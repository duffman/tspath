#! /usr/bin/env node

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

let fs         = require("fs");
let path       = require("path");
let chalk      = require("chalk");
const log      = console.log;

let Confirm = require('prompt-confirm');

import { ParserEngine }     from "./parser-engine";
import { ParentFileFinder } from "./parent-file-finder";
import { TS_CONFIG }        from "./type-definitions";

const pkg = require('../package.json');

export class TSPath {
	private engine = new ParserEngine();

	constructor() {
		log(chalk.yellow("TSPath " + pkg.version));
		let args = process.argv.slice(2);
		let param = args[0];

		let projectPath = process.cwd();

		let findResult = ParentFileFinder.findFile(projectPath, TS_CONFIG);

		var scope = this;

		if (param == "-f" && findResult.fileFound) {
			scope.processPath(findResult.path);

		} else if (findResult.fileFound) {
			let confirm = new Confirm("Process project at: <"  + findResult.path +  "> ?")
				.ask(function(answer) {
					if (answer) {
						scope.processPath(findResult.path);
					}
				});

		} else {
			log(chalk.bold("No project root found!"));
		}
	}

	private processPath(projectPath: string) {
		if (this.engine.setProjectPath(projectPath)) {
			this.engine.execute();
		}
	}

	public parseCommandLineParam(): string {
		let args = process.argv.slice(2);
		var param: string = null;

		if (args.length != 1) {
			param = args[0];
		}

		return param;
	}
}

let tspath = new TSPath();