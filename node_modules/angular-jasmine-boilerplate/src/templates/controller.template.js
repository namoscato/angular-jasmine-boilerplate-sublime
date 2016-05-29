{% extends "base.template.js" %}

{% block content %}
    beforeEach(function() {
    {%- for spy in doc.dependencies.spies %}
        {$ spy.variable $} = jasmine.createSpyObj('{$ spy.name $}', [{$ spy.methodString $}]);

        {%- for methodSpy in spy.methodSpies %}

        {$ methodSpy.variable $} = jasmine.createSpyObj('{$ spy.variable $}.{$ methodSpy.methodName $}', [{$ methodSpy.methodString $}]);
        {$ spy.variable $}.{$ methodSpy.methodName $}.and.returnValue({$ methodSpy.variable $});
        {%- endfor %}
{% endfor %}    });

    function construct() {
        inject(function($controller) {
            target = $controller('{$ doc.name $}', {
            {%- for spy in doc.dependencies.spies %}
                {$ spy.name $}: {$ spy.variable $},
            {%- endfor %}
            });
        });
    }
{% endblock %}
