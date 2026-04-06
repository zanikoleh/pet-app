// Jest setup file
try {
  const { polyfill } = require('react-native/Libraries/Animated/NativeAnimatedHelper');
  polyfill();
} catch (error) {
  // polyfill not available in test environment
}

// Polyfill Response for fetch tests
if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Map(Object.entries(init?.headers || {}));
    }

    get ok() {
      return this.status >= 200 && this.status < 300;
    }

    json() {
      return Promise.resolve(JSON.parse(this.body));
    }

    text() {
      return Promise.resolve(this.body?.toString() || '');
    }

    clone() {
      return new Response(this.body, { status: this.status, statusText: this.statusText, headers: Object.fromEntries(this.headers) });
    }
  };
}

// Polyfill DOMException for AbortError
if (typeof DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name;
    }
  };
}

