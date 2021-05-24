# node-pino-logger-factory

[![npm@latest](https://img.shields.io/npm/v/@byndyusoft/pino-logger-factory/latest.svg)](https://www.npmjs.com/package/@byndyusoft/pino-logger-factory)
[![test workflow](https://github.com/Byndyusoft/node-pino-logger-factory/workflows/test%20workflow/badge.svg)](https://github.com/Byndyusoft/node-pino-logger-factory/actions)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

:evergreen_tree: logger factory for pino :evergreen_tree:

## Requirements

- Node.js v12 LTS or later
- npm or yarn

## Install

```bash
npm install @byndyusoft/pino-logger-factory
```

or

```bash
yarn add @byndyusoft/pino-logger-factory
```

## Environment

You must initialize `process.env` before creating pino logger:

```typescript
process.env.npm_package_name;
process.env.npm_package_version;
process.env.CASC_ENV ?? process.env.NODE_ENV;
process.env["BUILD_*"];
```

## Usage

Create pino logger:

```typescript
import {PinoLoggerFactory} from "@byndyusoft/pino-logger-factory";

const logger = new PinoLoggerFactory().create();
```

Create pino-http logger:

```typescript
import {PinoHttpLoggerFactory} from "@byndyusoft/pino-logger-factory";

const httpLogger = new PinoHttpLoggerFactory().create();
```

### Usage with nestjs-pino

Import and configure modules:

```typescript
import {
  OpenTracingModule,
  TracedHttpModule,
} from "@byndyusoft/nest-opentracing";
import {
  PinoHttpLoggerOptionsBuilder,
  PinoLoggerFactory,
} from "@byndyusoft/pino-logger-factory";
import {Module} from "@nestjs/common";
import {LoggerModule} from "nestjs-pino";

@Module({
  imports: [
    OpenTracingModule.forRoot({
      applyRoutes: ["/api/*"],
      ignoreRoutes: ["/metrics", "/_healthz", "/_readiness"],
    }),
    TracedHttpModule.forRoot(),
    // LoggerModule must be imported after OpenTracingModule
    LoggerModule.forRootAsync({
      useFactory: () => ({
        pinoHttp: new PinoHttpLoggerOptionsBuilder()
          .withLogger(new PinoLoggerFactory().create())
          .build(),
      }),
    }),
  ],
})
export class InfrastructureModule {}
```

Override default exception filter:

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import {isObject} from "@nestjs/common/utils/shared.utils";
import {AbstractHttpAdapter, HttpAdapterHost} from "@nestjs/core";
import {MESSAGES} from "@nestjs/core/constants";
import {InjectPinoLogger, PinoLogger} from "nestjs-pino";

@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  @Inject()
  protected readonly httpAdapterHost!: HttpAdapterHost;

  public constructor(
    @InjectPinoLogger("ExceptionsHandler")
    private readonly __logger: PinoLogger,
  ) {}

  private static __handleHttpException(
    exception: HttpException,
    host: ArgumentsHost,
    httpAdapter: AbstractHttpAdapter,
  ): void {
    const response = exception.getResponse();

    const message = isObject(response)
      ? response
      : {
          statusCode: exception.getStatus(),
          message: response,
        };

    httpAdapter.reply(host.getArgByIndex(1), message, exception.getStatus());
  }

  public catch(exception: unknown, host: ArgumentsHost): void {
    const {httpAdapter} = this.httpAdapterHost;

    if (exception instanceof HttpException) {
      BaseExceptionFilter.__handleHttpException(exception, host, httpAdapter);
    } else {
      this.__handleUnknownException(exception, host, httpAdapter);
    }
  }

  private __handleUnknownException(
    exception: unknown,
    host: ArgumentsHost,
    httpAdapter: AbstractHttpAdapter,
  ): void {
    const body = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: MESSAGES.UNKNOWN_EXCEPTION_MESSAGE,
    };

    httpAdapter.reply(host.getArgByIndex(1), body, body.statusCode);

    this.__logger.error(exception as Error);
  }
}
```

## Maintainers

- [@Byndyusoft/owners](https://github.com/orgs/Byndyusoft/teams/owners) <<github.maintain@byndyusoft.com>>
- [@Byndyusoft/team](https://github.com/orgs/Byndyusoft/teams/team)
