/**
 * @author: Patrik Forsberg <patrik.forsberg@coldmind.com>
 * @date: 2022-09-28 10:07
 */
import chalk from "chalk";

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

		for (let obj in logData) {
			let str = obj as string;
			if (typeof obj === "object") {
				str = JSON.stringify(obj);
			}
			dataArr.push(str);
		}

		log(colorFunc(logMessage), colorFunc(dataArr.join(" ::: ") ));
	}

	public static logRed(logMessage: string, ...logData:any[]): void {
		Logger.logBase(chalk.redBright, logMessage, logData);
	}

	public static logYellow(logMessage: string, logData: any = ""): void {
		log(chalk.yellow(logMessage), logData);
	}

	public static logCyan(logMessage: string, logData: any = ""): void {
		if (logData) {
			log(chalk.cyan(logMessage), logData);
		} else {
			log(chalk.cyan(logMessage));
		}
	}

	public static logText(logMessage: string, ...logText: string[]): void {
		let text = logText.join(" :: ");
		log(chalk.bold.cyan(logMessage), `:: ${logText}`);
	}

	public static logBlue(logMessage: string, logData: any = ""): void {
		console.log(chalk.blue(logMessage), logData);
	}

	public static logPurple(logMessage: string, logData: any = null): void {
		if (logData == null) {
			log(chalk.magenta(logMessage));
		} else {
			log(chalk.magenta(logMessage), logData);
		}
	}
}
