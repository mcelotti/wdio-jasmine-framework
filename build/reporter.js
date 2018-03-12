'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = undefined;

var _isExtensible = require('babel-runtime/core-js/object/is-extensible');

var _isExtensible2 = _interopRequireDefault(_isExtensible);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SETTLE_TIMEOUT = 5000;
var STACKTRACE_FILTER = /(node_modules(\/|\\)(\w+)*|wdio-sync\/build|- - - - -)/g;

var JasmineReporter = function () {
    function JasmineReporter(params) {
        (0, _classCallCheck3.default)(this, JasmineReporter);

        this._cid = params.cid;
        this._capabilities = params.capabilities;
        this._specs = params.specs;
        this._cleanStack = params.cleanStack;
        this._parent = [];
        this._failedCount = 0;

        this.sentMessages = 0; // number of messages sent to the parent
        this.receivedMessages = 0; // number of messages received by the parent
    }

    (0, _createClass3.default)(JasmineReporter, [{
        key: 'suiteStarted',
        value: function suiteStarted() {
            var suite = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this._suiteStart = new Date();
            suite.type = 'suite';

            this.emit('suite:start', suite);
            this._parent.push({
                description: suite.description,
                id: suite.id
            });
        }
    }, {
        key: 'specStarted',
        value: function specStarted() {
            var test = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this._testStart = new Date();
            test.type = 'test';
            this.emit('test:start', test);
        }
    }, {
        key: 'specDone',
        value: function specDone(test) {
            /**
             * jasmine can't set test pending if async (`pending()` got called)
             * this is a workaround until https://github.com/jasmine/jasmine/issues/937 is resolved
             */
            if (Array.isArray(test.failedExpectations)) {
                test.failedExpectations.forEach(function (e) {
                    if (e.message.includes('Failed: => marked Pending')) {
                        test.status = 'pending';
                        test.failedExpectations = [];
                    }
                });
            }

            if (test.failedExpectations && this._cleanStack) {
                test.failedExpectations = test.failedExpectations.map(this.cleanStack.bind(this));
            }

            var e = 'test:' + test.status.replace(/ed/, '');
            test.type = 'test';
            test.duration = new Date() - this._testStart;
            this.emit(e, test);
            this._failedCount += test.status === 'failed' ? 1 : 0;
            this.emit('test:end', test);
        }
    }, {
        key: 'suiteDone',
        value: function suiteDone() {
            var suite = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            this._parent.pop();
            suite.type = 'suite';
            suite.duration = new Date() - this._suiteStart;
            this.emit('suite:end', suite);
        }
    }, {
        key: 'emit',
        value: function emit(event, payload) {
            var _this = this;

            var message = {
                cid: this._cid,
                uid: this.getUniqueIdentifier(payload),
                event: event,
                title: payload.description,
                pending: payload.status === 'pending',
                parent: this._parent.length ? this.getUniqueIdentifier(this._parent[this._parent.length - 1]) : null,
                type: payload.type,
                file: '',
                err: payload.failedExpectations && payload.failedExpectations.length ? payload.failedExpectations[0] : null,
                duration: payload.duration,
                runner: {},
                specs: this._specs
            };

            message.runner[this._cid] = this._capabilities;
            this.send(message, null, {}, function () {
                return ++_this.receivedMessages;
            });
            this.sentMessages++;
        }
    }, {
        key: 'send',
        value: function send() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return process.send.apply(process, args);
        }

        /**
         * wait until all messages were sent to parent
         */

    }, {
        key: 'waitUntilSettled',
        value: function waitUntilSettled() {
            var _this2 = this;

            return new _promise2.default(function (resolve) {
                var start = new Date().getTime();
                var interval = setInterval(function () {
                    var now = new Date().getTime();

                    if (_this2.sentMessages !== _this2.receivedMessages && now - start < _get__('SETTLE_TIMEOUT')) return;
                    clearInterval(interval);
                    resolve();
                }, 100);
            });
        }
    }, {
        key: 'getFailedCount',
        value: function getFailedCount() {
            return this._failedCount;
        }
    }, {
        key: 'getUniqueIdentifier',
        value: function getUniqueIdentifier(target) {
            return target.description + target.id;
        }
    }, {
        key: 'cleanStack',
        value: function cleanStack(error) {
            var stack = error.stack.split('\n');
            stack = stack.filter(function (line) {
                return !line.match(_get__('STACKTRACE_FILTER'));
            });
            error.stack = stack.join('\n');
            return error;
        }
    }]);
    return JasmineReporter;
}();

exports.default = _get__('JasmineReporter');

function _getGlobalObject() {
    try {
        if (!!global) {
            return global;
        }
    } catch (e) {
        try {
            if (!!window) {
                return window;
            }
        } catch (e) {
            return this;
        }
    }
}

;
var _RewireModuleId__ = null;

function _getRewireModuleId__() {
    if (_RewireModuleId__ === null) {
        var globalVariable = _getGlobalObject();

        if (!globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__) {
            globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__ = 0;
        }

        _RewireModuleId__ = __$$GLOBAL_REWIRE_NEXT_MODULE_ID__++;
    }

    return _RewireModuleId__;
}

function _getRewireRegistry__() {
    var theGlobalVariable = _getGlobalObject();

    if (!theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__) {
        theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = (0, _create2.default)(null);
    }

    return __$$GLOBAL_REWIRE_REGISTRY__;
}

function _getRewiredData__() {
    var moduleId = _getRewireModuleId__();

    var registry = _getRewireRegistry__();

    var rewireData = registry[moduleId];

    if (!rewireData) {
        registry[moduleId] = (0, _create2.default)(null);
        rewireData = registry[moduleId];
    }

    return rewireData;
}

(function registerResetAll() {
    var theGlobalVariable = _getGlobalObject();

    if (!theGlobalVariable['__rewire_reset_all__']) {
        theGlobalVariable['__rewire_reset_all__'] = function () {
            theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = (0, _create2.default)(null);
        };
    }
})();

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
var _RewireAPI__ = {};

(function () {
    function addPropertyToAPIObject(name, value) {
        (0, _defineProperty2.default)(_RewireAPI__, name, {
            value: value,
            enumerable: false,
            configurable: true
        });
    }

    addPropertyToAPIObject('__get__', _get__);
    addPropertyToAPIObject('__GetDependency__', _get__);
    addPropertyToAPIObject('__Rewire__', _set__);
    addPropertyToAPIObject('__set__', _set__);
    addPropertyToAPIObject('__reset__', _reset__);
    addPropertyToAPIObject('__ResetDependency__', _reset__);
    addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
    var rewireData = _getRewiredData__();

    if (rewireData[variableName] === undefined) {
        return _get_original__(variableName);
    } else {
        var value = rewireData[variableName];

        if (value === INTENTIONAL_UNDEFINED) {
            return undefined;
        } else {
            return value;
        }
    }
}

function _get_original__(variableName) {
    switch (variableName) {
        case 'SETTLE_TIMEOUT':
            return SETTLE_TIMEOUT;

        case 'STACKTRACE_FILTER':
            return STACKTRACE_FILTER;

        case 'JasmineReporter':
            return JasmineReporter;
    }

    return undefined;
}

function _assign__(variableName, value) {
    var rewireData = _getRewiredData__();

    if (rewireData[variableName] === undefined) {
        return _set_original__(variableName, value);
    } else {
        return rewireData[variableName] = value;
    }
}

function _set_original__(variableName, _value) {
    switch (variableName) {}

    return undefined;
}

function _update_operation__(operation, variableName, prefix) {
    var oldValue = _get__(variableName);

    var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

    _assign__(variableName, newValue);

    return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
    var rewireData = _getRewiredData__();

    if ((typeof variableName === 'undefined' ? 'undefined' : (0, _typeof3.default)(variableName)) === 'object') {
        (0, _keys2.default)(variableName).forEach(function (name) {
            rewireData[name] = variableName[name];
        });
    } else {
        if (value === undefined) {
            rewireData[variableName] = INTENTIONAL_UNDEFINED;
        } else {
            rewireData[variableName] = value;
        }

        return function () {
            _reset__(variableName);
        };
    }
}

function _reset__(variableName) {
    var rewireData = _getRewiredData__();

    delete rewireData[variableName];

    if ((0, _keys2.default)(rewireData).length == 0) {
        delete _getRewireRegistry__()[_getRewireModuleId__];
    }

    ;
}

function _with__(object) {
    var rewireData = _getRewiredData__();

    var rewiredVariableNames = (0, _keys2.default)(object);
    var previousValues = {};

    function reset() {
        rewiredVariableNames.forEach(function (variableName) {
            rewireData[variableName] = previousValues[variableName];
        });
    }

    return function (callback) {
        rewiredVariableNames.forEach(function (variableName) {
            previousValues[variableName] = rewireData[variableName];
            rewireData[variableName] = object[variableName];
        });
        var result = callback();

        if (!!result && typeof result.then == 'function') {
            result.then(reset).catch(reset);
        } else {
            reset();
        }

        return result;
    };
}

var _typeOfOriginalExport = typeof JasmineReporter === 'undefined' ? 'undefined' : (0, _typeof3.default)(JasmineReporter);

function addNonEnumerableProperty(name, value) {
    (0, _defineProperty2.default)(JasmineReporter, name, {
        value: value,
        enumerable: false,
        configurable: true
    });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && (0, _isExtensible2.default)(JasmineReporter)) {
    addNonEnumerableProperty('__get__', _get__);
    addNonEnumerableProperty('__GetDependency__', _get__);
    addNonEnumerableProperty('__Rewire__', _set__);
    addNonEnumerableProperty('__set__', _set__);
    addNonEnumerableProperty('__reset__', _reset__);
    addNonEnumerableProperty('__ResetDependency__', _reset__);
    addNonEnumerableProperty('__with__', _with__);
    addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}

exports.__get__ = _get__;
exports.__GetDependency__ = _get__;
exports.__Rewire__ = _set__;
exports.__set__ = _set__;
exports.__ResetDependency__ = _reset__;
exports.__RewireAPI__ = _RewireAPI__;