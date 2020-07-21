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

import util from 'util';
import { Writable } from 'stream';

import Lumberjack from '../src/Lumberjack';

jest.mock('util', () => ({ format: jest.fn() }));

describe('Lumberjack', () => {
  function createStream({ write } = {}) {
    const stream = new Writable({
      // required by Console
      // https://github.com/nodejs/node/blob/v12.0.0/lib/internal/console/constructor.js#L83
      write: write || jest.fn(),
    });
    jest.spyOn(stream, 'write');
    // https://github.com/nodejs/node/blob/v12.0.0/lib/internal/console/constructor.js#L236
    jest.spyOn(stream, 'once');
    // https://github.com/nodejs/node/blob/v12.0.0/lib/internal/console/constructor.js#L246
    jest.spyOn(stream, 'removeListener');
    return stream;
  }

  describe('constructor', () => {
    it('is a constructor', () => {
      const logger = new Lumberjack();
      expect(logger instanceof Lumberjack).toBe(true);
    });

    it('enforces usage of `new`', () => {
      const logger = Lumberjack();
      expect(logger instanceof Lumberjack).toBe(true);
    });

    describe('stdout option', () => {
      it('throws if not a stream', () => {
        expect(() => new Lumberjack({ stdout: true })).toThrowErrorMatchingSnapshot();
      });
    });

    describe('stderr option', () => {
      it('throws if not a stream', () => {
        expect(() => new Lumberjack({ stderr: true })).toThrowErrorMatchingSnapshot();
      });
    });

    describe('formatter option', () => {
      it('defaults to util.format', () => {
        const logger = new Lumberjack();
        util.format.mockClear();
        logger.log('something');
        // jest uses something that calls util.format (probably console.log)
        // so we can't test for the number of times it's been called (desire 1)
        expect(util.format).toHaveBeenCalled();
        expect(util.format).toHaveBeenCalledWith('something');
      });

      it('throws an error if not a function', () => {
        expect(() => new Lumberjack({ formatter: true })).toThrowErrorMatchingSnapshot();
      });
    });

    describe('beforeWrite option', () => {
      it('throws an error if provided but is not a function', () => {
        expect(() => new Lumberjack({ beforeWrite: true })).toThrowErrorMatchingSnapshot();
      });
    });

    describe('afterWrite option', () => {
      it('throws an error if provided but is not a function', () => {
        expect(() => new Lumberjack({ afterWrite: true })).toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe('error', () => {
    const stdout = createStream();
    const stderr = createStream();
    const formatter = jest.fn(() => 'error string');
    const logger = new Lumberjack({ stdout, stderr, formatter });

    beforeEach(() => {
      stdout.write.mockClear();
      stderr.write.mockClear();
      formatter.mockClear();
    });

    it('is formatted by the formatter option', () => {
      const a = 1;
      const b = 'two';
      const c = function three() {};
      logger.error(a, b, c);
      expect(formatter).toHaveBeenCalledTimes(1);
      expect(formatter.mock.calls[0]).toEqual(['error', a, b, c]);
    });

    it('is written to the stderr stream option', () => {
      logger.error();
      expect(stderr.write).toHaveBeenCalledTimes(1);
      expect(stderr.write.mock.calls[0][0]).toEqual('error string\n');
    });

    it('is not written to the stdout stream option', () => {
      logger.error();
      expect(stdout.write).not.toHaveBeenCalled();
    });

    it('skips writing to the stderr stream if formatter returned null', () => {
      const skipperLogger = new Lumberjack({ stdout, stderr, formatter: () => null });
      skipperLogger.error('skipping');
      expect(stderr.write).not.toHaveBeenCalled();
    });

    it('calls beforeWrite before writing to stderr', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const stderrPush = createStream({ write: jest.fn(() => { order.push('stderr'); }) });
      const beforeLogger = new Lumberjack({
        stdout,
        stderr: stderrPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
      });
      beforeLogger.error('text');
      expect(beforeWritePush).toHaveBeenCalledTimes(1);
      expect(stderrPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stderr']);
    });

    it('calls afterWrite after writing to stderr', () => {
      const order = [];
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stderrPush = createStream({ write: jest.fn(() => { order.push('stderr'); }) });
      const afterLogger = new Lumberjack({
        stdout,
        stderr: stderrPush,
        formatter: (v) => v,
        afterWrite: afterWritePush,
      });
      afterLogger.error('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stderrPush.write).toHaveBeenCalled();
      expect(order).toEqual(['stderr', 'afterWrite']);
    });

    it('calls both beforeWrite and afterWrite', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stderrPush = createStream({ write: jest.fn(() => { order.push('stderr'); }) });
      const beforeAndAfterLogger = new Lumberjack({
        stdout,
        stderr: stderrPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
        afterWrite: afterWritePush,
      });
      beforeAndAfterLogger.error('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stderrPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stderr', 'afterWrite']);
    });
  });

  describe('warn', () => {
    const stdout = createStream();
    const stderr = createStream();
    const formatter = jest.fn(() => 'warn string');
    const logger = new Lumberjack({ stdout, stderr, formatter });

    beforeEach(() => {
      stdout.write.mockClear();
      stderr.write.mockClear();
      formatter.mockClear();
    });

    it('is formatted by the formatter option', () => {
      const a = 1;
      const b = 'two';
      const c = function three() {};
      logger.warn(a, b, c);
      expect(formatter).toHaveBeenCalledTimes(1);
      expect(formatter.mock.calls[0]).toEqual(['warn', a, b, c]);
    });

    it('is written to the stderr stream option', () => {
      logger.warn();
      expect(stderr.write).toHaveBeenCalledTimes(1);
      expect(stderr.write.mock.calls[0][0]).toEqual('warn string\n');
    });

    it('is not written to the stdout stream option', () => {
      logger.warn();
      expect(stdout.write).not.toHaveBeenCalled();
    });

    it('skips writing to the stderr stream if formatter returned null', () => {
      const skipperLogger = new Lumberjack({ stdout, stderr, formatter: () => null });
      skipperLogger.warn('skipping');
      expect(stderr.write).not.toHaveBeenCalled();
    });

    it('calls beforeWrite before writing to stderr', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const stderrPush = createStream({ write: jest.fn(() => { order.push('stderr'); }) });
      const beforeLogger = new Lumberjack({
        stdout,
        stderr: stderrPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
      });
      beforeLogger.warn('text');
      expect(beforeWritePush).toHaveBeenCalledTimes(1);
      expect(stderrPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stderr']);
    });

    it('calls afterWrite after writing to stderr', () => {
      const order = [];
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stderrPush = createStream({ write: jest.fn(() => { order.push('stderr'); }) });
      const afterLogger = new Lumberjack({
        stdout,
        stderr: stderrPush,
        formatter: (v) => v,
        afterWrite: afterWritePush,
      });
      afterLogger.warn('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stderrPush.write).toHaveBeenCalled();
      expect(order).toEqual(['stderr', 'afterWrite']);
    });

    it('calls both beforeWrite and afterWrite', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stderrPush = createStream({ write: jest.fn(() => { order.push('stderr'); }) });
      const beforeAndAfterLogger = new Lumberjack({
        stdout,
        stderr: stderrPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
        afterWrite: afterWritePush,
      });
      beforeAndAfterLogger.warn('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stderrPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stderr', 'afterWrite']);
    });
  });

  describe('info', () => {
    const stdout = createStream();
    const formatter = jest.fn(() => 'info string');
    const logger = new Lumberjack({ stdout, formatter });

    beforeEach(() => {
      stdout.write.mockClear();
      formatter.mockClear();
    });

    it('is formatted by the formatter option', () => {
      const a = 1;
      const b = 'two';
      const c = function three() {};
      logger.info(a, b, c);
      expect(formatter).toHaveBeenCalledTimes(1);
      expect(formatter.mock.calls[0]).toEqual(['info', a, b, c]);
    });

    it('is written to the stdout stream option', () => {
      logger.info();
      expect(stdout.write).toHaveBeenCalledTimes(1);
      expect(stdout.write.mock.calls[0][0]).toEqual('info string\n');
    });

    it('skips writing to the stdout stream if formatter returned null', () => {
      const skipperLogger = new Lumberjack({ stdout, formatter: () => null });
      skipperLogger.error('skipping');
      expect(stdout.write).not.toHaveBeenCalled();
    });

    it('calls beforeWrite before writing to stderr', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const beforeLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
      });
      beforeLogger.info('text');
      expect(beforeWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stdout']);
    });

    it('calls afterWrite after writing to stdout', () => {
      const order = [];
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const afterLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        afterWrite: afterWritePush,
      });
      afterLogger.info('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['stdout', 'afterWrite']);
    });

    it('calls both beforeWrite and afterWrite', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const beforeAndAfterLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
        afterWrite: afterWritePush,
      });
      beforeAndAfterLogger.info('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stdout', 'afterWrite']);
    });
  });

  describe('log', () => {
    const stdout = createStream();
    const formatter = jest.fn(() => 'log string');
    const logger = new Lumberjack({ stdout, formatter });

    beforeEach(() => {
      stdout.write.mockClear();
      formatter.mockClear();
    });

    it('is formatted by the formatter option', () => {
      const a = 1;
      const b = 'two';
      const c = function three() {};
      logger.log(a, b, c);
      expect(formatter).toHaveBeenCalledTimes(1);
      expect(formatter.mock.calls[0]).toEqual(['log', a, b, c]);
    });

    it('is written to the stdout stream option', () => {
      logger.log();
      expect(stdout.write).toHaveBeenCalledTimes(1);
      expect(stdout.write.mock.calls[0][0]).toEqual('log string\n');
    });

    it('skips writing to the stdout stream if formatter returned null', () => {
      const skipperLogger = new Lumberjack({ stdout, formatter: () => null });
      skipperLogger.error('skipping');
      expect(stdout.write).not.toHaveBeenCalled();
    });

    it('calls beforeWrite before writing to stderr', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const beforeLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
      });
      beforeLogger.log('text');
      expect(beforeWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stdout']);
    });

    it('calls afterWrite after writing to stdout', () => {
      const order = [];
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const afterLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        afterWrite: afterWritePush,
      });
      afterLogger.log('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['stdout', 'afterWrite']);
    });

    it('calls both beforeWrite and afterWrite', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const beforeAndAfterLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
        afterWrite: afterWritePush,
      });
      beforeAndAfterLogger.log('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stdout', 'afterWrite']);
    });
  });

  describe('table', () => {
    const stdout = createStream();
    const formatter = jest.fn(() => 'table string');
    const logger = new Lumberjack({ stdout, formatter });

    beforeEach(() => {
      stdout.write.mockClear();
      formatter.mockClear();
    });

    it('is formatted by the formatter option', () => {
      const a = 1;
      const b = 'two';
      const c = function three() {};
      logger.table(a, b, c);
      expect(formatter).toHaveBeenCalledTimes(1);
      expect(formatter.mock.calls[0]).toEqual(['table', a, b, c]);
    });

    it('is written to the stdout stream option', () => {
      logger.table();
      expect(stdout.write).toHaveBeenCalledTimes(1);
      expect(stdout.write.mock.calls[0][0]).toEqual('table string\n');
    });

    it('skips writing to the stdout stream if formatter returned null', () => {
      const skipperLogger = new Lumberjack({ stdout, formatter: () => null });
      skipperLogger.error('skipping');
      expect(stdout.write).not.toHaveBeenCalled();
    });

    it('calls beforeWrite before writing to stderr', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const beforeLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
      });
      beforeLogger.table('text');
      expect(beforeWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stdout']);
    });

    it('calls afterWrite after writing to stdout', () => {
      const order = [];
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const afterLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        afterWrite: afterWritePush,
      });
      afterLogger.table('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['stdout', 'afterWrite']);
    });

    it('calls both beforeWrite and afterWrite', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const beforeAndAfterLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
        afterWrite: afterWritePush,
      });
      beforeAndAfterLogger.table('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stdout', 'afterWrite']);
    });
  });

  describe('dir', () => {
    const stdout = createStream();
    const formatter = jest.fn(() => 'dir string');
    const logger = new Lumberjack({ stdout, formatter });

    beforeEach(() => {
      stdout.write.mockClear();
      formatter.mockClear();
    });

    it('is formatted by the formatter option', () => {
      const a = 1;
      const b = 'two';
      const c = function three() {};
      logger.dir(a, b, c);
      expect(formatter).toHaveBeenCalledTimes(1);
      expect(formatter.mock.calls[0]).toEqual(['dir', a, b, c]);
    });

    it('is written to the stdout stream option', () => {
      logger.dir();
      expect(stdout.write).toHaveBeenCalledTimes(1);
    });

    it('skips writing to the stdout stream if formatter returned null', () => {
      const skipperLogger = new Lumberjack({ stdout, formatter: () => null });
      skipperLogger.error('skipping');
      expect(stdout.write).not.toHaveBeenCalled();
    });

    it('calls beforeWrite before writing to stderr', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const beforeLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
      });
      beforeLogger.dir('text');
      expect(beforeWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stdout']);
    });

    it('calls afterWrite after writing to stdout', () => {
      const order = [];
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const afterLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        afterWrite: afterWritePush,
      });
      afterLogger.dir('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['stdout', 'afterWrite']);
    });

    it('calls both beforeWrite and afterWrite', () => {
      const order = [];
      const beforeWritePush = jest.fn(() => { order.push('beforeWrite'); });
      const afterWritePush = jest.fn(() => { order.push('afterWrite'); });
      const stdoutPush = createStream({ write: jest.fn(() => { order.push('stdout'); }) });
      const beforeAndAfterLogger = new Lumberjack({
        stdout: stdoutPush,
        formatter: (v) => v,
        beforeWrite: beforeWritePush,
        afterWrite: afterWritePush,
      });
      beforeAndAfterLogger.dir('text');
      expect(afterWritePush).toHaveBeenCalledTimes(1);
      expect(stdoutPush.write).toHaveBeenCalled();
      expect(order).toEqual(['beforeWrite', 'stdout', 'afterWrite']);
    });
  });
});
