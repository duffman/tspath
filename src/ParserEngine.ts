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
import { JsonCommentStripper } from './json-comment-stripper';
import { ProjectOptions } from './lib/project-options';
import { FILE_ENCODING } from './lib/constants';

import * as esprima from 'esprima';
import chalk from 'chalk';
import * as escodegen from 'escodegen';

/**
 * Parser engine class
 */
export class ParserEngine {
    public projectPath: string;
    public fileName: string;
    public compactMode: boolean = true;

    private nrFilesProcessed: number = 0;
    private nrPathsProcessed: number = 0;
    private appRoot: string;
    private distRoot: string;
    private projectOptions: ProjectOptions;
    private tsConfig: any;
    private readonly fileFilter: string;

    /**
     * ParserEngine constructor
     * @param projectPath
     * @param fileName
     * @param compactMode
     * @param filter
     */
    constructor(projectPath: string, fileName: string, compactMode: boolean, filter: string[]) {
        this.projectPath = projectPath;
        this.fileName = fileName;
        this.compactMode = compactMode;
        this.fileFilter = filter.map((e) => {
            return !e.startsWith('.') ? '.' + e : e;
        }).join(',');
    }
    /**
     * Exit
     * @param code
     */
    public exit(code: number = 5): void {
        console.log('Terminating...');
        process.exit(code);
    }

    /**
     * Parse project and resolve paths
     */
    public execute(configPath: string = ''): void {
        const PROCESS_TIME = 'Operation finished in';
        console.time(PROCESS_TIME);

        if (!Utils.isEmpty(this.projectPath) && !this.validateProjectPath(this.projectPath)) {
            console.log(chalk.red.bold('Project Path "' + chalk.underline(this.projectPath) + '" is invalid!'));
            this.exit(10);
        }

        this.projectOptions = this.readConfig(configPath);
        const projectName = this.readProjectName();

        if (!Utils.isEmpty(projectName)) {
            console.log(chalk.yellow('Parsing project: ') + chalk.bold(projectName) + ' ' + chalk.underline(this.projectPath));
        } else {
            console.log(chalk.yellow.bold('Parsing project at: ') + '"' + this.projectPath + '"');
        }

        this.appRoot = path.resolve(this.projectPath, this.projectOptions.baseUrl);
        this.distRoot = path.resolve(this.projectPath, this.projectOptions.outDir);

        const fileList = new Array<string>();

        console.log(this);
        process.exit();
        this.walkSync(this.distRoot, fileList, this.fileFilter);

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < fileList.length; i++) {
            const filename = fileList[i];
            this.processFile(filename);
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
        const options = this.projectOptions;

        // tslint:disable-next-line:forin
        for (const alias in options.pathMappings) {
            let mapping = options.pathMappings[alias];

            // TODO: Handle * properly
            const strippedAlias = Utils.stripWildcard(alias);
            mapping = Utils.stripWildcard(mapping);

            // 2018-06-02: Workaround for bug with same prefix Aliases e.g @db and @dbCore
            // Cut alias prefix for mapping comparison
            const requirePrefix = jsRequire.substring(0, jsRequire.indexOf(path.sep));

            if (requirePrefix === strippedAlias) {
                let result = jsRequire.replace(strippedAlias, mapping);
                Utils.replaceDoubleSlashes(result);
                result = Utils.ensureTrailingPathDelimiter(result);

                const absoluteJsRequire = path.join(this.distRoot, result);
                const sourceDir = path.dirname(sourceFilename);

                let relativePath = path.relative(sourceDir, absoluteJsRequire);

                /* If the path does not start with .. it´ not a sub directory
                 * as in ../ or ..\ so assume it´ the same dir...
                 */
                if (relativePath[0] !== '.') {
                    relativePath = './' + relativePath;
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
     */
    public processFile(filename: string): void {
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

        const option = { comment: true, format: { compact: this.compactMode, quotes: '"' } };
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
     * Read and parse the TypeScript configuration file
     * @param configFilename
     */
    public readConfig(configFilename: string = ''): ProjectOptions {
        const fileName = path.resolve(this.projectPath, configFilename);
        let fileData = fs.readFileSync(path.resolve(this.projectPath, fileName), { encoding: FILE_ENCODING });
        console.log('fileData', fileData);

        const jsonCS = new JsonCommentStripper();
        fileData = jsonCS.stripComments(fileData);

        this.tsConfig = JSON.parse(fileData);

        const compilerOpt = this.tsConfig.compilerOptions;

        const reqFields = {
            baseUrl: compilerOpt.baseUrl,
            outDir:compilerOpt.outDir,
        };

        // tslint:disable-next-line:forin
        for (const key in reqFields) {
            const field = reqFields[key];
            if (Utils.isEmpty(field)) {
                console.log(chalk.red.bold('Missing required field:') + ' "' + chalk.bold.underline(key) + '"');
                this.exit(22);
            }
        }

        return new ProjectOptions(compilerOpt);
    }

    /**
     *
     * @param ast
     * @param scope
     * @param func
     */
    public traverseSynTree(ast, scope, func): void {
        func(ast);
        for (const key in ast) {
            if (ast.hasOwnProperty(key)) {
                const child = ast[key];

                if (typeof child === 'object' && child !== null) {
                    if (Array.isArray(child)) {
                        child.forEach((astRecursive) => { // 5
                            scope.traverseSynTree(astRecursive, scope, func);
                        });
                    } else {
                        scope.traverseSynTree(child, scope, func);
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
        configFile += this.fileName;

        if (!fs.existsSync(projectPath)) {
            result = false;
        }

        if (!fs.existsSync(configFile)) {
            console.log('Compiler Configuration file ' + chalk.underline.bold(this.fileName) + ' is missing!');
        }

        return result;
    }

    /**
     * Attempts to read the name property form package.json
     * @returns {string}
     */
    private readProjectName(): string {
        let projectName: string = '';
        const filename = path.resolve(this.projectPath, 'package.json');

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
