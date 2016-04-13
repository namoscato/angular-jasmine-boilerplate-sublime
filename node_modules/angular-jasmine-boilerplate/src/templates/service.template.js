{% extends 'base.template.js' %}

{% block content %}
{%- if doc.dependencies.spies %}
    beforeEach(module(function($provide) {
    {%- for spy in doc.dependencies.spies %}
        $provide.service('{$ spy.dependency $}', function() {
            {$ spy.variable $} = jasmine.createSpyObj('{$ spy.dependency $}', [{$ spy.methods $}]);
            return {$ spy.variable $};
        });
    {% endfor -%}
    }));
{% endif %}
    beforeEach(inject(function({$ doc.name $}) {
        target = {$ doc.name $};
    }));
{% endblock %}
