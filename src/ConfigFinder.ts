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

 =---------------------------------------------------------------=

 This file is part of the TypeScript Path Igniter Project:
 https://github.com/duffman/ts-path-igniter

 Author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 Date: 2017-09-02

 =---------------------------------------------------------------= */

import * as fs from 'fs';
import * as path from 'path';
import { Utils } from './utils';
import { ConfigFile } from './lib/ConfigFile';
import { TSPATH_CONFIG, TS_CONFIG } from './lib/constants';

/**
 * Config finder class
 */
export class ConfigFinder {

    /**
     * Find config file
     * @param startPath
     * @throws Error When no config file can be found
     */
    public static find(startPath: string): ConfigFile {
        let result: ConfigFile;
        // tslint:disable-next-line:no-conditional-assignment
        if(false === (result = this.findFile(startPath, TSPATH_CONFIG))) {
            result = this.findFile(startPath, TS_CONFIG);
        }

        // If not one of the two configs found, throw Error
        if(!result) {
            console.log('WAAAAA', result);
            throw new Error('Could not find the required configuration file');
        }

        return result;
    }

    /**
     * File finder which traverses parent directories
     * until a given filename is found.
     * @param startPath
     * @param filename
     * @returns { ConfigFile, boolean }
     */
    public static findFile(startPath: string, filename: string): any {
        let result: ConfigFile | boolean = false;
        const sep = path.sep;
        const parts = startPath.split(sep);
        let fullPath: string;

        let tmpStr: string = sep;

        for (let i = 0; i < parts.length; i++) {
            tmpStr = path.resolve(tmpStr, parts[i]);
            tmpStr = Utils.ensureTrailingPathDelimiter(tmpStr);
            parts[i] = tmpStr;
        }

        for (let i = parts.length - 1; i > 0; i--) {
            tmpStr = parts[i];
            fullPath = path.resolve(tmpStr, filename);

            if (fs.existsSync(fullPath)) {
                result = new ConfigFile(tmpStr, fullPath, filename);
                break;
            }
        }

        return result;
    }
}
