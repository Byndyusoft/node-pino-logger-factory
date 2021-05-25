import os from "os";

import {camelCase} from "camel-case";
import murmurhash from "murmurhash";
import pino, {Logger, LoggerOptions, SerializerFn} from "pino";

import {LogLevel} from "../enums";

export class PinoLoggerOptionsBuilder {
  protected _base: Record<string, unknown> = {};

  protected _level: LogLevel = LogLevel.info;

  protected _logArgsTransformers: Array<
    (this: Logger, args: unknown[]) => unknown[]
  > = [];

  protected _prettyPrint = false;

  protected _redactPaths: string[] = [];

  protected _serializers: Record<string, SerializerFn> = {};

  public constructor(useDefaults = true) {
    if (useDefaults) {
      this.withDefaultBase();
      this.withDefaultLogArgsTransformers();
      this.withDefaultRedactPaths();
      this.withDefaultSerializers();
    }
  }

  public build(): LoggerOptions {
    const logArgsTransformers = this._logArgsTransformers;

    return {
      serializers: this._serializers,
      timestamp: pino.stdTimeFunctions.isoTime,
      level: this._level,
      redact: this._redactPaths,
      prettyPrint: this._prettyPrint
        ? {
            translateTime: "SYS:STANDARD",
            colorize: true,
            ignore: Object.keys(this._base)
              .concat("errHash", "msgTemplateHash")
              .join(","),
            suppressFlushSyncWarning: true,
          }
        : false,
      base: this._base,
      formatters: {
        level: (level) => ({level}),
      },
      hooks: {
        logMethod(this: Logger, args: unknown[], method) {
          const transformedArgs = logArgsTransformers.reduce(
            (a, t) => t.call(this, a),
            args,
          );

          Reflect.apply(method, this, transformedArgs);
        },
      },
    };
  }

  public withBase(base: Record<string, unknown>): PinoLoggerOptionsBuilder {
    this._base = {
      ...this._base,
      ...base,
    };

    return this;
  }

  public withDefaultBase(): PinoLoggerOptionsBuilder {
    const buildKeyPrefix = "BUILD_";

    return this.withBase({
      pid: process.pid,
      hostname: os.hostname(),
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
      env: process.env.CASC_ENV ?? process.env.NODE_ENV, // see https://github.com/Byndyusoft/node-casc
      ...Object.fromEntries(
        Object.entries(process.env)
          .filter(([key]) => key.startsWith(buildKeyPrefix))
          .map(([key, value]) => [
            camelCase(key.slice(buildKeyPrefix.length)),
            value,
          ]),
      ),
    });
  }

  public withDefaultLogArgsTransformers(): PinoLoggerOptionsBuilder {
    return this.withLogArgsTransformers(
      function (args) {
        return typeof args[0] === "object" ? args : [{}, ...args];
      },
      function (args) {
        const [o, ...n] = args;

        return o instanceof Error ? [{err: o}, ...n] : args;
      },
      function (args) {
        const [o, ...n] = args as [Record<string, unknown>, ...unknown[]];

        if (o.err instanceof Error) {
          o.errHash = murmurhash(o.err.stack ?? "").toString(16);
        }

        if (n.length > 0) {
          o.msgTemplateHash = murmurhash(n[0] as string).toString(16);
        }

        return [o, ...n];
      },
    );
  }

  public withDefaultRedactPaths(): PinoLoggerOptionsBuilder {
    return this.withRedactPaths("req.headers.authorization");
  }

  public withDefaultSerializers(): PinoLoggerOptionsBuilder {
    return this.withSerializers({
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    });
  }

  public withLevel(level: LogLevel): PinoLoggerOptionsBuilder {
    this._level = level;

    return this;
  }

  public withLogArgsTransformers(
    ...logArgsTransformers: Array<(this: Logger, args: unknown[]) => unknown[]>
  ): PinoLoggerOptionsBuilder {
    this._logArgsTransformers.push(...logArgsTransformers);

    return this;
  }

  public withPrettyPrint(prettyPrint: boolean): PinoLoggerOptionsBuilder {
    this._prettyPrint = prettyPrint;

    return this;
  }

  public withRedactPaths(...paths: string[]): PinoLoggerOptionsBuilder {
    this._redactPaths.push(...paths);

    return this;
  }

  public withSerializers(
    serializers: Record<string, SerializerFn>,
  ): PinoLoggerOptionsBuilder {
    this._serializers = {
      ...this._serializers,
      ...serializers,
    };

    return this;
  }
}
