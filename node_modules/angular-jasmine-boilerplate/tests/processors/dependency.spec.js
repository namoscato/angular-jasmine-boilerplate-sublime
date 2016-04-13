var rewire = require('rewire'),
    dependencyProcessor = rewire('../../src/processors/dependency');

describe('dependencyProcessor', function() {
    var docs,
        target;

    var logSpy;

    beforeEach(function() {
        logSpy = jasmine.createSpyObj('log', ['debug']);

        target = dependencyProcessor(logSpy);
    });

    describe('When processing no dependencies', function() {
        beforeEach(function() {
            docs = [
                {}
            ];

            target.$process(docs);
        });

        it('should not output any spies', function() {
            expect(docs).toEqual([
                {
                    dependencies: {
                        spies: [],
                        variableDefinitions: ''
                    }
                }
            ]);
        });
    });

    describe('When processing dependencies', function() {
        describe('in general', function() {
            beforeEach(function() {
                docs = [
                    {
                        fileInfo: {
                            content: 'content'
                        },
                        requires: [
                            'dep'
                        ]
                    },
                    {
                        fileInfo: {
                            content: 'content'
                        },
                        requires: [
                            'bDep',
                            '$dep',
                            'aDep'
                        ]
                    }
                ];

                target.$process(docs);
            });

            it('should output relevant spies', function() {
                expect(docs[0].dependencies).toEqual({
                    spies: [
                        {
                            dependency: 'dep',
                            methods : "''", 
                            variable: 'depSpy'
                        }
                    ],
                    variableDefinitions: "\n    var depSpy;\n"
                });

                expect(docs[1].dependencies).toEqual({
                    spies: [
                        {
                            dependency: '$dep',
                            methods : "''",
                            variable: 'depSpy'
                        },
                        {
                            dependency: 'aDep',
                            methods : "''",
                            variable: 'aDepSpy'
                        },
                        {
                            dependency: 'bDep',
                            methods : "''",
                            variable: 'bDepSpy'
                        }
                    ],
                    variableDefinitions: "\n    var depSpy,\n        aDepSpy,\n        bDepSpy;\n"
                });
            });
        });

        describe('with method calls', function() {
            beforeEach(function() {
                docs = [
                    {
                        fileInfo: {
                            content: 'no method calls'
                        },
                        requires: [
                            'dep'
                        ]
                    },
                    {
                        fileInfo: {
                            content: '$dep.(); $depinvalidMethodCall(); $dep.property; $dep.method1(); aDep  .  method2(); aDep.method3(); aDep .  method3(); aDep.method3  (); bdep.noMatchOnLowercaseD(); bDep.Z   (); bDep.A();'
                        },
                        requires: [
                            'bDep',
                            '$dep',
                            'aDep'
                        ]
                    }
                ];

                target.$process(docs);
            });

            it('should output a deduped, sorted method string', function() {
                expect(docs[0].dependencies).toEqual({
                    spies: [
                        {
                            dependency: 'dep',
                            methods : "''", 
                            variable: 'depSpy'
                        }
                    ],
                    variableDefinitions: "\n    var depSpy;\n"
                });

                expect(docs[1].dependencies).toEqual({
                    spies: [
                        {
                            dependency: '$dep',
                            methods : "'method1'",
                            variable: 'depSpy'
                        },
                        {
                            dependency: 'aDep',
                            methods : "'method2', 'method3'",
                            variable: 'aDepSpy'
                        },
                        {
                            dependency: 'bDep',
                            methods : "'A', 'Z'",
                            variable: 'bDepSpy'
                        }
                    ],
                    variableDefinitions: "\n    var depSpy,\n        aDepSpy,\n        bDepSpy;\n"
                });
            });
        });
    });
});
