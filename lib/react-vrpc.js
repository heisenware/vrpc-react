'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends5 = require('babel-runtime/helpers/extends');

var _extends6 = _interopRequireDefault(_extends5);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _vrpc = require('vrpc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vrpcGlobalContext = _react2.default.createContext();
var vrpcContexts = [];

function createVrpcProvider(_ref) {
  var _ref$domain = _ref.domain,
      domain = _ref$domain === undefined ? 'public.vrpc' : _ref$domain,
      _ref$broker = _ref.broker,
      broker = _ref$broker === undefined ? 'wss://vrpc.io/mqtt' : _ref$broker,
      _ref$backends = _ref.backends,
      backends = _ref$backends === undefined ? {} : _ref$backends;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(backends)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      // Create context for this backend
      var context = _react2.default.createContext();
      context.displayName = key;
      vrpcContexts.push(context);
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
        unauthorizedErrorCallback = _ref2.unauthorizedErrorCallback;

    return _react2.default.createElement(
      VrpcBackendMaker,
      {
        backends: backends,
        broker: broker,
        token: token,
        domain: domain,
        username: username,
        password: password,
        unauthorizedErrorCallback: unauthorizedErrorCallback
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

    _this.state = { __global__: { vrpcIsLoading: true } };
    return _this;
  }

  (0, _createClass3.default)(VrpcBackendMaker, [{
    key: 'componentDidMount',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var _this2 = this;

        var _props, backends, broker, token, domain, username, password, unauthorizedErrorCallback, vrpc;

        return _regenerator2.default.wrap(function _callee3$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _props = this.props, backends = _props.backends, broker = _props.broker, token = _props.token, domain = _props.domain, username = _props.username, password = _props.password, unauthorizedErrorCallback = _props.unauthorizedErrorCallback;
                vrpc = new _vrpc.VrpcRemote({ broker: broker, token: token, domain: domain, username: username, password: password });


                vrpc.on('error', function (err) {
                  if (unauthorizedErrorCallback && err && err.message && err.message.toLowerCase().includes('not authorized')) {
                    unauthorizedErrorCallback();
                  } else {
                    throw err;
                  }
                });

                this._initializeBackendStates(backends);

                _context4.next = 6;
                return vrpc.connect();

              case 6:

                vrpc.on('instanceNew', function () {
                  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(added, _ref5) {
                    var agent = _ref5.agent,
                        className = _ref5.className;

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
                            keys = _this2._filterBackends(className, backends);
                            _iteratorNormalCompletion2 = true;
                            _didIteratorError2 = false;
                            _iteratorError2 = undefined;
                            _context2.prev = 6;
                            _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop() {
                              var key, _backends$key, args, instance, events, proxies, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _instance, proxy;

                              return _regenerator2.default.wrap(function _loop$(_context) {
                                while (1) {
                                  switch (_context.prev = _context.next) {
                                    case 0:
                                      key = _step2.value;
                                      _backends$key = backends[key], args = _backends$key.args, instance = _backends$key.instance, events = _backends$key.events;
                                      // This backend manages the lifetime of its proxy itself

                                      if (!(args || instance && _this2.state.__global__.vrpcIsLoading)) {
                                        _context.next = 4;
                                        break;
                                      }

                                      return _context.abrupt('return', 'continue');

                                    case 4:
                                      proxies = [];
                                      _iteratorNormalCompletion3 = true;
                                      _didIteratorError3 = false;
                                      _iteratorError3 = undefined;
                                      _context.prev = 8;
                                      _iterator3 = added[Symbol.iterator]();

                                    case 10:
                                      if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                        _context.next = 35;
                                        break;
                                      }

                                      _instance = _step3.value;
                                      _context.prev = 12;
                                      _context.next = 15;
                                      return vrpc.getInstance(_instance, { className: className, agent: agent });

                                    case 15:
                                      proxy = _context.sent;

                                      proxy._className = className;
                                      _context.prev = 17;

                                      if (!events) {
                                        _context.next = 21;
                                        break;
                                      }

                                      _context.next = 21;
                                      return _this2._registerEvents(key, proxy, events);

                                    case 21:
                                      _context.next = 26;
                                      break;

                                    case 23:
                                      _context.prev = 23;
                                      _context.t0 = _context['catch'](17);

                                      console.error('Failed registering event(s): ' + events + ' on instance: ' + _instance + ' because: ' + _context.t0.message);

                                    case 26:
                                      proxies.push(proxy);
                                      _context.next = 32;
                                      break;

                                    case 29:
                                      _context.prev = 29;
                                      _context.t1 = _context['catch'](12);

                                      console.error('Failed connecting to instance: ' + _instance + ' because: ' + _context.t1.message);

                                    case 32:
                                      _iteratorNormalCompletion3 = true;
                                      _context.next = 10;
                                      break;

                                    case 35:
                                      _context.next = 41;
                                      break;

                                    case 37:
                                      _context.prev = 37;
                                      _context.t2 = _context['catch'](8);
                                      _didIteratorError3 = true;
                                      _iteratorError3 = _context.t2;

                                    case 41:
                                      _context.prev = 41;
                                      _context.prev = 42;

                                      if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                        _iterator3.return();
                                      }

                                    case 44:
                                      _context.prev = 44;

                                      if (!_didIteratorError3) {
                                        _context.next = 47;
                                        break;
                                      }

                                      throw _iteratorError3;

                                    case 47:
                                      return _context.finish(44);

                                    case 48:
                                      return _context.finish(41);

                                    case 49:
                                      _this2.setState(function (prevState) {
                                        return (0, _defineProperty3.default)({}, key, (0, _defineProperty3.default)({}, key, [].concat((0, _toConsumableArray3.default)(prevState[key][key]), proxies)));
                                      });

                                    case 50:
                                    case 'end':
                                      return _context.stop();
                                  }
                                }
                              }, _loop, _this2, [[8, 37, 41, 49], [12, 29], [17, 23], [42,, 44, 48]]);
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

                vrpc.on('instanceGone', function () {
                  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(removed, _ref8) {
                    var agent = _ref8.agent,
                        className = _ref8.className;

                    var keys, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _loop2, _iterator4, _step4, _ret2;

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
                            keys = _this2._filterBackends(className, backends);
                            _iteratorNormalCompletion4 = true;
                            _didIteratorError4 = false;
                            _iteratorError4 = undefined;
                            _context3.prev = 6;

                            _loop2 = function _loop2() {
                              var key = _step4.value;
                              var _backends$key2 = backends[key],
                                  instance = _backends$key2.instance,
                                  args = _backends$key2.args;
                              // This backend manages the lifetime of its proxy itself

                              if (args) return 'continue';
                              // Available instance is used by this backend
                              if (instance && _this2.state[key][key] && removed.includes(instance)) {
                                console.warn('Lost instance ' + instance + ' for backend: ' + key);
                                _this2.setState((0, _defineProperty3.default)({}, key, (0, _defineProperty3.default)({}, key, undefined)));
                                return 'continue';
                              }
                              _this2.setState(function (prevState) {
                                var proxies = prevState[key][key].filter(function (x) {
                                  return !removed.includes(x._targetId);
                                });
                                return (0, _defineProperty3.default)({}, key, (0, _defineProperty3.default)({}, key, proxies));
                              });
                            };

                            _iterator4 = keys[Symbol.iterator]();

                          case 9:
                            if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
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
                            _iteratorNormalCompletion4 = true;
                            _context3.next = 9;
                            break;

                          case 16:
                            _context3.next = 22;
                            break;

                          case 18:
                            _context3.prev = 18;
                            _context3.t0 = _context3['catch'](6);
                            _didIteratorError4 = true;
                            _iteratorError4 = _context3.t0;

                          case 22:
                            _context3.prev = 22;
                            _context3.prev = 23;

                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                              _iterator4.return();
                            }

                          case 25:
                            _context3.prev = 25;

                            if (!_didIteratorError4) {
                              _context3.next = 28;
                              break;
                            }

                            throw _iteratorError4;

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
                _context4.next = 10;
                return this._createRequiredProxies(domain, backends, vrpc);

              case 10:
                this._initializeGlobalState(vrpc);

              case 11:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee3, this);
      }));

      function componentDidMount() {
        return _ref3.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: 'componentWillUnmount',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var backends, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _step5$value, _key4, value, _value$events, _events, _proxies, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, proxy, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, event, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _event;

        return _regenerator2.default.wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                backends = this.props.backends;
                _iteratorNormalCompletion5 = true;
                _didIteratorError5 = false;
                _iteratorError5 = undefined;
                _context5.prev = 4;
                _iterator5 = Object.entries(backends)[Symbol.iterator]();

              case 6:
                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                  _context5.next = 94;
                  break;
                }

                _step5$value = (0, _slicedToArray3.default)(_step5.value, 2), _key4 = _step5$value[0], value = _step5$value[1];
                _value$events = value.events, _events = _value$events === undefined ? [] : _value$events;

                if (!(_events.length === 0)) {
                  _context5.next = 11;
                  break;
                }

                return _context5.abrupt('break', 94);

              case 11:
                _proxies = this.props[_key4];

                if (!Array.isArray(_proxies)) {
                  _context5.next = 65;
                  break;
                }

                _iteratorNormalCompletion6 = true;
                _didIteratorError6 = false;
                _iteratorError6 = undefined;
                _context5.prev = 16;
                _iterator6 = _proxies[Symbol.iterator]();

              case 18:
                if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                  _context5.next = 49;
                  break;
                }

                proxy = _step6.value;
                _iteratorNormalCompletion7 = true;
                _didIteratorError7 = false;
                _iteratorError7 = undefined;
                _context5.prev = 23;
                _iterator7 = _events[Symbol.iterator]();

              case 25:
                if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                  _context5.next = 32;
                  break;
                }

                event = _step7.value;
                _context5.next = 29;
                return proxy.removeListener(event);

              case 29:
                _iteratorNormalCompletion7 = true;
                _context5.next = 25;
                break;

              case 32:
                _context5.next = 38;
                break;

              case 34:
                _context5.prev = 34;
                _context5.t0 = _context5['catch'](23);
                _didIteratorError7 = true;
                _iteratorError7 = _context5.t0;

              case 38:
                _context5.prev = 38;
                _context5.prev = 39;

                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                  _iterator7.return();
                }

              case 41:
                _context5.prev = 41;

                if (!_didIteratorError7) {
                  _context5.next = 44;
                  break;
                }

                throw _iteratorError7;

              case 44:
                return _context5.finish(41);

              case 45:
                return _context5.finish(38);

              case 46:
                _iteratorNormalCompletion6 = true;
                _context5.next = 18;
                break;

              case 49:
                _context5.next = 55;
                break;

              case 51:
                _context5.prev = 51;
                _context5.t1 = _context5['catch'](16);
                _didIteratorError6 = true;
                _iteratorError6 = _context5.t1;

              case 55:
                _context5.prev = 55;
                _context5.prev = 56;

                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                  _iterator6.return();
                }

              case 58:
                _context5.prev = 58;

                if (!_didIteratorError6) {
                  _context5.next = 61;
                  break;
                }

                throw _iteratorError6;

              case 61:
                return _context5.finish(58);

              case 62:
                return _context5.finish(55);

              case 63:
                _context5.next = 91;
                break;

              case 65:
                _iteratorNormalCompletion8 = true;
                _didIteratorError8 = false;
                _iteratorError8 = undefined;
                _context5.prev = 68;
                _iterator8 = _events[Symbol.iterator]();

              case 70:
                if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                  _context5.next = 77;
                  break;
                }

                _event = _step8.value;
                _context5.next = 74;
                return _proxies.removeListener(_event);

              case 74:
                _iteratorNormalCompletion8 = true;
                _context5.next = 70;
                break;

              case 77:
                _context5.next = 83;
                break;

              case 79:
                _context5.prev = 79;
                _context5.t2 = _context5['catch'](68);
                _didIteratorError8 = true;
                _iteratorError8 = _context5.t2;

              case 83:
                _context5.prev = 83;
                _context5.prev = 84;

                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                  _iterator8.return();
                }

              case 86:
                _context5.prev = 86;

                if (!_didIteratorError8) {
                  _context5.next = 89;
                  break;
                }

                throw _iteratorError8;

              case 89:
                return _context5.finish(86);

              case 90:
                return _context5.finish(83);

              case 91:
                _iteratorNormalCompletion5 = true;
                _context5.next = 6;
                break;

              case 94:
                _context5.next = 100;
                break;

              case 96:
                _context5.prev = 96;
                _context5.t3 = _context5['catch'](4);
                _didIteratorError5 = true;
                _iteratorError5 = _context5.t3;

              case 100:
                _context5.prev = 100;
                _context5.prev = 101;

                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }

              case 103:
                _context5.prev = 103;

                if (!_didIteratorError5) {
                  _context5.next = 106;
                  break;
                }

                throw _iteratorError5;

              case 106:
                return _context5.finish(103);

              case 107:
                return _context5.finish(100);

              case 108:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee4, this, [[4, 96, 100, 108], [16, 51, 55, 63], [23, 34, 38, 46], [39,, 41, 45], [56,, 58, 62], [68, 79, 83, 91], [84,, 86, 90], [101,, 103, 107]]);
      }));

      function componentWillUnmount() {
        return _ref10.apply(this, arguments);
      }

      return componentWillUnmount;
    }()
  }, {
    key: '_initializeBackendStates',
    value: function _initializeBackendStates(backends) {
      var obj = {};
      Object.keys(backends).forEach(function (key) {
        if (!backends[key].instance && !backends[key].args) {
          obj[key] = (0, _defineProperty3.default)({}, key, []);
        } else {
          obj[key] = (0, _defineProperty3.default)({}, key, undefined);
        }
      });
      this.setState(obj);
    }
  }, {
    key: '_initializeGlobalState',
    value: function _initializeGlobalState(vrpc) {
      this.setState({ __global__: { vrpc: vrpc, vrpcIsLoading: false } });
    }
  }, {
    key: '_createRequiredProxies',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(domain, backends, vrpc) {
        var _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, _step9$value, _key5, value, agent, className, _instance2, args, proxy, _proxy;

        return _regenerator2.default.wrap(function _callee5$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _iteratorNormalCompletion9 = true;
                _didIteratorError9 = false;
                _iteratorError9 = undefined;
                _context6.prev = 3;
                _iterator9 = Object.entries(backends)[Symbol.iterator]();

              case 5:
                if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                  _context6.next = 35;
                  break;
                }

                _step9$value = (0, _slicedToArray3.default)(_step9.value, 2), _key5 = _step9$value[0], value = _step9$value[1];
                agent = value.agent, className = value.className, _instance2 = value.instance, args = value.args;

                if (!args) {
                  _context6.next = 21;
                  break;
                }

                _context6.prev = 9;
                _context6.next = 12;
                return vrpc.create({ agent: agent, className: className, instance: _instance2, args: args });

              case 12:
                proxy = _context6.sent;

                this.setState((0, _defineProperty3.default)({}, _key5, (0, _defineProperty3.default)({}, _key5, proxy)));
                _context6.next = 19;
                break;

              case 16:
                _context6.prev = 16;
                _context6.t0 = _context6['catch'](9);

                console.warn('Could not create backend ' + _key5 + ' because: ' + _context6.t0.message);

              case 19:
                _context6.next = 32;
                break;

              case 21:
                if (!_instance2) {
                  _context6.next = 32;
                  break;
                }

                _context6.prev = 22;
                _context6.next = 25;
                return vrpc.getInstance({ instance: _instance2, className: className, agent: agent, domain: domain });

              case 25:
                _proxy = _context6.sent;

                this.setState((0, _defineProperty3.default)({}, _key5, (0, _defineProperty3.default)({}, _key5, _proxy)));
                _context6.next = 32;
                break;

              case 29:
                _context6.prev = 29;
                _context6.t1 = _context6['catch'](22);

                console.error('Could not attach to backend instance ' + _instance2 + ', because: ' + _context6.t1.message);

              case 32:
                _iteratorNormalCompletion9 = true;
                _context6.next = 5;
                break;

              case 35:
                _context6.next = 41;
                break;

              case 37:
                _context6.prev = 37;
                _context6.t2 = _context6['catch'](3);
                _didIteratorError9 = true;
                _iteratorError9 = _context6.t2;

              case 41:
                _context6.prev = 41;
                _context6.prev = 42;

                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                  _iterator9.return();
                }

              case 44:
                _context6.prev = 44;

                if (!_didIteratorError9) {
                  _context6.next = 47;
                  break;
                }

                throw _iteratorError9;

              case 47:
                return _context6.finish(44);

              case 48:
                return _context6.finish(41);

              case 49:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee5, this, [[3, 37, 41, 49], [9, 16], [22, 29], [42,, 44, 48]]);
      }));

      function _createRequiredProxies(_x5, _x6, _x7) {
        return _ref11.apply(this, arguments);
      }

      return _createRequiredProxies;
    }()
  }, {
    key: '_filterBackends',
    value: function _filterBackends(className, backends) {
      var ret = [];
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = Object.entries(backends)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var _step10$value = (0, _slicedToArray3.default)(_step10.value, 2),
              k = _step10$value[0],
              v = _step10$value[1];

          if (typeof v.className === 'string' && v.className === className) ret.push(k);
          if ((0, _typeof3.default)(v.className) === 'object' && className.match(v.className)) ret.push(k);
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      return ret;
    }
  }, {
    key: '_registerEvents',
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(key, proxy, events) {
        var _this3 = this;

        var _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _loop3, _iterator11, _step11;

        return _regenerator2.default.wrap(function _callee7$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _iteratorNormalCompletion11 = true;
                _didIteratorError11 = false;
                _iteratorError11 = undefined;
                _context9.prev = 3;
                _loop3 = /*#__PURE__*/_regenerator2.default.mark(function _loop3() {
                  var event;
                  return _regenerator2.default.wrap(function _loop3$(_context8) {
                    while (1) {
                      switch (_context8.prev = _context8.next) {
                        case 0:
                          event = _step11.value;

                          proxy[event] = null;
                          _context8.next = 4;
                          return proxy.on(event, function () {
                            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                              for (var _len = arguments.length, args = Array(_len), _key8 = 0; _key8 < _len; _key8++) {
                                args[_key8] = arguments[_key8];
                              }

                              var proxies;
                              return _regenerator2.default.wrap(function _callee6$(_context7) {
                                while (1) {
                                  switch (_context7.prev = _context7.next) {
                                    case 0:
                                      proxies = _this3.state[key][key].filter(function (_ref14) {
                                        var _targetId = _ref14._targetId;
                                        return proxy._targetId !== _targetId;
                                      });
                                      _context7.t0 = args.length;
                                      _context7.next = _context7.t0 === 0 ? 4 : _context7.t0 === 1 ? 6 : 8;
                                      break;

                                    case 4:
                                      proxies.push((0, _extends6.default)({}, proxy, (0, _defineProperty3.default)({}, event, undefined)));
                                      return _context7.abrupt('break', 9);

                                    case 6:
                                      proxies.push((0, _extends6.default)({}, proxy, (0, _defineProperty3.default)({}, event, args[0])));
                                      return _context7.abrupt('break', 9);

                                    case 8:
                                      proxies.push((0, _extends6.default)({}, proxy, (0, _defineProperty3.default)({}, event, args)));

                                    case 9:
                                      _this3.setState((0, _defineProperty3.default)({}, key, (0, _defineProperty3.default)({}, key, proxies)));

                                    case 10:
                                    case 'end':
                                      return _context7.stop();
                                  }
                                }
                              }, _callee6, _this3);
                            }));

                            return function () {
                              return _ref13.apply(this, arguments);
                            };
                          }());

                        case 4:
                        case 'end':
                          return _context8.stop();
                      }
                    }
                  }, _loop3, _this3);
                });
                _iterator11 = events[Symbol.iterator]();

              case 6:
                if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                  _context9.next = 11;
                  break;
                }

                return _context9.delegateYield(_loop3(), 't0', 8);

              case 8:
                _iteratorNormalCompletion11 = true;
                _context9.next = 6;
                break;

              case 11:
                _context9.next = 17;
                break;

              case 13:
                _context9.prev = 13;
                _context9.t1 = _context9['catch'](3);
                _didIteratorError11 = true;
                _iteratorError11 = _context9.t1;

              case 17:
                _context9.prev = 17;
                _context9.prev = 18;

                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                  _iterator11.return();
                }

              case 20:
                _context9.prev = 20;

                if (!_didIteratorError11) {
                  _context9.next = 23;
                  break;
                }

                throw _iteratorError11;

              case 23:
                return _context9.finish(20);

              case 24:
                return _context9.finish(17);

              case 25:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee7, this, [[3, 13, 17, 25], [18,, 20, 24]]);
      }));

      function _registerEvents(_x8, _x9, _x10) {
        return _ref12.apply(this, arguments);
      }

      return _registerEvents;
    }()
  }, {
    key: '_renderProviders',
    value: function _renderProviders(children) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

      if (index === -1) {
        return _react2.default.createElement(
          vrpcGlobalContext.Provider,
          { value: this.state.__global__ },
          this._renderProviders(children, index + 1)
        );
      }
      if (index < vrpcContexts.length) {
        var Context = vrpcContexts[index];
        var Provider = Context.Provider;
        return _react2.default.createElement(
          Provider,
          { value: this.state[Context.displayName] },
          this._renderProviders(children, index + 1)
        );
      }
      return children;
    }
  }, {
    key: 'render',
    value: function render() {
      var loading = this.props.loading;
      var vrpcIsLoading = this.state.__global__.vrpcIsLoading;

      if (vrpcIsLoading) return loading || false;
      var children = this.props.children;

      return this._renderProviders(children);
    }
  }]);
  return VrpcBackendMaker;
}(_react.Component);

function withVrpc(backendsOrPassedComponent, PassedComponent) {
  var backends = void 0;
  if (typeof backendsOrPassedComponent === 'string') {
    backends = [backendsOrPassedComponent];
  } else if (Array.isArray(backendsOrPassedComponent)) {
    backends = backendsOrPassedComponent;
  } else {
    PassedComponent = backendsOrPassedComponent;
  }

  return function (_Component2) {
    (0, _inherits3.default)(ComponentWithVrpc, _Component2);

    function ComponentWithVrpc() {
      (0, _classCallCheck3.default)(this, ComponentWithVrpc);
      return (0, _possibleConstructorReturn3.default)(this, (ComponentWithVrpc.__proto__ || Object.getPrototypeOf(ComponentWithVrpc)).apply(this, arguments));
    }

    (0, _createClass3.default)(ComponentWithVrpc, [{
      key: '_renderConsumers',
      value: function _renderConsumers(PassedComponent, backends, props) {
        var _this5 = this;

        var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;

        if (index === -1) {
          return _react2.default.createElement(
            vrpcGlobalContext.Consumer,
            null,
            function (globalProps) {
              return _this5._renderConsumers(PassedComponent, backends, (0, _extends6.default)({}, props, globalProps), index + 1);
            }
          );
        }
        if (index < backends.length) {
          var Context = vrpcContexts.find(function (x) {
            return x.displayName === backends[index];
          });
          if (!Context) return _react2.default.createElement(PassedComponent, props);
          var Consumer = Context.Consumer;
          return _react2.default.createElement(
            Consumer,
            null,
            function (vrpcProps) {
              return _this5._renderConsumers(PassedComponent, backends, (0, _extends6.default)({}, props, vrpcProps), index + 1);
            }
          );
        }
        return _react2.default.createElement(PassedComponent, props);
      }
    }, {
      key: 'render',
      value: function render() {
        if (!backends) backends = vrpcContexts.map(function (x) {
          return x.displayName;
        });
        return this._renderConsumers(PassedComponent, backends, this.props);
      }
    }]);
    return ComponentWithVrpc;
  }(_react.Component);
}