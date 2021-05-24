import {Options} from "pino-http";

export interface IPinoHttpLoggerOptionsBuilder {
  readonly build: () => Options;
}
