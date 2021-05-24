import {Span} from "opentracing";
import {Logger} from "pino";
import {Options} from "pino-http";

import {IPinoHttpLoggerOptionsBuilder} from "../interfaces";

export class PinoHttpLoggerOptionsBuilder
  implements IPinoHttpLoggerOptionsBuilder
{
  protected _customProps: Array<
    (request: unknown, response: unknown) => Record<string, unknown>
  > = [];

  protected _ignorePaths: string[] = [];

  protected _logger?: Logger;

  public constructor(useDefaults = true) {
    if (useDefaults) {
      this.withDefaultCustomProps();
      this.withDefaultIgnorePaths();
    }
  }

  public build(): Options {
    return {
      logger: this._logger,
      autoLogging: {
        ignorePaths: this._ignorePaths,
        getPath: (request) => (request as {originalUrl?: string}).originalUrl,
      },
      wrapSerializers: false,
      reqCustomProps: (request, response) =>
        Object.fromEntries(
          this._customProps.flatMap((x) =>
            Object.entries(x(request, response)),
          ),
        ),
    };
  }

  public withCustomProps(
    ...customProps: Array<
      (request: unknown, response: unknown) => Record<string, unknown>
    >
  ): PinoHttpLoggerOptionsBuilder {
    this._customProps.push(...customProps);

    return this;
  }

  public withDefaultCustomProps(): PinoHttpLoggerOptionsBuilder {
    return this.withCustomProps((request) => ({
      traceId: (request as {__rootSpan__?: Span}).__rootSpan__
        ?.context()
        .toTraceId(), // see https://github.com/Byndyusoft/nest-opentracing/blob/master/src/environments/http/tracing.middleware.ts#L13
    }));
  }

  public withDefaultIgnorePaths(): PinoHttpLoggerOptionsBuilder {
    return this.withIgnorePaths("/metrics", "/_healthz", "/_readiness");
  }

  public withIgnorePaths(
    ...ignorePaths: string[]
  ): PinoHttpLoggerOptionsBuilder {
    this._ignorePaths.push(...ignorePaths);

    return this;
  }

  public withLogger(logger: Logger): PinoHttpLoggerOptionsBuilder {
    this._logger = logger;

    return this;
  }
}
