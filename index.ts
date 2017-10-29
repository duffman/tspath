#! /usr/bin/env node

import { Utils } from "./src/utils";
let fs         = require("fs");
let path       = require("path");
let chalk      = require("chalk");
const log      = console.log;
const logBlank = console.log("\n");

var co         = require('co');
var prompt     = require('co-prompt');
var program   = require('commander');

import { ParserEngine }     from "./src/parser-engine";
import { ParentFileFinder } from "./src/parent-file-finder";
import { TS_CONFIG }        from "./src/type-definitions";

export class TSPath {
	engine = new ParserEngine();

	constructor() {




		/*
		program
			.arguments('<path>')
			.option('-c, --current <current>', "Use current path")
			.option('-l, --locate <locate>', "Attempts to locate tsconfig.json")
			.action(function(file) {
				co(function * () {
					var ok = yield confirm('are you sure? ');

				});
			})
			.parse(process.argv);
		*/

		log(chalk.blue("Coldmind - Snowflake 0.7.1"));
		let args = process.argv.slice(2);
		let param = args[0];

		var projectPath = "";
		var apath = "/Users/patrikforsberg/Putte/BlackLotusServer/ServerCore/Plugins/External";

		ParentFileFinder.findFile(apath, TS_CONFIG);

		/*
		if (param == "--current") {
			projectPath = process.cwd();
		}
		else if (param == "--locate") {
			//this.locateFile(process.cwd());

		} else {
			log("Falling back to durrent Directory");
			projectPath = param;
		}


		if (this.engine.setProjectPath(projectPath)) {
			this.engine.execute();
		}
		*/
	}

	showHelp() {
		let blank = '\u000A'; ///" ";

		log(chalk.bold.blue("Snowflake - TypeScript Path Alias Resolver"));
		log(blank);
		log("Snowflake uses the " + chalk.bold("tsconfig.json"));
		log("Usage: snowflake " + chalk.bold("<path to project root>"));
		log(blank);
		log("Alternatives to manual entered path:");
		log(blank);
		log(chalk.bold("--current") + "  Uses the current directory");
		log(chalk.bold("--sniff") + "    Tries to locate the tsconfig.json");
		log(blank);
	}

	public parseCommandLineParam(): string {
		let args = process.argv.slice(2);
		var param: string = null;

		if (args.length != 1) {
			param = args[0];

			if (param == "--current") {
				param = process.cwd();
			}
			else if (param == "--locate") {

			}
			else if (fs.existsSync(param)) {
			}
			else {

			}
		}

		return null;
	}
}

let tspath = new TSPath();