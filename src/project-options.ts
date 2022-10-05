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

import { ISettings } from "./tspath.types";
import { ITSConfig } from "./tspath.types";
import { IPaths }    from "./tspath.types";

export class ProjectOptions {
	public outDir: string;
	public baseUrl: string;
	public removeComments: boolean;
	public pathMappings: ISettings;

	//TODO: Support fallbacks
	private processMappings(mappings: IPaths) {
		for (const alias in mappings) {
			this.pathMappings[ alias ] = mappings[ alias ][ 0 ]; // No support for fallbacks yet...
		}
	}

	constructor(tsconfigObj: ITSConfig) {
		this.pathMappings   = {};
		this.outDir         = tsconfigObj.outDir;
		this.baseUrl        = tsconfigObj.baseUrl;
		this.removeComments = tsconfigObj.removeComments;
		this.processMappings(tsconfigObj.paths);
	}
}
