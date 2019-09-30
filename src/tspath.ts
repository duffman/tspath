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
import { IArguments } from './lib/type-definitions';
import chalk from 'chalk';
import { ConfigFile } from './lib/ConfigFile';
// @ts-ignore
import { version } from '../package.json';

/**
 * TSPath main class
 */
export class TSPath {
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
    public execute(args: IArguments): void {
        let filter = ['js'];
        const scope = this;
        const force: boolean = args.force || args.f;
        const projectPath = process.cwd();
        const compactOutput = !args.preserve;

        let config: ConfigFile;
        try {
            let confPath = projectPath;
            if (typeof args.conf === 'string' && '' !== args.conf) {
                confPath = projectPath + '/' + args.conf;
            }
            config = ConfigFinder.find(confPath);
        } catch($err) {
            console.log(chalk.bold.red('Could not find the required configuration file'));
            process.exit(23);
        }

        if (args.ext || args.filter) {
            const argFilter = args.ext ? args.ext : args.filter;
            filter = argFilter.split(',').map((ext) => {
                return ext.replace(/\s/g, '');
            });
        }

        if (filter.length === 0) {
            console.log(chalk.bold.red('File filter missing!'));
            process.exit(23);
        }

        if (force) {
            scope.processPath(config!.path, config!.fullPath, config!.fileName, compactOutput, filter);
        } else {
            new Confirm('Files found at <' + config!.path + '>, continue processing ?')
                .ask((answer: boolean) => {
                    if (answer) {
                        scope.processPath(config!.path, config!.fullPath, config!.fileName, compactOutput, filter);
                    }
                });
        }
  }

    /**
     * Process project path
     * @param projectPath
     * @param configPath
     * @param fileName
     * @param compactOutput
     * @param filter
     */
    private processPath(projectPath: string, configPath: string, fileName: string, compactOutput: boolean, filter: string[]): void {
        const engine: ParserEngine = new ParserEngine(projectPath, fileName, compactOutput, filter);
        engine.execute(configPath);
    }
}
