export declare class JsonCommentStripper {
    private currState;
    private prevtState;
    constructor();
    stripComments(data: string): string;
    private isQuote(char);
    private setState(state);
    private inState(state);
    private setPrevState();
    private inComment();
    parse(data: string): string;
}
