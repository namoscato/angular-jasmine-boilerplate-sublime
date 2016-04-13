'use strict';

/**
 * @dgProcessor description
 * @description Appends the truncated description summary
 */
module.exports = function descriptionProcessor() {

    return {
        $runAfter: ['tags-extracted'],
        $runBefore: ['rendering-docs'],
        $process: function(docs) {
            var parts;

            docs.forEach(function(doc) {
                if (typeof doc.methods === 'undefined') {
                    return;
                }

                doc.methods.forEach(function(method) {
                    parts = method.description.split('\n');

                    // Lowercase first letter
                    method.descriptionSummary = parts[0].charAt(0).toLowerCase() + parts[0].slice(1);

                    // Escape single quotes
                    method.descriptionSummary = method.descriptionSummary.replace(/'/g, "\\'");

                    if (parts.length > 1) {
                        method.descriptionSummary += '...';
                    }
                });
            });
        }
    };

};
