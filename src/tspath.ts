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

const chalk = require("ansi-colors");
const log   = console.log;
let Confirm = require("prompt-confirm");
let yargs   = require("yargs")
	.usage("Resolve relative paths in JS output.\nUsage: run $0 in <project-directory>")
	.option("force")
	.alias("force", "f")
	.describe("force", "Skip confirmation")

	.option("projectPath")
	.describe("projectPath", "Path to project directory (tsconfig.json)")
	.string("projectPath")

	.option("verbose")
	.alias("verbose", "v")
	.describe("verbose", "Output extra info")

	.option("silent")
	.alias("silent", "s")
	.describe("silent", "Output nothing (also includes -force)")

	.option("dryRun")
	.alias("dryRun", "dry")
	.describe("dryRun", "Don´t write any output files")


	.showHelpOnFail(false, "Specify --help for available options")
	.help("help")
	.argv;

import * as os              from "os";
import * as path            from "path";
import { ParserEngine }     from "./parser-engine";
import { Const }            from "./tspath.const";
import { JsonFile }         from "./utils/json-file";
import { Logger }           from "./utils/logger";
import { ParentFileFinder } from "./utils/parent-file-finder";
import { existsSync }       from "fs";
import { Utils }            from "./utils/utils";

export class TSPath {
	private engine = new ParserEngine();

	constructor() {
		const pkg: any = new JsonFile("package.json");
		log(chalk.yellow(`TSPath v${ Const.VERSION }`));
		console.log("Try: 'tspath --help' for more information");

		let filter             = [ "js" ];
		const force: boolean   = yargs.force || yargs.f;
		const verbose: boolean = yargs.verbose || yargs.v;
		let projectPath        = yargs.projectPath ?? process.cwd();
		let compactOutput      = !yargs.preserve;

		if (yargs.projectPath && projectPath.startsWith("~")) {
			projectPath = path.join(
				os.homedir(),
				Utils.ensureLeadingSlash(projectPath.substring(1))
			);
		}

		let findResult = ParentFileFinder.findFile(projectPath, Const.TS_CONFIG);

		if (yargs.projectPath && !existsSync(projectPath)) {
			log(chalk.bold(`Project path "${ projectPath }" was root found!`));
			process.exit(666);
		}

		if (yargs.ext || yargs.filter) {
			let argFilter = yargs.ext ? yargs.ext : yargs.filter;
			filter        = argFilter.split(",").map((ext) => {
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
			this.processPath(findResult.path);
		}
		else if (findResult.fileFound) {
			let confirm = new Confirm("Process project at: <" + findResult.path + "> ?").ask(answer => {
				if (answer) {
					this.processPath(findResult.path);
				}
			});
		}
		else {
			log(chalk.bold("No project root found!"));
		}
	}

	private processPath(projectPath: string) {
		if (this.engine.setProjectPath(projectPath)) {
			this.engine.execute();
		}
	}
}

new TSPath();
