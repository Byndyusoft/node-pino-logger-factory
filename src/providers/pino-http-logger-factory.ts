import pinoHttp, {HttpLogger, Options} from "pino-http";

import {IPinoHttpLoggerFactory} from "../interfaces";

import {PinoHttpLoggerOptionsBuilder} from "./pino-http-logger-options-builder";
import {PinoLoggerFactory} from "./pino-logger-factory";

export class PinoHttpLoggerFactory implements IPinoHttpLoggerFactory {
  public create(options?: Options): HttpLogger {
    return pinoHttp(
      options ??
        new PinoHttpLoggerOptionsBuilder()
          .withLogger(new PinoLoggerFactory().create())
          .build(),
    );
  }
}
