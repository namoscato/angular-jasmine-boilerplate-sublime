'use strict';

var _ = require('lodash');

/**
 * @dgProcessor dependencies
 * @description Compiles a list of relevant dependency meta data
 */
module.exports = function dependencyProcessor(log) {

    return {
        $runAfter: ['tags-extracted'],
        $runBefore: ['rendering-docs'],
        $process: function(docs) {
            docs.forEach(function(doc) {
                var dependencies = {
                    spies: [],
                    variableDefinitions: ''
                };

                if (typeof doc.requires !== 'undefined') {
                    _.sortBy(doc.requires, function(require) {
                        return require;
                    }).forEach(function(dependency) {
                        var isInternalService = dependency.charAt(0) === '$';

                        // Set variable
                        var variable = dependency;

                        if (isInternalService) {
                            variable = dependency.substr(1);
                        }

                        // Set method
                        var escape = (isInternalService ? '\\' : '');
                        var regEx = new RegExp('(' + escape + dependency + ')\\s*[.]\\s*[A-Za-z0-9_]+\\s*[(]', 'g');
                        var calls = doc.fileInfo.content.match(regEx);
                        var methods = [];

                        if (calls !== null) {
                            calls.forEach(function(call, index) {
                                var index = call.indexOf('.') + 1;

                                methods.push(call.substr(index, call.length - index - 1).trim()); // Remove left-paren and whitespace
                            });

                            methods = _.sortedUniq(methods.sort());
                        }

                        methods = "'" + methods.join("', '") + "'";

                        dependencies.spies.push({
                            dependency: dependency,
                            methods: methods,
                            variable: variable + 'Spy'
                        });
                    });

                    dependencies.variableDefinitions = "\n    var " + _.map(dependencies.spies, 'variable').join(",\n        ") + ";\n";
                }

                log.debug('Compiled ' + dependencies.spies.length + ' dependencies');

                doc.dependencies = dependencies;
            });
        }
    };

};
