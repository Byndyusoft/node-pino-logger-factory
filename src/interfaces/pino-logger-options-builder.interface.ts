import {LoggerOptions} from "pino";

export interface IPinoLoggerOptionsBuilder {
  readonly build: () => LoggerOptions;
}
