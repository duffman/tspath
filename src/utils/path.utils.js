"use strict";
/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-10-04 10:41
 */
exports.__esModule = true;
exports.PathUtils = void 0;
var fs = require("fs");
var path = require("path");
var utils_1 = require("./utils");
var PathUtils = /** @class */ (function () {
    function PathUtils() {
    }
    /**
     * Check if given path exists
     * @param {string} path
     * @returns {boolean}
     */
    PathUtils.pathExist = function (path) {
        return fs.existsSync(path);
    };
    /**
     * Get relative path from 1 to another
     * @param {string} fromPath
     * @param {string} toPath
     * @param {boolean} dotSlashForSamePath
     * @returns {string}
     */
    PathUtils.getRelativePath = function (fromPath, toPath, dotSlashForSamePath) {
        if (dotSlashForSamePath === void 0) { dotSlashForSamePath = true; }
        var relativePath = path.relative(fromPath, toPath);
        if (!relativePath.trim().length && dotSlashForSamePath) {
            relativePath = ".";
        }
        relativePath = utils_1.Utils.ensureTrailingSlash(relativePath);
        return relativePath;
    };
    return PathUtils;
}());
exports.PathUtils = PathUtils;
