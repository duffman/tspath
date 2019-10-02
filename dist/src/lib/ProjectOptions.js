"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const chalk_1 = require("chalk");
/**
 * Project Options Class
 */
class ProjectOptions {
    /**
     * ProjectOptions Constructor
     * @param configObj
     */
    constructor(configObj) {
        this.outDir = null;
        this.baseUrl = null;
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
    processMappings(mappings) {
        // tslint:disable-next-line:forin
        for (const alias in mappings) {
            this.pathMappings[alias] = mappings[alias][0]; // No support for fallbacks yet...
        }
    }
    /**
     * Validate input
     */
    validate() {
        try {
            this.validateKey('pathMappings')
                .validateKey('baseUrl');
        }
        catch (e) {
            console.log(chalk_1.default.red.bold('Missing required field in config:') + ' "' + chalk_1.default.bold.underline(e.message) + '"');
            process.exit(22);
        }
    }
    /**
     * Exit on invalid key
     * @param key
     */
    validateKey(key) {
        // @ts-ignore
        if (!this.hasOwnProperty(key) || utils_1.Utils.isEmpty(this[key])) {
            throw new Error(key);
        }
        return this;
    }
}
exports.ProjectOptions = ProjectOptions;
