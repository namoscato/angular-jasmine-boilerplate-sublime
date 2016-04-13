var rewire = require('rewire'),
    logOutputFilesProcessor = rewire('../../src/processors/log-output-files');

describe('logOutputFilesProcessor', function() {
    var target;

    var canonicalPathSpy,
        colorsSpy,
        consoleSpy,
        fsSpy,
        readlineSyncSpy;

    var canonicalPathRelativeCount;

    beforeEach(function() {
        canonicalPathSpy = jasmine.createSpyObj('canonical-path', ['relative']);

        canonicalPathRelativeCount = 0;
        canonicalPathSpy.relative.and.callFake(function() {
            return (++canonicalPathRelativeCount) + ' PATH';
        });

        consoleSpy = jasmine.createSpyObj('console', ['log']);

        colorsSpy = jasmine.createSpyObj('colors/safe', [
            'green',
            'red'
        ]);
        colorsSpy.green.and.returnValue('GREEN');
        colorsSpy.red.and.callFake(function(arg) {
            return '*' + arg + '*';
        });

        fsSpy = jasmine.createSpyObj('fs', ['accessSync']);
        fsSpy.accessSync.and.throwError({ code: 'ENOENT' });
        fsSpy.F_OK = 'F_OK';

        readlineSyncSpy = jasmine.createSpyObj('readline-sync', ['keyInYNStrict']);
        readlineSyncSpy.keyInYNStrict.and.returnValue(true);

        logOutputFilesProcessor.__set__({
            canonicalPath: canonicalPathSpy,
            colors: colorsSpy,
            console: consoleSpy,
            fs: fsSpy,
            readlineSync: readlineSyncSpy
        });

        target = logOutputFilesProcessor({
            outputFolder: '/first/second'
        });
    });

    describe('When writing no boilerplate files', function() {
        beforeEach(function() {
            target.$process([]);
        });

        it('should not output any files', function() {
            expect(consoleSpy.log.calls.allArgs()).toEqual([
                [
                    '\nWriting boilerplate files...'
                ]
            ]);
        });
    });

    describe('When writing one boilerplate file', function() {
        beforeEach(function() {
            target.$process([
                {
                    outputPath: '/first/second/third'
                }
            ]);
        });

        it('should get relative path', function() {
            expect(canonicalPathSpy.relative).toHaveBeenCalledWith(
                '/first/second',
                '/first/second/third'
            );
        });

        it('should determine if files already exist', function() {
            expect(fsSpy.accessSync.calls.allArgs()).toEqual([
                [
                    '/first/second/third',
                    'F_OK'
                ]
            ]);
        });

        it('should color text green', function() {
            expect(colorsSpy.green).toHaveBeenCalledWith('1 PATH');
        });

        it('should output text', function() {
            expect(consoleSpy.log.calls.argsFor(1)).toEqual(['GREEN']);
        });
    });

    describe('When writing multiple boilerplate files', function() {
        beforeEach(function() {
            target.$process([
                {
                    outputPath: '/first/second/third'
                },
                {
                    outputPath: '/first/second/fourth'
                },
                {
                    outputPath: '/first/second/fifth'
                },
                {
                    outputPath: '/first/second/fifth'
                }
            ]);
        });

        it('should get relative paths', function() {
            expect(canonicalPathSpy.relative.calls.allArgs()).toEqual([
                [
                    '/first/second',
                    '/first/second/fifth'
                ],
                [
                    '/first/second',
                    '/first/second/fourth'
                ],
                [
                    '/first/second',
                    '/first/second/third'
                ]
            ]);
        });

        it('should determine if files already exist', function() {
            expect(fsSpy.accessSync.calls.allArgs()).toEqual([
                [
                    '/first/second/fifth',
                    'F_OK'
                ],
                [
                    '/first/second/fourth',
                    'F_OK'
                ],
                [
                    '/first/second/third',
                    'F_OK'
                ]
            ]);
        });

        it('should color text green', function() {
            expect(colorsSpy.green.calls.count()).toEqual(3);
        });

        it('should output text', function() {
            expect(consoleSpy.log.calls.count()).toEqual(4);
        });
    });

    describe('When writing a file that already exists', function() {
        var docs;

        describe('without a force option', function() {
            describe('in interactive mode', function() {
                beforeEach(function() {
                    count = 0;

                    docs = [
                        {
                            outputPath: '/first/second/third'
                        },
                        {
                            outputPath: '/first/second/fourth'
                        },
                        {
                            outputPath: '/first/second/third'
                        }
                    ];

                    fsSpy.accessSync.and.stub();

                    readlineSyncSpy.keyInYNStrict.and.callFake(function(arg) {
                        return arg === '*2 PATH already exists; overwrite?*';
                    });

                    target.$process(docs);
                });

                it('should prompt user', function() {
                    expect(readlineSyncSpy.keyInYNStrict.calls.allArgs()).toEqual([
                        [
                            '*1 PATH already exists; overwrite?*'
                        ],
                        [
                            '*2 PATH already exists; overwrite?*'
                        ]
                    ]);
                });

                it('should color text green', function() {
                    expect(colorsSpy.green.calls.allArgs()).toEqual([
                        [
                            '2 PATH'
                        ]
                    ]);
                });

                it('should output text', function() {
                    expect(consoleSpy.log.calls.count()).toEqual(2);
                });

                it('should remove ignored file', function() {
                    expect(docs).toEqual([
                        {
                            outputPath: '/first/second/fourth'
                        }
                    ]);
                });
            });

            describe('in non-interactive mode', function() {
                beforeEach(function() {
                    count = 0;

                    docs = [
                        {
                            outputPath: '/first/second/third'
                        },
                        {
                            outputPath: '/first/second/fourth'
                        }
                    ];

                    fsSpy.accessSync.and.stub();

                    target.nonInteractive = true;

                    target.$process(docs);
                });

                it('should not prompt user', function() {
                    expect(readlineSyncSpy.keyInYNStrict.calls.count()).toEqual(0);
                });

                it('should color text red', function() {
                    expect(colorsSpy.red.calls.allArgs()).toEqual([
                        [
                            '1 PATH already exists'
                        ],
                        [
                            '2 PATH already exists'
                        ]
                    ]);
                });

                it('should output text', function() {
                    expect(consoleSpy.log.calls.count()).toEqual(3);
                });

                it('should remove ignored file', function() {
                    expect(docs).toEqual([]);
                });
            });
        });

        describe('with a force option', function() {
            beforeEach(function() {
                docs = [
                    {
                        outputPath: '/first/second/third'
                    },
                    {
                        outputPath: '/first/second/fourth'
                    }
                ];

                target.force = true;

                target.$process(docs);
            });

            it('should not attempt to access files', function() {
                expect(fsSpy.accessSync.calls.count()).toEqual(0);
            });

            it('should color text green', function() {
                expect(colorsSpy.green.calls.allArgs()).toEqual([
                    [
                        '1 PATH'
                    ],
                    [
                        '2 PATH'
                    ]
                ]);
            });

            it('should output text', function() {
                expect(consoleSpy.log.calls.count()).toEqual(3);
            });
        });
    });
});
