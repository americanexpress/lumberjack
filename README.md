<h1 align="center">
  <img src='https://github.com/americanexpress/lumberjack/raw/master/lumberjack.png' alt="Lumberjack - One Amex" width='50%'/>
</h1>

[![npm](https://img.shields.io/npm/v/@americanexpress/lumberjack)](https://www.npmjs.com/package/@americanexpress/lumberjack)
[![Travis (.org) branch](https://img.shields.io/travis/americanexpress/lumberjack/master)](https://travis-ci.org/americanexpress/lumberjack)

> `lumberjack` is a minimal and configurable [`Console`](https://nodejs.org/api/console.html) with utilities.

## 👩‍💻 Hiring 👨‍💻

Want to get paid for your contributions to `lumberjack`?
> Send your resume to oneamex.careers@aexp.com

## 📖 Table of Contents

* [Features](#-features)
* [Usage](#-usage)
* [API](#-api)
* [Contributing](#-contributing)

## ✨ Features

* minimal and configurable  [`Console`](https://nodejs.org/api/console.html) with utilities.
* Log formating using `formatter` depending on the log level.
* Invoke callback functions before and after writing to stream.
* Replace global `console` object using lumberjack

## 🤹‍ Usage

### Installation

```bash
npm i @americanexpress/lumberjack
```

### Invocation

#### How to use Lumberjack

Read more about this in the [Lumberjack](#Lumberjack) API section.

```javascript
import Lumberjack from '@americanexpress/lumberjack';

function createLogger(simple = true) {
  return new Lumberjack({
    formatter: simple
      // your formatter function can be as simple as:
      ? (level, ...args) => `${level}: ${args}`
      // or can be more complex, like stringifying as JSON:
      : (level, ...messages) => JSON.stringify(
        {
          level,
          messages,
          time: new Date().toISOString(),
        },
        null,
        2
      ),
  });
}

const logger = createLogger();

logger.error(new Error('sample error'));
logger.warn("you're gonna have a bad time");
logger.info('%d', 42);
logger.log({ its: 'complicated' });
logger.dir(document.location); // lists properties of an object
logger.table(['apples', 'oranges', 'bananas']); // expects array
```

#### How to use monkeypatches

Read more about this in the [monkeypatches](#monkeypatches) API section.

```javascript
import Lumberjack, { monkeypatches } from '@americanexpress/lumberjack';

const logger = new Lumberjack();

monkeypatches.replaceGlobalConsole(logger);

console.log('This is now invoking logger.log');
```

## 🎛️ API

### Lumberjack

Creating a new console/Lumberjack is _similar_ to creating a [new nodejs Console](https://nodejs.org/api/console.html#console_new_console_stdout_stderr_ignoreerrors), but slightly different:

* pass a single object with named options

``` javascript
const logger = new Lumberjack({
  // options are added here
});
```

`Options` are:

* `stdout`: stream to write to, defaults to `process.stdout`
* `stderr`: defaults to the `stdout` option
* `formatter`: an optional function that gets the log level and raw input arguments to return a string that is written to the stream (either `stdout` or `stderr` depending on log level)
  * defaults to `util.format` (nodejs Console's formatter)
  * can return `null` to skip writing to the stream
* `beforeWrite`: callback function invoked before writing to the stream
* `afterWrite`: callback function invoked after writing to the stream

The `Lumberjack` instance has four methods: `error`, `warn`, `info`, and `log`.

### monkeypatches

>A monkey patch is a way for a program to extend or modify supporting system software locally (affecting only the running instance of the program).
>
>https://en.wikipedia.org/wiki/Monkey_patch

Use monkeypatches with care and be aware of [pitfalls](https://en.wikipedia.org/wiki/Monkey_patch#Pitfalls).

#### replaceGlobalConsole

Replaces the `error`, `warn`, `info`, and `log` methods on the global `console` object with those of the `logger` argument provided.

```javascript
import Lumberjack, { monkeypatches } from '@americanexpress/lumberjack';

const logger = new Lumberjack();

monkeypatches.replaceGlobalConsole(logger);

console.log('This is now invoking logger.log');
```

#### attachSpy

Spy on invocations of methods, ex: on native packages.

Arguments:

* object the method exists on
* method name to spy on
* spy function, receives
  * an array of the original arguments
  * a function to invoke the original method and get the return value, this will be invoked automatically if not done by the spy function

See also [attachHttpRequestSpy](#monkeypatches.attachHttpRequestSpy) and [attachHttpsRequestSpy](#monkeypatches.attachHttpsRequestSpy)

```javascript
import { monkeypatches } from '@americanexpress/lumberjack';

monkeypatches.attachSpy(http, 'request', (args, callOriginal) => {
  console.log('starting http request', args);
  const returnValue = callOriginal(); // spy, not an interceptor, so args handled automatically
  console.log('http request started', returnValue);
});
```

#### attachHttpRequestSpy

Spy on the beginning and end of an `http.request`.

Arguments:

* spy for the invocation of `http.request`
* spy for the close of the socket used in the `http.request`

Both spies receive the return value of `http.request` and a normalized parsed URL requested (via `url.parse`).

```javascript
import { monkeypatches } from '@americanexpress/lumberjack';

monkeypatches.attachHttpRequestSpy(
  (clientRequest, parsedUrl) => console.info(`started request to ${parsedUrl.href}`),
  (clientRequest, parsedUrl) => console.info(`request to ${parsedUrl.href} finished`)
);
```

#### attachHttpsRequestSpy

The same thing as [attachHttpRequestSpy](#monkeypatches.attachHttpRequestSpy) but for the `https` native package.

Note that for nodejs versions before 6.0.0 and earlier `https.request` called `http.request` so adding spys for both
`http` and `https` will result in both spies being called.

## 🏆 Contributing

We welcome Your interest in the American Express Open Source Community on Github.
Any Contributor to any Open Source Project managed by the American Express Open
Source Community must accept and sign an Agreement indicating agreement to the
terms below. Except for the rights granted in this Agreement to American Express
and to recipients of software distributed by American Express, You reserve all
right, title, and interest, if any, in and to Your Contributions. Please [fill
out the Agreement](https://cla-assistant.io/americanexpress/lumberjack).

Please feel free to open pull requests and see [CONTRIBUTING.md](./CONTRIBUTING.md) to learn how to get started contributing.

## 🗝️ License

Any contributions made under this project will be governed by the [Apache License
2.0](https://github.com/americanexpress/lumberjack/blob/master/LICENSE.txt).

## 🗣️ Code of Conduct

This project adheres to the [American Express Community Guidelines](./CODE_OF_CONDUCT.md).
By participating, you are expected to honor these guidelines.
