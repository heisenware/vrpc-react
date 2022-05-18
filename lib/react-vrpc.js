'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.createVrpcProvider = createVrpcProvider;
exports.useClient = useClient;
exports.useBackend = useBackend;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _vrpc = require('vrpc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vrpcClientContext = (0, _react.createContext)();
var vrpcBackendContexts = [];

function createVrpcProvider(_ref) {
  var _ref$domain = _ref.domain,
      domain = _ref$domain === undefined ? 'vrpc' : _ref$domain,
      _ref$broker = _ref.broker,
      broker = _ref$broker === undefined ? 'wss://vrpc.io/mqtt' : _ref$broker,
      _ref$backends = _ref.backends,
      backends = _ref$backends === undefined ? {} : _ref$backends,
      _ref$identity = _ref.identity,
      identity = _ref$identity === undefined ? null : _ref$identity,
      _ref$debug = _ref.debug,
      debug = _ref$debug === undefined ? false : _ref$debug;

  // create a context for every user-specified backend
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(backends)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      var context = (0, _react.createContext)();
      context.displayName = key;
      vrpcBackendContexts.push(context);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return function VrpcProvider(_ref2) {
    var children = _ref2.children,
        username = _ref2.username,
        password = _ref2.password,
        token = _ref2.token,
        onError = _ref2.onError;

    return _react2.default.createElement(
      VrpcBackendMaker,
      {
        backends: backends,
        broker: broker,
        token: token,
        domain: domain,
        username: username,
        password: password,
        identity: identity,
        debug: debug,
        onError: onError
      },
      children
    );
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
      debug = _ref3.debug,
      onError = _ref3.onError;

  var client = (0, _react.useMemo)(function () {
    return new _vrpc.VrpcClient({
      broker: broker,
      token: token,
      domain: domain,
      username: username,
      password: password,
      identity: identity
    });
  }, [broker, token, domain, username, password]);

  var _useState = (0, _react.useState)(true),
      _useState2 = (0, _slicedToArray3.default)(_useState, 2),
      isInitializing = _useState2[0],
      setIsInitializing = _useState2[1];

  var _useState3 = (0, _react.useState)(null),
      _useState4 = (0, _slicedToArray3.default)(_useState3, 2),
      error = _useState4[0],
      setError = _useState4[1];

  var _useState5 = (0, _react.useState)([]),
      _useState6 = (0, _slicedToArray3.default)(_useState5, 2),
      backend = _useState6[0],
      setBackend = _useState6[1];

  (0, _react.useEffect)(function () {
    var init = function () {
      var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9() {
        return _regenerator2.default.wrap(function _callee9$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.prev = 0;

                initializeBackends(client);
                client.on('error', function (error) {
                  var message = error.message;

                  onError(message);
                  setError(message);
                });
                _context11.next = 5;
                return client.connect();

              case 5:
                registerHandlers(client);
                if (debug) console.log('VRPC client is connected');
                setIsInitializing(false);
                _context11.next = 14;
                break;

              case 10:
                _context11.prev = 10;
                _context11.t0 = _context11['catch'](0);

                if (debug) {
                  console.error('VRPC client failed to connect because: ' + _context11.t0.message);
                }
                setError(_context11.t0.message);

              case 14:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee9, this, [[0, 10]]);
      }));

      return function init() {
        return _ref16.apply(this, arguments);
      };
    }();

    // Initialize here


    function filterBackends(className, agent) {
      var ret = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.entries(backends)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
              k = _step2$value[0],
              v = _step2$value[1];

          if (v.className === className && v.agent === agent) {
            ret.push(k);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return ret;
    }

    function createMultiInstanceBackend(client, defaultClassName, defaultAgent) {
      var _this = this;

      return {
        create: function () {
          var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(id) {
            var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                _ref5$args = _ref5.args,
                args = _ref5$args === undefined ? [] : _ref5$args,
                _ref5$className = _ref5.className,
                className = _ref5$className === undefined ? defaultClassName : _ref5$className,
                _ref5$agent = _ref5.agent,
                agent = _ref5$agent === undefined ? defaultAgent : _ref5$agent;

            return _regenerator2.default.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    return _context.abrupt('return', client.create({
                      agent: agent,
                      className: className,
                      args: args,
                      instance: id
                    }));

                  case 1:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, _this);
          }));

          return function create(_x) {
            return _ref4.apply(this, arguments);
          };
        }(),
        get: function () {
          var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(id) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    return _context2.abrupt('return', client.getInstance(id, { agent: defaultAgent }));

                  case 1:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, _this);
          }));

          return function get(_x3) {
            return _ref6.apply(this, arguments);
          };
        }(),
        delete: function () {
          var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(id) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    return _context3.abrupt('return', client.delete(id, { agent: defaultAgent }));

                  case 1:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, _this);
          }));

          return function _delete(_x4) {
            return _ref7.apply(this, arguments);
          };
        }(),
        callStatic: function () {
          var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(functionName) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }

            var options;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    options = {};

                    if (typeof functionName === 'string') {
                      options.functionName = functionName;
                      options.args = args;
                      options.className = defaultClassName;
                      options.agent = defaultAgent;
                    } else {
                      options = functionName;
                    }
                    return _context4.abrupt('return', client.callStatic(options));

                  case 3:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, _callee4, _this);
          }));

          return function callStatic(_x5) {
            return _ref8.apply(this, arguments);
          };
        }(),
        callAll: function () {
          var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(functionName) {
            for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }

            var options;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    options = {};

                    if (typeof functionName === 'string') {
                      options.functionName = functionName;
                      options.args = args;
                      options.className = defaultClassName;
                      options.agent = defaultAgent;
                    } else {
                      options = functionName;
                    }
                    return _context5.abrupt('return', client.callAll(options));

                  case 3:
                  case 'end':
                    return _context5.stop();
                }
              }
            }, _callee5, _this);
          }));

          return function callAll(_x6) {
            return _ref9.apply(this, arguments);
          };
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
        return (0, _extends3.default)({}, prev);
      });
    }

    function registerHandlers(client) {
      var _this2 = this;

      client.on('instanceNew', function () {
        var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(added, _ref11) {
          var className = _ref11.className,
              agent = _ref11.agent;

          var keys, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _loop, _iterator3, _step3, _ret;

          return _regenerator2.default.wrap(function _callee6$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  if (className) {
                    _context7.next = 2;
                    break;
                  }

                  return _context7.abrupt('return');

                case 2:
                  keys = filterBackends(className, agent);
                  _iteratorNormalCompletion3 = true;
                  _didIteratorError3 = false;
                  _iteratorError3 = undefined;
                  _context7.prev = 6;
                  _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop() {
                    var key, _backends$key, agent, instance, args, proxy;

                    return _regenerator2.default.wrap(function _loop$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            key = _step3.value;
                            _backends$key = backends[key], agent = _backends$key.agent, instance = _backends$key.instance, args = _backends$key.args;

                            if (!args) {
                              _context6.next = 4;
                              break;
                            }

                            return _context6.abrupt('return', 'continue');

                          case 4:
                            if (!instance) {
                              _context6.next = 18;
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
                              return (0, _extends3.default)({}, prev);
                            });
                            _context6.next = 16;
                            break;

                          case 12:
                            _context6.prev = 12;
                            _context6.t0 = _context6['catch'](5);

                            if (debug) {
                              console.error('Could not attach to backend instance \'' + instance + '\', because: ' + _context6.t0.message);
                            }
                            setBackend(function (prev) {
                              prev[key] = [null, _context6.t0.message];
                              return (0, _extends3.default)({}, prev);
                            });

                          case 16:
                            _context6.next = 19;
                            break;

                          case 18:
                            // multi-instance backend
                            setBackend(function (prev) {
                              if (!prev[key][0] || !prev[key][0].ids) return prev;
                              prev[key][0].ids = [].concat((0, _toConsumableArray3.default)(new Set([].concat((0, _toConsumableArray3.default)(prev[key][0].ids), (0, _toConsumableArray3.default)(added)))));
                              return (0, _extends3.default)({}, prev);
                            });

                          case 19:
                          case 'end':
                            return _context6.stop();
                        }
                      }
                    }, _loop, _this2, [[5, 12]]);
                  });
                  _iterator3 = keys[Symbol.iterator]();

                case 9:
                  if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                    _context7.next = 17;
                    break;
                  }

                  return _context7.delegateYield(_loop(), 't0', 11);

                case 11:
                  _ret = _context7.t0;

                  if (!(_ret === 'continue')) {
                    _context7.next = 14;
                    break;
                  }

                  return _context7.abrupt('continue', 14);

                case 14:
                  _iteratorNormalCompletion3 = true;
                  _context7.next = 9;
                  break;

                case 17:
                  _context7.next = 23;
                  break;

                case 19:
                  _context7.prev = 19;
                  _context7.t1 = _context7['catch'](6);
                  _didIteratorError3 = true;
                  _iteratorError3 = _context7.t1;

                case 23:
                  _context7.prev = 23;
                  _context7.prev = 24;

                  if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                  }

                case 26:
                  _context7.prev = 26;

                  if (!_didIteratorError3) {
                    _context7.next = 29;
                    break;
                  }

                  throw _iteratorError3;

                case 29:
                  return _context7.finish(26);

                case 30:
                  return _context7.finish(23);

                case 31:
                case 'end':
                  return _context7.stop();
              }
            }
          }, _callee6, _this2, [[6, 19, 23, 31], [24,, 26, 30]]);
        }));

        return function (_x7, _x8) {
          return _ref10.apply(this, arguments);
        };
      }());

      client.on('instanceGone', function () {
        var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(gone, _ref13) {
          var className = _ref13.className,
              agent = _ref13.agent;

          var keys, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _loop2, _iterator4, _step4, _ret2;

          return _regenerator2.default.wrap(function _callee7$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  if (className) {
                    _context8.next = 2;
                    break;
                  }

                  return _context8.abrupt('return');

                case 2:
                  keys = filterBackends(className, agent);
                  _iteratorNormalCompletion4 = true;
                  _didIteratorError4 = false;
                  _iteratorError4 = undefined;
                  _context8.prev = 6;

                  _loop2 = function _loop2() {
                    var key = _step4.value;
                    var _backends$key2 = backends[key],
                        instance = _backends$key2.instance,
                        args = _backends$key2.args;

                    if (args) return 'continue'; // active instance backend
                    // Available instance is used by this backend
                    if (instance && gone.includes(instance)) {
                      if (debug) {
                        console.warn('Lost instance \'' + instance + '\' for backend: ' + key);
                      }
                      setBackend(function (prev) {
                        prev[key] = [null, 'Lost instance: ' + instance];
                        return (0, _extends3.default)({}, prev);
                      });
                      return 'continue';
                    }
                    setBackend(function (prev) {
                      if (!prev[key][0] || !prev[key][0].ids) return prev;
                      prev[key][0].ids = prev[key][0].ids.filter(function (x) {
                        return !gone.includes(x);
                      });
                      return (0, _extends3.default)({}, prev);
                    });
                  };

                  _iterator4 = keys[Symbol.iterator]();

                case 9:
                  if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                    _context8.next = 16;
                    break;
                  }

                  _ret2 = _loop2();

                  if (!(_ret2 === 'continue')) {
                    _context8.next = 13;
                    break;
                  }

                  return _context8.abrupt('continue', 13);

                case 13:
                  _iteratorNormalCompletion4 = true;
                  _context8.next = 9;
                  break;

                case 16:
                  _context8.next = 22;
                  break;

                case 18:
                  _context8.prev = 18;
                  _context8.t0 = _context8['catch'](6);
                  _didIteratorError4 = true;
                  _iteratorError4 = _context8.t0;

                case 22:
                  _context8.prev = 22;
                  _context8.prev = 23;

                  if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                  }

                case 25:
                  _context8.prev = 25;

                  if (!_didIteratorError4) {
                    _context8.next = 28;
                    break;
                  }

                  throw _iteratorError4;

                case 28:
                  return _context8.finish(25);

                case 29:
                  return _context8.finish(22);

                case 30:
                case 'end':
                  return _context8.stop();
              }
            }
          }, _callee7, _this2, [[6, 18, 22, 30], [23,, 25, 29]]);
        }));

        return function (_x9, _x10) {
          return _ref12.apply(this, arguments);
        };
      }());

      client.on('agent', function () {
        var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(_ref15) {
          var agent = _ref15.agent,
              status = _ref15.status;

          var _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _loop3, _iterator5, _step5, _ret3;

          return _regenerator2.default.wrap(function _callee8$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  _iteratorNormalCompletion5 = true;
                  _didIteratorError5 = false;
                  _iteratorError5 = undefined;
                  _context10.prev = 3;
                  _loop3 = /*#__PURE__*/_regenerator2.default.mark(function _loop3() {
                    var _step5$value, k, v, proxy;

                    return _regenerator2.default.wrap(function _loop3$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            _step5$value = (0, _slicedToArray3.default)(_step5.value, 2), k = _step5$value[0], v = _step5$value[1];

                            if (!(v.agent !== agent)) {
                              _context9.next = 3;
                              break;
                            }

                            return _context9.abrupt('return', 'continue');

                          case 3:
                            if (!(status === 'offline')) {
                              _context9.next = 8;
                              break;
                            }

                            if (debug) {
                              console.warn('Lost agent \'' + agent + '\' that is required for backend: ' + k);
                            }
                            setBackend(function (prev) {
                              if (!v.instance && !v.args && prev[k][0]) {
                                prev[k][0].ids = [];
                              } else {
                                prev[k][0] = null;
                              }
                              prev[k][1] = 'Required agent \'' + agent + '\' is offline';
                              return (0, _extends3.default)({}, prev);
                            });
                            _context9.next = 25;
                            break;

                          case 8:
                            if (!(status === 'online')) {
                              _context9.next = 25;
                              break;
                            }

                            if (!v.args) {
                              _context9.next = 24;
                              break;
                            }

                            _context9.prev = 10;
                            _context9.next = 13;
                            return client.create({
                              agent: v.agent,
                              className: v.className,
                              instance: v.instance,
                              args: v.args,
                              cacheProxy: true
                            });

                          case 13:
                            proxy = _context9.sent;

                            if (debug) {
                              console.log('Created instance \'' + (v.instance || '<anonymous>') + '\' for: backend ' + k);
                            }
                            setBackend(function (prev) {
                              prev[k] = [proxy, null];
                              return (0, _extends3.default)({}, prev);
                            });
                            _context9.next = 22;
                            break;

                          case 18:
                            _context9.prev = 18;
                            _context9.t0 = _context9['catch'](10);

                            if (debug) {
                              console.warn('Could not create instance \'' + (v.instance || '<anonymous>') + '\' for backend \'' + k + '\' because: ' + _context9.t0.message);
                            }
                            setBackend(function (prev) {
                              prev[k] = [null, _context9.t0.message];
                              return (0, _extends3.default)({}, prev);
                            });

                          case 22:
                            _context9.next = 25;
                            break;

                          case 24:
                            setBackend(function (prev) {
                              prev[k][1] = null;
                              return (0, _extends3.default)({}, prev);
                            });

                          case 25:
                          case 'end':
                            return _context9.stop();
                        }
                      }
                    }, _loop3, _this2, [[10, 18]]);
                  });
                  _iterator5 = Object.entries(backends)[Symbol.iterator]();

                case 6:
                  if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                    _context10.next = 14;
                    break;
                  }

                  return _context10.delegateYield(_loop3(), 't0', 8);

                case 8:
                  _ret3 = _context10.t0;

                  if (!(_ret3 === 'continue')) {
                    _context10.next = 11;
                    break;
                  }

                  return _context10.abrupt('continue', 11);

                case 11:
                  _iteratorNormalCompletion5 = true;
                  _context10.next = 6;
                  break;

                case 14:
                  _context10.next = 20;
                  break;

                case 16:
                  _context10.prev = 16;
                  _context10.t1 = _context10['catch'](3);
                  _didIteratorError5 = true;
                  _iteratorError5 = _context10.t1;

                case 20:
                  _context10.prev = 20;
                  _context10.prev = 21;

                  if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                  }

                case 23:
                  _context10.prev = 23;

                  if (!_didIteratorError5) {
                    _context10.next = 26;
                    break;
                  }

                  throw _iteratorError5;

                case 26:
                  return _context10.finish(23);

                case 27:
                  return _context10.finish(20);

                case 28:
                case 'end':
                  return _context10.stop();
              }
            }
          }, _callee8, _this2, [[3, 16, 20, 28], [21,, 23, 27]]);
        }));

        return function (_x11) {
          return _ref14.apply(this, arguments);
        };
      }());
    }

    init();
  }, [client, backends, debug, onError]);

  function refresh(backend) {
    setBackend(function (prev) {
      if (!prev[backend]) return prev;
      prev[backend][0] = (0, _extends3.default)({}, prev[backend][0]);
      return (0, _extends3.default)({}, prev);
    });
  }

  function renderProviders() {
    var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

    if (index === -1) {
      return _react2.default.createElement(
        vrpcClientContext.Provider,
        { value: [client, error, refresh] },
        renderProviders(index + 1)
      );
    }
    if (index < vrpcBackendContexts.length) {
      var Context = vrpcBackendContexts[index];
      var Provider = Context.Provider;
      return _react2.default.createElement(
        Provider,
        { value: [].concat((0, _toConsumableArray3.default)(backend[Context.displayName])) },
        renderProviders(index + 1)
      );
    }
    return children;
  }

  if (isInitializing) return null;
  return renderProviders();
}

function useClient() {
  var _ref17 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      onError = _ref17.onError;

  var _useContext = (0, _react.useContext)(vrpcClientContext),
      _useContext2 = (0, _slicedToArray3.default)(_useContext, 2),
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
      _useContext4 = (0, _slicedToArray3.default)(_useContext3, 3),
      refresh = _useContext4[2];

  var _useState7 = (0, _react.useState)([null, null]),
      _useState8 = (0, _slicedToArray3.default)(_useState7, 2),
      proxy = _useState8[0],
      setProxy = _useState8[1];

  (0, _react.useEffect)(function () {
    if (!id) return;

    var _context12 = (0, _slicedToArray3.default)(context, 1),
        backend = _context12[0];

    if (backend.ids && backend.ids.includes(id)) {
      backend.get(id).then(function (proxy) {
        return setProxy([proxy, null, function () {
          return refresh(name);
        }]);
      }).catch(function (err) {
        return setProxy([null, err.message]);
      });
    } else {
      setProxy([null, 'The provided id is not an instance on the selected backend']);
    }
  }, [context, id, refresh, name]);
  if (id) return proxy;
  context.push(function () {
    return refresh(name);
  });
  return context;
}