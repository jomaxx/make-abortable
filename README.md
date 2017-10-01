# make-abortable

Make promises abortable! That's it! :)

### Install

```bash
# if using npm
npm i make-abortable
# if using yarn
yarn add make-abortable
```

### Usage

```js
const abortable = require('make-abortable');
const controller = new AbortController();
const signal = controller.signal;

const promise = new Promise(resolve => {
  setTimeout(() => {
    resolve();
  }, 1000);
});

// abortable(promise, controller) works as well
const abortablePromise = abortable(promise, { signal });

// abort the promise
controller.abort();

abortablePromise
  .then(() => {
    // this will not execute
  })
  .catch((err) => {
    if (err.name === 'AbortError') return;
    // handle real errors here
  });
```

### AbortController

This library utilizes the `AbortController` api. This api is new so you might need a polyfill. Read about the `AbortController` api [here](https://dom.spec.whatwg.org/#aborting-ongoing-activities).
