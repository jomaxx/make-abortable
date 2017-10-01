'use strict;';

module.exports = makeAbortable;

function makeAbortable(promise, { signal }) {
  if (signal.aborted) {
    return Promise.reject(createAbortError());
  }

  return Promise.race([
    promise,
    new Promise(function(resolve, reject) {
      signal.addEventListener('abort', function onAbort() {
        reject(createAbortError());
        signal.removeEventListener('abort', onAbort);
      });
    }),
  ]);
}

function createAbortError() {
  let abortError;

  try {
    abortError = new DOMException('Aborted', 'AbortError');
  } catch (err) {
    abortError = new Error('Aborted');
    abortError.name = 'AbortError';
  }

  return abortError;
}
