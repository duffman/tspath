import { ISettings } from './ISettings';
/**
 * Project Options Class
 */
export declare class ProjectOptions {
    outDir: string | null;
    baseUrl: string | null;
    pathMappings: ISettings;
    /**
     * ProjectOptions Constructor
     * @param configObj
     */
    constructor(configObj: any);
    /**
     * Process path mappings
     * @param mappings
     */
    processMappings(mappings: ISettings[]): void;
    /**
     * Validate input
     */
    private validate;
    /**
     * Exit on invalid key
     * @param key
     */
    private validateKey;
}
