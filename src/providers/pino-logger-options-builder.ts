import os from "os";

import {camelCase} from "camel-case";
import murmurhash from "murmurhash";
import pino, {LogFn, LoggerOptions, SerializerFn} from "pino";
import format from "quick-format-unescaped";

import {LogLevel} from "../enums";
import {IPinoLoggerOptionsBuilder} from "../interfaces";

export class PinoLoggerOptionsBuilder implements IPinoLoggerOptionsBuilder {
  protected _base: Record<string, unknown> = {};

  protected _level: LogLevel = LogLevel.info;

  protected _prettyPrint = false;

  protected _redactPaths: string[] = [];

  protected _serializers: Record<string, SerializerFn> = {};

  public constructor(useDefaults = true) {
    if (useDefaults) {
      this.withDefaultBase();
      this.withDefaultRedactPaths();
      this.withDefaultSerializers();
    }
  }

  public build(): LoggerOptions {
    return {
      serializers: this._serializers,
      timestamp: pino.stdTimeFunctions.isoTime,
      level: this._level,
      redact: this._redactPaths,
      prettyPrint: this._prettyPrint
        ? {
            translateTime: "SYS:STANDARD",
            colorize: true,
            ignore: Object.keys(this._base).concat("hash").join(","),
            suppressFlushSyncWarning: true,
          }
        : false,
      base: this._base,
      formatters: {
        level: (level) => ({level}),
      },
      hooks: {
        logMethod(args: readonly unknown[], method: LogFn) {
          const [o, ...n] = args;

          const formatOptions = (
            this as unknown as {
              [pino.symbols.formatOptsSym]: format.Options;
            }
          )[pino.symbols.formatOptsSym];

          let formattedObject: Record<string, unknown> | null = null;
          let formattedMessage: string | undefined;
          let dataForHash = "";

          if (typeof o === "object") {
            if (n.length > 0) {
              const [no, ...nn] = n;
              formattedMessage = format(no as string, nn, formatOptions);
            }

            dataForHash = formattedMessage ?? "";

            formattedObject =
              o instanceof Error ? {err: o} : (o as Record<string, unknown>);

            if (formattedObject.err instanceof Error) {
              dataForHash = dataForHash.concat(
                "\n",
                formattedObject.err.stack ?? "",
              );
            }
          } else {
            formattedMessage = format(o as string, n, formatOptions);
            dataForHash = formattedMessage;
          }

          Reflect.apply(method, this, [
            {
              ...formattedObject,
              hash: murmurhash(dataForHash).toString(16),
            },
            formattedMessage,
          ]);
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
