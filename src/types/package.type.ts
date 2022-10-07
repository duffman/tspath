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
	scripts?: any;
	preferGlobal?: boolean;
	bin?: any;
	keywords?: string[];
	author?: string;
	repository?: any;
	dependencies?: any;
	devDependencies?: any;
}
