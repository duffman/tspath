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
import { ParserEngine } from './parser-engine';
import { ParentFileFinder } from './parent-file-finder';
import { TS_CONFIG, TSPATH_CONFIG, IArguments } from './lib/type-definitions';
import chalk from 'chalk';
import { FileFindResult } from './lib/FileFindResult';
// @ts-ignore
import { version } from '../package.json';
import * as path from 'path';

/**
 * TSPath main class
 */
export class TSPath {
    private engine = new ParserEngine();

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

        let config: FileFindResult;
        if (args.conf) {
             config = ParentFileFinder.findFile(process.cwd() + '/' + args.conf, TSPATH_CONFIG);
             if(!config.fileFound) {
                 console.log(chalk.bold.red('Given configuration path <' + args.conf + '> is not resolvable'));
                 process.exit(23);
             }
        } else {
            config = ParentFileFinder.findFile(projectPath, TSPATH_CONFIG);
            if(!config.fileFound) {
                config = ParentFileFinder.findFile(projectPath, TS_CONFIG);
            }

            if(!config.fileFound) {
                console.log(chalk.bold.red('Could not find the required configuration file'));
                process.exit(23);
            }
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

        this.engine.compactMode = compactOutput;
        this.engine.setFileFilter(filter);

        if (force && config.fileFound) {
            scope.processPath(config.path, config.result);
        } else if (config.fileFound) {
            new Confirm('Files found at <' + config.path + '>, continue processing ?')
                .ask(function(answer: boolean) {
                    if (answer) {
                        scope.processPath(config.path, config.result);
                    }
                });
        } else {
            console.log(chalk.bold('No project root found!'));
        }
  }

    /**
     * Process project path
     * @param projectPath
     * @param configPath
     */
    private processPath(projectPath: string, configPath: string): void {
        if (this.engine.setProjectPath(projectPath)) {
            this.engine.execute(configPath);
        }
    }
}
