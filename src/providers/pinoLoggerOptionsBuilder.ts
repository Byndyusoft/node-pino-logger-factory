/*
 * Copyright 2021 Byndyusoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import os from "os";

import { camelCase } from "camel-case";
import murmurhash from "murmurhash";
import { Logger, LoggerOptions, pino } from "pino";
import { PrettyOptions } from "pino-pretty";

import { LogLevel } from "~/src/enums";

export class PinoLoggerOptionsBuilder {
  protected _base: Record<string, unknown> = {};

  protected _level: LogLevel = LogLevel.info;

  protected _logArgsTransformers: Array<
    (this: Logger, args: unknown[]) => unknown[]
  > = [];

  protected _prettyPrint = false;

  protected _redactPaths: string[] = [];

  protected _serializers: NonNullable<LoggerOptions["serializers"]> = {};

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
      transport: this.__buildTransport(),
      serializers: this._serializers,
      timestamp: pino.stdTimeFunctions.isoTime,
      level: this._level,
      redact: this._redactPaths,
      base: this._base,
      formatters: {
        level: (level) => ({ level }),
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
      env: process.env.CONFIG_ENV ?? process.env.NODE_ENV, // CONFIG_ENV used in https://github.com/Byndyusoft/nest-template
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
      function extractObjectFromArgs(args) {
        return typeof args[0] === "object" ? args : [{}, ...args];
      },
      function fixErrorObject(args) {
        const [message, ...optionalParams] = args;

        return message instanceof Error
          ? [{ err: message }, ...optionalParams]
          : args;
      },
      function getMessageFromError(args) {
        const [message, ...optionalParams] = args as [
          Record<string, unknown>,
          ...unknown[],
        ];

        // optionalParams[0] is undefined if log object in nest
        if (
          message.err instanceof Error &&
          (optionalParams.length === 0 || optionalParams[0] === undefined)
        ) {
          return [message, message.err.message];
        }

        return args;
      },
      function calculateHash(args) {
        const [message, ...optionalParams] = args as [
          Record<string, unknown>,
          ...unknown[],
        ];

        if (message.err instanceof Error) {
          message.errHash = murmurhash(message.err.stack ?? "").toString(16);
        }

        if (optionalParams.length > 0) {
          message.msgTemplateHash = murmurhash(
            String(optionalParams[0]),
          ).toString(16);
        }

        return [message, ...optionalParams];
      },
    );
  }

  public withDefaultRedactPaths(): PinoLoggerOptionsBuilder {
    return this.withRedactPaths(
      "req.headers.authorization",
      "err.config.headers['x-api-key']",
    );
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
    serializers: NonNullable<LoggerOptions["serializers"]>,
  ): PinoLoggerOptionsBuilder {
    this._serializers = {
      ...this._serializers,
      ...serializers,
    };

    return this;
  }

  private __buildTransport():
    | pino.TransportSingleOptions<PrettyOptions>
    | undefined {
    return this._prettyPrint
      ? {
          target: "pino-pretty",
          options: {
            translateTime: "SYS:STANDARD",
            colorize: true,
            ignore: [
              ...Object.keys(this._base),
              "errHash",
              "msgTemplateHash",
            ].join(","),
          },
        }
      : undefined;
  }
}
