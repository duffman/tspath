"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
/**
 * Argument class
 */
class Arguments {
    /**
     * Arguments Constructor
     * @param args CLI arguments
     */
    constructor(args) {
        this.f = false;
        this.force = false;
        this.root = false;
        this.preserve = false;
        this.filter = 'js';
        this.ext = 'js';
        this.minify = false;
        this.absPath = false;
        this.args = args;
        this.f = this.validateInput(args, 'f', 'boolean') ? args.f : false;
        this.force = this.validateInput(args, 'force', 'boolean') ? args.force : false;
        this.root = this.validateInput(args, 'root', 'string') ? args.root : false;
        this.preserve = this.validateInput(args, 'preserve', 'boolean') ? args.preserve : false;
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
    validateInput(args, key, type) {
        // @ts-ignore
        if (args.hasOwnProperty(key) && typeof args[key] !== type) {
            console.log(chalk_1.default.red.bold('Incorrect cli flag ') + '"' + chalk_1.default.bold.underline(key) + '", it should be of type ' + '"' + chalk_1.default.bold.underline(type) + '"');
            process.exit();
        }
        // @ts-ignore
        return typeof args[key] !== 'undefined';
    }
}
exports.Arguments = Arguments;
