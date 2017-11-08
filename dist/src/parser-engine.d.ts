import { ProjectOptions } from "./project-options";
export declare class ParserEngine {
    projectPath: string;
    nrFilesProcessed: number;
    nrPathsProcessed: number;
    appRoot: string;
    projectOptions: ProjectOptions;
    tsConfig: any;
    constructor();
    exit(code?: number): void;
    setProjectPath(projectPath: string): boolean;
    private validateProjectPath(projectPath);
    /**
     * Attempts to read the name property form package.json
     * @returns {string}
     */
    private readProjectName();
    execute(): void;
    /**
     *
     * @param sourceFilename
     * @param jsRequire - require in javascript source "require("jsRequire")
     * @returns {string}
     */
    getRelativePathForRequiredFile(sourceFilename: string, jsRequire: string): any;
    /**
     * Processes the filename specified in require("filename")
     * @param node
     * @param sourceFilename
     * @returns {any}
     */
    processJsRequire(node: any, sourceFilename: string): any;
    /**
     * Extracts all the requires from a single file and processes the paths
     * @param filename
     */
    processFile(filename: string): void;
    /**
     * Saves file contents to disk
     * @param filename
     * @param fileContents
     */
    saveFileContents(filename: string, fileContents: string): void;
    /**
     * Read and parse the TypeScript configuration file
     * @param configFilename
     */
    readConfig(configFilename?: string): ProjectOptions;
    /**
     *
     * @param ast
     * @param scope
     * @param func
     */
    traverseSynTree(ast: any, scope: any, func: any): void;
    /**
     * Recursively walking a directory structure and collect files
     * @param dir
     * @param filelist
     * @param fileExtension
     * @returns {Array<string>}
     */
    walkSync(dir: string, filelist: Array<string>, fileExtension?: string): string[];
}
