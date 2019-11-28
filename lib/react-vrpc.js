'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var VrpcContext = _react2.default.createContext();

function createVrpcProvider(_ref) {
  var _ref$domain = _ref.domain,
      domain = _ref$domain === undefined ? 'public.vrpc' : _ref$domain,
      _ref$broker = _ref.broker,
      broker = _ref$broker === undefined ? 'wss://vrpc.io/mqtt' : _ref$broker,
      backends = _ref.backends;

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
        password: password
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

    _this.state = { vrpcIsLoading: true };
    return _this;
  }

  (0, _createClass3.default)(VrpcBackendMaker, [{
    key: 'componentDidMount',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _props, backends, broker, token, domain, username, password, vrpc, obj, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, key, value, agent, className, instance, args, _value$events, events, classNames, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, name;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _props = this.props, backends = _props.backends, broker = _props.broker, token = _props.token, domain = _props.domain, username = _props.username, password = _props.password;
                vrpc = new _vrpc.VrpcRemote({ broker: broker, token: token, domain: domain, username: username, password: password });
                _context.next = 4;
                return vrpc.connected();

              case 4:
                obj = {};
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 8;
                _iterator = Object.entries(backends)[Symbol.iterator]();

              case 10:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 70;
                  break;
                }

                _step$value = (0, _slicedToArray3.default)(_step.value, 2), key = _step$value[0], value = _step$value[1];
                agent = value.agent, className = value.className, instance = value.instance, args = value.args, _value$events = value.events, events = _value$events === undefined ? [] : _value$events;

                if (!instance) {
                  _context.next = 25;
                  break;
                }

                if (!args) {
                  _context.next = 20;
                  break;
                }

                _context.next = 17;
                return vrpc.create({ agent: agent, className: className, instance: instance, args: args });

              case 17:
                obj[key] = _context.sent;
                _context.next = 23;
                break;

              case 20:
                _context.next = 22;
                return vrpc.getInstance({ agent: agent, className: className, instance: instance });

              case 22:
                obj[key] = _context.sent;

              case 23:
                _context.next = 67;
                break;

              case 25:
                if (!args) {
                  _context.next = 31;
                  break;
                }

                _context.next = 28;
                return vrpc.create({ agent: agent, className: className, args: args });

              case 28:
                obj[key] = _context.sent;
                _context.next = 67;
                break;

              case 31:
                // observe an array of existing instances
                obj[key] = [];

                if (!((typeof className === 'undefined' ? 'undefined' : (0, _typeof3.default)(className)) === 'object')) {
                  _context.next = 65;
                  break;
                }

                _context.next = 35;
                return vrpc.getAvailableClasses(agent);

              case 35:
                classNames = _context.sent;
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 39;
                _iterator2 = classNames[Symbol.iterator]();

              case 41:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context.next = 49;
                  break;
                }

                name = _step2.value;

                if (!name.match(className)) {
                  _context.next = 46;
                  break;
                }

                _context.next = 46;
                return this._registerProxy(obj, key, agent, events, name, vrpc);

              case 46:
                _iteratorNormalCompletion2 = true;
                _context.next = 41;
                break;

              case 49:
                _context.next = 55;
                break;

              case 51:
                _context.prev = 51;
                _context.t0 = _context['catch'](39);
                _didIteratorError2 = true;
                _iteratorError2 = _context.t0;

              case 55:
                _context.prev = 55;
                _context.prev = 56;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 58:
                _context.prev = 58;

                if (!_didIteratorError2) {
                  _context.next = 61;
                  break;
                }

                throw _iteratorError2;

              case 61:
                return _context.finish(58);

              case 62:
                return _context.finish(55);

              case 63:
                _context.next = 67;
                break;

              case 65:
                _context.next = 67;
                return this._registerProxy(obj, key, agent, events, className, vrpc);

              case 67:
                _iteratorNormalCompletion = true;
                _context.next = 10;
                break;

              case 70:
                _context.next = 76;
                break;

              case 72:
                _context.prev = 72;
                _context.t1 = _context['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context.t1;

              case 76:
                _context.prev = 76;
                _context.prev = 77;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 79:
                _context.prev = 79;

                if (!_didIteratorError) {
                  _context.next = 82;
                  break;
                }

                throw _iteratorError;

              case 82:
                return _context.finish(79);

              case 83:
                return _context.finish(76);

              case 84:
                this.setState((0, _extends3.default)({ vrpc: vrpc }, obj, { vrpcIsLoading: false }));

              case 85:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 72, 76, 84], [39, 51, 55, 63], [56,, 58, 62], [77,, 79, 83]]);
      }));

      function componentDidMount() {
        return _ref3.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: 'componentWillUnmount',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var backends, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _step3$value, key, value, _value$events2, events, proxies, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, proxy, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, event, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _event;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                backends = this.prop.backends;
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context2.prev = 4;
                _iterator3 = Object.entries(backends)[Symbol.iterator]();

              case 6:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context2.next = 94;
                  break;
                }

                _step3$value = (0, _slicedToArray3.default)(_step3.value, 2), key = _step3$value[0], value = _step3$value[1];
                _value$events2 = value.events, events = _value$events2 === undefined ? [] : _value$events2;

                if (!(events.length === 0)) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt('break', 94);

              case 11:
                proxies = this.props[key];

                if (!Array.isArray(proxies)) {
                  _context2.next = 65;
                  break;
                }

                _iteratorNormalCompletion4 = true;
                _didIteratorError4 = false;
                _iteratorError4 = undefined;
                _context2.prev = 16;
                _iterator4 = proxies[Symbol.iterator]();

              case 18:
                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                  _context2.next = 49;
                  break;
                }

                proxy = _step4.value;
                _iteratorNormalCompletion5 = true;
                _didIteratorError5 = false;
                _iteratorError5 = undefined;
                _context2.prev = 23;
                _iterator5 = events[Symbol.iterator]();

              case 25:
                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                  _context2.next = 32;
                  break;
                }

                event = _step5.value;
                _context2.next = 29;
                return proxy.removeListener(event);

              case 29:
                _iteratorNormalCompletion5 = true;
                _context2.next = 25;
                break;

              case 32:
                _context2.next = 38;
                break;

              case 34:
                _context2.prev = 34;
                _context2.t0 = _context2['catch'](23);
                _didIteratorError5 = true;
                _iteratorError5 = _context2.t0;

              case 38:
                _context2.prev = 38;
                _context2.prev = 39;

                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }

              case 41:
                _context2.prev = 41;

                if (!_didIteratorError5) {
                  _context2.next = 44;
                  break;
                }

                throw _iteratorError5;

              case 44:
                return _context2.finish(41);

              case 45:
                return _context2.finish(38);

              case 46:
                _iteratorNormalCompletion4 = true;
                _context2.next = 18;
                break;

              case 49:
                _context2.next = 55;
                break;

              case 51:
                _context2.prev = 51;
                _context2.t1 = _context2['catch'](16);
                _didIteratorError4 = true;
                _iteratorError4 = _context2.t1;

              case 55:
                _context2.prev = 55;
                _context2.prev = 56;

                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
                }

              case 58:
                _context2.prev = 58;

                if (!_didIteratorError4) {
                  _context2.next = 61;
                  break;
                }

                throw _iteratorError4;

              case 61:
                return _context2.finish(58);

              case 62:
                return _context2.finish(55);

              case 63:
                _context2.next = 91;
                break;

              case 65:
                _iteratorNormalCompletion6 = true;
                _didIteratorError6 = false;
                _iteratorError6 = undefined;
                _context2.prev = 68;
                _iterator6 = events[Symbol.iterator]();

              case 70:
                if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                  _context2.next = 77;
                  break;
                }

                _event = _step6.value;
                _context2.next = 74;
                return proxies.removeListener(_event);

              case 74:
                _iteratorNormalCompletion6 = true;
                _context2.next = 70;
                break;

              case 77:
                _context2.next = 83;
                break;

              case 79:
                _context2.prev = 79;
                _context2.t2 = _context2['catch'](68);
                _didIteratorError6 = true;
                _iteratorError6 = _context2.t2;

              case 83:
                _context2.prev = 83;
                _context2.prev = 84;

                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                  _iterator6.return();
                }

              case 86:
                _context2.prev = 86;

                if (!_didIteratorError6) {
                  _context2.next = 89;
                  break;
                }

                throw _iteratorError6;

              case 89:
                return _context2.finish(86);

              case 90:
                return _context2.finish(83);

              case 91:
                _iteratorNormalCompletion3 = true;
                _context2.next = 6;
                break;

              case 94:
                _context2.next = 100;
                break;

              case 96:
                _context2.prev = 96;
                _context2.t3 = _context2['catch'](4);
                _didIteratorError3 = true;
                _iteratorError3 = _context2.t3;

              case 100:
                _context2.prev = 100;
                _context2.prev = 101;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 103:
                _context2.prev = 103;

                if (!_didIteratorError3) {
                  _context2.next = 106;
                  break;
                }

                throw _iteratorError3;

              case 106:
                return _context2.finish(103);

              case 107:
                return _context2.finish(100);

              case 108:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 96, 100, 108], [16, 51, 55, 63], [23, 34, 38, 46], [39,, 41, 45], [56,, 58, 62], [68, 79, 83, 91], [84,, 86, 90], [101,, 103, 107]]);
      }));

      function componentWillUnmount() {
        return _ref4.apply(this, arguments);
      }

      return componentWillUnmount;
    }()
  }, {
    key: '_registerProxy',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(obj, key, agent, events, className, vrpc) {
        var _this2 = this;

        var instances, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _loop3, _iterator7, _step7;

        return _regenerator2.default.wrap(function _callee4$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return vrpc.getAvailableInstances(className, agent);

              case 2:
                instances = _context8.sent;
                _iteratorNormalCompletion7 = true;
                _didIteratorError7 = false;
                _iteratorError7 = undefined;
                _context8.prev = 6;
                _loop3 = /*#__PURE__*/_regenerator2.default.mark(function _loop3() {
                  var instance, proxy, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _loop4, _iterator10, _step10;

                  return _regenerator2.default.wrap(function _loop3$(_context7) {
                    while (1) {
                      switch (_context7.prev = _context7.next) {
                        case 0:
                          instance = _step7.value;
                          _context7.next = 3;
                          return vrpc.getInstance({ agent: agent, className: className, instance: instance });

                        case 3:
                          proxy = _context7.sent;

                          proxy._className = className;
                          _iteratorNormalCompletion10 = true;
                          _didIteratorError10 = false;
                          _iteratorError10 = undefined;
                          _context7.prev = 8;
                          _loop4 = /*#__PURE__*/_regenerator2.default.mark(function _loop4() {
                            var event;
                            return _regenerator2.default.wrap(function _loop4$(_context6) {
                              while (1) {
                                switch (_context6.prev = _context6.next) {
                                  case 0:
                                    event = _step10.value;
                                    _context6.next = 3;
                                    return proxy.on(event, function () {
                                      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                                        args[_key2] = arguments[_key2];
                                      }

                                      proxy[event] = args;
                                    });

                                  case 3:
                                  case 'end':
                                    return _context6.stop();
                                }
                              }
                            }, _loop4, _this2);
                          });
                          _iterator10 = events[Symbol.iterator]();

                        case 11:
                          if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                            _context7.next = 16;
                            break;
                          }

                          return _context7.delegateYield(_loop4(), 't0', 13);

                        case 13:
                          _iteratorNormalCompletion10 = true;
                          _context7.next = 11;
                          break;

                        case 16:
                          _context7.next = 22;
                          break;

                        case 18:
                          _context7.prev = 18;
                          _context7.t1 = _context7['catch'](8);
                          _didIteratorError10 = true;
                          _iteratorError10 = _context7.t1;

                        case 22:
                          _context7.prev = 22;
                          _context7.prev = 23;

                          if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                          }

                        case 25:
                          _context7.prev = 25;

                          if (!_didIteratorError10) {
                            _context7.next = 28;
                            break;
                          }

                          throw _iteratorError10;

                        case 28:
                          return _context7.finish(25);

                        case 29:
                          return _context7.finish(22);

                        case 30:
                          obj[key].push(proxy);

                        case 31:
                        case 'end':
                          return _context7.stop();
                      }
                    }
                  }, _loop3, _this2, [[8, 18, 22, 30], [23,, 25, 29]]);
                });
                _iterator7 = instances[Symbol.iterator]();

              case 9:
                if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                  _context8.next = 14;
                  break;
                }

                return _context8.delegateYield(_loop3(), 't0', 11);

              case 11:
                _iteratorNormalCompletion7 = true;
                _context8.next = 9;
                break;

              case 14:
                _context8.next = 20;
                break;

              case 16:
                _context8.prev = 16;
                _context8.t1 = _context8['catch'](6);
                _didIteratorError7 = true;
                _iteratorError7 = _context8.t1;

              case 20:
                _context8.prev = 20;
                _context8.prev = 21;

                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                  _iterator7.return();
                }

              case 23:
                _context8.prev = 23;

                if (!_didIteratorError7) {
                  _context8.next = 26;
                  break;
                }

                throw _iteratorError7;

              case 26:
                return _context8.finish(23);

              case 27:
                return _context8.finish(20);

              case 28:
                vrpc.on('class', function () {
                  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(info) {
                    var currentIds, removed, added, current, updated, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _loop, _iterator8, _step8;

                    return _regenerator2.default.wrap(function _callee3$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            if (!(info.agent !== agent || info.className !== className)) {
                              _context5.next = 2;
                              break;
                            }

                            return _context5.abrupt('return');

                          case 2:
                            currentIds = _this2.state[key].map(function (x) {
                              return x._targetId;
                            });
                            removed = currentIds.filter(function (x) {
                              return !info.instances.includes(x);
                            });
                            added = info.instances.filter(function (x) {
                              return !currentIds.includes(x);
                            });
                            current = _this2.state[key];
                            updated = current.filter(function (proxy) {
                              return !removed.includes(proxy._targetId);
                            });
                            _iteratorNormalCompletion8 = true;
                            _didIteratorError8 = false;
                            _iteratorError8 = undefined;
                            _context5.prev = 10;
                            _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop() {
                              var instance, proxy, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _loop2, _iterator9, _step9;

                              return _regenerator2.default.wrap(function _loop$(_context4) {
                                while (1) {
                                  switch (_context4.prev = _context4.next) {
                                    case 0:
                                      instance = _step8.value;
                                      _context4.next = 3;
                                      return vrpc.getInstance({
                                        agent: agent,
                                        className: info.className,
                                        instance: instance
                                      });

                                    case 3:
                                      proxy = _context4.sent;

                                      proxy._className = info.className;
                                      _iteratorNormalCompletion9 = true;
                                      _didIteratorError9 = false;
                                      _iteratorError9 = undefined;
                                      _context4.prev = 8;
                                      _loop2 = /*#__PURE__*/_regenerator2.default.mark(function _loop2() {
                                        var event;
                                        return _regenerator2.default.wrap(function _loop2$(_context3) {
                                          while (1) {
                                            switch (_context3.prev = _context3.next) {
                                              case 0:
                                                event = _step9.value;
                                                _context3.next = 3;
                                                return proxy.on(event, function () {
                                                  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                                                    args[_key] = arguments[_key];
                                                  }

                                                  proxy[event] = args;
                                                });

                                              case 3:
                                              case 'end':
                                                return _context3.stop();
                                            }
                                          }
                                        }, _loop2, _this2);
                                      });
                                      _iterator9 = events[Symbol.iterator]();

                                    case 11:
                                      if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                                        _context4.next = 16;
                                        break;
                                      }

                                      return _context4.delegateYield(_loop2(), 't0', 13);

                                    case 13:
                                      _iteratorNormalCompletion9 = true;
                                      _context4.next = 11;
                                      break;

                                    case 16:
                                      _context4.next = 22;
                                      break;

                                    case 18:
                                      _context4.prev = 18;
                                      _context4.t1 = _context4['catch'](8);
                                      _didIteratorError9 = true;
                                      _iteratorError9 = _context4.t1;

                                    case 22:
                                      _context4.prev = 22;
                                      _context4.prev = 23;

                                      if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                        _iterator9.return();
                                      }

                                    case 25:
                                      _context4.prev = 25;

                                      if (!_didIteratorError9) {
                                        _context4.next = 28;
                                        break;
                                      }

                                      throw _iteratorError9;

                                    case 28:
                                      return _context4.finish(25);

                                    case 29:
                                      return _context4.finish(22);

                                    case 30:
                                      updated.push(proxy);

                                    case 31:
                                    case 'end':
                                      return _context4.stop();
                                  }
                                }
                              }, _loop, _this2, [[8, 18, 22, 30], [23,, 25, 29]]);
                            });
                            _iterator8 = added[Symbol.iterator]();

                          case 13:
                            if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                              _context5.next = 18;
                              break;
                            }

                            return _context5.delegateYield(_loop(), 't0', 15);

                          case 15:
                            _iteratorNormalCompletion8 = true;
                            _context5.next = 13;
                            break;

                          case 18:
                            _context5.next = 24;
                            break;

                          case 20:
                            _context5.prev = 20;
                            _context5.t1 = _context5['catch'](10);
                            _didIteratorError8 = true;
                            _iteratorError8 = _context5.t1;

                          case 24:
                            _context5.prev = 24;
                            _context5.prev = 25;

                            if (!_iteratorNormalCompletion8 && _iterator8.return) {
                              _iterator8.return();
                            }

                          case 27:
                            _context5.prev = 27;

                            if (!_didIteratorError8) {
                              _context5.next = 30;
                              break;
                            }

                            throw _iteratorError8;

                          case 30:
                            return _context5.finish(27);

                          case 31:
                            return _context5.finish(24);

                          case 32:
                            _this2.setState((0, _defineProperty3.default)({}, key, updated));

                          case 33:
                          case 'end':
                            return _context5.stop();
                        }
                      }
                    }, _callee3, _this2, [[10, 20, 24, 32], [25,, 27, 31]]);
                  }));

                  return function (_x7) {
                    return _ref6.apply(this, arguments);
                  };
                }());

              case 29:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee4, this, [[6, 16, 20, 28], [21,, 23, 27]]);
      }));

      function _registerProxy(_x, _x2, _x3, _x4, _x5, _x6) {
        return _ref5.apply(this, arguments);
      }

      return _registerProxy;
    }()
  }, {
    key: 'render',
    value: function render() {
      var loading = this.props.loading;
      var vrpcIsLoading = this.state.vrpcIsLoading;

      if (vrpcIsLoading) return loading || false;
      var children = this.props.children;

      return _react2.default.createElement(
        VrpcContext.Provider,
        { value: this.state },
        children
      );
    }
  }]);
  return VrpcBackendMaker;
}(_react.Component);

function withVrpc(PassedComponent) {
  return function (_Component2) {
    (0, _inherits3.default)(ComponentWithVrpc, _Component2);

    function ComponentWithVrpc() {
      (0, _classCallCheck3.default)(this, ComponentWithVrpc);
      return (0, _possibleConstructorReturn3.default)(this, (ComponentWithVrpc.__proto__ || Object.getPrototypeOf(ComponentWithVrpc)).apply(this, arguments));
    }

    (0, _createClass3.default)(ComponentWithVrpc, [{
      key: 'render',
      value: function render() {
        var _this4 = this;

        return _react2.default.createElement(
          VrpcContext.Consumer,
          null,
          function (vrpcInfo) {
            return _react2.default.createElement(PassedComponent, (0, _extends3.default)({}, _this4.props, vrpcInfo));
          }
        );
      }
    }]);
    return ComponentWithVrpc;
  }(_react.Component);
}