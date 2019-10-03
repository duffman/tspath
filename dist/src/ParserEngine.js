"use strict";
/*=--------------------------------------------------------------=

 TSPath - Typescript Path Resolver

 Author : Patrik Forsberg
 Email  : patrik.forsberg@coldmind.com
 GitHub : https://github.com/duffman

 I hope this piece of software brings joy into your life, makes
 you sleep better knowing that you are no longer in path hell!

 Use this software free of charge, the only thing I ask is that
 you obey to the terms stated in the license, i would also like
 you to keep the file header intact.

 Also, I would love to see you getting involved in the project!

 Enjoy!

 This software is subject to the LGPL v2 License, please find
 the full license attached in LICENCE.md

=----------------------------------------------------------------= */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const utils_1 = require("./utils");
const constants_1 = require("./lib/constants");
const esprima = require("esprima");
const chalk_1 = require("chalk");
const escodegen = require("escodegen");
const PathResolver_1 = require("./lib/PathResolver");
/**
 * Parser engine class
 */
class ParserEngine {
    /**
     * ParserEngine constructor
     * @param config
     * @param args
     */
    constructor(config, args) {
        this.nrFilesProcessed = 0;
        this.nrPathsProcessed = 0;
        this.config = config;
        this.args = args;
        this.fileFilter = args.ext ? args.ext : args.filter;
        this.pathResolver = new PathResolver_1.PathResolver(config);
    }
    /**
     * Exit
     * @param code
     */
    exit(code = 5) {
        console.log('Terminating...');
        process.exit(code);
    }
    /**
     * Parse project and resolve paths
     */
    execute() {
        const PROCESS_TIME = 'Operation finished in';
        console.time(PROCESS_TIME);
        if (!utils_1.Utils.isEmpty(this.pathResolver.projectRoot) && !this.validateProjectPath(this.pathResolver.projectRoot)) {
            console.log(chalk_1.default.red.bold('Project Path "' + chalk_1.default.underline(this.pathResolver.projectRoot) + '" is invalid!'));
            this.exit(10);
        }
        const projectName = this.readProjectName();
        if (!utils_1.Utils.isEmpty(projectName)) {
            console.log(chalk_1.default.yellow('Parsing project: ') + chalk_1.default.bold(projectName) + ' ' + chalk_1.default.underline(this.pathResolver.projectRoot));
        }
        else {
            console.log(chalk_1.default.yellow.bold('Parsing project at: ') + '"' + this.pathResolver.projectRoot + '"');
        }
        const fileList = new Array();
        this.walkSync(this.pathResolver.distRoot, fileList, this.fileFilter);
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < fileList.length; i++) {
            const filename = fileList[i];
            this.processFile(filename, this.pathResolver.projectRoot);
        }
        console.log(chalk_1.default.bold('Total files processed:'), this.nrFilesProcessed);
        console.log(chalk_1.default.bold('Total paths processed:'), this.nrPathsProcessed);
        console.timeEnd(PROCESS_TIME);
        console.log(chalk_1.default.bold.green('Project is prepared, now run it normally!'));
    }
    /**
     *
     * @param sourceFilename
     * @param jsRequire - require in javascript source "require("jsRequire")
     * @returns {string}
     */
    getRelativePathForRequiredFile(sourceFilename, jsRequire) {
        const options = this.config.projectOptions;
        // tslint:disable-next-line:forin
        for (const alias in options.pathMappings) {
            let mapping = options.pathMappings[alias];
            // TODO: Handle * properly
            const strippedAlias = utils_1.Utils.stripWildcard(alias);
            mapping = utils_1.Utils.stripWildcard(mapping);
            // 2018-06-02: Workaround for bug with same prefix Aliases e.g @db and @dbCore
            // Cut alias prefix for mapping comparison
            const requirePrefix = jsRequire.substring(0, jsRequire.indexOf(path.sep));
            let pathPrefix = './';
            if (this.args.absPath) {
                pathPrefix = '/';
            }
            if (requirePrefix === strippedAlias) {
                let result = jsRequire.replace(strippedAlias, mapping);
                utils_1.Utils.replaceDoubleSlashes(result);
                result = utils_1.Utils.ensureTrailingPathDelimiter(result);
                const absoluteJsRequire = path.join(this.pathResolver.distRoot, result);
                const sourceDir = path.dirname(sourceFilename);
                let relativePath = path.relative(sourceDir, absoluteJsRequire);
                /* If the path does not start with .. it´ not a sub directory
                 * as in ../ or ..\ so assume it´ the same dir...
                 */
                if (relativePath[0] !== '.') {
                    relativePath = pathPrefix + relativePath;
                }
                jsRequire = relativePath;
                break;
            }
        }
        return jsRequire;
    }
    /**
     * Processes the filename specified in require("filename")
     * @param node
     * @param sourceFilename
     * @returns any
     */
    processJsRequire(node, sourceFilename) {
        let resultNode = node;
        const requireInJsFile = utils_1.Utils.safeGetAstNodeValue(node);
        /* Only proceed if the "require" contains a full file path, not
         * single references like "inversify"
         */
        if (!utils_1.Utils.isEmpty(requireInJsFile) && utils_1.Utils.fileHavePath(requireInJsFile)) {
            const relativePath = this.getRelativePathForRequiredFile(sourceFilename, requireInJsFile);
            resultNode = { type: 'Literal', value: relativePath, raw: relativePath };
            this.nrPathsProcessed++;
        }
        return resultNode;
    }
    /**
     * Extracts all the requires from a single file and processes the paths
     * @param filename
     * @param baseUrl
     */
    processFile(filename, baseUrl) {
        this.nrFilesProcessed++;
        const scope = this;
        const inputSourceCode = fs.readFileSync(filename, constants_1.FILE_ENCODING);
        let ast = null;
        try {
            // @ts-ignore
            ast = esprima.parse(inputSourceCode); // , { raw: true, tokens: true, range: true, comment: true });
        }
        catch (error) {
            console.log('Unable to parse file:', filename);
            console.log('Error:', error);
            this.exit();
        }
        this.traverseSynTree(ast, this, (node) => {
            if (node !== undefined && node.type === 'CallExpression' && node.callee.name === 'require') {
                node.arguments[0] = scope.processJsRequire(node.arguments[0], filename);
            }
        });
        const option = { comment: true, format: { compact: !this.args.preserve, quotes: '"' } };
        const finalSource = escodegen.generate(ast, option);
        try {
            this.saveFileContents(filename, finalSource);
        }
        catch (error) {
            console.log(chalk_1.default.bold.red('Unable to write file:'), filename);
            this.exit();
        }
    }
    /**
     * Saves file contents to disk
     * @param filename
     * @param fileContents
     */
    saveFileContents(filename, fileContents) {
        const error = false;
        fs.writeFileSync(filename, fileContents, { encoding: constants_1.FILE_ENCODING });
        if (error) {
            throw Error('Could not save file: ' + filename);
        }
    }
    /**
     * @param ast
     * @param scope
     * @param method
     */
    traverseSynTree(ast, scope, method) {
        method(ast);
        for (const key in ast) {
            if (ast.hasOwnProperty(key)) {
                const child = ast[key];
                if (typeof child === 'object' && child !== null) {
                    if (Array.isArray(child)) {
                        child.forEach((astRecursive) => {
                            scope.traverseSynTree(astRecursive, scope, method);
                        });
                    }
                    else {
                        scope.traverseSynTree(child, scope, method);
                    }
                }
            }
        }
    }
    /**
     * Recursively walking a directory structure and collect files
     * @param dir
     * @param fileList
     * @param fileExtension
     * @returns {Array<string>}
     */
    walkSync(dir, fileList, fileExtension) {
        const scope = this;
        const files = fs.readdirSync(dir);
        fileList = fileList || [];
        fileExtension = fileExtension === undefined ? '' : fileExtension;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                fileList = this.walkSync(path.join(dir, file), fileList, fileExtension);
            }
            else {
                const tmpExt = path.extname(file);
                if ((fileExtension.length > 0 && scope.matchExtension(tmpExt))
                    || (fileExtension.length < 1)
                    || (fileExtension === '*.*')) {
                    const fullFilename = path.join(dir, file);
                    fileList.push(fullFilename);
                }
            }
        }
        return fileList;
    }
    /**
     * Validate if project path is correct
     * @param projectPath
     */
    validateProjectPath(projectPath) {
        let result = true;
        let configFile = utils_1.Utils.ensureTrailingPathDelimiter(projectPath);
        configFile += this.config.fileName;
        if (!fs.existsSync(projectPath)) {
            result = false;
        }
        if (!fs.existsSync(configFile)) {
            console.log('Compiler Configuration file ' + chalk_1.default.underline.bold(this.config.fileName) + ' is missing!');
        }
        return result;
    }
    /**
     * Attempts to read the name property form package.json
     * @returns {string}
     */
    readProjectName() {
        let projectName = '';
        const filename = path.resolve(this.pathResolver.projectRoot, 'package.json');
        if (fs.existsSync(filename)) {
            const json = require(filename);
            projectName = json.name;
        }
        return projectName;
    }
    /**
     * Match a given file extension with the configured extensions
     * @param {string} fileExtension - ".xxx" or "xxx
     * @returns {boolean}
     */
    matchExtension(fileExtension) {
        if (utils_1.Utils.isEmpty(fileExtension) || 0 === this.fileFilter.length) {
            return false;
        }
        return this.fileFilter.indexOf(fileExtension) > -1;
    }
}
exports.ParserEngine = ParserEngine;
