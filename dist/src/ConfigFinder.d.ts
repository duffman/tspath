import { ConfigFile } from './lib/ConfigFile';
/**
 * Config finder class
 */
export declare class ConfigFinder {
    /**
     * Find config file
     * @param startPath
     * @throws Error When no config file can be found
     */
    static find(startPath: string): ConfigFile;
    /**
     * File finder which traverses parent directories
     * until a given filename is found.
     * @param startPath
     * @param filename
     * @returns { ConfigFile, boolean }
     */
    static findFile(startPath: string, filename: string): any;
}
