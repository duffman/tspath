import { ConfigFile } from './lib/ConfigFile';
import { Arguments } from './lib/Arguments';
/**
 * Parser engine class
 */
export declare class ParserEngine {
    private config;
    private args;
    private pathResolver;
    private readonly fileFilter;
    private nrFilesProcessed;
    private nrPathsProcessed;
    /**
     * ParserEngine constructor
     * @param config
     * @param args
     */
    constructor(config: ConfigFile, args: Arguments);
    /**
     * Exit
     * @param code
     */
    private exit;
    /**
     * Parse project and resolve paths
     */
    execute(): void;
    /**
     *
     * @param sourceFilename
     * @param jsRequire - require in javascript source "require("jsRequire")
     * @returns {string}
     */
    getRelativePathForRequiredFile(sourceFilename: string, jsRequire: string): string;
    /**
     * Processes the filename specified in require("filename")
     * @param node
     * @param sourceFilename
     * @returns any
     */
    processJsRequire(node: any, sourceFilename: string): any;
    /**
     * Extracts all the requires from a single file and processes the paths
     * @param filename
     * @param baseUrl
     */
    processFile(filename: string, baseUrl: string): void;
    /**
     * Saves file contents to disk
     * @param filename
     * @param fileContents
     */
    saveFileContents(filename: string, fileContents: string): void;
    /**
     * @param ast
     * @param scope
     * @param method
     */
    traverseSynTree(ast: any, scope: any, method: (ast: any) => void): void;
    /**
     * Recursively walking a directory structure and collect files
     * @param dir
     * @param fileList
     * @param fileExtension
     * @returns {Array<string>}
     */
    walkSync(dir: string, fileList: string[], fileExtension?: string): string[];
    /**
     * Validate if project path is correct
     * @param projectPath
     */
    private validateProjectPath;
    /**
     * Attempts to read the name property form package.json
     * @returns {string}
     */
    private readProjectName;
    /**
     * Match a given file extension with the configured extensions
     * @param {string} fileExtension - ".xxx" or "xxx
     * @returns {boolean}
     */
    private matchExtension;
}
