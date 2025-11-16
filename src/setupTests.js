import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
  });
}

const abDescriptor = Object.getOwnPropertyDescriptor(
  ArrayBuffer.prototype,
  "resizable"
);
if (!abDescriptor) {
  Object.defineProperty(ArrayBuffer.prototype, "resizable", {
    configurable: true,
    get() {
      return false;
    },
  });
}

if (typeof SharedArrayBuffer !== "undefined") {
  const sabDescriptor = Object.getOwnPropertyDescriptor(
    SharedArrayBuffer.prototype,
    "growable"
  );
  if (!sabDescriptor) {
    Object.defineProperty(SharedArrayBuffer.prototype, "growable", {
      configurable: true,
      get() {
        return false;
      },
    });
  }
}
