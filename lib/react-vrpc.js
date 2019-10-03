'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

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
  var domain = _ref.domain,
      broker = _ref.broker,
      token = _ref.token,
      username = _ref.username,
      password = _ref.password,
      backends = _ref.backends;

  var vrpc = new _vrpc.VrpcRemote({ broker: broker, token: token, domain: domain, username: username, password: password });
  return function VrpcProvider(_ref2) {
    var children = _ref2.children;

    return _react2.default.createElement(
      VrpcBackendMaker,
      { vrpc: vrpc, backends: backends },
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
        var _props, vrpc, backends, obj, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, key, value, domain, agent, className, args;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _props = this.props, vrpc = _props.vrpc, backends = _props.backends;
                obj = {};
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 5;
                _iterator = Object.entries(backends)[Symbol.iterator]();

              case 7:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 16;
                  break;
                }

                _step$value = (0, _slicedToArray3.default)(_step.value, 2), key = _step$value[0], value = _step$value[1];
                domain = value.domain, agent = value.agent, className = value.className, args = value.args;
                _context.next = 12;
                return vrpc.create({ domain: domain, agent: agent, className: className, args: args });

              case 12:
                obj[key] = _context.sent;

              case 13:
                _iteratorNormalCompletion = true;
                _context.next = 7;
                break;

              case 16:
                _context.next = 22;
                break;

              case 18:
                _context.prev = 18;
                _context.t0 = _context['catch'](5);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 22:
                _context.prev = 22;
                _context.prev = 23;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 25:
                _context.prev = 25;

                if (!_didIteratorError) {
                  _context.next = 28;
                  break;
                }

                throw _iteratorError;

              case 28:
                return _context.finish(25);

              case 29:
                return _context.finish(22);

              case 30:
                this.setState((0, _extends3.default)({ vrpc: vrpc }, obj, { vrpcIsLoading: false }));

              case 31:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 18, 22, 30], [23,, 25, 29]]);
      }));

      function componentDidMount() {
        return _ref3.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: 'render',
    value: function render() {
      var vrpcIsLoading = this.state.vrpcIsLoading;

      if (vrpcIsLoading) return false;
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
        var _this3 = this;

        return _react2.default.createElement(
          VrpcContext.Consumer,
          null,
          function (vrpcInfo) {
            return _react2.default.createElement(PassedComponent, (0, _extends3.default)({}, _this3.props, vrpcInfo));
          }
        );
      }
    }]);
    return ComponentWithVrpc;
  }(_react.Component);
}