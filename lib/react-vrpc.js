'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VrpcContext = _react2.default.createContext();

function createVrpcProvider() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      topicPrefix = _ref.topicPrefix,
      brokerUrl = _ref.brokerUrl;

  var vrpc = new _vrpc.VrpcRemote({ topicPrefix: topicPrefix, brokerUrl: brokerUrl });
  return function VrpcProvider(_ref2) {
    var children = _ref2.children;

    return _react2.default.createElement(
      VrpcContext.Provider,
      { value: vrpc },
      children
    );
  };
}

var VrpcInstanceMaker = function (_Component) {
  (0, _inherits3.default)(VrpcInstanceMaker, _Component);

  function VrpcInstanceMaker() {
    (0, _classCallCheck3.default)(this, VrpcInstanceMaker);

    var _this = (0, _possibleConstructorReturn3.default)(this, (VrpcInstanceMaker.__proto__ || Object.getPrototypeOf(VrpcInstanceMaker)).call(this));

    _this.state = {};
    return _this;
  }

  (0, _createClass3.default)(VrpcInstanceMaker, [{
    key: 'componentDidMount',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _props, vrpc, agentId, className, instanceName, args;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _props = this.props, vrpc = _props.vrpc, agentId = _props.agentId, className = _props.className, instanceName = _props.instanceName, args = _props.args;

                if (!agentId) {
                  _context.next = 11;
                  break;
                }

                _context.t0 = this;
                _context.t1 = _defineProperty3.default;
                _context.t2 = {};
                _context.t3 = instanceName;
                _context.next = 8;
                return vrpc.create(agentId, className, args);

              case 8:
                _context.t4 = _context.sent;
                _context.t5 = (0, _context.t1)(_context.t2, _context.t3, _context.t4);

                _context.t0.setState.call(_context.t0, _context.t5);

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function componentDidMount() {
        return _ref3.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          vrpc = _props2.vrpc,
          agentId = _props2.agentId,
          instanceName = _props2.instanceName,
          oldProps = _props2.oldProps,
          PassedComponent = _props2.PassedComponent;

      if (agentId && !this.state[instanceName]) return false;
      if (agentId) {
        return _react2.default.createElement(PassedComponent, (0, _extends3.default)({}, oldProps, {
          vrpc: vrpc
        }, (0, _defineProperty3.default)({}, instanceName, this.state[instanceName])));
      }
      return _react2.default.createElement(PassedComponent, (0, _extends3.default)({}, oldProps, { vrpc: vrpc }));
    }
  }]);
  return VrpcInstanceMaker;
}(_react.Component);

function withVrpc(agentId, className) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  // TODO Error handling of having defined agentId but not className
  return function _withVrpc(PassedComponent) {
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
            function (vrpc) {
              return _react2.default.createElement(VrpcInstanceMaker, {
                oldProps: _this3.props,
                PassedComponent: PassedComponent,
                vrpc: vrpc,
                agentId: agentId,
                className: className,
                args: args,
                instanceName: (0, _utils.lowerFirstChar)(className)
              });
            }
          );
        }
      }]);
      return ComponentWithVrpc;
    }(_react.Component);
  };
}