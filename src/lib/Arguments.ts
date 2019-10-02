import { Argv } from 'yargs';
import chalk from 'chalk';

/**
 * Argument class
 */
export class Arguments {
    public f: boolean = false;
    public force: boolean = false;
    public root: string | boolean = false;
    public preserve: boolean = false;
    public filter: string = 'js';
    public ext: string = 'js';
    public minify: boolean = false;
    public absPath: boolean = false;

    private args: Argv;

    /**
     * Arguments Constructor
     * @param args CLI arguments
     */
    constructor(args: any) {
        this.args = args;

        this.f = this.validateInput(args, 'f', 'boolean') ? args.f : false;
        this.force = this.validateInput(args, 'force', 'boolean') ? args.force : false;
        this.root = this.validateInput(args, 'root', 'string') ? args.root : false;
        this.preserve = this.validateInput(args, 'preserve', 'boolean') ?  args.preserve: false;
        this.filter = this.validateInput(args, 'filter', 'string') ? args.filter : 'js';
        this.ext = this.validateInput(args, 'ext', 'string') ? args.ext : 'js';
        this.minify = this.validateInput(args, 'minify', 'boolean') ? args.minify : false;
        this.absPath = this.validateInput(args, 'absPath', 'boolean') ? args.absPath : false;
    }

    /**
     * Validate input type
     * @param args
     * @param key
     * @param type
     */
    private validateInput(args: Argv, key: string, type: string): boolean {
        // @ts-ignore
        if(args.hasOwnProperty(key) && typeof args[key] !== type) {
            console.log(chalk.red.bold('Incorrect cli flag ') + '"' + chalk.bold.underline(key) + '", it should be of type ' + '"' + chalk.bold.underline(type) + '"');
            process.exit();
        }

        // @ts-ignore
        return typeof args[key] !== 'undefined';
    }
}
