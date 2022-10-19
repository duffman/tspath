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

import type { Literal } from "esprima-next";
import * as path from "path";

export class Utils {
	/**
	 * Helper method used to safely get the value of an AST node
	 * @param node
	 * @returns {string}
	 */
	public static safeGetAstNodeValue(node: Literal): string {
		if (Utils.isEmpty(node) || Utils.isEmpty(node.value) || typeof node.value !== "string") {
			return "";
		} else {
			return node.value;
		}
	}

	/**
	 * Cross platform method that verifies that the given path ends
	 * with a path delimiter, NOTE that this method does no effort
	 * in verifying that your path string is correct.
	 * @param searchPath
	 * @returns {string}
	 */
	public static ensureTrailingPathDelimiter(searchPath: string) {
		if (Utils.isEmpty(searchPath)) {
			return;
		}

		const pathSep = path.sep;
		if (searchPath.endsWith(pathSep) == false) {
			searchPath = searchPath + pathSep;
		}
		return searchPath;
	}

	/**
	 * Appends given value to a given path
	 * @param path
	 * @param part
	 * @param trailingDelim
	 */
	public static appendToPath(path: string, part: string, trailingDelim = true) {
		Utils.ensureTrailingPathDelimiter(path);
		path += part;

		if (trailingDelim) {
			Utils.ensureTrailingPathDelimiter(path);
		}
	}

	/**
	 * Checks for unset input string
	 * @param input
	 * @returns {boolean}
	 */
	public static isEmpty(input): boolean {
		return input === undefined || input === null || input === "";
	}

	/**
	 * Removes the trailing "*" from a string (if any)
	 * @param path
	 * @returns {string}
	 */
	public static stripWildcard(path: string): string {
		if (path.endsWith("/*")) {
			path = path.substr(0, path.length - 2);
		}

		return path;
	}

	/**
	 * Replaces double slashes "//" (if any)
	 * @param filePath
	 */
	static replaceDoubleSlashes(filePath: string) {
		return path.normalize(filePath);
	}
	/**
	 * Converts EFBBBF (UTF-8 BOM) to FEFF (UTF-16 BOM)
	 * @param data
	 */
	public static stripByteOrderMark(data: string): string {
		if (data.charCodeAt(0) === 0xfeff) {
			data = data.slice(1);
		}

		return data;
	}

	/**
	 * Checks if a given filename contains a search path
	 * @param filename
	 * @returns {boolean}
	 */
	public static fileHavePath(filename: string): boolean {
		return filename !== path.basename(filename);
	}
}
