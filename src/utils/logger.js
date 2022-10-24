"use strict";
exports.__esModule = true;
exports.Logger = void 0;
/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-09-28 10:07
 */
var tspath_const_1 = require("../tspath.const");
var chalk = require("ansi-colors");
var log = console.log;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.log = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        log(data);
    };
    Logger.debug = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        if (tspath_const_1.Const.DEBUG_MODE)
            log(data);
    };
    Logger.error = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        console.error(data);
    };
    Logger.logException = function (label, e) {
        Logger.spit(2);
        if (e instanceof Error) {
            Logger.logRed("Error :: ".concat(label, " ::"), e);
        }
        else {
            Logger.logRed("Exception :: ".concat(label, " ::"), e);
        }
    };
    Logger.pretty = function (doLog, label, obj) {
        Logger.spit(2);
        Logger.log(doLog, label);
        Logger.log(doLog, "--");
        console.dir(obj, { depth: null, colors: true });
        Logger.spit(2);
    };
    Logger.spit = function (count) {
        for (var i = 0; i < count; i++) {
            console.log("\n");
        }
    };
    Logger.logBase = function (colorFunc, logMessage) {
        var logData = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            logData[_i - 2] = arguments[_i];
        }
        var dataArr = new Array();
        for (var _a = 0, logData_1 = logData; _a < logData_1.length; _a++) {
            var obj = logData_1[_a];
            var str = obj;
            if (typeof obj === "object") {
                str = JSON.stringify(obj);
            }
            dataArr.push(str);
        }
        log(colorFunc(logMessage), colorFunc(dataArr.join(" ::: ")));
    };
    Logger.logRed = function (logMessage) {
        var logData = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logData[_i - 1] = arguments[_i];
        }
        Logger.logBase(chalk.redBright, logMessage, logData);
    };
    Logger.logYellow = function (logMessage, logData) {
        if (logData === void 0) { logData = ""; }
        log(chalk.yellow(logMessage), logData);
    };
    Logger.logCyan = function (logMessage, logData) {
        if (logData === void 0) { logData = ""; }
        if (logData) {
            log(chalk.cyan(logMessage), logData);
        }
        else {
            log(chalk.cyan(logMessage));
        }
    };
    Logger.logText = function (logMessage) {
        var logText = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            logText[_i - 1] = arguments[_i];
        }
        var text = logText.join(" :: ");
        log(chalk.bold.cyan(logMessage), ":: ".concat(logText));
    };
    Logger.logBlue = function (logMessage, logData) {
        if (logData === void 0) { logData = ""; }
        console.log(chalk.blue(logMessage), logData);
    };
    Logger.logPurple = function (logMessage, logData) {
        if (logData === void 0) { logData = null; }
        if (logData == null) {
            log(chalk.magenta(logMessage));
        }
        else {
            log(chalk.magenta(logMessage), logData);
        }
    };
    return Logger;
}());
exports.Logger = Logger;
