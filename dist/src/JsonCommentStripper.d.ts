/**
 * Json comment stripper
 */
export declare class JsonCommentStripper {
    private currState;
    private prevState;
    /**
     * Strip away comment lines
     * @param data
     */
    stripComments(data: string): string;
    /**
     * Parse file content
     * @param data
     */
    parse(data: string): string;
    /**
     * Validate if quote
     * @param char
     */
    private isQuote;
    /**
     * Set state
     * @param state
     */
    private setState;
    /**
     * Validate if in state
     * @param state
     */
    private inState;
    /**
     * Set previous state
     */
    private setPrevState;
    /**
     * Validate if in comment
     */
    private inComment;
}
