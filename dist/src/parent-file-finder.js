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

 =---------------------------------------------------------------=

 This file is part of the TypeScript Path Igniter Project:
 https://github.com/duffman/ts-path-igniter

 Author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 Date: 2017-09-02

 =---------------------------------------------------------------= */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const utils_1 = require("./utils");
const type_definitions_1 = require("./type-definitions");
class FileFindResult {
    constructor(fileFound = false, path = "", result = "") {
        this.fileFound = fileFound;
        this.path = path;
        this.result = result;
    }
}
exports.FileFindResult = FileFindResult;
class ParentFileFinder {
    /**
     * File finder which traverses parent directories
     * until a given filename is found.
     * @param startPath
     * @param filename
     * @returns {FileFindResult}
     */
    static findFile(startPath, filename) {
        let result = new FileFindResult();
        let sep = path.sep;
        let parts = startPath.split(sep);
        let tmpStr = sep;
        for (let i = 0; i < parts.length; i++) {
            tmpStr = path.resolve(tmpStr, parts[i]);
            tmpStr = utils_1.Utils.ensureTrailingPathDelimiter(tmpStr);
            parts[i] = tmpStr;
        }
        for (let i = parts.length - 1; i > 0; i--) {
            tmpStr = parts[i];
            filename = path.resolve(tmpStr, type_definitions_1.TS_CONFIG);
            if (fs.existsSync(filename)) {
                result.fileFound = true;
                result.path = tmpStr;
                result.result = filename;
                break;
            }
        }
        return result;
    }
}
exports.ParentFileFinder = ParentFileFinder;
