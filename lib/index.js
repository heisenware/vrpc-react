'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactVrpc = require('./react-vrpc');

Object.keys(_reactVrpc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _reactVrpc[key];
    }
  });
});