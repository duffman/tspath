#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pkg = require('../package.json');
let fs = require("fs");
let path = require("path");
let chalk = require("chalk");
let log = console.log;
let Confirm = require('prompt-confirm');
let yargs = require("yargs").argv;
const parser_engine_1 = require("./parser-engine");
const parent_file_finder_1 = require("./parent-file-finder");
const type_definitions_1 = require("./type-definitions");
class TSPath {
    constructor() {
        this.engine = new parser_engine_1.ParserEngine();
        log(chalk.yellow("TSPath " + pkg.version));
        let args = process.argv.slice(2);
        let param = args[0];
        let filter = ["js"];
        let force = (yargs.force || yargs.f);
        let projectPath = process.cwd();
        let compactOutput = yargs.preserve ? false : true;
        let findResult = parent_file_finder_1.ParentFileFinder.findFile(projectPath, type_definitions_1.TS_CONFIG);
        let scope = this;
        if (yargs.ext || yargs.filter) {
            let argFilter = yargs.ext ? yargs.ext : yargs.filter;
            filter = argFilter.split(",").map((ext) => {
                return ext.replace(/\s/g, "");
            });
        }
        if (filter.length === 0) {
            log(chalk.bold.red("File filter missing!"));
            process.exit(23);
        }
        this.engine.compactMode = compactOutput;
        this.engine.setFileFilter(filter);
        if (force && findResult.fileFound) {
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
}
exports.TSPath = TSPath;
let tspath = new TSPath();
