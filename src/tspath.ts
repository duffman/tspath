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

const log = console.log;
const Confirm = require("prompt-confirm");
const yargs = require("yargs").argv;

import { bold, red, yellow } from "./utils/color";
import { ParserEngine }      from "./parser-engine";
import { Const }             from "./tspath.const";
import { JsonFile }          from "./utils/json-file";
import { ParentFileFinder }  from "./utils/parent-file-finder";

export class TSPath {
	private engine = new ParserEngine();

	constructor() {
		const pkg: any = new JsonFile("package.json");

		log(yellow(`TSPath v${ Const.VERSION }`));
		let filter = ["js"];
		const force: boolean = yargs.force || yargs.f;
		const verbose: boolean = yargs.verbose || yargs.v;
		let projectPath = process.cwd();
		let compactOutput = !yargs.preserve;
		let findResult = ParentFileFinder.findFile(projectPath, Const.TS_CONFIG);

		if (yargs.ext || yargs.filter) {
			let argFilter = yargs.ext ? yargs.ext : yargs.filter;
			filter = argFilter.split(",").map((ext) => {
				return ext.replace(/\s/g, "");
			});
		}

		if (filter.length === 0) {
			log(bold(red("File filter missing!")));
			process.exit(23);
		}

		this.engine.compactMode = compactOutput;
		this.engine.setFileFilter(filter);

		if (force && findResult.fileFound) {
			this.processPath(findResult.path);
		} else if (findResult.fileFound) {
			let confirm = new Confirm("Process project at: <" + findResult.path + "> ?").ask(answer => {
				if (answer) {
					this.processPath(findResult.path);
				}
			});
		} else {
			log(bold("No project root found!"));
		}
	}

	private processPath(projectPath: string) {
		if (this.engine.setProjectPath(projectPath)) {
			this.engine.execute();
		}
	}
}

new TSPath();
