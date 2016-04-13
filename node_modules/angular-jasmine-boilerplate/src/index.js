'use strict';

var canonicalPath = require('canonical-path'),
    dgeni = require('dgeni');

module.exports = function(options) {

    var Package = dgeni.Package;

    var self = new Package(
        'angularJasmineBoilerplate',
        [
            require('dgeni-packages/ngdoc')
        ]
    );

    self.processor(require('./processors/dependency'));
    self.processor(require('./processors/description'));
    self.processor(require('./processors/log-output-files'));
    self.processor(require('./processors/log-source-files'));

    self.config(function(computeIdsProcessor, computePathsProcessor, getAliases, log, logOutputFilesProcessor, readFilesProcessor, templateFinder, writeFilesProcessor) {
        log.remove(log.transports.Console);

        readFilesProcessor.basePath = options.basePath;
        readFilesProcessor.sourceFiles = options.sources;

        templateFinder.templateFolders = [
            canonicalPath.resolve(__dirname, 'templates')
        ];
        templateFinder.templatePatterns = [
            '${ doc.docType }.template.js'
        ];

        writeFilesProcessor.outputFolder = options.testPath;

        computeIdsProcessor.idTemplates.push({
            docTypes: [
                'controller',
                'service'
            ],
            idTemplate: 'module:${module}.${docType}:${name}',
            getAliases: getAliases
        });

        computePathsProcessor.pathTemplates.push({
            docTypes: [
                'controller',
                'service'
            ],
            pathTemplate: '${name}',
            getOutputPath: function(doc) {
                var baseName = doc.fileInfo.baseName,
                    relativePath = doc.fileInfo.relativePath.slice(0, -baseName.length - 3);

                return canonicalPath.resolve(
                    options.testPath,
                    relativePath,
                    baseName.charAt(0).toLowerCase() + baseName.slice(1) + '.spec.js'
                );
            }
        });

        logOutputFilesProcessor.force = options.force;
        logOutputFilesProcessor.nonInteractive = options.nonInteractive;
    });

    return self;
};
