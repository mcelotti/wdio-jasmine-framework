'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.__RewireAPI__ = exports.__ResetDependency__ = exports.__set__ = exports.__Rewire__ = exports.__GetDependency__ = exports.__get__ = exports.adapterFactory = exports.JasmineAdapter = undefined;

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

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _jasmine = require('jasmine');

var _jasmine2 = _interopRequireDefault(_jasmine);

var _reporter = require('./reporter');

var _reporter2 = _interopRequireDefault(_reporter);

var _wdioSync = require('wdio-sync');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INTERFACES = {
    bdd: ['beforeAll', 'beforeEach', 'it', 'xit', 'fit', 'afterEach', 'afterAll']
};

var DEFAULT_TIMEOUT_INTERVAL = 60000;

/**
 * Jasmine 2.x runner
 */

var JasmineAdapter = function () {
    function JasmineAdapter(cid, config) {
        var specs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var capabilities = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        (0, _classCallCheck3.default)(this, JasmineAdapter);

        this.cid = cid;
        this.capabilities = capabilities;
        this.specs = specs;
        this.config = (0, _assign2.default)({}, config);
        this.jasmineNodeOpts = (0, _assign2.default)({
            cleanStack: true
        }, config.jasmineNodeOpts);
        this.jrunner = {};
        this.reporter = new (_get__('JasmineReporter'))({
            cid: this.cid,
            capabilities: this.capabilities,
            specs: this.specs,
            cleanStack: this.jasmineNodeOpts.cleanStack
        });
    }

    (0, _createClass3.default)(JasmineAdapter, [{
        key: 'run',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var _this = this;

                var self, jasmine, beforeAllMock, executeMock, result;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                self = this;


                                this.jrunner = new (_get__('Jasmine'))();
                                jasmine = this.jrunner.jasmine;


                                this.jrunner.projectBaseDir = '';
                                this.jrunner.specDir = '';
                                this.jrunner.addSpecFiles(this.specs);

                                jasmine.DEFAULT_TIMEOUT_INTERVAL = this.getDefaultInterval();
                                jasmine.getEnv().addReporter(this.reporter);

                                /**
                                 * Filter specs to run based on jasmineNodeOpts.grep and jasmineNodeOpts.invert
                                 */
                                jasmine.getEnv().specFilter = function (spec) {
                                    var grepMatch = _this.getGrepMatch(spec);
                                    var invertGrep = !!_this.jasmineNodeOpts.invertGrep;
                                    if (grepMatch === invertGrep) {
                                        spec.pend();
                                    }
                                    return true;
                                };

                                /**
                                 * enable expectHandler
                                 */
                                jasmine.Spec.prototype.addExpectationResult = this.getExpectationResultHandler(jasmine);

                                /**
                                 * patch jasmine to support promises
                                 */
                                _get__('INTERFACES')['bdd'].forEach(function (fnName) {
                                    var origFn = global[fnName];
                                    global[fnName] = function () {
                                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                                            args[_key] = arguments[_key];
                                        }

                                        var retryCnt = typeof args[args.length - 1] === 'number' ? args.pop() : 0;
                                        var specFn = typeof args[0] === 'function' ? args.shift() : typeof args[1] === 'function' ? args.pop() : undefined;
                                        var specTitle = args[0];
                                        var patchedOrigFn = function patchedOrigFn(done) {
                                            // specFn will be replaced by wdio-sync and will always return a promise
                                            return specFn.call(this).then(function () {
                                                return done();
                                            }, function (e) {
                                                return done.fail(e);
                                            });
                                        };
                                        var newArgs = [specTitle, patchedOrigFn, retryCnt].filter(function (a) {
                                            return Boolean(a);
                                        });

                                        if (!specFn) {
                                            return origFn(specTitle);
                                        }

                                        return origFn.apply(_this, newArgs);
                                    };
                                });

                                /**
                                 * wrap commands with wdio-sync
                                 */
                                _get__('wrapCommands')(global.browser, this.config.beforeCommand, this.config.afterCommand);
                                _get__('INTERFACES')['bdd'].forEach(function (fnName) {
                                    return _get__('runInFiberContext')(['it', 'fit'], _this.config.beforeHook, _this.config.afterHook, fnName);
                                });

                                /**
                                 * for a clean stdout we need to avoid that Jasmine initialises the
                                 * default reporter
                                 */
                                _get__('Jasmine').prototype.configureDefaultReporter = function () {};

                                /**
                                 * wrap Suite and Spec prototypes to get access to their data
                                 */
                                beforeAllMock = jasmine.Suite.prototype.beforeAll;

                                jasmine.Suite.prototype.beforeAll = function () {
                                    self.lastSpec = this.result;

                                    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                                        args[_key2] = arguments[_key2];
                                    }

                                    beforeAllMock.apply(this, args);
                                };
                                executeMock = jasmine.Spec.prototype.execute;

                                jasmine.Spec.prototype.execute = function () {
                                    self.lastTest = this.result;
                                    self.lastTest.start = new Date().getTime();

                                    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                                        args[_key3] = arguments[_key3];
                                    }

                                    executeMock.apply(this, args);
                                };

                                _context.next = 20;
                                return _get__('executeHooksWithArgs')(this.config.before, [this.capabilities, this.specs]);

                            case 20:
                                _context.next = 22;
                                return new _promise2.default(function (resolve) {
                                    _this.jrunner.env.beforeAll(_this.wrapHook('beforeSuite'));
                                    _this.jrunner.env.beforeEach(_this.wrapHook('beforeTest'));
                                    _this.jrunner.env.afterEach(_this.wrapHook('afterTest'));
                                    _this.jrunner.env.afterAll(_this.wrapHook('afterSuite'));

                                    _this.jrunner.onComplete(function () {
                                        return resolve(_this.reporter.getFailedCount());
                                    });
                                    _this.jrunner.execute();
                                });

                            case 22:
                                result = _context.sent;
                                _context.next = 25;
                                return _get__('executeHooksWithArgs')(this.config.after, [result, this.capabilities, this.specs]);

                            case 25:
                                _context.next = 27;
                                return this.reporter.waitUntilSettled();

                            case 27:
                                return _context.abrupt('return', result);

                            case 28:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function run() {
                return _ref.apply(this, arguments);
            }

            return run;
        }()

        /**
         * Hooks which are added as true Mocha hooks need to call done() to notify async
         */

    }, {
        key: 'wrapHook',
        value: function wrapHook(hookName) {
            var _this2 = this;

            return function (done) {
                return _get__('executeHooksWithArgs')(_this2.config[hookName], _this2.prepareMessage(hookName)).then(function () {
                    return done();
                }, function (e) {
                    console.log('Error in ' + hookName + ' hook: ' + e.stack.slice(7));
                    done();
                });
            };
        }
    }, {
        key: 'prepareMessage',
        value: function prepareMessage(hookName) {
            var params = { type: hookName };

            switch (hookName) {
                case 'beforeSuite':
                case 'afterSuite':
                    params.payload = (0, _assign2.default)({
                        file: this.jrunner.specFiles[0]
                    }, this.lastSpec);
                    break;
                case 'beforeTest':
                case 'afterTest':
                    params.payload = (0, _assign2.default)({
                        file: this.jrunner.specFiles[0]
                    }, this.lastTest);
                    break;
            }

            return this.formatMessage(params);
        }
    }, {
        key: 'formatMessage',
        value: function formatMessage(params) {
            var message = {
                type: params.type
            };

            if (params.err) {
                message.err = {
                    message: params.err.message,
                    stack: params.err.stack
                };
            }

            if (params.payload) {
                message.title = params.payload.description;
                message.fullName = params.payload.fullName || null;
                message.file = params.payload.file;

                if (params.payload.type && params.payload.type === 'test') {
                    message.parent = this.lastSpec.description;
                    message.passed = params.payload.failedExpectations.length === 0;
                }

                if (params.type === 'afterTest') {
                    message.duration = new Date().getTime() - params.payload.start;
                }

                if (typeof params.payload.duration === 'number') {
                    message.duration = params.payload.duration;
                }
            }

            return message;
        }
    }, {
        key: 'getDefaultInterval',
        value: function getDefaultInterval() {
            var jasmineNodeOpts = this.jasmineNodeOpts;

            if (jasmineNodeOpts.defaultTimeoutInterval) {
                return jasmineNodeOpts.defaultTimeoutInterval;
            }

            return _get__('DEFAULT_TIMEOUT_INTERVAL');
        }
    }, {
        key: 'getGrepMatch',
        value: function getGrepMatch(spec) {
            var grep = this.jasmineNodeOpts.grep;

            return !grep || spec.getFullName().match(new RegExp(grep)) !== null;
        }
    }, {
        key: 'getExpectationResultHandler',
        value: function getExpectationResultHandler(jasmine) {
            var jasmineNodeOpts = this.jasmineNodeOpts;

            var origHandler = jasmine.Spec.prototype.addExpectationResult;

            if (typeof jasmineNodeOpts.expectationResultHandler !== 'function') {
                return origHandler;
            }

            return this.expectationResultHandler(origHandler);
        }
    }, {
        key: 'expectationResultHandler',
        value: function expectationResultHandler(origHandler) {
            var expectationResultHandler = this.jasmineNodeOpts.expectationResultHandler;

            return function (passed, data) {
                try {
                    expectationResultHandler.call(global.browser, passed, data);
                } catch (e) {
                    /**
                     * propagate expectationResultHandler error if actual assertion passed
                     */
                    if (passed) {
                        passed = false;
                        data = {
                            passed: false,
                            message: 'expectationResultHandlerError: ' + e.message
                        };
                    }
                }

                return origHandler.call(this, passed, data);
            };
        }
    }]);
    return JasmineAdapter;
}();

var _JasmineAdapter = _get__('JasmineAdapter');
var adapterFactory = {};

_get__('adapterFactory').run = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(cid, config, specs, capabilities) {
        var adapter, result;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        adapter = new (_get__('_JasmineAdapter'))(cid, config, specs, capabilities);
                        _context2.next = 3;
                        return adapter.run();

                    case 3:
                        result = _context2.sent;
                        return _context2.abrupt('return', result);

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x3, _x4, _x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}();

exports.default = _get__('adapterFactory');
exports.JasmineAdapter = JasmineAdapter;
exports.adapterFactory = adapterFactory;

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
        case 'JasmineReporter':
            return _reporter2.default;

        case 'Jasmine':
            return _jasmine2.default;

        case 'INTERFACES':
            return INTERFACES;

        case 'wrapCommands':
            return _wdioSync.wrapCommands;

        case 'runInFiberContext':
            return _wdioSync.runInFiberContext;

        case 'executeHooksWithArgs':
            return _wdioSync.executeHooksWithArgs;

        case 'DEFAULT_TIMEOUT_INTERVAL':
            return DEFAULT_TIMEOUT_INTERVAL;

        case 'JasmineAdapter':
            return JasmineAdapter;

        case 'adapterFactory':
            return adapterFactory;

        case '_JasmineAdapter':
            return _JasmineAdapter;
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

var _typeOfOriginalExport = typeof adapterFactory === 'undefined' ? 'undefined' : (0, _typeof3.default)(adapterFactory);

function addNonEnumerableProperty(name, value) {
    (0, _defineProperty2.default)(adapterFactory, name, {
        value: value,
        enumerable: false,
        configurable: true
    });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && (0, _isExtensible2.default)(adapterFactory)) {
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