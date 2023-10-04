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

import { pino } from "pino";
import { stdout } from "stdout-stderr";

import { LogLevel, PinoLoggerOptionsBuilder } from "~/src";

describe("PinoLoggerOptionsBuilder", () => {
  afterEach(() => {
    delete process.env.CONFIG_ENV;
    delete process.env.BUILD_COMMIT;
  });

  it("must build options with defaults", () => {
    const builder = new PinoLoggerOptionsBuilder();

    expect(builder.build()).toMatchSnapshot();
  });

  it("must build options without defaults", () => {
    const builder = new PinoLoggerOptionsBuilder(false);

    expect(builder.build()).toMatchSnapshot();
  });

  it("must log custom error", () => {
    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).error({ err: "some error" });
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log error", () => {
    const error = new Error("some error");
    error.stack = "Error: some error";

    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).error(error);
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log error with custom message", () => {
    const error = new Error("some error");
    error.stack = "Error: some error";

    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).error(error, "custom message");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log error without trace", () => {
    const error = new Error("some error");
    delete error.stack;

    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).error(error);
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log error with extra undefined argument", () => {
    const error = new Error("some error");
    error.stack = "Error: some error";

    //only for nest logger in 9.3.0 and later
    //first param is always undefined if not use params in log.error()
    //if params in log.error() is set, then first extraArg mustn't be undefined
    const extraArguments = [undefined];

    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();

    pino(builder.build()).error(
      {
        err: error,
        context: "some context",
      },
      ...extraArguments,
    );
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log message", () => {
    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).info("hello");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log message with args", () => {
    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).info("hello %s", "world");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log object", () => {
    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).info({ a: 1 });
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log object and message", () => {
    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).info({ a: 1 }, "hello");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log object and message with args", () => {
    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).info({ a: 1 }, "hello %s", "world");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must override level", () => {
    const builder = new PinoLoggerOptionsBuilder();

    expect(builder.withLevel(LogLevel.warn).build()).toMatchSnapshot();
  });

  it("must override pretty print", () => {
    const builder = new PinoLoggerOptionsBuilder();

    expect(builder.withPrettyPrint(true).build()).toMatchSnapshot();
  });

  it("must use process.env that starts with BUILD_", () => {
    process.env.BUILD_COMMIT = "eefc20";

    const builder = new PinoLoggerOptionsBuilder();

    expect(builder.build()).toMatchSnapshot();
  });

  it("must use process.env.CONFIG_ENV if exists", () => {
    process.env.CONFIG_ENV = "dev";

    const builder = new PinoLoggerOptionsBuilder();

    expect(builder.build()).toMatchSnapshot();
  });
});
