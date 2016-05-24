var rewire = require('rewire');
var descriptionProcessor = rewire('../../src/processors/description');

describe('descriptionProcessor', function() {
    var docs;
    var target;

    var nlpSpy;
    var nlpVerbSpy;

    beforeEach(function() {
        nlpSpy = jasmine.createSpyObj('nlp', ['verb']);

        nlpVerbSpy = jasmine.createSpyObj('nlp.verb', ['conjugate']);
        nlpVerbSpy.conjugate.and.returnValue({
            gerund: 'verbing'
        });
        nlpSpy.verb.and.returnValue(nlpVerbSpy);

        descriptionProcessor.__set__({
            nlp: nlpSpy
        });

        target = descriptionProcessor();
    });

    describe('When processing a component without any methods', function() {
        beforeEach(function() {
            docs = [
                {}
            ];

            target.$process(docs);
        });

        it('should gracefully ignore the lack of methods', function() {
            expect(docs).toEqual([
                {}
            ]);
        });
    });

    describe('When processing a method without a description', function() {
        beforeEach(function() {
            docs = [
                {
                    methods: [
                        {
                            description: ''
                        }
                    ]
                }
            ];

            target.$process(docs);
        });

        it('should not output description summary', function() {
            expect(docs[0].methods).toEqual([
                {
                    description: '',
                    descriptionSummary: ''
                }
            ]);
        });
    });

    describe('When processing a method with a description', function() {
        beforeEach(function() {
            docs = [
                {
                    methods: [
                        {
                            description: 'Verb1 One'
                        },
                        {
                            description: " Verb2 two \nwith a second line"
                        },
                        {
                            description: "verb3 word's with a quote"
                        }
                    ]
                }
            ];

            target.$process(docs);
        });

        it('should conjugate verbs', function() {
            expect(nlpSpy.verb.calls.allArgs()).toEqual([
                ['Verb1'],
                ['Verb2'],
                ['verb3'],
            ]);
        });

        it('should output description summary', function() {
            expect(docs[0].methods[0].descriptionSummary).toEqual('verbing One');
        });


        it('on multiple lines should output first line description summary', function() {
            expect(docs[0].methods[1].descriptionSummary).toEqual('verbing two...');
        });

        it('with a single quote should output escaped description summary', function() {
            expect(docs[0].methods[2].descriptionSummary).toEqual("verbing word\\'s with a quote");
        });
    });
});
