import pino, {Logger, LoggerOptions} from "pino";

import {IPinoLoggerFactory} from "../interfaces";

import {PinoLoggerOptionsBuilder} from "./pino-logger-options-builder";

export class PinoLoggerFactory implements IPinoLoggerFactory {
  public create(options?: LoggerOptions): Logger {
    return pino(options ?? new PinoLoggerOptionsBuilder().build());
  }
}
