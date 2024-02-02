/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */
import {describe, expect, it, vi } from 'vitest';

import replaceGlobalConsole from '../../src/monkeypatches/replaceGlobalConsole';

import Lumberjack from '../../src/Lumberjack';

vi.mock('../../src/Lumberjack');

describe('replaceGlobalConsole', () => {
  const origConsole = global.console;

  it('throws when not given a Lumberjack', () => {
    expect(() => replaceGlobalConsole(() => {})).toThrowErrorMatchingSnapshot();
  });

  it('replaces the global console with the Lumberjack', () => {
    const logger = new Lumberjack();
    expect(console).toBe(origConsole);
    replaceGlobalConsole(logger);
    expect(console).toBe(origConsole);
    expect(console.error).toBe(logger.error);
    expect(console.warn).toBe(logger.warn);
    expect(console.info).toBe(logger.info);
    expect(console.log).toBe(logger.log);
  });
});
