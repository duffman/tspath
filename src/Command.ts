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

// @ts-ignore
import * as Confirm from 'prompt-confirm';
import { ParserEngine } from './ParserEngine';
import { ConfigFinder } from './ConfigFinder';
import chalk from 'chalk';
import { ConfigFile } from './lib/ConfigFile';
// @ts-ignore
import { version } from '../package.json';
import { Arguments } from './lib/Arguments';

/**
 * TSPath main class
 */
export class Command {
    /**
     * TSPath constructor, logs version
     */
    constructor() {
        console.log(chalk.yellow('TSPath ' + version));
    }

    /**
     * Execute command
     * @param args
     */
    public execute(args: Arguments): void {
        const force: boolean = args.force || args.f;
        const projectPath = process.cwd();

        let config: ConfigFile | null = null;
        try {
            let confPath = projectPath;
            if (args.root) {
                confPath = projectPath + '/' + args.root;
            }
            config = ConfigFinder.find(confPath);
            config.readContents();
        } catch(err) {
            console.log(chalk.bold.red(err));
            process.exit(23);
        }

        // @ts-ignore
        const engine: ParserEngine = new ParserEngine(config, args);

        if (force) {
            engine.execute();
        } else {
            new Confirm('Files found at <' + config!.path + '>, continue processing ?')
                .ask((answer: boolean) => {
                    if (answer) {
                        engine.execute();
                    }
                });
        }
  }
}
