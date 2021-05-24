import os from "os";

global.process = {
  // @ts-expect-error make pid writable
  __proto__: process,
  pid: process.pid,
};

beforeEach(() => {
  jest.useFakeTimers("modern").setSystemTime(1459875739796);
  jest.spyOn(os, "hostname").mockReturnValue("host");

  process.pid = 123456;
  process.env.npm_package_name = "name";
  process.env.npm_package_version = "version";
  process.env.NODE_ENV = "test";
});
