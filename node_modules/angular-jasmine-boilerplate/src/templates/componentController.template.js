{% extends "base.template.js" %}

{% block content %}
    beforeEach(function() {
{%- for spy in doc.dependencies.spies %}
{%- if spy.name != '$scope' %}
        {$ spy.variable $} = jasmine.createSpyObj('{$ spy.name $}', [{$ spy.methodString $}]);

        {%- for methodSpy in spy.methodSpies %}

        {$ methodSpy.variable $} = jasmine.createSpyObj('{$ spy.variable $}.{$ methodSpy.methodName $}', [{$ methodSpy.methodString $}]);
        {$ spy.variable $}.{$ methodSpy.methodName $}.and.returnValue({$ methodSpy.variable $});
        {%- endfor %}
{% endif %}
{%- endfor %}
        inject(function($componentController, $rootScope) {
            scopeSpy = $rootScope.$new();
            {%- if doc.dependencies.coreSpies['$scope'] %}
            {% for method in doc.dependencies.coreSpies['$scope'].methods %}
            spyOn(scopeSpy, '{$ method $}');
            {%- endfor %}
            {%- endif %}

            target = $componentController(
                '{$ doc.component $}',
                {
                {%- for spy in doc.dependencies.spies %}
                    {$ spy.name $}: {$ spy.variable $},
                {%- endfor %}
                }
            );
        });
    });
{% endblock %}
