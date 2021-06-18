export declare const FILE_ENCODING = "UTF-8";
export declare const TS_CONFIG = "tsconfig.json";
export interface ISettings {
    [key: string]: string;
}
export interface ITSConfig {
    outDir: string;
    baseUrl: string;
    paths: IPaths;
}
export interface IPaths {
    [index: string]: Array<string>;
}
