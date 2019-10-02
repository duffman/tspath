/**
 * Argument class
 */
export declare class Arguments {
    f: boolean;
    force: boolean;
    root: string | boolean;
    preserve: boolean;
    filter: string;
    ext: string;
    minify: boolean;
    absPath: boolean;
    private args;
    /**
     * Arguments Constructor
     * @param args CLI arguments
     */
    constructor(args: any);
    /**
     * Validate input type
     * @param args
     * @param key
     * @param type
     */
    private validateInput;
}
