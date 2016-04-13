var rewire = require('rewire'),
    descriptionProcessor = rewire('../../src/processors/description');

describe('descriptionProcessor', function() {
    var docs,
        target;

    beforeEach(function() {
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
                            description: 'Description One'
                        },
                        {
                            description: "Description two\nwith a second line"
                        },
                        {
                            description: "Description's with a quote"
                        }
                    ]
                }
            ];

            target.$process(docs);
        });

        it('should output description summary', function() {
            expect(docs[0].methods[0].descriptionSummary).toEqual('description One');
        });

        it('on multiple lines should output first line description summary', function() {
            expect(docs[0].methods[1].descriptionSummary).toEqual('description two...');
        });

        it('with a single quote should output escaped description summary', function() {
            expect(docs[0].methods[2].descriptionSummary).toEqual("description\\'s with a quote");
        });
    });
});
