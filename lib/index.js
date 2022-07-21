"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactVrpc = require("./react-vrpc");

Object.keys(_reactVrpc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _reactVrpc[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _reactVrpc[key];
    }
  });
});