/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-10-06 19:18
 */

import { ITSConfig } from "tspath.types";
import { IJsonFile } from "../utils/json-file";

export interface TsconfigType extends IJsonFile {
    compilerOptions: ITSConfig
}
