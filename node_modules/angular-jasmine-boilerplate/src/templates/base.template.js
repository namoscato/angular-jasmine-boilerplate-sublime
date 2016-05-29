describe('{$ doc.name $}', function() {
    var result;
    var target;
{% for blocks in doc.dependencies.variables %}
{%- for variable in blocks %}
    var {$ variable $};
{%- endfor %}
{% endfor %}
    beforeEach(module('{$ doc.module $}'));
{% block content %}{% endblock -%}

{% include 'blocks/methods.template.js' -%}

});
