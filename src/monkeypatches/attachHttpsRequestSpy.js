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

import https from 'https';

import attachSpy from './attachSpy';
import httpSpy from './httpSpy';

export default function attachHttpsRequestSpies(requestSpy, socketCloseSpy) {
  if (typeof requestSpy !== 'function') {
    throw new TypeError(`requestSpy must be a function (was "${typeof requestSpy}")`);
  }

  if (socketCloseSpy && (typeof socketCloseSpy !== 'function')) {
    throw new TypeError(
      `socketCloseSpy must be function if provided (was "${typeof socketCloseSpy}")`);
  }

  attachSpy(https, 'request', httpSpy('https', requestSpy, socketCloseSpy));
}
