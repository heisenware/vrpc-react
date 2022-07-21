"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createVrpcProvider = createVrpcProvider;
exports.useBackend = useBackend;
exports.useClient = useClient;

var _react = _interopRequireWildcard(require("react"));

var _vrpc = require("vrpc");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var NETWORK_ERROR = 'NetworkError';
var VRPC_ERROR = 'VrpcError';
var vrpcClientContext = /*#__PURE__*/(0, _react.createContext)();
var vrpcBackendContexts = [];

function createVrpcProvider(_ref) {
  var _ref$domain = _ref.domain,
      domain = _ref$domain === void 0 ? 'vrpc' : _ref$domain,
      _ref$broker = _ref.broker,
      broker = _ref$broker === void 0 ? 'wss://vrpc.io/mqtt' : _ref$broker,
      _ref$backends = _ref.backends,
      backends = _ref$backends === void 0 ? {} : _ref$backends,
      _ref$identity = _ref.identity,
      identity = _ref$identity === void 0 ? null : _ref$identity,
      _ref$bestEffort = _ref.bestEffort,
      bestEffort = _ref$bestEffort === void 0 ? false : _ref$bestEffort,
      _ref$debug = _ref.debug,
      debug = _ref$debug === void 0 ? false : _ref$debug;

  // create a context for every user-specified backend
  for (var _i = 0, _Object$keys = Object.keys(backends); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    var context = /*#__PURE__*/(0, _react.createContext)();
    context.displayName = key;
    vrpcBackendContexts.push(context);
  }

  return function VrpcProvider(_ref2) {
    var children = _ref2.children,
        username = _ref2.username,
        password = _ref2.password,
        token = _ref2.token,
        _ref2$onError = _ref2.onError,
        onError = _ref2$onError === void 0 ? function (msg) {
      return debug && console.error(msg);
    } : _ref2$onError;
    return /*#__PURE__*/_react["default"].createElement(VrpcBackendMaker, {
      backends: backends,
      broker: broker,
      token: token,
      domain: domain,
      username: username,
      password: password,
      identity: identity,
      bestEffort: bestEffort,
      debug: debug,
      onError: onError
    }, children);
  };
}

function VrpcBackendMaker(_ref3) {
  var children = _ref3.children,
      backends = _ref3.backends,
      broker = _ref3.broker,
      token = _ref3.token,
      domain = _ref3.domain,
      username = _ref3.username,
      password = _ref3.password,
      identity = _ref3.identity,
      bestEffort = _ref3.bestEffort,
      debug = _ref3.debug,
      onError = _ref3.onError;
  var client = (0, _react.useMemo)(function () {
    return new _vrpc.VrpcClient({
      broker: broker,
      token: token,
      domain: domain,
      username: username,
      password: password,
      identity: identity,
      bestEffort: bestEffort
    });
  }, [broker, token, domain, username, password, identity, bestEffort]);

  var _useState = (0, _react.useState)(true),
      _useState2 = _slicedToArray(_useState, 2),
      isInitializing = _useState2[0],
      setIsInitializing = _useState2[1];

  var _useState3 = (0, _react.useState)(null),
      _useState4 = _slicedToArray(_useState3, 2),
      error = _useState4[0],
      setError = _useState4[1];

  var _useState5 = (0, _react.useState)([]),
      _useState6 = _slicedToArray(_useState5, 2),
      backend = _useState6[0],
      setBackend = _useState6[1];

  (0, _react.useEffect)(function () {
    function filterBackends(className, agent) {
      var ret = [];

      for (var _i2 = 0, _Object$entries = Object.entries(backends); _i2 < _Object$entries.length; _i2++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
            k = _Object$entries$_i[0],
            v = _Object$entries$_i[1];

        if (v.className === className && v.agent === agent) {
          ret.push(k);
        }
      }

      return ret;
    }

    function createMultiInstanceBackend(client, defaultClassName, defaultAgent) {
      return {
        create: function () {
          var _create = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(id) {
            var _ref4,
                _ref4$args,
                args,
                _ref4$className,
                className,
                _ref4$agent,
                agent,
                _args = arguments;

            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _ref4 = _args.length > 1 && _args[1] !== undefined ? _args[1] : {}, _ref4$args = _ref4.args, args = _ref4$args === void 0 ? [] : _ref4$args, _ref4$className = _ref4.className, className = _ref4$className === void 0 ? defaultClassName : _ref4$className, _ref4$agent = _ref4.agent, agent = _ref4$agent === void 0 ? defaultAgent : _ref4$agent;
                    return _context.abrupt("return", client.create({
                      agent: agent,
                      className: className,
                      args: args,
                      instance: id
                    }));

                  case 2:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          function create(_x) {
            return _create.apply(this, arguments);
          }

          return create;
        }(),
        get: function () {
          var _get = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(id) {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    return _context2.abrupt("return", client.getInstance(id, {
                      agent: defaultAgent
                    }));

                  case 1:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));

          function get(_x2) {
            return _get.apply(this, arguments);
          }

          return get;
        }(),
        "delete": function () {
          var _delete2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(id) {
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    return _context3.abrupt("return", client["delete"](id, {
                      agent: defaultAgent
                    }));

                  case 1:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3);
          }));

          function _delete(_x3) {
            return _delete2.apply(this, arguments);
          }

          return _delete;
        }(),
        callStatic: function () {
          var _callStatic = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(functionName) {
            var options,
                _len,
                args,
                _key,
                _args4 = arguments;

            return _regeneratorRuntime().wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    options = {};

                    if (typeof functionName === 'string') {
                      options.functionName = functionName;

                      for (_len = _args4.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                        args[_key - 1] = _args4[_key];
                      }

                      options.args = args;
                      options.className = defaultClassName;
                      options.agent = defaultAgent;
                    } else {
                      options = functionName;
                    }

                    return _context4.abrupt("return", client.callStatic(options));

                  case 3:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4);
          }));

          function callStatic(_x4) {
            return _callStatic.apply(this, arguments);
          }

          return callStatic;
        }(),
        callAll: function () {
          var _callAll = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(functionName) {
            var options,
                _len2,
                args,
                _key2,
                _args5 = arguments;

            return _regeneratorRuntime().wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    options = {};

                    if (typeof functionName === 'string') {
                      options.functionName = functionName;

                      for (_len2 = _args5.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                        args[_key2 - 1] = _args5[_key2];
                      }

                      options.args = args;
                      options.className = defaultClassName;
                      options.agent = defaultAgent;
                    } else {
                      options = functionName;
                    }

                    return _context5.abrupt("return", client.callAll(options));

                  case 3:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          }));

          function callAll(_x5) {
            return _callAll.apply(this, arguments);
          }

          return callAll;
        }(),
        ids: []
      };
    }

    function initializeBackends(client) {
      setBackend(function (prev) {
        Object.keys(backends).forEach(function (x) {
          var _backends$x = backends[x],
              instance = _backends$x.instance,
              args = _backends$x.args,
              className = _backends$x.className,
              agent = _backends$x.agent;

          if (!instance && !args) {
            var _backend = createMultiInstanceBackend(client, className, agent);

            prev[x] = [_backend, null];
          } else {
            prev[x] = [null, null];
          }
        });
        return _objectSpread({}, prev);
      });
    }

    function registerHandlers(client) {
      client.on('instanceNew', /*#__PURE__*/function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(added, _ref5) {
          var className, agent, keys, _iterator, _step, _loop, _ret;

          return _regeneratorRuntime().wrap(function _callee6$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  className = _ref5.className, agent = _ref5.agent;

                  if (className) {
                    _context7.next = 3;
                    break;
                  }

                  return _context7.abrupt("return");

                case 3:
                  keys = filterBackends(className, agent);
                  _iterator = _createForOfIteratorHelper(keys);
                  _context7.prev = 5;
                  _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
                    var key, _backends$key, agent, instance, args, proxy, _error;

                    return _regeneratorRuntime().wrap(function _loop$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            key = _step.value;
                            _backends$key = backends[key], agent = _backends$key.agent, instance = _backends$key.instance, args = _backends$key.args;

                            if (!args) {
                              _context6.next = 4;
                              break;
                            }

                            return _context6.abrupt("return", "continue");

                          case 4:
                            if (!instance) {
                              _context6.next = 20;
                              break;
                            }

                            _context6.prev = 5;
                            _context6.next = 8;
                            return client.getInstance(instance, {
                              className: className,
                              agent: agent
                            });

                          case 8:
                            proxy = _context6.sent;
                            setBackend(function (prev) {
                              prev[key] = [proxy, null];
                              return _objectSpread({}, prev);
                            });
                            _context6.next = 18;
                            break;

                          case 12:
                            _context6.prev = 12;
                            _context6.t0 = _context6["catch"](5);
                            _error = new Error("Could not attach to backend instance '".concat(instance, "', because: ").concat(_context6.t0.message), {
                              cause: _context6.t0
                            });
                            _error.name = VRPC_ERROR;
                            onError(_error);
                            setBackend(function (prev) {
                              prev[key] = [null, _error];
                              return _objectSpread({}, prev);
                            });

                          case 18:
                            _context6.next = 21;
                            break;

                          case 20:
                            // multi-instance backend
                            setBackend(function (prev) {
                              if (!prev[key][0] || !prev[key][0].ids) return prev;
                              prev[key][0].ids = _toConsumableArray(new Set([].concat(_toConsumableArray(prev[key][0].ids), _toConsumableArray(added))));
                              return _objectSpread({}, prev);
                            });

                          case 21:
                          case "end":
                            return _context6.stop();
                        }
                      }
                    }, _loop, null, [[5, 12]]);
                  });

                  _iterator.s();

                case 8:
                  if ((_step = _iterator.n()).done) {
                    _context7.next = 15;
                    break;
                  }

                  return _context7.delegateYield(_loop(), "t0", 10);

                case 10:
                  _ret = _context7.t0;

                  if (!(_ret === "continue")) {
                    _context7.next = 13;
                    break;
                  }

                  return _context7.abrupt("continue", 13);

                case 13:
                  _context7.next = 8;
                  break;

                case 15:
                  _context7.next = 20;
                  break;

                case 17:
                  _context7.prev = 17;
                  _context7.t1 = _context7["catch"](5);

                  _iterator.e(_context7.t1);

                case 20:
                  _context7.prev = 20;

                  _iterator.f();

                  return _context7.finish(20);

                case 23:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee6, null, [[5, 17, 20, 23]]);
        }));

        return function (_x6, _x7) {
          return _ref6.apply(this, arguments);
        };
      }());
      client.on('instanceGone', /*#__PURE__*/function () {
        var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(gone, _ref7) {
          var className, agent, keys, _iterator2, _step2, _loop2, _ret2;

          return _regeneratorRuntime().wrap(function _callee7$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  className = _ref7.className, agent = _ref7.agent;

                  if (className) {
                    _context8.next = 3;
                    break;
                  }

                  return _context8.abrupt("return");

                case 3:
                  keys = filterBackends(className, agent);
                  _iterator2 = _createForOfIteratorHelper(keys);
                  _context8.prev = 5;

                  _loop2 = function _loop2() {
                    var key = _step2.value;
                    var _backends$key2 = backends[key],
                        instance = _backends$key2.instance,
                        args = _backends$key2.args; // Available instance is used by this backend

                    if (instance && gone.includes(instance)) {
                      var _error2 = new Error("Lost instance '".concat(instance, "' required for backend '").concat(key, "'"));

                      _error2.name = VRPC_ERROR;
                      onError(_error2);
                      setBackend(function (prev) {
                        prev[key] = [null, _error2];
                        return _objectSpread({}, prev);
                      });
                      return "continue";
                    }

                    setBackend(function (prev) {
                      if (!prev[key][0] || !prev[key][0].ids) return prev;
                      prev[key][0].ids = prev[key][0].ids.filter(function (x) {
                        return !gone.includes(x);
                      });
                      return _objectSpread({}, prev);
                    });
                  };

                  _iterator2.s();

                case 8:
                  if ((_step2 = _iterator2.n()).done) {
                    _context8.next = 14;
                    break;
                  }

                  _ret2 = _loop2();

                  if (!(_ret2 === "continue")) {
                    _context8.next = 12;
                    break;
                  }

                  return _context8.abrupt("continue", 12);

                case 12:
                  _context8.next = 8;
                  break;

                case 14:
                  _context8.next = 19;
                  break;

                case 16:
                  _context8.prev = 16;
                  _context8.t0 = _context8["catch"](5);

                  _iterator2.e(_context8.t0);

                case 19:
                  _context8.prev = 19;

                  _iterator2.f();

                  return _context8.finish(19);

                case 22:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee7, null, [[5, 16, 19, 22]]);
        }));

        return function (_x8, _x9) {
          return _ref8.apply(this, arguments);
        };
      }());
      client.on('agent', /*#__PURE__*/function () {
        var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(_ref9) {
          var agent, status, _loop3, _i3, _Object$entries2, _ret3;

          return _regeneratorRuntime().wrap(function _callee8$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  agent = _ref9.agent, status = _ref9.status;
                  _loop3 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop3() {
                    var _Object$entries2$_i, k, v, _error3, proxy, _error4;

                    return _regeneratorRuntime().wrap(function _loop3$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            _Object$entries2$_i = _slicedToArray(_Object$entries2[_i3], 2), k = _Object$entries2$_i[0], v = _Object$entries2$_i[1];

                            if (!(v.agent !== agent)) {
                              _context9.next = 3;
                              break;
                            }

                            return _context9.abrupt("return", "continue");

                          case 3:
                            if (!(status === 'offline')) {
                              _context9.next = 10;
                              break;
                            }

                            _error3 = new Error("Lost agent '".concat(agent, "' required for backend '").concat(k, "'"));
                            _error3.name = VRPC_ERROR;
                            onError(_error3);
                            setBackend(function (prev) {
                              if (!v.instance && !v.args && prev[k][0]) {
                                prev[k][0].ids = [];
                              } else {
                                prev[k][0] = null;
                              }

                              prev[k][1] = _error3;
                              return _objectSpread({}, prev);
                            });
                            _context9.next = 29;
                            break;

                          case 10:
                            if (!(status === 'online')) {
                              _context9.next = 29;
                              break;
                            }

                            if (!v.args) {
                              _context9.next = 28;
                              break;
                            }

                            _context9.prev = 12;
                            _context9.next = 15;
                            return client.create({
                              agent: v.agent,
                              className: v.className,
                              instance: v.instance,
                              args: v.args,
                              cacheProxy: true
                            });

                          case 15:
                            proxy = _context9.sent;

                            if (debug) {
                              console.log("Created instance '".concat(v.instance || '<anonymous>', "' for: backend ").concat(k));
                            }

                            setBackend(function (prev) {
                              prev[k] = [proxy, null];
                              return _objectSpread({}, prev);
                            });
                            _context9.next = 26;
                            break;

                          case 20:
                            _context9.prev = 20;
                            _context9.t0 = _context9["catch"](12);
                            _error4 = new Error("Could not create instance '".concat(v.instance || '<anonymous>', "' for backend '").concat(k, "' because: ").concat(_context9.t0.message), {
                              cause: _context9.t0
                            });
                            _error4.name = VRPC_ERROR;
                            onError(_error4);
                            setBackend(function (prev) {
                              prev[k] = [null, _error4];
                              return _objectSpread({}, prev);
                            });

                          case 26:
                            _context9.next = 29;
                            break;

                          case 28:
                            setBackend(function (prev) {
                              prev[k][1] = null;
                              return _objectSpread({}, prev);
                            });

                          case 29:
                          case "end":
                            return _context9.stop();
                        }
                      }
                    }, _loop3, null, [[12, 20]]);
                  });
                  _i3 = 0, _Object$entries2 = Object.entries(backends);

                case 3:
                  if (!(_i3 < _Object$entries2.length)) {
                    _context10.next = 11;
                    break;
                  }

                  return _context10.delegateYield(_loop3(), "t0", 5);

                case 5:
                  _ret3 = _context10.t0;

                  if (!(_ret3 === "continue")) {
                    _context10.next = 8;
                    break;
                  }

                  return _context10.abrupt("continue", 8);

                case 8:
                  _i3++;
                  _context10.next = 3;
                  break;

                case 11:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee8);
        }));

        return function (_x10) {
          return _ref10.apply(this, arguments);
        };
      }());
    }

    function init() {
      return _init.apply(this, arguments);
    } // Initialize here


    function _init() {
      _init = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
        var _error5;

        return _regeneratorRuntime().wrap(function _callee9$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.prev = 0;
                initializeBackends(client);
                client.on('error', function (error) {
                  error.name = NETWORK_ERROR;
                  onError(error);
                  setError(error);
                });
                _context11.next = 5;
                return client.connect();

              case 5:
                registerHandlers(client);
                if (debug) console.log('VRPC client is connected');
                setIsInitializing(false);
                _context11.next = 16;
                break;

              case 10:
                _context11.prev = 10;
                _context11.t0 = _context11["catch"](0);
                _error5 = new Error("VRPC client failed to connect because: ".concat(_context11.t0.message), {
                  cause: _context11.t0
                });
                _error5.name = VRPC_ERROR;
                onError(_error5);
                setError(_error5);

              case 16:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee9, null, [[0, 10]]);
      }));
      return _init.apply(this, arguments);
    }

    init();
  }, [client, backends, debug, onError]);

  function refresh(backend) {
    setBackend(function (prev) {
      if (!prev[backend]) return prev;
      prev[backend][0] = _objectSpread({}, prev[backend][0]);
      return _objectSpread({}, prev);
    });
  }

  function renderProviders() {
    var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

    if (index === -1) {
      return /*#__PURE__*/_react["default"].createElement(vrpcClientContext.Provider, {
        value: [client, error, refresh]
      }, renderProviders(index + 1));
    }

    if (index < vrpcBackendContexts.length) {
      var Context = vrpcBackendContexts[index];
      var Provider = Context.Provider;
      return /*#__PURE__*/_react["default"].createElement(Provider, {
        value: _toConsumableArray(backend[Context.displayName])
      }, renderProviders(index + 1));
    }

    return children;
  }

  if (isInitializing) return null;
  return renderProviders();
}

function useClient() {
  var _ref11 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      onError = _ref11.onError;

  var _useContext = (0, _react.useContext)(vrpcClientContext),
      _useContext2 = _slicedToArray(_useContext, 2),
      client = _useContext2[0],
      error = _useContext2[1];

  if (onError) client.on('error', onError);
  return [client, error];
}

function useBackend(name, id) {
  var context = (0, _react.useContext)(vrpcBackendContexts.find(function (x) {
    return x.displayName === name;
  }));

  var _useContext3 = (0, _react.useContext)(vrpcClientContext),
      _useContext4 = _slicedToArray(_useContext3, 3),
      refresh = _useContext4[2];

  var _useState7 = (0, _react.useState)([null, null]),
      _useState8 = _slicedToArray(_useState7, 2),
      proxy = _useState8[0],
      setProxy = _useState8[1];

  (0, _react.useEffect)(function () {
    if (!id) return;

    var _context12 = _slicedToArray(context, 1),
        backend = _context12[0];

    if (backend.ids && backend.ids.includes(id)) {
      backend.get(id).then(function (proxy) {
        return setProxy([proxy, null, function () {
          return refresh(name);
        }]);
      })["catch"](function (err) {
        var error = new Error("Failed proxy creation for id '".concat(id, "' of backend '").concat(name, "' because: ").concat(err.message), {
          cause: err
        });
        error.name = VRPC_ERROR;
        setProxy([null, error]);
      });
    } else {
      var error = new Error('The provided id is not an instance on the selected backend');
      error.name = VRPC_ERROR;
      setProxy([null, error]);
    }
  }, [context, id, refresh, name]);
  if (id) return proxy;
  context.push(function () {
    return refresh(name);
  });
  return context;
}