import {HttpLogger, Options} from "pino-http";

export interface IPinoHttpLoggerFactory {
  readonly create: (options?: Options) => HttpLogger;
}
