import * as path from "path";
import * as fs from "fs";
import { FILE_ENCODING, TS_CONFIG } from './constants';
import { JsonCommentStripper } from '../json-comment-stripper';
import { ProjectOptions } from './project-options';

/**
 * Config file class
 */
export class ConfigFile {
    private readonly _path: string = '';
    private _fullPath: string = '';
    private readonly _fileName: string = '';

    private _projectOptions: ProjectOptions;
    private jsonStripper =  new JsonCommentStripper();

    /**
     * Config file constructor
     * @param projectPath
     * @param fullPath
     * @param fileName
     */
    constructor(projectPath: string, fullPath: string, fileName: string) {
        this._path = projectPath;
        this._fullPath = fullPath;
        this._fileName = fileName;
    }

    /**
     * Read and parse the configuration file
     */
    public readContents(): ConfigFile {
        const fileName = path.resolve(this._path, this._fileName);
        const fileData = this.jsonStripper.stripComments(
            fs.readFileSync(path.resolve(this._path, fileName), { encoding: FILE_ENCODING }),
        );
        const config = JSON.parse(fileData);
        const options = this._fileName === TS_CONFIG ? config.compilerOptions : config;

        this._projectOptions = new ProjectOptions(options);

        return this;
    }

    /**
     * Path getter
     */
    get path(): string {
        return this._path;
    }

    /**
     * FileName getter
     */
    get fileName(): string {
        return this._fileName;
    }

    /**
     * ProjectOptions getter
     */
    get projectOptions(): ProjectOptions {
        return this._projectOptions;
    }
}
