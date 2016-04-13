{%- for method in doc.methods %}
    /**
     * {$ method.name $}
     */
    
    describe('When {$ method.descriptionSummary $}', function() {
        beforeEach(function() {
            {% if doc.docType == 'controller' -%}
                construct();

            {% endif -%}
            target.{$ method.name $}();
        });

        it('should ', function() {

        });
    });
{% endfor -%}
