#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Confirm = require("prompt-confirm");
const ParserEngine_1 = require("./ParserEngine");
const ConfigFinder_1 = require("./ConfigFinder");
const chalk_1 = require("chalk");
// @ts-ignore
const package_json_1 = require("../package.json");
/**
 * TSPath main class
 */
class Command {
    /**
     * TSPath constructor, logs version
     */
    constructor() {
        console.log(chalk_1.default.yellow('TSPath ' + package_json_1.version));
    }
    /**
     * Execute command
     * @param args
     */
    execute(args) {
        const force = args.force || args.f;
        const projectPath = process.cwd();
        let config = null;
        try {
            let confPath = projectPath;
            if (args.root) {
                confPath = projectPath + '/' + args.root;
            }
            config = ConfigFinder_1.ConfigFinder.find(confPath);
            config.readContents();
        }
        catch (err) {
            console.log(chalk_1.default.bold.red(err));
            process.exit(23);
        }
        // @ts-ignore
        const engine = new ParserEngine_1.ParserEngine(config, args);
        if (force) {
            engine.execute();
        }
        else {
            new Confirm('Files found at <' + config.path + '>, continue processing ?')
                .ask((answer) => {
                if (answer) {
                    engine.execute();
                }
            });
        }
    }
}
exports.Command = Command;
