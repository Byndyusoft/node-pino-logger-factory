/*
 * Copyright 2024 Byndyusoft
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

import { jsonDebugObjectSerializer } from "~/src";

describe("jsonDebugObjectSerializer::", () => {
  describe("when value is object", () => {
    const data = {
      nest: {
        key: "value",
      },
    };

    it("stringify values", () => {
      expect(jsonDebugObjectSerializer(data)).toStrictEqual({
        nest: '{"key":"value"}',
      });
    });
  });

  describe("when value is null", () => {
    const data = {
      nest: null,
    };

    it("stringify null value", () => {
      expect(jsonDebugObjectSerializer(data)).toStrictEqual({
        nest: "null",
      });
    });
  });

  describe("when value is array", () => {
    const data = {
      nest: [1, 2],
    };

    it("stringify value", () => {
      expect(jsonDebugObjectSerializer(data)).toStrictEqual({
        nest: "[1,2]",
      });
    });
  });

  describe("when value is undefined", () => {
    const data = {
      nest: undefined,
    };

    it("no stringify undefined value", () => {
      expect(jsonDebugObjectSerializer(data)).toStrictEqual({
        nest: undefined,
      });
    });
  });
});
