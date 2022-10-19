/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-10-04 10:41
 */

import * as fs   from "fs";
import * as path from "path";
import { Utils } from "./utils";

export class PathUtils {
	/**
	 * Check if given path exists
	 * @param {string} path
	 * @returns {boolean}
	 */
	public static pathExist(path: string): boolean {
		return fs.existsSync(path);
	}

	/**
	 * Get relative path from 1 to another
	 * @param {string} fromPath
	 * @param {string} toPath
	 * @param {boolean} dotSlashForSamePath
	 * @returns {string}
	 */
	public static getRelativePath(fromPath: string, toPath: string, dotSlashForSamePath = true): string {
		let relativePath: string = path.relative(fromPath, toPath);

		if (!relativePath.trim().length && dotSlashForSamePath) {
			relativePath = ".";
		}

		relativePath = Utils.ensureTrailingSlash(relativePath);
		return relativePath;
	}
}
