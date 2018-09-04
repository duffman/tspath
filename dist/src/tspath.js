#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let fs = require("fs");
let path = require("path");
let chalk = require("chalk");
const log = console.log;
let Confirm = require('prompt-confirm');
const parser_engine_1 = require("./parser-engine");
const parent_file_finder_1 = require("./parent-file-finder");
const type_definitions_1 = require("./type-definitions");
const pkg = require('../package.json');
class TSPath {
    constructor() {
        this.engine = new parser_engine_1.ParserEngine();
        log(chalk.yellow("TSPath " + pkg.version));
        let param = TSPath.parseCommandLineParam("-f");
        let projectPath = process.cwd();
        let findResult = parent_file_finder_1.ParentFileFinder.findFile(projectPath, type_definitions_1.TS_CONFIG);
        var scope = this;
        if (param && findResult.fileFound) {
            scope.processPath(findResult.path);
        }
        else if (findResult.fileFound) {
            let confirm = new Confirm("Process project at: <" + findResult.path + "> ?")
                .ask(function (answer) {
                if (answer) {
                    scope.processPath(findResult.path);
                }
            });
        }
        else {
            log(chalk.bold("No project root found!"));
        }
    }
    processPath(projectPath) {
        if (this.engine.setProjectPath(projectPath)) {
            this.engine.execute();
        }
    }
    static parseCommandLineParam(id) {
        let args = process.argv.slice(2);
        var param = null;
        const argsLen = args.length;
        let counter = 0;
        while (param === null && counter < argsLen) {
            if (args[counter] === id)
                param = args[counter];
            counter++;
        }
        ;
        return param;
    }
}
exports.TSPath = TSPath;
let tspath = new TSPath();
