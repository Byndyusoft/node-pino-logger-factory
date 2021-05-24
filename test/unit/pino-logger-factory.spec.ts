import {stdout} from "stdout-stderr";

import {PinoLoggerFactory, PinoLoggerOptionsBuilder} from "../../src";

describe("pino-logger-factory", () => {
  it("must build pino with custom options", () => {
    const factory = new PinoLoggerFactory();

    stdout.start();
    factory.create(new PinoLoggerOptionsBuilder(false).build()).info("hello");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });

  it("must build pino with default options", () => {
    const factory = new PinoLoggerFactory();

    stdout.start();
    factory.create().info("hello");
    stdout.stop();

    expect(JSON.parse(stdout.output)).toMatchSnapshot();
  });
});
