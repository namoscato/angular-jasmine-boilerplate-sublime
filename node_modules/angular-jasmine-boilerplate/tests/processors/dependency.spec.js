var rewire = require('rewire');
var dependencyProcessor = rewire('../../src/processors/dependency');

describe('dependencyProcessor', function() {
    var docs;
    var target;

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
                        coreSpies: {},
                        spies: [],
                        variables: []
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
                    coreSpies: {},
                    spies: [
                        {
                            name: 'dep',
                            methods: [],
                            methodString: "''",
                            methodSpies: [],
                            variable: 'depSpy'
                        }
                    ],
                    variables: [
                        [
                            'depSpy'
                        ]
                    ]
                });

                expect(docs[1].dependencies).toEqual({
                    coreSpies: {},
                    spies: [
                        {
                            name: '$dep',
                            methods: [],
                            methodString: "''",
                            methodSpies: [],
                            variable: 'depSpy'
                        },
                        {
                            name: 'aDep',
                            methods: [],
                            methodString: "''",
                            methodSpies: [],
                            variable: 'aDepSpy'
                        },
                        {
                            name: 'bDep',
                            methods: [],
                            methodString: "''",
                            methodSpies: [],
                            variable: 'bDepSpy'
                        }
                    ],
                    variables: [
                        [
                            'depSpy',
                            'aDepSpy',
                            'bDepSpy',
                        ]
                    ]
                });
            });
        });

        describe('with method calls', function() {
            beforeEach(function() {
                docs = [
                    {
                        fileInfo: {
                            content: '$dep.(); $depinvalidMethodCall(); $dep.property; $dep.$method1(); ' + 
                                     'aDep  .  method2(); aDep.method3(arg); aDep .  method3(); aDep.method3  (); ' + 
                                     'bdep.noMatchOnLowercaseD(); bDep.\nZ   (); bDep.A(); bDep.A();'
                        },
                        requires: [
                            'bDep',
                            '$dep',
                            'aDep',
                        ]
                    }
                ];

                target.$process(docs);
            });

            it('should output a deduped, sorted method string', function() {
                expect(docs[0].dependencies).toEqual({
                    coreSpies: {},
                    spies: [
                        {
                            name: '$dep',
                            methods: [
                                '$method1'
                            ],
                            methodString: "'$method1'",
                            methodSpies: [],
                            variable: 'depSpy'
                        },
                        {
                            name: 'aDep',
                            methods: [
                                'method2',
                                'method3'
                            ],
                            methodString: "'method2', 'method3'",
                            methodSpies: [],
                            variable: 'aDepSpy'
                        },
                        {
                            name: 'bDep',
                            methods: [
                                'A',
                                'Z'
                            ],
                            methodString: "'A', 'Z'",
                            methodSpies: [],
                            variable: 'bDepSpy'
                        }
                    ],
                    variables: [
                        [
                            'depSpy',
                            'aDepSpy',
                            'bDepSpy',
                        ]
                    ]
                });
            });
        });

        describe('with promise method calls', function() {
            beforeEach(function() {
                docs = [
                    {
                        fileInfo: {
                            content: 'cDep.method2().catch() cDep.method1().then(function() {}) cDep.method1().then() cDep.method1.catch cDep . method1 () .  finally() cDep.method2.then'
                        },
                        requires: [
                            'cDep'
                        ]
                    }
                ];

                target.$process(docs);
            });

            it('should output promise method spies', function() {
                expect(docs[0].dependencies).toEqual({
                    coreSpies: {},
                    spies: [
                        {
                            name: 'cDep',
                            methods: [
                                'method1',
                                'method2',
                            ],
                            methodString: "'method1', 'method2'",
                            methodSpies: [
                                {
                                    name: 'cDepMethod1',
                                    methods: [
                                        'finally',
                                        'then'
                                    ],
                                    methodString: "'finally', 'then'",
                                    methodSpies: [],
                                    variable: 'cDepMethod1Spy',
                                    methodName: 'method1'
                                },
                                {
                                    name: 'cDepMethod2',
                                    methods: [
                                        'catch'
                                    ],
                                    methodString: "'catch'",
                                    methodSpies: [],
                                    variable: 'cDepMethod2Spy',
                                    methodName: 'method2'
                                }
                            ],
                            variable: 'cDepSpy'
                        }
                    ],
                    variables: [
                        [
                            'cDepSpy',
                        ],
                        [
                            'cDepMethod1Spy',
                            'cDepMethod2Spy'
                        ]
                    ]
                });
            });
        });

        describe('with a core dependency', function() {
            beforeEach(function() {
                docs = [
                    {
                        fileInfo: {
                            content: ''
                        },
                        requires: [
                            '$scope'
                        ]
                    }
                ];

                target.$process(docs);
            });

            it('should output promise method spies', function() {
                expect(docs[0].dependencies).toEqual({
                    coreSpies: {
                        '$scope': {
                            name: '$scope',
                            methods: [],
                            methodString: "''",
                            methodSpies: [],
                            variable: 'scopeSpy'
                        }
                    },
                    spies: [
                        {
                            name: '$scope',
                            methods: [],
                            methodString: "''",
                            methodSpies: [],
                            variable: 'scopeSpy'
                        }
                    ],
                    variables: [
                        [
                            'scopeSpy',
                        ]
                    ]
                });
            });
        });
    });
});
