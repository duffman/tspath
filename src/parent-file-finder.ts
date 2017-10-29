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

/*
 Simple File Finder that mimics the behaviour of the
 TypeScript compiler when locating it´s tsconfig.json

 The file finder will keep traversing parent directories
 until the file is found or the root is reached

 This file is part of the Snowflake Project:
 https://github.com/duffman/snowflake

 @Author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 @Date: 2017-10-26
 */

let path = require("path");
let fs   = require("fs");

import { Utils } from "./utils";
import { TS_CONFIG } from "./type-definitions";

export class FileFindResult {
	constructor(
		public fileFound: boolean = false,
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
		var parts = filename.split(sep);

		console.log("Parts:", parts);
		var tmpStr = sep;

		for (var i = 0; i < parts.length; i++) {
			tmpStr = path.resolve(tmpStr, parts[i]);
			tmpStr = Utils.ensureTrailingPathDelimiter(tmpStr);
			parts[i] = tmpStr;
			console.log(tmpStr);
		}

		console.log(" ");

		for (var i = parts.length-1; i > 0; i--) {
			tmpStr = parts[i];
			filename = path.resolve(tmpStr, TS_CONFIG);

			console.log("Trying to find:", filename);

			if (fs.existsSync(filename)) {
				result.fileFound = true;
				result.result = filename;
				console.log("********** Project Root found at:", tmpStr);
				break;
			}

			console.log(tmpStr);
		}

		return result;
	}


}