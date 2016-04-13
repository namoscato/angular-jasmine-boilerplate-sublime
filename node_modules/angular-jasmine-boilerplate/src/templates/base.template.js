describe('{$ doc.name $}', function() {
    var result,
        target;
{$ doc.dependencies.variableDefinitions $}
    beforeEach(module('{$ doc.module $}'));
{% block content %}{% endblock -%}

{% include 'blocks/methods.template.js' -%}

});
