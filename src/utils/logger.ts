import { blue, bold, cyan, magenta, redBright, yellow } from "./color";

/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-09-28 10:07
 */
const log = console.log;

export class Logger {
	public static log(...data: any[]): void {
		log(data);
	}

	public static error(...data: any[]): void {
		console.error(data);
	}

	public static logException(label: string, e?: Error | any): void {
		Logger.spit(2);

		if (e instanceof Error) {
			Logger.logRed(`Error :: ${label} ::`, e);
		} else {
			Logger.logRed(`Exception :: ${label} ::`, e);
		}
	}

	public static pretty(doLog: boolean, label: string, obj: any): void {
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

	public static logBase(colorFunc: (data: any) => string, logMessage: string, ...logData:any[]): void {
		let dataArr = new Array<string>();

		for (let obj of logData) {
			let str = obj as string;
			if (typeof obj === "object") {
				str = JSON.stringify(obj);
			}
			dataArr.push(str);
		}

		log(colorFunc(logMessage), colorFunc(dataArr.join(" ::: ") ));
	}

	public static logRed(logMessage: string, ...logData:any[]): void {
		Logger.logBase(redBright, logMessage, logData);
	}

	public static logYellow(logMessage: string, logData: any = ""): void {
		log(yellow(logMessage), logData);
	}

	public static logCyan(logMessage: string, logData: any = ""): void {
		if (logData) {
			log(cyan(logMessage), logData);
		} else {
			log(cyan(logMessage));
		}
	}

	public static logText(logMessage: string, ...logText: string[]): void {
		let text = logText.join(" :: ");
		log(bold(cyan(logMessage)), `:: ${logText}`);
	}

	public static logBlue(logMessage: string, logData: any = ""): void {
		console.log(blue(logMessage), logData);
	}

	public static logPurple(logMessage: string, logData: any = null): void {
		if (logData == null) {
			log(magenta(logMessage));
		} else {
			log(magenta(logMessage), logData);
		}
	}
}
