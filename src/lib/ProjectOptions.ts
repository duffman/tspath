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

import { ISettings } from './ISettings';
import { Utils } from '../utils';
import chalk from 'chalk';

/**
 * Project Options Class
 */
export class ProjectOptions {
    public outDir: string | null = null;
    public baseUrl: string | null = null;
    public pathMappings: ISettings;

    /**
     * ProjectOptions Constructor
     * @param configObj
     */
    constructor(configObj: any) {
        this.pathMappings = {};
        this.outDir = configObj.outDir || './';
        this.baseUrl = configObj.baseUrl;
        this.processMappings(configObj.paths);
        this.validate();
    }

    /**
     * Process path mappings
     * @param mappings
     */
    public processMappings(mappings: ISettings[]): void {
        // tslint:disable-next-line:forin
        for (const alias in mappings) {
            this.pathMappings[alias] = mappings[alias][0]; // No support for fallbacks yet...
        }
    }

    /**
     * Validate input
     */
    private validate(): void {
        try {
            this.validateKey('pathMappings')
                .validateKey('baseUrl');
        } catch(e) {
            console.log(chalk.red.bold('Missing required field in config:') + ' "' + chalk.bold.underline(e.message) + '"');
            process.exit(22);
        }
    }

    /**
     * Exit on invalid key
     * @param key
     */
    private validateKey(key: string): ProjectOptions {
        // @ts-ignore
        if (!this.hasOwnProperty(key) || Utils.isEmpty(this[key])) {
            throw new Error(key);
        }

        return this;
    }
}
