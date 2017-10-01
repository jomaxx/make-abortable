const abortable = require('../');

let signal;

function abort() {
  signal.aborted = true;
  signal.addEventListener.mock.calls.forEach(([type, fn]) => {
    if (type === 'abort') {
      fn();
    }
  });
}

class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name;
  }
}

beforeEach(() => {
  global.DOMException = DOMException;

  signal = {
    aborted: false,
    addEventListener: jest.fn(),
  };
});

async function expectAborted(promise) {
  await expect(promise).rejects.toBeInstanceOf(Error);
  const error = await promise.catch(e => e);
  expect(error.name).toEqual('AbortError');
}

it('rejects if signal already aborted', async () => {
  signal.aborted = true;
  const promise = Promise.resolve('test');
  const abortablePromise = abortable(promise, { signal });
  await expectAborted(abortablePromise);
  await expect(abortablePromise).rejects.toBeInstanceOf(DOMException);
});

it('fallback to Error when DOMException not available', async () => {
  global.DOMException = undefined;
  signal.aborted = true;
  const promise = Promise.resolve('test');
  const abortablePromise = abortable(promise, { signal });
  await expectAborted(abortablePromise);
  await expect(abortablePromise).rejects.not.toBeInstanceOf(DOMException);
});

it('rejects if signal aborted before promise resolves', async () => {
  const promise = new Promise(resolve => {
    setTimeout(() => {
      abort();
      resolve();
    }, 0);
  });
  expect(signal.aborted).toBe(false);
  const abortablePromise = abortable(promise, { signal });
  await expectAborted(abortablePromise);
});

it('resolves if signal aborted after promise resolves', async () => {
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve();
      abort();
    }, 0);
  });
  const abortablePromise = abortable(promise, { signal });
  expect(signal.aborted).toBe(false);
  await expect(abortablePromise).resolves.toBe(undefined);
  expect(signal.aborted).toBe(true);
});
