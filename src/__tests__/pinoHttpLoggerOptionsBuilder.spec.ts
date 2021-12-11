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

import { IncomingMessage, ServerResponse } from "http";

import { Span } from "opentracing";
import { AutoLoggingOptions } from "pino-http";

import { PinoHttpLoggerOptionsBuilder, PinoLoggerFactory } from "~/src";

describe("PinoHttpLoggerOptionsBuilder", () => {
  it("must build options with defaults", () => {
    const builder = new PinoHttpLoggerOptionsBuilder();

    expect(builder.build()).toMatchSnapshot();
  });

  it("must build options without defaults", () => {
    const builder = new PinoHttpLoggerOptionsBuilder(false);

    expect(builder.build()).toMatchSnapshot();
  });

  it("must override logger", () => {
    const logger = new PinoLoggerFactory().create();

    const options = new PinoHttpLoggerOptionsBuilder()
      .withLogger(logger)
      .build();

    expect(options.logger).toBe(logger);
  });

  it("must return path", () => {
    const options = new PinoHttpLoggerOptionsBuilder().build();

    expect(
      (options.autoLogging as AutoLoggingOptions).getPath?.({
        originalUrl: "/test",
      } as unknown as IncomingMessage),
    ).toStrictEqual("/test");
  });

  it("must set traceId if __rootSpan__ in request", () => {
    const span = new Span();
    jest.spyOn(span.context(), "toTraceId").mockReturnValue("120a073f7c3954d5");

    const options = new PinoHttpLoggerOptionsBuilder().build();

    expect(
      options.reqCustomProps?.(
        { __rootSpan__: span } as unknown as IncomingMessage,
        {} as unknown as ServerResponse,
      ),
    ).toStrictEqual({
      traceId: "120a073f7c3954d5",
    });
  });

  it("must set traceId to undefined if __rootSpan__ not in request", () => {
    const options = new PinoHttpLoggerOptionsBuilder().build();

    expect(
      options.reqCustomProps?.(
        {} as unknown as IncomingMessage,
        {} as unknown as ServerResponse,
      ),
    ).toStrictEqual({
      traceId: undefined,
    });
  });
});
