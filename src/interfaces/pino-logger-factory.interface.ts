import {Logger, LoggerOptions} from "pino";

export interface IPinoLoggerFactory {
  readonly create: (options?: LoggerOptions) => Logger;
}
