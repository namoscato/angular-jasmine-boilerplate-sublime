'use strict';

var colors = require('colors/safe');

/**
 * @dgProcessor logSourceFilesProcessor
 * @description Logs the set of source files that will be processed
 */
module.exports = function logSourceFilesProcessor() {

    return {
        $runAfter: ['reading-files'],
        $runBefore: ['processing-docs'],
        $process: function(docs) {
            var count;
            var path;
            var pathsHash = {};
            var summary;

            console.log('\nReading source files...');

            docs.forEach(function(doc) {
                path = doc.fileInfo.relativePath;

                if (typeof pathsHash[path] !== 'undefined') {
                    return;
                }

                console.log(colors.green(path));

                pathsHash[path] = true;
            });

            count = Object.keys(pathsHash).length;

            if (count === 0) {
                console.log(colors.red('No source files found'));
                process.exit(1);
            }

            summary = '\nGenerating boilerplate for '
                + count
                + ' component'
                + (count === 1 ? '' : 's')
                + '...';

            console.log(summary);
        }
    };

};
