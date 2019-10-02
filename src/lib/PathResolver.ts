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

import { ConfigFile } from './ConfigFile';
import * as path from 'path';

/**
 * PathResolver class
 */
export class PathResolver {
    private readonly _projectRoot: string;
    private _appRoot: string;
    private readonly _distRoot: string;

    /**
     * PathResolver constructor
     */
    constructor(config: ConfigFile) {
        this._projectRoot = config.path;
        this._appRoot = config.projectOptions.baseUrl ? path.resolve(this._projectRoot, config.projectOptions.baseUrl) : this._projectRoot;
        this._distRoot = config.projectOptions.outDir ? path.resolve(this._projectRoot, config.projectOptions.outDir) : this._projectRoot;
    }

    /**
     * ProjectRoot getter
     */
    get projectRoot(): string {
        return this._projectRoot;
    }

    /**
     * Dist root getter
     */
    get distRoot(): string {
        return this._distRoot;
    }
}
