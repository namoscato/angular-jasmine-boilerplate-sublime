{% extends "base.template.js" %}

{% block content %}
    beforeEach(function() {
    {%- for spy in doc.dependencies.spies %}
        {$ spy.variable $} = jasmine.createSpyObj('{$ spy.dependency $}', [{$ spy.methods $}]);
    {% endfor -%}
    });

    function construct() {
        inject(function($controller) {
            target = $controller('{$ doc.name $}', {
            {%- for spy in doc.dependencies.spies %}
                {$ spy.dependency $}: {$ spy.variable $},
            {%- endfor %}
            });
        });
    }
{% endblock %}
