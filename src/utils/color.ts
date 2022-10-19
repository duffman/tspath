import * as supportsColor from "supports-color";

const ESCAPE = "\x1b[";

const formatters = {
    reset: "0m",
    bold: "1m",
    bold_reset: "22m",
    underline: "4m",
    underline_reset: "24m"
}

const colors = {
    "default": "39m",
    "red": "31m",
    "yellow": "33m",
    "green": "32m",
    "blue": "34m",
    "magenta": "35m",
    "cyan": "36m",
    "red_bright": "91m"
}

const ac = (str: string) => 
    supportsColor.stdout
        ? ESCAPE + str
        : "";

// const RESET_ALL = ac(formatters.reset);

// colors
const DEFAULT_COLOR = ac(colors.default);

const RED = ac(colors.red);
export const red = (str: string) => `${RED}${str}${DEFAULT_COLOR}`;

const RED_BRIGHT = ac(colors.red_bright);
export const redBright = (str: string) => `${RED_BRIGHT}${str}${DEFAULT_COLOR}`;

const YELLOW = ac(colors.yellow);
export const yellow = (str: string) => `${YELLOW}${str}${DEFAULT_COLOR}`;

const GREEN = ac(colors.green);
export const green = (str: string) => `${GREEN}${str}${DEFAULT_COLOR}`;

const BLUE = ac(colors.blue);
export const blue = (str: string) => `${BLUE}${str}${DEFAULT_COLOR}`;

const MAGENTA = ac(colors.magenta);
export const magenta = (str: string) => `${MAGENTA}${str}${DEFAULT_COLOR}`;

const CYAN = ac(colors.cyan);
export const cyan = (str: string) => `${CYAN}${str}${DEFAULT_COLOR}`;

// formatting
const BOLD = ac(formatters.bold);
const BOLD_RESET = ac(formatters.bold_reset)
export const bold = (str: string) => `${BOLD}${str}${BOLD_RESET}`;

const UNDERLINE = ac(formatters.underline);
const UNDERLINE_RESET = ac(formatters.underline_reset);
export const underline = (str: string) => `${UNDERLINE}${str}${UNDERLINE_RESET}`;


