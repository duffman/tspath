import { ISettings, ITSConfig, IPaths } from "./type-definitions";
export declare class ProjectOptions {
    outDir: string;
    baseUrl: string;
    pathMappings: ISettings;
    processMappings(mappings: IPaths): void;
    constructor(tsconfigObj: ITSConfig);
}
