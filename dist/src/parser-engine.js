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
let fs = require("fs");
let path = require('path');
let esprima = require("esprima");
let escodegen = require("escodegen");
let chalk = require("chalk");
const utils_1 = require("./utils");
const json_comment_stripper_1 = require("./json-comment-stripper");
const project_options_1 = require("./project-options");
const type_definitions_1 = require("./type-definitions");
const type_definitions_2 = require("./type-definitions");
const log = console.log;
class ParserEngine {
    constructor() {
        this.nrFilesProcessed = 0;
        this.nrPathsProcessed = 0;
    }
    exit(code = 5) {
        console.log("Terminating...");
        process.exit(code);
    }
    setProjectPath(projectPath) {
        /*
        this.projectPath = process.cwd();
        console.log("CURRENT:", this.projectPath);
        */
        if (!utils_1.Utils.isEmpty(projectPath) && !this.validateProjectPath(projectPath)) {
            log(chalk.red.bold("Project Path \"" + chalk.underline(projectPath) + "\" is invalid!"));
            return false;
        }
        this.projectPath = projectPath;
        return true;
    }
    validateProjectPath(projectPath) {
        var result = true;
        let configFile = utils_1.Utils.ensureTrailingPathDelimiter(projectPath);
        configFile += type_definitions_1.TS_CONFIG;
        if (!fs.existsSync(projectPath)) {
            result = false;
        }
        if (!fs.existsSync(configFile)) {
            log("TypeScript Compiler Configuration file " + chalk.underline.bold(type_definitions_1.TS_CONFIG) + " is missing!");
        }
        return result;
    }
    /**
     * Attempts to read the name property form package.json
     * @returns {string}
     */
    readProjectName() {
        var projectName = null;
        var filename = path.resolve(this.projectPath, "package.json");
        if (fs.existsSync(filename)) {
            var json = require(filename);
            projectName = json.name;
        }
        return projectName;
    }
    execute() {
        const PROCESS_TIME = "Operation finished in";
        console.time(PROCESS_TIME);
        if (!this.validateProjectPath(this.projectPath)) {
            log(chalk.bold.red("Invalid project path"));
            this.exit(10);
        }
        this.projectOptions = this.readConfig();
        let projectName = this.readProjectName();
        if (!utils_1.Utils.isEmpty(projectName)) {
            log(chalk.yellow("Parsing project: ") + chalk.bold(projectName) + " " + chalk.underline(this.projectPath));
        }
        else {
            log(chalk.yellow.bold("Parsing project at: ") + '"' + this.projectPath + '"');
        }
        this.appRoot = path.resolve(this.projectPath, this.projectOptions.baseUrl);
        this.appRoot = path.resolve(this.appRoot, this.projectOptions.outDir);
        let fileList = new Array();
        this.walkSync(this.appRoot, fileList, ".js");
        for (var i = 0; i < fileList.length; i++) {
            let filename = fileList[i];
            this.processFile(filename);
        }
        log(chalk.bold("Total files processed:"), this.nrFilesProcessed);
        log(chalk.bold("Total paths processed:"), this.nrPathsProcessed);
        console.timeEnd(PROCESS_TIME);
        log(chalk.bold.green("Project is prepared, now run it normally!"));
    }
    /**
     *
     * @param sourceFilename
     * @param jsRequire - require in javascript source "require("jsRequire")
     * @returns {string}
     */
    getRelativePathForRequiredFile(sourceFilename, jsRequire) {
        let options = this.projectOptions;
        for (var alias in options.pathMappings) {
            var mapping = options.pathMappings[alias];
            //TODO: Handle * properly
            alias = utils_1.Utils.stripWildcard(alias);
            mapping = utils_1.Utils.stripWildcard(mapping);
            if (jsRequire.substring(0, alias.length) == alias) {
                var result = jsRequire.replace(alias, mapping);
                utils_1.Utils.replaceDoubleSlashes(result);
                var absoluteJsRequire = path.join(this.appRoot, result);
                var sourceDir = path.dirname(sourceFilename);
                let relativePath = path.relative(sourceDir, absoluteJsRequire);
                /* If the path does not start with .. it´ not a sub directory
                 * as in ../ or ..\ so assume it´ the same dir...
                 */
                if (relativePath[0] != ".") {
                    relativePath = "./" + relativePath;
                }
                return relativePath;
            }
        }
        return jsRequire;
    }
    /**
     * Processes the filename specified in require("filename")
     * @param node
     * @param sourceFilename
     * @returns {any}
     */
    processJsRequire(node, sourceFilename) {
        let resultNode = node;
        let requireInJsFile = utils_1.Utils.safeGetAstNodeValue(node);
        /* Only proceed if the "require" contains a full file path, not
         * single references like "inversify"
         */
        if (!utils_1.Utils.isEmpty(requireInJsFile) && utils_1.Utils.fileHavePath(requireInJsFile)) {
            let relativePath = this.getRelativePathForRequiredFile(sourceFilename, requireInJsFile);
            resultNode = { type: "Literal", value: relativePath, raw: relativePath };
            this.nrPathsProcessed++;
        }
        return resultNode;
    }
    /**
     * Extracts all the requires from a single file and processes the paths
     * @param filename
     */
    processFile(filename) {
        this.nrFilesProcessed++;
        let scope = this;
        let inputSourceCode = fs.readFileSync(filename, type_definitions_2.FILE_ENCODING);
        var ast = null;
        try {
            ast = esprima.parse(inputSourceCode); //, { raw: true, tokens: true, range: true, comment: true });
        }
        catch (error) {
            console.log("Unable to parse file:", filename);
            console.log("Error:", error);
            this.exit();
        }
        this.traverseSynTree(ast, this, function (node) {
            if (node != undefined && node.type == "CallExpression" && node.callee.name == "require") {
                node.arguments[0] = scope.processJsRequire(node.arguments[0], filename);
            }
        });
        let option = { comment: true, format: { compact: true, quotes: '"' } };
        let finalSource = escodegen.generate(ast, option);
        try {
            this.saveFileContents(filename, finalSource);
        }
        catch (error) {
            log(chalk.bold.red("Unable to write file:"), filename);
            this.exit();
        }
    }
    /**
     * Saves file contents to disk
     * @param filename
     * @param fileContents
     */
    saveFileContents(filename, fileContents) {
        var error = false;
        fs.writeFileSync(filename, fileContents, type_definitions_2.FILE_ENCODING, error);
        if (error) {
            throw Error("Could not save file: " + filename);
        }
    }
    /**
     * Read and parse the TypeScript configuration file
     * @param configFilename
     */
    readConfig(configFilename = type_definitions_1.TS_CONFIG) {
        let fileName = path.resolve(this.projectPath, configFilename);
        let fileData = fs.readFileSync(path.resolve(this.projectPath, fileName), type_definitions_2.FILE_ENCODING);
        let jsonCS = new json_comment_stripper_1.JsonCommentStripper();
        fileData = jsonCS.stripComments(fileData);
        this.tsConfig = JSON.parse(fileData);
        let compilerOpt = this.tsConfig.compilerOptions;
        let reqFields = [];
        reqFields["baseUrl"] = compilerOpt.baseUrl;
        reqFields["outDir"] = compilerOpt.outDir;
        for (var key in reqFields) {
            var field = reqFields[key];
            if (utils_1.Utils.isEmpty(field)) {
                log(chalk.red.bold("Missing required field:") + ' "' + chalk.bold.underline(key) + '"');
                this.exit(22);
            }
        }
        return new project_options_1.ProjectOptions(compilerOpt);
    }
    /**
     *
     * @param ast
     * @param scope
     * @param func
     */
    traverseSynTree(ast, scope, func) {
        func(ast);
        for (var key in ast) {
            if (ast.hasOwnProperty(key)) {
                var child = ast[key];
                if (typeof child === 'object' && child !== null) {
                    if (Array.isArray(child)) {
                        child.forEach(function (ast) {
                            scope.traverseSynTree(ast, scope, func);
                        });
                    }
                    else {
                        scope.traverseSynTree(child, scope, func);
                    }
                }
            }
        }
    }
    /**
     * Recursively walking a directory structure and collect files
     * @param dir
     * @param filelist
     * @param fileExtension
     * @returns {Array<string>}
     */
    walkSync(dir, filelist, fileExtension) {
        var scope = this;
        var files = fs.readdirSync(dir);
        filelist = filelist || [];
        fileExtension = fileExtension === undefined ? "" : fileExtension;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filelist = this.walkSync(path.join(dir, file), filelist, fileExtension);
            }
            else {
                var tmpExt = path.extname(file);
                if ((fileExtension.length > 0 && tmpExt == fileExtension)
                    || (fileExtension.length < 1)
                    || (fileExtension == "*.*")) {
                    let fullFilename = path.join(dir, file);
                    filelist.push(fullFilename);
                }
            }
        }
        return filelist;
    }
}
exports.ParserEngine = ParserEngine;
