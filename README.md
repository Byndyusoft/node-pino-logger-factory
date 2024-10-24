# node-pino-logger-factory

[![npm@latest](https://img.shields.io/npm/v/@byndyusoft/pino-logger-factory/latest.svg)](https://www.npmjs.com/package/@byndyusoft/pino-logger-factory)
[![test](https://github.com/Byndyusoft/node-pino-logger-factory/actions/workflows/test.yaml/badge.svg?branch=master)](https://github.com/Byndyusoft/node-pino-logger-factory/actions/workflows/test.yaml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

:evergreen_tree: logger factory for pino :evergreen_tree:

## Requirements

- Node.js v14 LTS or later
- npm or yarn

## Install

```bash
npm install @byndyusoft/pino-logger-factory pino pino-http && npm install -D pino-pretty
```

or

```bash
yarn add @byndyusoft/pino-logger-factory pino pino-http && yarn add -D pino-pretty
```

## Environment

You must initialize `process.env` before creating pino logger:

```typescript
process.env.npm_package_name;
process.env.npm_package_version;
process.env.CONFIG_ENV ?? process.env.NODE_ENV;
process.env["BUILD_*"];
```

## Usage

Create pino logger:

```typescript
import { PinoLoggerFactory } from "@byndyusoft/pino-logger-factory";

const logger = new PinoLoggerFactory().create();
```

Create pino-http logger:

```typescript
import { PinoHttpLoggerFactory } from "@byndyusoft/pino-logger-factory";

const httpLogger = new PinoHttpLoggerFactory().create();
```

### Usage with nestjs-pino

Import and configure modules:

```typescript
import {
  PinoHttpLoggerOptionsBuilder,
  PinoLoggerFactory,
} from "@byndyusoft/pino-logger-factory";
import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

@Module({
  imports: [
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

## Maintainers

- [@Byndyusoft/owners](https://github.com/orgs/Byndyusoft/teams/owners) <<github.maintain@byndyusoft.com>>
- [@Byndyusoft/team](https://github.com/orgs/Byndyusoft/teams/team)
- [@KillWolfVlad](https://github.com/KillWolfVlad)

## License

This repository is released under version 2.0 of the
[Apache License](https://www.apache.org/licenses/LICENSE-2.0).
