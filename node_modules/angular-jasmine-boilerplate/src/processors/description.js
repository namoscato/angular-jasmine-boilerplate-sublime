'use strict';

var nlp = require("nlp_compromise");

/**
 * @dgProcessor descriptionProcessor
 * @description Appends the truncated description summary
 */
module.exports = function descriptionProcessor() {

    return {
        $runAfter: ['tags-extracted'],
        $runBefore: ['rendering-docs'],
        $process: function(docs) {
            var i;
            var parts;
            var summary;
            var spaceIndex;

            docs.forEach(function(doc) {
                if (typeof doc.methods === 'undefined') {
                    return;
                }

                doc.methods.forEach(function(method) {
                    parts = method.description.split('\n');

                    summary = parts[0].trim().replace(/'/g, "\\'"); // Trim whitespace and escape single quotes

                    if (summary.length > 0) {
                        spaceIndex = summary.indexOf(' '); // Assume first word is present tense verb

                        summary = nlp.verb(summary.substring(0, spaceIndex)).conjugate().gerund + summary.substring(spaceIndex);
                    }

                    method.descriptionSummary = summary;

                    if (parts.length > 1) {
                        method.descriptionSummary += '...';
                    }
                });
            });
        }
    };

};
