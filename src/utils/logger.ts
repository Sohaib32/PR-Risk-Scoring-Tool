import chalk from 'chalk';

type Level = 'debug' | 'info' | 'warn' | 'error';

function levelPriority(level: Level): number {
  switch (level) {
    case 'debug': return 10;
    case 'info': return 20;
    case 'warn': return 30;
    case 'error': return 40;
    default: return 20;
  }
}

const envLevel = (process.env.LOG_LEVEL?.toLowerCase() as Level) || 'info';
const current = levelPriority(envLevel);

function shouldLog(level: Level) {
  return levelPriority(level) >= current;
}

export const logger = {
  debug: (...args: unknown[]) => { if (shouldLog('debug')) console.log(chalk.gray('[debug]'), ...args); },
  info:  (...args: unknown[]) => { if (shouldLog('info'))  console.log(chalk.white('[info ]'), ...args); },
  warn:  (...args: unknown[]) => { if (shouldLog('warn'))  console.warn(chalk.yellow('[warn ]'), ...args); },
  error: (...args: unknown[]) => { if (shouldLog('error')) console.error(chalk.red('[error]'), ...args); },
};
