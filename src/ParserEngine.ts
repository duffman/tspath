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

import * as fs from 'fs';
import * as path from 'path';
import { Utils } from './utils';
import { FILE_ENCODING } from './lib/constants';

import * as esprima from 'esprima';
import chalk from 'chalk';
import * as escodegen from 'escodegen';
import { ConfigFile } from './lib/ConfigFile';
import { PathResolver } from './lib/PathResolver';
import { Arguments } from './lib/Arguments';

/**
 * Parser engine class
 */
export class ParserEngine {
    private config: ConfigFile;
    private args: Arguments;
    private pathResolver: PathResolver;

    private readonly fileFilter: string;
    private nrFilesProcessed: number = 0;
    private nrPathsProcessed: number = 0;

    /**
     * ParserEngine constructor
     * @param config
     * @param args
     */
    constructor(config: ConfigFile, args: Arguments) {
        this.config = config;
        this.args = args;
        this.fileFilter = args.ext ? args.ext : args.filter;
        this.pathResolver = new PathResolver(config);
    }
    /**
     * Exit
     * @param code
     */
    private exit(code: number = 5): void {
        console.log('Terminating...');
        process.exit(code);
    }

    /**
     * Parse project and resolve paths
     */
    public execute(): void {
        const PROCESS_TIME = 'Operation finished in';
        console.time(PROCESS_TIME);

        if (!Utils.isEmpty(this.pathResolver.projectRoot) && !this.validateProjectPath(this.pathResolver.projectRoot)) {
            console.log(chalk.red.bold('Project Path "' + chalk.underline(this.pathResolver.projectRoot) + '" is invalid!'));
            this.exit(10);
        }

        const projectName = this.readProjectName();

        if (!Utils.isEmpty(projectName)) {
            console.log(chalk.yellow('Parsing project: ') + chalk.bold(projectName) + ' ' + chalk.underline(this.pathResolver.projectRoot));
        } else {
            console.log(chalk.yellow.bold('Parsing project at: ') + '"' + this.pathResolver.projectRoot + '"');
        }

        const fileList = new Array<string>();

        this.walkSync(this.pathResolver.distRoot, fileList, this.fileFilter);

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < fileList.length; i++) {
            const filename = fileList[i];
            this.processFile(filename, this.pathResolver.projectRoot);
        }

        console.log(chalk.bold('Total files processed:'), this.nrFilesProcessed);
        console.log(chalk.bold('Total paths processed:'), this.nrPathsProcessed);

        console.timeEnd(PROCESS_TIME);
        console.log(chalk.bold.green('Project is prepared, now run it normally!'));
    }

    /**
     *
     * @param sourceFilename
     * @param jsRequire - require in javascript source "require("jsRequire")
     * @returns {string}
     */
    public getRelativePathForRequiredFile(sourceFilename: string, jsRequire: string): string {
        const options = this.config.projectOptions;

        // tslint:disable-next-line:forin
        for (const alias in options.pathMappings) {
            let mapping = options.pathMappings[alias];

            // TODO: Handle * properly
            const strippedAlias = Utils.stripWildcard(alias);
            mapping = Utils.stripWildcard(mapping);

            // 2018-06-02: Workaround for bug with same prefix Aliases e.g @db and @dbCore
            // Cut alias prefix for mapping comparison
            const requirePrefix = jsRequire.substring(0, jsRequire.indexOf(path.sep));

            let pathPrefix = './';
            if(this.args.absPath) {
                pathPrefix = '/';
            }
            if (requirePrefix === strippedAlias) {
                let result = jsRequire.replace(strippedAlias, mapping);
                Utils.replaceDoubleSlashes(result);
                result = Utils.ensureTrailingPathDelimiter(result);

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
    public processJsRequire(node: any, sourceFilename: string): any {
        let resultNode = node;
        const requireInJsFile = Utils.safeGetAstNodeValue(node);

        /* Only proceed if the "require" contains a full file path, not
         * single references like "inversify"
         */
        if (!Utils.isEmpty(requireInJsFile) && Utils.fileHavePath(requireInJsFile)) {
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
    public processFile(filename: string, baseUrl: string): void {
        this.nrFilesProcessed++;

        const scope = this;
        const inputSourceCode = fs.readFileSync(filename, FILE_ENCODING);
        let ast = null;

        try {
            // @ts-ignore
            ast = esprima.parse(inputSourceCode); // , { raw: true, tokens: true, range: true, comment: true });
        } catch (error) {
            console.log('Unable to parse file:', filename);
            console.log('Error:', error);
            this.exit();
        }

        this.traverseSynTree(ast, this, (node: any) => {
            if (node !== undefined && node.type === 'CallExpression' && node.callee.name === 'require') {
                node.arguments[0] = scope.processJsRequire(node.arguments[0], filename);
            }
        });

        const option = { comment: true, format: { compact: !this.args.preserve, quotes: '"' } };
        const finalSource = escodegen.generate(ast, option);

        try {
            this.saveFileContents(filename, finalSource);
        } catch (error) {
            console.log(chalk.bold.red('Unable to write file:'), filename);
            this.exit();
        }
    }

    /**
     * Saves file contents to disk
     * @param filename
     * @param fileContents
     */
    public saveFileContents(filename: string, fileContents: string): void {
        const error: any = false;
        fs.writeFileSync(filename, fileContents, { encoding: FILE_ENCODING });

        if (error) {
            throw Error('Could not save file: ' + filename);
        }
    }

    /**
     * @param ast
     * @param scope
     * @param method
     */
    public traverseSynTree(ast: any, scope: any, method: (ast: any) => void): void {
        method(ast);
        for (const key in ast) {
            if (ast.hasOwnProperty(key)) {
                const child = ast[key];

                if (typeof child === 'object' && child !== null) {
                    if (Array.isArray(child)) {
                        child.forEach((astRecursive) => { // 5
                            scope.traverseSynTree(astRecursive, scope, method);
                        });
                    } else {
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
    public walkSync(dir: string, fileList: string[], fileExtension?: string): string[] {
        const scope = this;
        const files = fs.readdirSync(dir);
        fileList = fileList || [];
        fileExtension = fileExtension === undefined ? '' : fileExtension;

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                fileList = this.walkSync(path.join(dir, file), fileList, fileExtension);
            } else {
                if ((fileExtension.length > 0 && scope.matchExtension(fileExtension))
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
    private validateProjectPath(projectPath: string): boolean {
        let result = true;

        let configFile = Utils.ensureTrailingPathDelimiter(projectPath);
        configFile += this.config.fileName;

        if (!fs.existsSync(projectPath)) {
            result = false;
        }

        if (!fs.existsSync(configFile)) {
            console.log('Compiler Configuration file ' + chalk.underline.bold(this.config.fileName) + ' is missing!');
        }

        return result;
    }

    /**
     * Attempts to read the name property form package.json
     * @returns {string}
     */
    private readProjectName(): string {
        let projectName: string = '';
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
    private matchExtension(fileExtension: string): boolean {
        if (Utils.isEmpty(fileExtension) || 0 === this.fileFilter.length) {
            return false;
        }

        return this.fileFilter.indexOf(fileExtension) > -1;
    }
}
