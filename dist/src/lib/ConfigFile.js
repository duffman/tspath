"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const constants_1 = require("./constants");
const JsonCommentStripper_1 = require("../JsonCommentStripper");
const ProjectOptions_1 = require("./ProjectOptions");
/**
 * Config file class
 */
class ConfigFile {
    /**
     * Config file constructor
     * @param projectPath
     * @param fullPath
     * @param fileName
     */
    constructor(projectPath, fullPath, fileName) {
        this._path = '';
        this._fullPath = '';
        this._fileName = '';
        this.jsonStripper = new JsonCommentStripper_1.JsonCommentStripper();
        this._path = projectPath;
        this._fullPath = fullPath;
        this._fileName = fileName;
    }
    /**
     * Read and parse the configuration file
     */
    readContents() {
        const fileName = path.resolve(this._path, this._fileName);
        const fileData = this.jsonStripper.stripComments(fs.readFileSync(path.resolve(this._path, fileName), { encoding: constants_1.FILE_ENCODING }));
        const config = JSON.parse(fileData);
        const options = this._fileName === constants_1.TS_CONFIG ? config.compilerOptions : config;
        this._projectOptions = new ProjectOptions_1.ProjectOptions(options);
        return this;
    }
    /**
     * Path getter
     */
    get path() {
        return this._path;
    }
    /**
     * FileName getter
     */
    get fileName() {
        return this._fileName;
    }
    /**
     * ProjectOptions getter
     */
    get projectOptions() {
        return this._projectOptions;
    }
}
exports.ConfigFile = ConfigFile;
