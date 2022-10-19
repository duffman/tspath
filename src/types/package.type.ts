/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-10-06 19:17
 */

import { IJsonFile } from "../utils/json-file";

export interface PackageType extends IJsonFile {
	name?: string;
	version?: string;
	description?: string;
	license?: string;
	scripts?: Record<string, string>;
	preferGlobal?: boolean;
	bin?: Record<string, string>;
	keywords?: string[];
	author?: string;
	repository?: {
		type: string,
		url: string
	};
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
}
