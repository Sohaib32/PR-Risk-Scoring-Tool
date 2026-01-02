import chalk from "chalk";

type Level = "debug" | "info" | "warn" | "error";

/**
 * Valid types that can be logged.
 * Matches what console methods can handle.
 */
type Loggable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Error
  | object
  | Loggable[];

function levelPriority(level: Level): number {
  switch (level) {
    case "debug":
      return 10;
    case "info":
      return 20;
    case "warn":
      return 30;
    case "error":
      return 40;
    default:
      return 20;
  }
}

const envLevel = (process.env.LOG_LEVEL?.toLowerCase() as Level) || "info";
const current = levelPriority(envLevel);

function shouldLog(level: Level): boolean {
  return levelPriority(level) >= current;
}

export const logger = {
  debug: (...args: Loggable[]): void => {
    if (shouldLog("debug")) console.log(chalk.gray("[debug]"), ...args);
  },
  info: (...args: Loggable[]): void => {
    if (shouldLog("info")) console.log(chalk.white("[info ]"), ...args);
  },
  warn: (...args: Loggable[]): void => {
    if (shouldLog("warn")) console.warn(chalk.yellow("[warn ]"), ...args);
  },
  error: (...args: Loggable[]): void => {
    if (shouldLog("error")) console.error(chalk.red("[error]"), ...args);
  },
};
