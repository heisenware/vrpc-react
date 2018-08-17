'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createVrpcProvider = createVrpcProvider;
exports.connectVrpc = connectVrpc;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _vrpc = require('vrpc');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
  _inherits(VrpcInstanceMaker, _Component);

  function VrpcInstanceMaker() {
    _classCallCheck(this, VrpcInstanceMaker);

    var _this = _possibleConstructorReturn(this, (VrpcInstanceMaker.__proto__ || Object.getPrototypeOf(VrpcInstanceMaker)).call(this));

    _this.state = {};
    return _this;
  }

  _createClass(VrpcInstanceMaker, [{
    key: 'componentDidMount',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _props, vrpc, agentId, className, instanceName;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _props = this.props, vrpc = _props.vrpc, agentId = _props.agentId, className = _props.className, instanceName = _props.instanceName;
                _context.t0 = this;
                _context.t1 = _defineProperty;
                _context.t2 = {};
                _context.t3 = instanceName;
                _context.next = 7;
                return vrpc.create(agentId, className);

              case 7:
                _context.t4 = _context.sent;
                _context.t5 = (0, _context.t1)(_context.t2, _context.t3, _context.t4);

                _context.t0.setState.call(_context.t0, _context.t5);

              case 10:
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
          instanceName = _props2.instanceName,
          oldProps = _props2.oldProps,
          PassedComponent = _props2.PassedComponent;

      if (!this.state[instanceName]) return false;
      return _react2.default.createElement(PassedComponent, _extends({}, oldProps, _defineProperty({}, instanceName, this.state[instanceName])));
    }
  }]);

  return VrpcInstanceMaker;
}(_react.Component);

function connectVrpc(agentId, className) {
  return function withVrpc(PassedComponent) {
    return function (_Component2) {
      _inherits(ComponentWithVrpc, _Component2);

      function ComponentWithVrpc() {
        _classCallCheck(this, ComponentWithVrpc);

        return _possibleConstructorReturn(this, (ComponentWithVrpc.__proto__ || Object.getPrototypeOf(ComponentWithVrpc)).apply(this, arguments));
      }

      _createClass(ComponentWithVrpc, [{
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
                instanceName: lowerFirstChar(className)
              });
            }
          );
        }
      }]);

      return ComponentWithVrpc;
    }(_react.Component);
  };
}