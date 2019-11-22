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

import Lumberjack from '../Lumberjack';

export default function replaceGlobalConsole(logger) {
  if (!(logger instanceof Lumberjack)) {
    throw new Error('logger must be an instance of Lumberjack');
  }

  // global.console = logger;
  // TypeError: Cannot set property console of #<Object> which has only a getter
  // so set each property instead
  console.error = logger.error;
  console.warn = logger.warn;
  console.info = logger.info;
  console.log = logger.log;
}
