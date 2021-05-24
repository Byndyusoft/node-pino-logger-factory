import express, {Express} from "express";
import {HttpLogger} from "pino-http";
import {stdout} from "stdout-stderr";
import supertest from "supertest";

import {
  PinoHttpLoggerFactory,
  PinoHttpLoggerOptionsBuilder,
  PinoLoggerFactory,
  PinoLoggerOptionsBuilder,
} from "../../src";

function createExpressApp(httpLogger: HttpLogger): Express {
  const app = express();

  app.use((request, response, next) => httpLogger(request, response, next));

  app.get("/test", (_request, response) => {
    response.status(204).send();
  });

  return app;
}

describe("pino-http-logger-factory", () => {
  it("must build pino with custom options", async () => {
    stdout.start();
    {
      const httpLogger = new PinoHttpLoggerFactory().create(
        new PinoHttpLoggerOptionsBuilder()
          .withLogger(
            new PinoLoggerFactory().create(
              new PinoLoggerOptionsBuilder(false).build(),
            ),
          )
          .build(),
      );

      const app = createExpressApp(httpLogger);

      await supertest(app).get("/test").expect(204);
    }
    stdout.stop();

    const output = JSON.parse(stdout.output) as Record<string, unknown>;
    expect(output.env).not.toBeDefined();
    expect(output.req).toBeDefined();
    expect(output.res).toBeDefined();
    expect(output.msg).toStrictEqual("request completed");
  });

  it("must build pino with default options", async () => {
    stdout.start();
    {
      const httpLogger = new PinoHttpLoggerFactory().create();

      const app = createExpressApp(httpLogger);

      await supertest(app).get("/test").expect(204);
    }
    stdout.stop();

    const output = JSON.parse(stdout.output) as Record<string, unknown>;
    expect(output.env).toStrictEqual("test");
    expect(output.req).toBeDefined();
    expect(output.res).toBeDefined();
    expect(output.msg).toStrictEqual("request completed");
  });
});
