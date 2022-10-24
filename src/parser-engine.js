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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ParserEngine = void 0;
var esprima = require("esprima");
var escodegen = require("escodegen");
var chalk = require("ansi-colors");
var tspath_const_1 = require("./tspath.const");
var logger_1 = require("./utils/logger");
var path_utils_1 = require("./utils/path.utils");
var utils_1 = require("./utils/utils");
var json_comment_stripper_1 = require("./utils/json-comment-stripper");
var project_options_1 = require("./project-options");
var fs = require("fs");
var path = require("path");
var log = console.log;
var testRun = false;
var ParserEngine = /** @class */ (function () {
    function ParserEngine(dryRun) {
        this.dryRun = dryRun;
        this.nrFilesProcessed = 0;
        this.nrPathsProcessed = 0;
        this.compactMode = true;
    }
    ParserEngine.prototype.exit = function (code) {
        if (code === void 0) { code = 5; }
        console.log("Terminating...");
        process.exit(code);
    };
    /**
     * Assign project path
     * @param {string} projectPath
     * @returns {boolean}
     */
    ParserEngine.prototype.setProjectPath = function (projectPath) {
        if (!utils_1.Utils.isEmpty(projectPath) && !this.validateProjectPath(projectPath)) {
            log(chalk.red.bold("Project Path \"" + chalk.underline(projectPath) + "\" is invalid!"));
            return false;
        }
        this.projectPath = projectPath;
        return true;
    };
    /**
     * Set the accepted file extensions, ensure leading . (dot)
     * @param {Array<string>} filter
     */
    ParserEngine.prototype.setFileFilter = function (filter) {
        this.fileFilter = filter.map(function (e) {
            return !e.startsWith(".") ? "." + e : e;
        });
    };
    ParserEngine.prototype.validateProjectPath = function (projectPath) {
        var result = true;
        var configFile = utils_1.Utils.ensureTrailingSlash(projectPath);
        configFile += tspath_const_1.Const.TS_CONFIG;
        if (!fs.existsSync(projectPath)) {
            result = false;
        }
        if (!fs.existsSync(configFile)) {
            log("TypeScript Compiler - Configuration file " + chalk.underline(tspath_const_1.Const.TS_CONFIG) + " is missing!");
        }
        return result;
    };
    /**
     * Attempts to read the name property form package.json
     * @returns {string}
     */
    ParserEngine.prototype.readProjectName = function () {
        var projectName = null;
        var filename = path.resolve(this.projectPath, "package.json");
        if (fs.existsSync(filename)) {
            var json = require(filename);
            projectName = json.name;
        }
        return projectName;
    };
    /**
     * Parse project and resolve paths
     */
    ParserEngine.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var PROCESS_TIME, projectName, tmpPath, fileList, i, filename;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        PROCESS_TIME = "Operation finished in";
                        console.time(PROCESS_TIME);
                        if (!this.validateProjectPath(this.projectPath)) {
                            log(chalk.bold.red("Invalid project path!"));
                            this.exit(10);
                        }
                        this.projectOptions = this.readConfig();
                        projectName = this.readProjectName();
                        if (!utils_1.Utils.isEmpty(projectName)) {
                            log(chalk.yellow("Parsing project: ") + chalk.bold(projectName) + " " + chalk.underline(this.projectPath));
                        }
                        else {
                            log(chalk.yellow.bold("Parsing project at: ") + "\"" + this.projectPath + "\"");
                        }
                        this.distRoot = path.resolve(this.projectPath, this.projectOptions.outDir);
                        this.basePath = this.distRoot;
                        tmpPath = path.resolve(this.distRoot, this.projectOptions.baseUrl);
                        //
                        // If the baseUrl exist in the dist folder, the TS Compiler have re-used the src structure
                        // in the dist folder in order to keep the structure intact, probably due to a require to
                        // a file located directly in the project root folder
                        //
                        if ((this.projectOptions.baseUrl !== this.projectOptions.outDir) && path_utils_1.PathUtils.pathExist(tmpPath)) {
                            this.basePath = tmpPath;
                        }
                        if (tspath_const_1.Const.DEBUG_MODE) {
                            //console.clear();
                            console.log("TMP :::", tmpPath);
                            console.log("Project path ::", this.projectPath);
                            console.log("Dist path ::", this.distRoot);
                            console.log("Src path ::", this.srcRoot);
                        }
                        fileList = new Array();
                        logger_1.Logger.logPurple("Indexing files...");
                        console.log(this.distRoot);
                        this.walkSync(this.distRoot, fileList, ".js");
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < fileList.length)) return [3 /*break*/, 5];
                        filename = fileList[i];
                        // @ts-ignore
                        process.stdout.clearLine();
                        // @ts-ignore
                        process.stdout.cursorTo(0);
                        process.stdout.write("Processing file \"".concat(path.basename(filename), "\"...") + "\r");
                        if (!tspath_const_1.Const.DEBUG_MODE) return [3 /*break*/, 3];
                        return [4 /*yield*/, utils_1.Utils.sleep(150)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.processFile(filename);
                        // @ts-ignore
                        process.stdout.clearLine();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5:
                        log(chalk.bold("Total files processed:"), this.nrFilesProcessed);
                        log(chalk.bold("Total paths processed:"), this.nrPathsProcessed);
                        console.timeEnd(PROCESS_TIME);
                        log(chalk.bold.green("Project is prepared, now run it normally!"));
                        return [2 /*return*/];
                }
            });
        });
    };
    ParserEngine.prototype.shouldSkipFile = function (filename) {
        var contents = fs.readFileSync(filename, tspath_const_1.Const.FILE_ENCODING);
        return contents.includes("tspath:skip-file");
    };
    /**
     *
     * @param sourceFilename
     * @param jsRequire - require in javascript source "require("jsRequire")
     * @returns {string}
     */
    ParserEngine.prototype.getRelativePathForRequiredFile = function (sourceFilename, jsRequire) {
        var options = this.projectOptions;
        if (tspath_const_1.Const.DEBUG_MODE) {
            console.log("FIRST :: jsRequire ::", jsRequire);
            console.log("getRelativePathForRequiredFile ::---", sourceFilename);
        }
        for (var alias in options.pathMappings) {
            var mapping = options.pathMappings[alias];
            //TODO: Handle * properly
            alias = utils_1.Utils.stripWildcard(alias);
            mapping = utils_1.Utils.stripWildcard(mapping);
            // 2018-06-02: Workaround for bug with same prefix Aliases e.g @db and @dbCore
            // Cut alias prefix for mapping comparison
            var requirePrefix = jsRequire.substring(0, jsRequire.indexOf(path.sep));
            if (requirePrefix === alias) {
                logger_1.Logger.debug("jsRequire ::", jsRequire);
                logger_1.Logger.debug("requirePrefix ::", requirePrefix);
                logger_1.Logger.debug("alias ::", alias);
                logger_1.Logger.debug("---");
                var result = jsRequire.replace(alias, mapping);
                utils_1.Utils.replaceDoubleSlashes(result);
                var absoluteJsRequire = path.join(this.basePath, result);
                logger_1.Logger.debug("Absolute PATH require ::", absoluteJsRequire);
                /*
                 if (!fs.existsSync(`${ absoluteJsRequire }.js`)) {
                 const newResult   = jsRequire.replace(alias, "");
                 absoluteJsRequire = path.join(this.basePath, newResult);
                 }
                 */
                var sourceDir = path.dirname(sourceFilename);
                if (tspath_const_1.Const.DEBUG_MODE) {
                    console.log("this.distRoot == ", this.distRoot);
                    console.log("sourceDir == ", sourceDir);
                    console.log("absoluteJsRequire == ", absoluteJsRequire);
                    console.log("sourceFilename == ", sourceFilename);
                }
                var fromPath = path.dirname(sourceFilename);
                //	fromPath = Utils.ensureTrailingPathDelimiter(fromPath)
                var toPath = path.dirname(absoluteJsRequire);
                // let relativePath = PathUtils.getRelativePath(fromPath, toPath, true);
                var relativePath = path.relative(fromPath, toPath);
                logger_1.Logger.debug("Relative PATH ::", relativePath);
                if (!relativePath.trim().length) {
                    relativePath = ".";
                }
                relativePath = utils_1.Utils.ensureTrailingSlash(relativePath);
                //
                // If the path does not start with .. it´ not a sub directory
                // as in ../ or ..\ so assume it´ the same dir...
                //
                if (relativePath[0] !== ".") {
                    relativePath = "./" + relativePath;
                }
                logger_1.Logger.debug("BEFORE >>>>>>>>>>>>>>> ::", absoluteJsRequire);
                jsRequire = relativePath + path.parse(absoluteJsRequire).base;
                logger_1.Logger.debug("AFTER >>>>>>>>>>>>>>> ::", jsRequire);
                break;
            }
        }
        return jsRequire;
    };
    /**
     * Processes the filename specified in require("filename")
     * @param node
     * @param sourceFilename
     * @returns {any}
     */
    ParserEngine.prototype.processJsRequire = function (node, sourceFilename) {
        var resultNode = node;
        var requireInJsFile = utils_1.Utils.safeGetAstNodeValue(node);
        //
        // Only proceed if the "require" contains a full file path, not
        // single references like "inversify"
        //
        if (!utils_1.Utils.isEmpty(requireInJsFile) && utils_1.Utils.fileHavePath(requireInJsFile)) {
            var relativePath = this.getRelativePathForRequiredFile(sourceFilename, requireInJsFile);
            resultNode = { type: "Literal", value: relativePath, raw: relativePath };
            if (relativePath && relativePath.length)
                this.nrPathsProcessed++;
        }
        return resultNode;
    };
    /**
     * Extracts all the requires from a single file and processes the paths
     * @param filename
     */
    ParserEngine.prototype.processFile = function (filename) {
        this.nrFilesProcessed++;
        var scope = this;
        var inputSourceCode = fs.readFileSync(filename, "utf-8");
        var ast = null;
        try {
            ast = esprima.parse(inputSourceCode, { raw: true, tokens: true, range: true, comment: true });
        }
        catch (error) {
            logger_1.Logger.logRed("Unable to parse file:", filename);
            console.log("Source ::", inputSourceCode);
            logger_1.Logger.log("Error:", error);
            this.exit();
        }
        this.traverseSynTree(ast, this, function (node) {
            if (node != undefined && node.type == "CallExpression" && node.callee.name == "require") {
                node.arguments[0] = scope.processJsRequire(node.arguments[0], filename);
            }
        });
        var option = { comment: true, format: { compact: this.compactMode, quotes: "\"" } };
        var finalSource = escodegen.generate(ast, option);
        try {
            if (!testRun) {
                this.saveFileContents(filename, finalSource);
            }
        }
        catch (error) {
            logger_1.Logger.logRed("Unable to write file: \"".concat(filename, "\""));
            this.exit();
        }
    };
    /**
     * Saves file contents to disk
     * @param filename
     * @param fileContents
     */
    ParserEngine.prototype.saveFileContents = function (filename, fileContents) {
        try {
            fs.writeFileSync(filename, fileContents, tspath_const_1.Const.FILE_ENCODING);
            return true;
        }
        catch (e) {
            throw Error("Error while saving file \"Could not save file \"".concat(filename, "\""));
        }
    };
    /**
     * Read and parse the TypeScript configuration file
     * @param configFilename
     */
    ParserEngine.prototype.readConfig = function (configFilename) {
        if (configFilename === void 0) { configFilename = tspath_const_1.Const.TS_CONFIG; }
        var fileName = path.resolve(this.projectPath, configFilename);
        fileName = path.resolve(this.projectPath, fileName);
        var fileData = fs.readFileSync(fileName, tspath_const_1.Const.FILE_ENCODING);
        var jsonCS = new json_comment_stripper_1.JsonCommentStripper();
        fileData = jsonCS.stripComments(fileData);
        try {
            this.tsConfig = JSON.parse(fileData);
        }
        catch (e) {
            logger_1.Logger.error("JSON parser failed for file \"".concat(fileName, "\""));
        }
        var compilerOpt = this.tsConfig.compilerOptions;
        var reqFields = [];
        reqFields["baseUrl"] = compilerOpt.baseUrl;
        reqFields["outDir"] = compilerOpt.outDir;
        for (var key in reqFields) {
            var field = reqFields[key];
            if (utils_1.Utils.isEmpty(field)) {
                log(chalk.red.bold("Missing required field:") + " \"" + chalk.bold.underline(key) + "\"");
                this.exit(22);
            }
        }
        return new project_options_1.ProjectOptions(compilerOpt);
    };
    /**
     * Traverse parsed JavaScript
     * @param ast
     * @param scope
     * @param func
     */
    ParserEngine.prototype.traverseSynTree = function (ast, scope, func) {
        func(ast);
        for (var key in ast) {
            if (ast.hasOwnProperty(key)) {
                var child = ast[key];
                if (typeof child === "object" && child !== null) {
                    if (Array.isArray(child)) {
                        child.forEach(function (ast) {
                            //5
                            scope.traverseSynTree(ast, scope, func);
                        });
                    }
                    else {
                        scope.traverseSynTree(child, scope, func);
                    }
                }
            }
        }
    };
    /**
     * Match a given file extension with the configured extensions
     * @param {string} fileExtension - ".xxx" or "xxx
     * @returns {boolean}
     */
    ParserEngine.prototype.matchExtension = function (fileExtension) {
        if (utils_1.Utils.isEmpty(fileExtension) || this.fileFilter.length == 0)
            return false;
        var matchesFilter = this.fileFilter.find(function (f) { return fileExtension.endsWith(f); }) !== undefined;
        return matchesFilter;
    };
    /**
     * Recursively walking a directory structure and collect files
     * @param dir
     * @param filelist
     * @param fileExtension
     * @returns {Array<string>}
     */
    ParserEngine.prototype.walkSync = function (dir, filelist, fileExtension) {
        var scope = this;
        var files = new Array();
        console.log("Walk Sync ::", dir);
        /*
            try {
    
            }
            catch (e) {
                DLog.error(`Unable to read directory "${ dir }"`, e);
                process.exit(667);
            }
    */
        filelist = filelist || [];
        fileExtension = !fileExtension ? "" : fileExtension;
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            console.log("FILE ::", file);
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filelist = this.walkSync(path.join(dir, file), filelist, fileExtension);
            }
            else {
                utils_1.Utils.updateLine(file);
                var tmpExt = path.extname(file);
                if (scope.matchExtension(tmpExt) || fileExtension === "*") {
                    var fullFilename = path.join(dir, file);
                    filelist.push(fullFilename);
                }
            }
        }
        return filelist;
    };
    return ParserEngine;
}());
exports.ParserEngine = ParserEngine;
