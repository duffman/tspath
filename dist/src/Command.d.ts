#! /usr/bin/env node
import { Arguments } from './lib/Arguments';
/**
 * TSPath main class
 */
export declare class Command {
    /**
     * TSPath constructor, logs version
     */
    constructor();
    /**
     * Execute command
     * @param args
     */
    execute(args: Arguments): void;
}
