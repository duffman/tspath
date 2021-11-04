#! /usr/bin/env node
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
exports.TSPath = void 0;
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
