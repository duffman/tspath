/**
 * Config file class
 */
export class ConfigFile {
    public path: string = '';
    public fullPath: string = '';
    public fileName: string = '';

    /**
     * Config file constructor
     * @param path
     * @param fullPath
     * @param fileName
     */
    constructor(path: string, fullPath: string, fileName: string) {
        this.path = path;
        this.fullPath = fullPath;
        this.fileName = fileName;
    }
}
