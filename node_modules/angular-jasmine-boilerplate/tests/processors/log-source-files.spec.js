var rewire = require('rewire'),
    logSourceFilesProcessor = rewire('../../src/processors/log-source-files');

describe('logSourceFilesProcessor', function() {
    var target;

    var colorsSpy,
        consoleSpy,
        processSpy;

    beforeEach(function() {
        consoleSpy = jasmine.createSpyObj('console', ['log']);

        colorsSpy = jasmine.createSpyObj('colors/safe', ['green', 'red']);
        colorsSpy.green.and.returnValue('GREEN');
        colorsSpy.red.and.returnValue('RED');

        processSpy = jasmine.createSpyObj('process', ['exit']);

        logSourceFilesProcessor.__set__({
            colors: colorsSpy,
            console: consoleSpy,
            process: processSpy
        });

        target = logSourceFilesProcessor();
    });

    describe('When reading no source files', function() {
        beforeEach(function() {
            target.$process([]);
        });

        it('should output error', function() {
            expect(colorsSpy.red).toHaveBeenCalledWith('No source files found');
        });

        it('should output console logs', function() {
            expect(consoleSpy.log.calls.argsFor(0)).toEqual([
                '\nReading source files...'
            ]);

            expect(consoleSpy.log.calls.argsFor(1)).toEqual([
                'RED'
            ]);
        });

        it('should stop process execution', function() {
            expect(processSpy.exit).toHaveBeenCalledWith(1);
        });
    });

    describe('When reading oine source file', function() {
        beforeEach(function() {
            target.$process([
                {
                    fileInfo: {
                        relativePath: 'path1'
                    }
                }
            ]);
        });

        it('should output relative path', function() {
            expect(colorsSpy.green.calls.allArgs()).toEqual([
                ['path1']
            ]);
        });

        it('should output generating log', function() {
            expect(consoleSpy.log.calls.argsFor(2)).toEqual([
                '\nGenerating boilerplate for 1 component...'
            ]);
        });
    });

    describe('When reading multiple source files', function() {
        beforeEach(function() {
            target.$process([
                {
                    fileInfo: {
                        relativePath: 'path1'
                    }
                },
                {
                    fileInfo: {
                        relativePath: 'path2'
                    }
                },
                {
                    fileInfo: {
                        relativePath: 'path2'
                    }
                },
                {
                    fileInfo: {
                        relativePath: 'path3'
                    }
                }
            ]);
        });

        it('should output relative paths', function() {
            expect(colorsSpy.green.calls.allArgs()).toEqual([
                ['path1'],
                ['path2'],
                ['path3']
            ]);
        });

        it('should output generating log', function() {
            expect(consoleSpy.log.calls.argsFor(4)).toEqual([
                '\nGenerating boilerplate for 3 components...'
            ]);
        });
    });
});
