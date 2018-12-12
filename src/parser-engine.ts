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

let fs = require("fs");
let path = require('path');
let esprima = require("esprima");
let escodegen = require("escodegen");
let chalk = require("chalk");

import { Utils } from "./utils";
import { JsonCommentStripper } from "./json-comment-stripper";
import { ProjectOptions } from "./project-options";
import { TS_CONFIG } from "./type-definitions";
import { FILE_ENCODING } from "./type-definitions";
import { TSPath } from './tspath';

const log = console.log;

export class ParserEngine {
    public projectPath: string;

    nrFilesProcessed: number = 0;
    nrPathsProcessed: number = 0;
    appRoot: string;
    projectOptions: ProjectOptions;
    tsConfig: any;

    constructor() { }

    public exit(code: number = 5) {
        console.log("Terminating...");
        process.exit(code);
    }

    public setProjectPath(projectPath: string): boolean {

		/*
		this.projectPath = process.cwd();
		console.log("CURRENT:", this.projectPath);
		*/

        if (!Utils.isEmpty(projectPath) && !this.validateProjectPath(projectPath)) {
            log(chalk.red.bold("Project Path \"" + chalk.underline(projectPath) + "\" is invalid!"));
            return false;
        }

        this.projectPath = projectPath;

        return true;
    }

    private validateProjectPath(projectPath: string): boolean {
        var result = true;

        let configFile = Utils.ensureTrailingPathDelimiter(projectPath);
        configFile += TS_CONFIG;

        if (!fs.existsSync(projectPath)) {
            result = false;
        }

        if (!fs.existsSync(configFile)) {
            log("TypeScript Compiler Configuration file " + chalk.underline.bold(TS_CONFIG) + " is missing!");
        }

        return result;
    }

	/**
	 * Attempts to read the name property form package.json
	 * @returns {string}
	 */
    private readProjectName(): string {
        var projectName: string = null;
        var filename = path.resolve(this.projectPath, "package.json");

        if (fs.existsSync(filename)) {
            var json = require(filename);
            projectName = json.name;
        }

        return projectName;
    }


    public execute() {
        const PROCESS_TIME = "Operation finished in";
        console.time(PROCESS_TIME);

        if (!this.validateProjectPath(this.projectPath)) {
            log(chalk.bold.red("Invalid project path"));
            this.exit(10);
        }

        this.projectOptions = this.readConfig();

        let projectName = this.readProjectName();

        if (!Utils.isEmpty(projectName)) {
            log(chalk.yellow("Parsing project: ") + chalk.bold(projectName) + " " + chalk.underline(this.projectPath));
        } else {
            log(chalk.yellow.bold("Parsing project at: ") + '"' + this.projectPath + '"');
        }

        this.appRoot = path.resolve(this.projectPath, this.projectOptions.outDir);

        let fileList = new Array<string>();

        this.walkSync(this.appRoot, fileList, ".js");

        for (var i = 0; i < fileList.length; i++)
            if (!this.shouldSkipFile(fileList[i]))
                this.processFile(fileList[i]);

        log(chalk.bold("Total files processed:"), this.nrFilesProcessed);
        log(chalk.bold("Total paths processed:"), this.nrPathsProcessed);

        console.timeEnd(PROCESS_TIME);
        log(chalk.bold.green("Project is prepared, now run it normally!"));
    }

    private shouldSkipFile(filename: string): boolean {
        const contents = fs.readFileSync(filename, 'utf8') as string;
        return contents.includes('tspath:skip-file');
    }

	/**
	 *
 	 * @param sourceFilename
	 * @param jsRequire - require in javascript source "require("jsRequire")
	 * @returns {string}
	 */
    getRelativePathForRequiredFile(sourceFilename: string, jsRequire: string) {
        let options = this.projectOptions;

        for (var alias in options.pathMappings) {
            var mapping = options.pathMappings[alias];

            //TODO: Handle * properly
            alias = Utils.stripWildcard(alias);
            mapping = Utils.stripWildcard(mapping);

            if (jsRequire.substring(0, alias.length) == alias) {
                var result = jsRequire.replace(alias, mapping);
                Utils.replaceDoubleSlashes(result);

                var absoluteJsRequire = path.join(this.appRoot, result);
                if (!fs.existsSync(`${absoluteJsRequire}.js`)) {
                    var newResult = jsRequire.replace(alias, '');
                    absoluteJsRequire = path.join(this.appRoot, newResult);
                }
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
    processJsRequire(node: any, sourceFilename: string): any {
        let resultNode = node;
        let requireInJsFile = Utils.safeGetAstNodeValue(node);

		/* Only proceed if the "require" contains a full file path, not
		 * single references like "inversify"
		 */
        if (!Utils.isEmpty(requireInJsFile) && Utils.fileHavePath(requireInJsFile)) {
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
    processFile(filename: string) {
        this.nrFilesProcessed++;

        let scope = this;
        let inputSourceCode = fs.readFileSync(filename, FILE_ENCODING);
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

        let option = { comment: true };
        if (TSPath.parseCommandLineParam("-c"))
            option['format'] = { compact: true, quotes: '"' };
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
    saveFileContents(filename: string, fileContents: string) {
        var error: any = false;
        fs.writeFileSync(filename, fileContents, FILE_ENCODING, error);

        if (error) {
            throw Error("Could not save file: " + filename);
        }
    }

	/**
	 * Read and parse the TypeScript configuration file
	 * @param configFilename
	 */
    readConfig(configFilename: string = TS_CONFIG): ProjectOptions {
        let fileName = path.resolve(this.projectPath, configFilename);
        let fileData = fs.readFileSync(path.resolve(this.projectPath, fileName), FILE_ENCODING);

        let jsonCS = new JsonCommentStripper();
        fileData = jsonCS.stripComments(fileData);

        this.tsConfig = JSON.parse(fileData);

        let compilerOpt = this.tsConfig.compilerOptions;

        let reqFields = [];
        reqFields["baseUrl"] = compilerOpt.baseUrl;
        reqFields["outDir"] = compilerOpt.outDir;

        for (var key in reqFields) {
            var field = reqFields[key];
            if (Utils.isEmpty(field)) {
                log(chalk.red.bold("Missing required field:") + ' "' + chalk.bold.underline(key) + '"');
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
    traverseSynTree(ast, scope, func) {
        func(ast);
        for (var key in ast) {
            if (ast.hasOwnProperty(key)) {
                var child = ast[key];

                if (typeof child === 'object' && child !== null) {
                    if (Array.isArray(child)) {
                        child.forEach(function (ast) { //5
                            scope.traverseSynTree(ast, scope, func);
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
	 * @param filelist
	 * @param fileExtension
	 * @returns {Array<string>}
	 */
    public walkSync(dir: string, filelist: Array<string>, fileExtension?: string) {
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
