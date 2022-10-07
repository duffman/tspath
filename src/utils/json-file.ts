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

 @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 @date: 2022-10-04 18:38

 =----------------------------------------------------------------= */

import * as fs    from "fs";
import { Const }  from "../tspath.const";
import { Logger } from "./logger";

export interface IJsonFile {
	rawData: any;
}

export class JsonFile implements IJsonFile {
	public rawData: any;

	constructor(filename: string) {
		try {
			const jsonStr = fs.readFileSync(filename, Const.FILE_ENCODING) as string;
			this.rawData = JSON.parse(jsonStr);
			Object.assign(this, this.rawData);
		} catch (e) {
			Logger.logRed(`Failed to read and parse JSON file "${filename}"`, e);
		}
	}

	/**
	 * Get property
	 * @param {string} name
	 * @param defVal
	 * @returns {any}
	 */
	public getProp<T = any>(name: string, defVal?: any): any {
		try {
			return this.rawData[name] as T;
		} catch (e) {
			return defVal;
		}
	}
}
