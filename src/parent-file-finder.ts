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

 Json Comment Stripper

 Simple Parser used to strip block and line comments form a
 JSON formatted string.

 Worth knowing: The parser treat " and ' the same, so it´s
 possible to start a string with " and end it with '

 This file is part of the TypeScript Path Igniter Project:
 https://github.com/duffman/ts-path-igniter

 Author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 Date: 2017-09-02

 =---------------------------------------------------------------= */

import * as fs       from "fs";
import * as path     from "path";
import { Utils }     from "./utils";
import { TS_CONFIG } from "./type-definitions";

export class FileFindResult {
	constructor(
		public fileFound: boolean = false,
		public path: string = "",
		public result: string = ""
	)
	{}
}

export class ParentFileFinder {
	/**
	 * File finder which traverses parent directories
	 * until a given filename is found.
	 * @param startPath
	 * @param filename
	 * @returns {FileFindResult}
	 */
	public static findFile(startPath: string, filename: string): FileFindResult {
		let result = new FileFindResult();
		let sep = path.sep;
		var parts = startPath.split(sep);

		var tmpStr = <string> sep;

		for (var i = 0; i < parts.length; i++) {
			tmpStr = path.resolve(tmpStr, parts[i]);
			tmpStr = Utils.ensureTrailingPathDelimiter(tmpStr);
			parts[i] = tmpStr;
		}

		for (var i = parts.length-1; i > 0; i--) {
			tmpStr = parts[i];
			filename = path.resolve(tmpStr, TS_CONFIG);

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