export declare class Utils {
    /**
     * Helper method used to safely get the value of an AST node
     * @param node
     * @returns {string}
     */
    static safeGetAstNodeValue(node: any): string;
    /**
     * Cross platform method that verifies that the given path ends
     * with a path delimiter, NOTE that this method does no effort
     * in verifying that your path string is correct.
     * @param searchPath
     * @returns {string}
     */
    static ensureTrailingPathDelimiter(searchPath: string): string;
    /**
     * Appends given value to a given path
     * @param path
     * @param part
     * @param trailingDelim
     */
    static appendToPath(path: string, part: string, trailingDelim?: boolean): void;
    /**
     * Checks for unset input string
     * @param input
     * @returns {boolean}
     */
    static isEmpty(input: any): boolean;
    /**
     * Removes the trailing "*" from a string (if any)
     * @param path
     * @returns {string}
     */
    static stripWildcard(path: string): string;
    /**
     * Replaces double slashes "//" (if any)
     * @param filePath
     */
    static replaceDoubleSlashes(filePath: string): void;
    /**
     * Converts EFBBBF (UTF-8 BOM) to FEFF (UTF-16 BOM)
     * @param data
     */
    static stripByteOrderMark(data: string): string;
    /**
     * Checks if a given filename contains a search path
     * @param filename
     * @returns {boolean}
     */
    static fileHavePath(filename: string): boolean;
}
