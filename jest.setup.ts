import { TextDecoder, TextEncoder } from "node:util";

// jsdom doesn't implement TextEncoder/TextDecoder, but react-router v7 (and
// anything else using the web streams/URL APIs) expects them to exist. Node
// provides spec-compliant versions, so map them onto the jsdom global.
Object.assign(globalThis, {
  TextEncoder: globalThis.TextEncoder ?? TextEncoder,
  TextDecoder: globalThis.TextDecoder ?? TextDecoder,
});

// Build-time constants normally injected by webpack's DefinePlugin. Jest
// doesn't run webpack, so they're defined here instead. Keep this list in
// sync with the DefinePlugin block in webpack.config.mjs.
Object.assign(globalThis, {
  __API_BASE_URL__: "/api/example",
});

import "@testing-library/jest-dom";
