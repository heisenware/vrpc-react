'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.createVrpcProvider = createVrpcProvider;
exports.withVrpc = withVrpc;
exports.withManagedInstance = withManagedInstance;
exports.withBackend = withBackend;
exports.useClient = useClient;
exports.useBackend = useBackend;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _vrpc = require('vrpc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vrpcClientContext = _react2.default.createContext();
var vrpcBackendContexts = [];
var vrpcManagedInstances = new Map();

function createVrpcProvider(_ref) {
  var _ref$domain = _ref.domain,
      domain = _ref$domain === undefined ? 'public.vrpc' : _ref$domain,
      _ref$broker = _ref.broker,
      broker = _ref$broker === undefined ? 'wss://vrpc.io/mqtt' : _ref$broker,
      _ref$backends = _ref.backends,
      backends = _ref$backends === undefined ? {} : _ref$backends,
      _ref$debug = _ref.debug,
      debug = _ref$debug === undefined ? false : _ref$debug;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(backends)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      // Create context for this backend
      var context = _react2.default.createContext();
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
        token = _ref2.token;

    return _react2.default.createElement(
      VrpcBackendMaker,
      {
        backends: backends,
        broker: broker,
        token: token,
        domain: domain,
        username: username,
        password: password,
        debug: debug
      },
      children
    );
  };
}

var VrpcBackendMaker = function (_Component) {
  (0, _inherits3.default)(VrpcBackendMaker, _Component);

  function VrpcBackendMaker() {
    (0, _classCallCheck3.default)(this, VrpcBackendMaker);

    var _this = (0, _possibleConstructorReturn3.default)(this, (VrpcBackendMaker.__proto__ || Object.getPrototypeOf(VrpcBackendMaker)).call(this));

    _this.state = {
      initializing: true,
      vrpc: { client: null, loading: true, error: null }
    };
    return _this;
  }

  (0, _createClass3.default)(VrpcBackendMaker, [{
    key: 'componentDidMount',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var _this2 = this;

        var _props, backends, broker, token, domain, username, password, debug, client;

        return _regenerator2.default.wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _props = this.props, backends = _props.backends, broker = _props.broker, token = _props.token, domain = _props.domain, username = _props.username, password = _props.password, debug = _props.debug;
                _context5.prev = 1;
                client = new _vrpc.VrpcRemote({ broker: broker, token: token, domain: domain, username: username, password: password });


                client.on('error', function (err) {
                  _this2.setState({ vrpc: { client: null, loading: false, error: err } });
                });

                this.initializeBackendStates(backends, client);

                _context5.next = 7;
                return client.connect();

              case 7:

                client.on('instanceNew', function () {
                  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(added, _ref5) {
                    var className = _ref5.className;

                    var keys, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _loop, _iterator2, _step2, _ret;

                    return _regenerator2.default.wrap(function _callee$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            if (className) {
                              _context2.next = 2;
                              break;
                            }

                            return _context2.abrupt('return');

                          case 2:
                            keys = _this2.filterBackends(className, backends);
                            _iteratorNormalCompletion2 = true;
                            _didIteratorError2 = false;
                            _iteratorError2 = undefined;
                            _context2.prev = 6;
                            _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop() {
                              var key, _backends$key, agent, instance, args, backend;

                              return _regenerator2.default.wrap(function _loop$(_context) {
                                while (1) {
                                  switch (_context.prev = _context.next) {
                                    case 0:
                                      key = _step2.value;
                                      _backends$key = backends[key], agent = _backends$key.agent, instance = _backends$key.instance, args = _backends$key.args;
                                      // This backend manages the lifetime of its instance itself

                                      if (!args) {
                                        _context.next = 4;
                                        break;
                                      }

                                      return _context.abrupt('return', 'continue');

                                    case 4:
                                      if (!instance) {
                                        _context.next = 18;
                                        break;
                                      }

                                      _context.prev = 5;
                                      _context.next = 8;
                                      return client.getInstance(instance, { className: className, agent: agent, domain: domain });

                                    case 8:
                                      backend = _context.sent;

                                      _this2.setBackendState(key, backend, false, null);
                                      _context.next = 16;
                                      break;

                                    case 12:
                                      _context.prev = 12;
                                      _context.t0 = _context['catch'](5);

                                      if (debug) console.error('Could not attach to backend instance \'' + instance + '\', because: ' + _context.t0.message);
                                      _this2.setBackendState(key, null, false, _context.t0);

                                    case 16:
                                      _context.next = 19;
                                      break;

                                    case 18:
                                      _this2.setState(function (prevState) {
                                        var _prevState$key$key = prevState[key][key],
                                            backend = _prevState$key$key.backend,
                                            loading = _prevState$key$key.loading,
                                            error = _prevState$key$key.error,
                                            refresh = _prevState$key$key.refresh;

                                        if (backend && backend.ids) {
                                          backend.ids = [].concat((0, _toConsumableArray3.default)(new Set([].concat((0, _toConsumableArray3.default)(backend.ids), (0, _toConsumableArray3.default)(added)))));
                                        }
                                        return (0, _defineProperty3.default)({}, key, (0, _defineProperty3.default)({}, key, { backend: backend, loading: loading, error: error, refresh: refresh }));
                                      });

                                    case 19:
                                    case 'end':
                                      return _context.stop();
                                  }
                                }
                              }, _loop, _this2, [[5, 12]]);
                            });
                            _iterator2 = keys[Symbol.iterator]();

                          case 9:
                            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                              _context2.next = 17;
                              break;
                            }

                            return _context2.delegateYield(_loop(), 't0', 11);

                          case 11:
                            _ret = _context2.t0;

                            if (!(_ret === 'continue')) {
                              _context2.next = 14;
                              break;
                            }

                            return _context2.abrupt('continue', 14);

                          case 14:
                            _iteratorNormalCompletion2 = true;
                            _context2.next = 9;
                            break;

                          case 17:
                            _context2.next = 23;
                            break;

                          case 19:
                            _context2.prev = 19;
                            _context2.t1 = _context2['catch'](6);
                            _didIteratorError2 = true;
                            _iteratorError2 = _context2.t1;

                          case 23:
                            _context2.prev = 23;
                            _context2.prev = 24;

                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                              _iterator2.return();
                            }

                          case 26:
                            _context2.prev = 26;

                            if (!_didIteratorError2) {
                              _context2.next = 29;
                              break;
                            }

                            throw _iteratorError2;

                          case 29:
                            return _context2.finish(26);

                          case 30:
                            return _context2.finish(23);

                          case 31:
                          case 'end':
                            return _context2.stop();
                        }
                      }
                    }, _callee, _this2, [[6, 19, 23, 31], [24,, 26, 30]]);
                  }));

                  return function (_x, _x2) {
                    return _ref4.apply(this, arguments);
                  };
                }());

                client.on('instanceGone', function () {
                  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(gone, _ref8) {
                    var className = _ref8.className;

                    var keys, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _loop2, _iterator3, _step3, _ret2;

                    return _regenerator2.default.wrap(function _callee2$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            if (className) {
                              _context3.next = 2;
                              break;
                            }

                            return _context3.abrupt('return');

                          case 2:
                            keys = _this2.filterBackends(className, backends);
                            _iteratorNormalCompletion3 = true;
                            _didIteratorError3 = false;
                            _iteratorError3 = undefined;
                            _context3.prev = 6;

                            _loop2 = function _loop2() {
                              var key = _step3.value;
                              var _backends$key2 = backends[key],
                                  instance = _backends$key2.instance,
                                  args = _backends$key2.args;
                              // This backend manages the lifetime of its proxy itself

                              if (args) return 'continue';
                              // Available instance is used by this backend
                              if (instance && _this2.state[key][key] && gone.includes(instance)) {
                                if (debug) console.warn('Lost instance \'' + instance + '\' for backend: ' + key);
                                _this2.setBackendState(key, null, true, null);
                                return 'continue';
                              }
                              // Delete all previously cached dynamic backends
                              gone.forEach(function (x) {
                                return vrpcManagedInstances.delete(x);
                              });
                              _this2.setState(function (prevState) {
                                var _prevState$key$key2 = prevState[key][key],
                                    backend = _prevState$key$key2.backend,
                                    loading = _prevState$key$key2.loading,
                                    error = _prevState$key$key2.error,
                                    refresh = _prevState$key$key2.refresh;

                                if (backend && backend.ids) {
                                  backend.ids = backend.ids.filter(function (x) {
                                    return !gone.includes(x);
                                  });
                                }
                                return (0, _defineProperty3.default)({}, key, (0, _defineProperty3.default)({}, key, { backend: backend, loading: loading, error: error, refresh: refresh }));
                              });
                            };

                            _iterator3 = keys[Symbol.iterator]();

                          case 9:
                            if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                              _context3.next = 16;
                              break;
                            }

                            _ret2 = _loop2();

                            if (!(_ret2 === 'continue')) {
                              _context3.next = 13;
                              break;
                            }

                            return _context3.abrupt('continue', 13);

                          case 13:
                            _iteratorNormalCompletion3 = true;
                            _context3.next = 9;
                            break;

                          case 16:
                            _context3.next = 22;
                            break;

                          case 18:
                            _context3.prev = 18;
                            _context3.t0 = _context3['catch'](6);
                            _didIteratorError3 = true;
                            _iteratorError3 = _context3.t0;

                          case 22:
                            _context3.prev = 22;
                            _context3.prev = 23;

                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                              _iterator3.return();
                            }

                          case 25:
                            _context3.prev = 25;

                            if (!_didIteratorError3) {
                              _context3.next = 28;
                              break;
                            }

                            throw _iteratorError3;

                          case 28:
                            return _context3.finish(25);

                          case 29:
                            return _context3.finish(22);

                          case 30:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee2, _this2, [[6, 18, 22, 30], [23,, 25, 29]]);
                  }));

                  return function (_x3, _x4) {
                    return _ref7.apply(this, arguments);
                  };
                }());

                client.on('agent', function () {
                  var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(_ref11) {
                    var agent = _ref11.agent,
                        status = _ref11.status;

                    var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _step4$value, k, v, error, backend, _backend, _backend2;

                    return _regenerator2.default.wrap(function _callee3$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _iteratorNormalCompletion4 = true;
                            _didIteratorError4 = false;
                            _iteratorError4 = undefined;
                            _context4.prev = 3;
                            _iterator4 = Object.entries(backends)[Symbol.iterator]();

                          case 5:
                            if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                              _context4.next = 34;
                              break;
                            }

                            _step4$value = (0, _slicedToArray3.default)(_step4.value, 2), k = _step4$value[0], v = _step4$value[1];

                            if (!(v.agent === agent)) {
                              _context4.next = 31;
                              break;
                            }

                            if (!(status === 'offline')) {
                              _context4.next = 14;
                              break;
                            }

                            if (debug) console.warn('Lost agent \'' + agent + '\' that is required for backend: ' + k);
                            error = new Error('Required agent \'' + agent + '\' is offline');

                            if (!v.instance && !v.args) {
                              backend = _this2.state[k][k].backend;

                              backend.ids = [];
                              _this2.setBackendState(k, backend, false, error);
                            } else {
                              _this2.setBackendState(k, null, false, error);
                            }
                            _context4.next = 31;
                            break;

                          case 14:
                            if (!(status === 'online')) {
                              _context4.next = 31;
                              break;
                            }

                            if (!v.args) {
                              _context4.next = 30;
                              break;
                            }

                            _context4.prev = 16;
                            _context4.next = 19;
                            return client.create({
                              agent: v.agent,
                              className: v.className,
                              instance: v.instance,
                              args: v.args
                            });

                          case 19:
                            _backend = _context4.sent;

                            if (debug) console.log('Created instance \'' + (v.instance || '<anonymous>') + '\' for: backend ' + k);
                            _this2.setBackendState(k, _backend, false, null);
                            _context4.next = 28;
                            break;

                          case 24:
                            _context4.prev = 24;
                            _context4.t0 = _context4['catch'](16);

                            if (debug) console.warn('Could not create instance \'' + (v.instance || '<anonymous>') + '\' for backend \'' + k + '\' because: ' + _context4.t0.message);
                            _this2.setBackendState(k, null, false, _context4.t0);

                          case 28:
                            _context4.next = 31;
                            break;

                          case 30:
                            if (v.instance) {
                              _this2.setBackendState(k, null, false, null);
                            } else {
                              _backend2 = _this2.state[k][k].backend;

                              _this2.setBackendState(k, _backend2, false, null);
                            }

                          case 31:
                            _iteratorNormalCompletion4 = true;
                            _context4.next = 5;
                            break;

                          case 34:
                            _context4.next = 40;
                            break;

                          case 36:
                            _context4.prev = 36;
                            _context4.t1 = _context4['catch'](3);
                            _didIteratorError4 = true;
                            _iteratorError4 = _context4.t1;

                          case 40:
                            _context4.prev = 40;
                            _context4.prev = 41;

                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                              _iterator4.return();
                            }

                          case 43:
                            _context4.prev = 43;

                            if (!_didIteratorError4) {
                              _context4.next = 46;
                              break;
                            }

                            throw _iteratorError4;

                          case 46:
                            return _context4.finish(43);

                          case 47:
                            return _context4.finish(40);

                          case 48:
                          case 'end':
                            return _context4.stop();
                        }
                      }
                    }, _callee3, _this2, [[3, 36, 40, 48], [16, 24], [41,, 43, 47]]);
                  }));

                  return function (_x5) {
                    return _ref10.apply(this, arguments);
                  };
                }());

                if (debug) console.log('VRPC client is connected');
                this.setState({ vrpc: { client: client, loading: false, error: null } });
                _context5.next = 18;
                break;

              case 14:
                _context5.prev = 14;
                _context5.t0 = _context5['catch'](1);

                if (debug) console.error('VRPC client failed to connect because: ' + _context5.t0.message);
                this.setState({ vrpc: { client: null, loading: false, error: _context5.t0 } });

              case 18:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee4, this, [[1, 14]]);
      }));

      function componentDidMount() {
        return _ref3.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: 'setBackendState',
    value: function setBackendState(key, backend, loading, error) {
      var _this3 = this;

      this.setState((0, _defineProperty3.default)({}, key, (0, _defineProperty3.default)({}, key, {
        backend: backend,
        loading: loading,
        error: error,
        refresh: function refresh() {
          var backendName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : key;
          return _this3.refresh(backendName);
        }
      })));
    }
  }, {
    key: 'refresh',
    value: function refresh(key) {
      this.setState(function (prevState) {
        var backend = (0, _extends3.default)({}, prevState[key][key].backend);
        return (0, _defineProperty3.default)({}, key, (0, _defineProperty3.default)({}, key, (0, _extends3.default)({}, prevState[key][key], { backend: backend })));
      });
    }
  }, {
    key: 'initializeBackendStates',
    value: function initializeBackendStates(backends, client) {
      var _this4 = this;

      var obj = {};
      Object.keys(backends).forEach(function (key) {
        if (!backends[key].instance && !backends[key].args) {
          var _backends$key3 = backends[key],
              _agent = _backends$key3.agent,
              backendClassName = _backends$key3.className;

          var backend = {
            create: function () {
              var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(id, _ref14) {
                var args = _ref14.args,
                    className = _ref14.className;
                return _regenerator2.default.wrap(function _callee5$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        return _context6.abrupt('return', client.create({
                          agent: _agent,
                          className: className || backendClassName,
                          args: args,
                          instance: id
                        }));

                      case 1:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                }, _callee5, _this4);
              }));

              return function create(_x7, _x8) {
                return _ref13.apply(this, arguments);
              };
            }(),
            get: function () {
              var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(id) {
                var _instance;

                return _regenerator2.default.wrap(function _callee6$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        if (!vrpcManagedInstances.has(id)) {
                          _context7.next = 2;
                          break;
                        }

                        return _context7.abrupt('return', vrpcManagedInstances.get(id));

                      case 2:
                        vrpcManagedInstances.set(id, { backend: null, loading: true, error: null });
                        _context7.prev = 3;
                        _context7.next = 6;
                        return client.getInstance(id, { agent: _agent });

                      case 6:
                        _instance = _context7.sent;

                        vrpcManagedInstances.set(id, { backend: _instance, loading: false, error: null });
                        return _context7.abrupt('return', _instance);

                      case 11:
                        _context7.prev = 11;
                        _context7.t0 = _context7['catch'](3);

                        vrpcManagedInstances.delete(id);
                        throw _context7.t0;

                      case 15:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                }, _callee6, _this4, [[3, 11]]);
              }));

              return function get(_x9) {
                return _ref15.apply(this, arguments);
              };
            }(),
            delete: function () {
              var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(id) {
                return _regenerator2.default.wrap(function _callee7$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        return _context8.abrupt('return', client.delete(id, { agent: _agent }));

                      case 1:
                      case 'end':
                        return _context8.stop();
                    }
                  }
                }, _callee7, _this4);
              }));

              return function _delete(_x10) {
                return _ref16.apply(this, arguments);
              };
            }(),
            ids: []
          };
          obj[key] = (0, _defineProperty3.default)({}, key, { backend: backend, loading: false, error: null });
        } else {
          obj[key] = (0, _defineProperty3.default)({}, key, { backend: null, loading: true, error: null });
        }
      });
      this.setState((0, _extends3.default)({}, obj, { initializing: false }));
    }
  }, {
    key: 'filterBackends',
    value: function filterBackends(className, backends) {
      var ret = [];
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = Object.entries(backends)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _step5$value = (0, _slicedToArray3.default)(_step5.value, 2),
              k = _step5$value[0],
              v = _step5$value[1];

          if (typeof v.className === 'string' && v.className === className) ret.push(k);
          if ((0, _typeof3.default)(v.className) === 'object' && className.match(v.className)) ret.push(k);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return ret;
    }
  }, {
    key: 'renderProviders',
    value: function renderProviders(children) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

      if (index === -1) {
        return _react2.default.createElement(
          vrpcClientContext.Provider,
          { value: { vrpc: this.state.vrpc } },
          this.renderProviders(children, index + 1)
        );
      }
      if (index < vrpcBackendContexts.length) {
        var Context = vrpcBackendContexts[index];
        var Provider = Context.Provider;
        return _react2.default.createElement(
          Provider,
          { value: this.state[Context.displayName] },
          this.renderProviders(children, index + 1)
        );
      }
      return children;
    }
  }, {
    key: 'render',
    value: function render() {
      var children = this.props.children;
      var initializing = this.state.initializing;

      if (initializing) return null;
      return this.renderProviders(children);
    }
  }]);
  return VrpcBackendMaker;
}(_react.Component);

function withVrpc(backendsOrPassedComponent, PassedComponent) {
  return withBackend(backendsOrPassedComponent, PassedComponent);
}

function withManagedInstance(backend, PassedComponent) {
  var WithManagedInstance = function (_Component2) {
    (0, _inherits3.default)(ComponentWithManagedInstance, _Component2);

    function ComponentWithManagedInstance() {
      (0, _classCallCheck3.default)(this, ComponentWithManagedInstance);

      var _this5 = (0, _possibleConstructorReturn3.default)(this, (ComponentWithManagedInstance.__proto__ || Object.getPrototypeOf(ComponentWithManagedInstance)).call(this));

      _this5.state = { backend: null, loading: true, error: null };
      return _this5;
    }

    (0, _createClass3.default)(ComponentWithManagedInstance, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this6 = this;

        var _props2 = this.props,
            id = _props2.id,
            vrpc = _props2.vrpc;

        var managingBackend = this.props[backend].backend;
        if (!id) {
          this.setState({
            error: new Error('Parent component did not provide an "id" property')
          });
          return;
        }
        if (!managingBackend.ids) {
          this.setState({
            error: new Error('The specified backend can not manage instances')
          });
          return;
        }
        if (!managingBackend.ids.includes(id)) {
          this.setState({
            error: new Error('Requested object with id \'' + id + '\' is not available')
          });
          return;
        }
        if (!vrpcManagedInstances.has(id)) {
          vrpcManagedInstances.set(id, { backend: null, loading: true, error: null });
          vrpc.client.getInstance(id).then(function (proxy) {
            var managedInstance = {
              backend: proxy,
              loading: false,
              error: null
            };
            vrpcManagedInstances.set(id, managedInstance);
            _this6.setState(managedInstance);
          }).catch(function (err) {
            vrpcManagedInstances.delete(id);
            _this6.setState({ backend: null, loading: false, error: err });
          });
        } else {
          this.setState(vrpcManagedInstances.get(id));
        }
      }
    }, {
      key: 'render',
      value: function render() {
        var injectedProps = (0, _extends3.default)({}, this.props, this.state);
        return _react2.default.createElement(PassedComponent, injectedProps);
      }
    }]);
    return ComponentWithManagedInstance;
  }(_react.Component);
  return withBackend(backend, WithManagedInstance);
}

function withBackend(backendsOrPassedComponent, PassedComponent) {
  var backends = void 0;
  if (typeof backendsOrPassedComponent === 'string') {
    backends = [backendsOrPassedComponent];
  } else if (Array.isArray(backendsOrPassedComponent)) {
    backends = backendsOrPassedComponent;
  } else {
    PassedComponent = backendsOrPassedComponent;
  }

  return function (_Component3) {
    (0, _inherits3.default)(ComponentWithVrpc, _Component3);

    function ComponentWithVrpc() {
      (0, _classCallCheck3.default)(this, ComponentWithVrpc);
      return (0, _possibleConstructorReturn3.default)(this, (ComponentWithVrpc.__proto__ || Object.getPrototypeOf(ComponentWithVrpc)).apply(this, arguments));
    }

    (0, _createClass3.default)(ComponentWithVrpc, [{
      key: 'renderConsumers',
      value: function renderConsumers(PassedComponent, backends, props) {
        var _this8 = this;

        var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;

        if (index === -1) {
          return _react2.default.createElement(
            vrpcClientContext.Consumer,
            null,
            function (globalProps) {
              return _this8.renderConsumers(PassedComponent, backends, (0, _extends3.default)({}, props, globalProps), index + 1);
            }
          );
        }
        if (index < backends.length) {
          var Context = vrpcBackendContexts.find(function (x) {
            return x.displayName === backends[index];
          });
          if (!Context) return _react2.default.createElement(PassedComponent, props);
          var Consumer = Context.Consumer;
          return _react2.default.createElement(
            Consumer,
            null,
            function (vrpcProps) {
              return _this8.renderConsumers(PassedComponent, backends, (0, _extends3.default)({}, props, vrpcProps), index + 1);
            }
          );
        }
        return _react2.default.createElement(PassedComponent, props);
      }
    }, {
      key: 'render',
      value: function render() {
        if (!backends) backends = vrpcBackendContexts.map(function (x) {
          return x.displayName;
        });
        return this.renderConsumers(PassedComponent, backends, this.props);
      }
    }]);
    return ComponentWithVrpc;
  }(_react.Component);
}

function useClient(_ref17) {
  var onError = _ref17.onError;

  var _useContext = (0, _react.useContext)(vrpcClientContext),
      client = _useContext.client,
      loading = _useContext.loading,
      error = _useContext.error;

  if (onError) client.on('error', onError);
  return { client: client, loading: loading, error: error };
}

function useBackend(name, id) {
  var clientContext = (0, _react.useContext)(vrpcClientContext);
  var context = vrpcBackendContexts.find(function (x) {
    return x.displayName === name;
  });
  var backendContext = (0, _react.useContext)(context);

  var _useState = (0, _react.useState)({
    backend: null,
    loading: true,
    error: null
  }),
      _useState2 = (0, _slicedToArray3.default)(_useState, 2),
      backend = _useState2[0],
      setBackend = _useState2[1];

  (0, _react.useEffect)(function () {
    if (!id) return;
    if (!backendContext[name].backend.ids.includes(id)) {
      setBackend({
        backend: null,
        loading: false,
        error: new Error('Requested object with id \'' + id + '\' is not available')
      });
      return;
    }
    if (!vrpcManagedInstances.has(id)) {
      vrpcManagedInstances.set(id, { backend: null, loading: true, error: null });
      clientContext.client.getInstance(id).then(function (proxy) {
        var managedInstance = {
          backend: proxy,
          loading: false,
          error: null
        };
        vrpcManagedInstances.set(id, managedInstance);
        setBackend(managedInstance);
      }).catch(function (err) {
        var managedInstance = {
          backend: null,
          loading: false,
          error: err
        };
        vrpcManagedInstances.set(id, managedInstance);
        setBackend(managedInstance);
      });
    }
  }, [name, id, backendContext, backend, clientContext.client]);
  if (clientContext.loading) {
    return { backend: null, loading: true, error: null };
  }
  if (clientContext.error) {
    return { backend: null, loading: false, error: clientContext.error };
  }
  if (id) return backend;
  return backendContext[name];
}