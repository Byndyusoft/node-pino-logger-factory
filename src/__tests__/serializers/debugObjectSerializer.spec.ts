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

import { debugObjectSerializer } from "~/src";

describe("debugObjectSerializer::", () => {
  describe("when value is object", () => {
    const data = {
      nest: {
        key: "value",
      },
    };

    it("return string representation of object", () => {
      expect(debugObjectSerializer(data)).toStrictEqual({
        nest: "{ key: 'value' }",
      });
    });
  });

  describe("when value is nesting object", () => {
    const data = {
      nest: {
        key: "value",
        keys: [1, 2],
        nested: {
          values: [2, 1],
        },
      },
    };

    it("return string representation of object", () => {
      expect(debugObjectSerializer(data)).toStrictEqual({
        nest: "{ key: 'value', keys: [ 1, 2 ], nested: { values: [ 2, 1 ] } }",
      });
    });
  });

  describe("when value is null", () => {
    const data = {
      nest: null,
    };

    it("stringify null value", () => {
      expect(debugObjectSerializer(data)).toStrictEqual({
        nest: "null",
      });
    });
  });

  describe("when value is array", () => {
    const data = {
      nest: [1, 2],
    };

    it("return string representation value", () => {
      expect(debugObjectSerializer(data)).toStrictEqual({
        nest: "[ 1, 2 ]",
      });
    });
  });

  describe("when value is undefined", () => {
    const data = {
      nest: undefined,
    };

    it("stringify undefined value", () => {
      expect(debugObjectSerializer(data)).toStrictEqual({
        nest: "undefined",
      });
    });
  });
});
