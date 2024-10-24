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

import { inspect } from "util";

/*
 * Returns a string representation of object that is intended for debugging.
 * */
export const debugObjectSerializer = (
  debugData: Record<string, unknown>,
): Record<string, unknown> => {
  const _debugData: Record<string, unknown> = {};

  for (const k of Object.keys(debugData)) {
    const value = debugData[k];

    _debugData[k] =
      typeof debugData[k] === "string"
        ? value
        : inspect(value, {
            depth: 5,
          });
  }

  return _debugData;
};
