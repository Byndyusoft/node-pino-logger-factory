import pino from "pino";
import {stdout} from "stdout-stderr";

import {LogLevel, PinoLoggerOptionsBuilder} from "../../src";

describe("pino-logger-options-builder", () => {
  afterEach(() => {
    delete process.env.CASC_ENV;
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
    pino(builder.build()).error({err: "some error"});
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

  it("must log error without trace", () => {
    const error = new Error("some error");
    delete error.stack;

    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).error(error);
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
    const builder = new PinoLoggerOptionsBuilder(false);

    stdout.start();
    pino(builder.build()).info({a: 1});
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log object and message", () => {
    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).info({a: 1}, "hello");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must log object and message with args", () => {
    const builder = new PinoLoggerOptionsBuilder();

    stdout.start();
    pino(builder.build()).info({a: 1}, "hello %s", "world");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must override level", () => {
    const builder = new PinoLoggerOptionsBuilder(false);

    expect(builder.withLevel(LogLevel.warn).build()).toMatchSnapshot();
  });

  it("must override pretty print", () => {
    const builder = new PinoLoggerOptionsBuilder(false);

    expect(builder.withPrettyPrint(true).build()).toMatchSnapshot();
  });

  it("must use process.env that starts with BUILD_", () => {
    process.env.BUILD_COMMIT = "eefc20";

    const builder = new PinoLoggerOptionsBuilder();

    expect(builder.build()).toMatchSnapshot();
  });

  it("must use process.env.CASC_ENV if exists", () => {
    process.env.CASC_ENV = "dev";

    const builder = new PinoLoggerOptionsBuilder();

    expect(builder.build()).toMatchSnapshot();
  });
});
