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

const { Console } = require('console');
const { format } = require('util');

function loggerFunctionBuilder({
  formatter, console, beforeWrite, afterWrite,
}) {
  // so create the method either with or without the calls to before/afterWrite, rather than
  // checking if the methods were provided every console write
  const writeToConsole = (consoleMethod) => (line) => {
    if (beforeWrite) beforeWrite();
    consoleMethod(line);
    if (afterWrite) afterWrite();
  };

  return (level) => {
    const writeToConsoleMethod = writeToConsole(console[level]);

    // The performance of .apply and the spread operator seems on par in V8
    // 6.3 but the spread operator, unlike .apply(), pushes the elements
    // onto the stack. That is, it makes stack overflows more likely.
    // https://github.com/nodejs/node/blob/master/lib/console.js#L137-L139
    // TODO: use apply instead of spread to decrease chances of stack overflows?
    return (...args) => {
      const line = formatter(level, ...args);

      if (line === null) {
        return;
      }

      writeToConsoleMethod(line);
    };
  };
}

export default function Lumberjack(opts = {}) {
  if (!(this instanceof Lumberjack)) {
    return new Lumberjack(opts);
  }

  const console = new Console(opts.stdout || process.stdout, opts.stderr);
  const formatter = opts.formatter || ((level, ...args) => format(...args));
  const beforeWrite = opts.beforeWrite || undefined;
  const afterWrite = opts.afterWrite || undefined;

  if (typeof formatter !== 'function') {
    throw new TypeError(`formatter must be a function (given "${typeof formatter}")`);
  }

  if (typeof beforeWrite !== 'function' && typeof beforeWrite !== 'undefined') {
    throw new TypeError(`beforeWrite must be a function (given "${typeof beforeWrite}")`);
  }

  if (typeof afterWrite !== 'function' && typeof afterWrite !== 'undefined') {
    throw new TypeError(`afterWrite must be a function (given "${typeof afterWrite}")`);
  }

  const getLoggerFunction = loggerFunctionBuilder({
    formatter, console, beforeWrite, afterWrite,
  });
  this.error = getLoggerFunction('error');
  this.warn = getLoggerFunction('warn');
  this.info = getLoggerFunction('info');
  this.log = getLoggerFunction('log');
  this.table = getLoggerFunction('table');
  this.dir = getLoggerFunction('dir');

  return this;
}
