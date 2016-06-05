'use strict';

var _ = require('lodash');

/**
 * @dgProcessor dependencyProcessor
 * @description Compiles a list of relevant dependency meta data
 */
module.exports = function dependencyProcessor(log) {

    /**
     * @description Method regular expression
     * 
     * 1. Method name
     * 2. Optional promise chain method name
     */
    var _methodRegularExpression = '\\s*\\.\\s*(\\$?[A-Za-z0-9_]+)\\s*\\([^\\)]*\\)(?:\\s*\\.\\s*(then|catch|finally)\\s*\\()?';
                                  //000000000001111111111111111111000000000000000000000000000000022222222222222222222000000000

    return {
        $runAfter: ['tags-extracted'],
        $runBefore: ['rendering-docs'],
        $process: function(docs) {
            docs.forEach(function(doc) {
                var additionalVariables = [];
                var dependencies = {
                    coreSpies: {},
                    spies: [],
                    variables: []
                };

                if (typeof doc.requires !== 'undefined') {
                    doc.requires.forEach(function(dependency) {
                        var chainedMethods = {};
                        var dependencyObject;
                        var match;
                        var methods = [];
                        var methodName;
                        var methodSpies = [];
                        var regularExpression;

                        regularExpression = new RegExp(
                            (isInternalService(dependency) ? '\\' : '') + dependency + _methodRegularExpression,
                            'g'
                        );

                        while (match = regularExpression.exec(doc.fileInfo.content)) {
                            methodName = match[1];

                            methods.push(methodName);

                            if (match[2]) {
                                if (typeof chainedMethods[methodName] === 'undefined') {
                                    chainedMethods[methodName] = [];
                                }

                                chainedMethods[methodName].push(match[2]);
                            }
                        }

                        for (methodName in chainedMethods) {
                            dependencyObject = createDependencyObject(
                                dependency + methodName.charAt(0).toUpperCase() + methodName.slice(1),
                                chainedMethods[methodName]
                            );

                            dependencyObject.methodName = methodName;

                            methodSpies.push(dependencyObject);
                            additionalVariables.push(dependencyObject.variable);
                        }

                        dependencyObject = createDependencyObject(
                            dependency,
                            methods,
                            methodSpies
                        );

                        if (dependency === '$scope') {
                            dependencies.coreSpies[dependency] = dependencyObject;
                        }

                        dependencies.spies.push(dependencyObject);
                    });
                }

                if (doc.docType === 'componentController' && typeof dependencies.coreSpies.$scope === 'undefined') {
                    dependencies.spies.push(
                        createDependencyObject('$scope')
                    );
                }

                dependencies.spies = _.sortBy(dependencies.spies, 'name');

                pushVariables(dependencies, _.map(dependencies.spies, 'variable'));
                pushVariables(dependencies, additionalVariables.sort());

                log.debug('Compiled ' + dependencies.spies.length + ' dependencies');

                doc.dependencies = dependencies;
            });
        }
    };

    /**
     * @name dependencyProcessor#createDependencyObject
     * @description Returns the variable name for the specified dependency
     * @param {String} dependency
     * @param {Array} [methods] Array of string method names
     * @param {Array} [methodSpies] Array of chained method spies
     * @returns {Object}
     */
    function createDependencyObject(dependency, methods, methodSpies) {
        if (typeof methods === 'undefined') {
            methods = [];
        }

        if (typeof methodSpies === 'undefined') {
            methodSpies = [];
        }

        methods = _.sortedUniq(methods.sort());

        return {
            name: dependency,
            methods: methods,
            methodString: "'" + methods.join("', '") + "'",
            methodSpies: methodSpies.sort(getCompareFunction('name')),
            variable: getVariableName(dependency)
        };
    }

    /**
     * @name dependencyProcessor#getCompareFunction
     * @description Returns the compare function for the specified property 
     * @param {String} property Property to compare on
     * @returns {Function}
     */
    function getCompareFunction(property) {
        return function(a, b) {
            if (a[property] < b[property]) {
                return -1;
            }

            if (a[property] > b[property]) {
                return 1;
            }

            return 0;
        };
    }

    /**
     * @name dependencyProcessor#getVariableName
     * @description Returns the variable name for the specified dependency
     * @param {String} dependency
     * @returns {Boolean}
     */
    function getVariableName(dependency) {
        if (isInternalService(dependency)) {
            dependency = dependency.substr(1);
        }

        return dependency + 'Spy';
    }

    /**
     * @name dependencyProcessor#isInternalService
     * @description Determines if the specified dependency is an internal service
     * @param {String} dependency
     * @returns {Boolean}
     */
    function isInternalService(dependency) {
        return dependency.charAt(0) === '$';
    }

    /**
     * @name dependencyProcessor#pushVariables
     * @description Pushes the specified variables onto the `dependencies` data structure
     * @param {Object} dependencies
     * @param {Array} variables
     */
    function pushVariables(dependencies, variables) {
        if (variables.length === 0) {
            return;
        }

        dependencies.variables.push([]);

        Array.prototype.push.apply(
            dependencies.variables[dependencies.variables.length - 1],
            variables
        );
    }

};
