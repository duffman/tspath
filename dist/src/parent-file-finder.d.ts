export declare class FileFindResult {
    fileFound: boolean;
    path: string;
    result: string;
    constructor(fileFound?: boolean, path?: string, result?: string);
}
export declare class ParentFileFinder {
    /**
     * File finder which traverses parent directories
     * until a given filename is found.
     * @param startPath
     * @param filename
     * @returns {FileFindResult}
     */
    static findFile(startPath: string, filename: string): FileFindResult;
}
