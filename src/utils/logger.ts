import { blue, bold, cyan, magenta, redBright, yellow } from "./color";

/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-09-28 10:07
 */
const log = console.log;

export class Logger {
	public static log(...data: unknown[]): void {
		log(data);
	}

	public static error(...data: unknown[]): void {
		console.error(data);
	}

	public static logException(label: string, e?: Error | string | unknown): void {
		Logger.spit(2);

		if (e instanceof Error) {
			Logger.logRed(`Error :: ${label} ::`, e);
		} else {
			Logger.logRed(`Exception :: ${label} ::`, e);
		}
	}

	public static pretty(doLog: boolean, label: string, obj: unknown): void {
		Logger.spit(2);
		Logger.log(doLog, label);
		Logger.log(doLog, "--");

		console.dir(obj, { depth: null, colors: true });
		Logger.spit(2);
	}

	public static spit(count: number): void {
		for (let i = 0; i < count; i++) {
			console.log("\n");
		}
	}

	public static logBase(colorFunc: (data: unknown) => string, logMessage: string, ...logData: (string | unknown)[]): void {
		const dataArr = new Array<string>();

		for (const obj of logData) {
			let str = obj as string;
			if (typeof obj === "object") {
				str = JSON.stringify(obj);
			}
			dataArr.push(str);
		}

		log(colorFunc(logMessage), colorFunc(dataArr.join(" ::: ") ));
	}

	public static logRed(logMessage: string, ...logData: unknown[]): void {
		Logger.logBase(redBright, logMessage, logData);
	}

	public static logYellow(logMessage: string, logData = ""): void {
		log(yellow(logMessage), logData);
	}

	public static logCyan(logMessage: string, logData = ""): void {
		if (logData) {
			log(cyan(logMessage), logData);
		} else {
			log(cyan(logMessage));
		}
	}

	public static logText(logMessage: string, ...logText: string[]): void {
		// const text = logText.join(" :: ");
		log(bold(cyan(logMessage)), `:: ${logText}`);
	}

	public static logBlue(logMessage: string, logData = ""): void {
		console.log(blue(logMessage), logData);
	}

	public static logPurple(logMessage: string, logData = null): void {
		if (logData == null) {
			log(magenta(logMessage));
		} else {
			log(magenta(logMessage), logData);
		}
	}
}
