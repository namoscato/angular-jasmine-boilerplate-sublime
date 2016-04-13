'use strict';

var canonicalPath = require('canonical-path'),
    colors = require('colors/safe'),
    fs = require('fs'),
    readlineSync = require('readline-sync');

/**
 * @dgProcessor dependencies
 * @description Logs the set of output files that will be processed
 */
module.exports = function logOutputFilesProcessor(writeFilesProcessor) {

    return {
        $validate: {
            force: { presence: true },
            nonInteractive: { presence: true }
        },
        $runAfter: ['docs-rendered'],
        $runBefore: ['writing-files'],
        $process: function(docs) {
            var doc,
                index = docs.length,
                isWriting,
                pathsHash = {},
                relativePath;

            console.log('\nWriting boilerplate files...');

            while (--index >= 0) {
                doc = docs[index];
                isWriting = true;

                if (typeof pathsHash[doc.outputPath] !== 'undefined') {
                    if (!pathsHash[doc.outputPath]) {
                        docs.splice(index, 1);
                    }
                    continue;
                }

                relativePath = canonicalPath.relative(writeFilesProcessor.outputFolder, doc.outputPath);

                try {
                    if (this.force) { // Always overwrite if force flag is set
                        throw {};
                    }

                    fs.accessSync(doc.outputPath, fs.F_OK); // Try to access file

                    if (this.nonInteractive) { // Output error if file already exists
                        console.log(colors.red(relativePath + ' already exists'));
                    } else { // Otherwise, prompt user to continue
                        isWriting = readlineSync.keyInYNStrict(
                            colors.red(relativePath + ' already exists; overwrite?')
                        );

                        if (isWriting) { // Continue if user confirms overwrite
                            throw {};
                        }
                    }

                    docs.splice(index, 1); // Otherwise, remove document from processing array
                } catch (e) {
                    console.log(colors.green(relativePath));
                }

                pathsHash[doc.outputPath] = isWriting;
            }
        }
    };

};
