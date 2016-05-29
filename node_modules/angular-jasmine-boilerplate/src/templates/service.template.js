{% extends 'base.template.js' %}

{% block content %}
{%- if doc.dependencies.spies %}
    beforeEach(module(function($provide) {
    {%- for spy in doc.dependencies.spies %}
        $provide.service('{$ spy.name $}', function() {
            {$ spy.variable $} = jasmine.createSpyObj('{$ spy.name $}', [{$ spy.methodString $}]);
{% for methodSpy in spy.methodSpies %}
            {$ methodSpy.variable $} = jasmine.createSpyObj('{$ spy.variable $}.{$ methodSpy.methodName $}', [{$ methodSpy.methodString $}]);
            {$ spy.variable $}.{$ methodSpy.methodName $}.and.returnValue({$ methodSpy.variable $});
{% endfor %}
            return {$ spy.variable $};
        });
    {% endfor -%}
    }));
{% endif %}
    beforeEach(inject(function({$ doc.name $}) {
        target = {$ doc.name $};
    }));
{% endblock %}
