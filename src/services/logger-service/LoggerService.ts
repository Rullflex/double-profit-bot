export class LoggerService {
  constructor(private readonly scope: string = '') {}

  log(message: string, ...args: any[]): void {
    console.log(`[${this.scope}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.scope}] ⚠️ ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[${this.scope}] ❌ ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.DEBUG === "true") {
      console.debug(`[${this.scope}] 🐛 ${message}`, ...args);
    }
  }

  withPrefix(prefix: string): LoggerService {
    return new LoggerService(this.scope ? `${this.scope} > ${prefix}` : prefix);
  }
}