<?php

/* @WebProfiler/Collector/router.html.twig */
class __TwigTemplate_8296276075cfedd8878fac0f3a637aaff67569e3d09bbb704c39bfc02efd2a06 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        // line 1
        $this->parent = $this->loadTemplate("@WebProfiler/Profiler/layout.html.twig", "@WebProfiler/Collector/router.html.twig", 1);
        $this->blocks = array(
            'toolbar' => array($this, 'block_toolbar'),
            'menu' => array($this, 'block_menu'),
            'panel' => array($this, 'block_panel'),
        );
    }

    protected function doGetParent(array $context)
    {
        return "@WebProfiler/Profiler/layout.html.twig";
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $__internal_48470eea5ff43dce12dc43e3b9c1121da0ff5dbd190f4610eef8d0fdf9faed1a = $this->env->getExtension("native_profiler");
        $__internal_48470eea5ff43dce12dc43e3b9c1121da0ff5dbd190f4610eef8d0fdf9faed1a->enter($__internal_48470eea5ff43dce12dc43e3b9c1121da0ff5dbd190f4610eef8d0fdf9faed1a_prof = new Twig_Profiler_Profile($this->getTemplateName(), "template", "@WebProfiler/Collector/router.html.twig"));

        $this->parent->display($context, array_merge($this->blocks, $blocks));
        
        $__internal_48470eea5ff43dce12dc43e3b9c1121da0ff5dbd190f4610eef8d0fdf9faed1a->leave($__internal_48470eea5ff43dce12dc43e3b9c1121da0ff5dbd190f4610eef8d0fdf9faed1a_prof);

    }

    // line 3
    public function block_toolbar($context, array $blocks = array())
    {
        $__internal_676f84660d9011aed666e172ab29e2895651f668c47cd3a9c9bfe922dee58f30 = $this->env->getExtension("native_profiler");
        $__internal_676f84660d9011aed666e172ab29e2895651f668c47cd3a9c9bfe922dee58f30->enter($__internal_676f84660d9011aed666e172ab29e2895651f668c47cd3a9c9bfe922dee58f30_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "toolbar"));

        
        $__internal_676f84660d9011aed666e172ab29e2895651f668c47cd3a9c9bfe922dee58f30->leave($__internal_676f84660d9011aed666e172ab29e2895651f668c47cd3a9c9bfe922dee58f30_prof);

    }

    // line 5
    public function block_menu($context, array $blocks = array())
    {
        $__internal_e45222fe1161d0555b6738135572d2c2a5c8e4a6c1ee91dc22a347765c47281e = $this->env->getExtension("native_profiler");
        $__internal_e45222fe1161d0555b6738135572d2c2a5c8e4a6c1ee91dc22a347765c47281e->enter($__internal_e45222fe1161d0555b6738135572d2c2a5c8e4a6c1ee91dc22a347765c47281e_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "menu"));

        // line 6
        echo "<span class=\"label\">
    <span class=\"icon\">";
        // line 7
        echo twig_include($this->env, $context, "@WebProfiler/Icon/router.svg");
        echo "</span>
    <strong>Routing</strong>
</span>
";
        
        $__internal_e45222fe1161d0555b6738135572d2c2a5c8e4a6c1ee91dc22a347765c47281e->leave($__internal_e45222fe1161d0555b6738135572d2c2a5c8e4a6c1ee91dc22a347765c47281e_prof);

    }

    // line 12
    public function block_panel($context, array $blocks = array())
    {
        $__internal_ce8aa72de6346f8296dcf080c6e4ae8352fbf5b28b64e4874b282ceccd6946e3 = $this->env->getExtension("native_profiler");
        $__internal_ce8aa72de6346f8296dcf080c6e4ae8352fbf5b28b64e4874b282ceccd6946e3->enter($__internal_ce8aa72de6346f8296dcf080c6e4ae8352fbf5b28b64e4874b282ceccd6946e3_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "panel"));

        // line 13
        echo "    ";
        echo $this->env->getExtension('http_kernel')->renderFragment($this->env->getExtension('routing')->getPath("_profiler_router", array("token" => (isset($context["token"]) ? $context["token"] : $this->getContext($context, "token")))));
        echo "
";
        
        $__internal_ce8aa72de6346f8296dcf080c6e4ae8352fbf5b28b64e4874b282ceccd6946e3->leave($__internal_ce8aa72de6346f8296dcf080c6e4ae8352fbf5b28b64e4874b282ceccd6946e3_prof);

    }

    public function getTemplateName()
    {
        return "@WebProfiler/Collector/router.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  73 => 13,  67 => 12,  56 => 7,  53 => 6,  47 => 5,  36 => 3,  11 => 1,);
    }
}
/* {% extends '@WebProfiler/Profiler/layout.html.twig' %}*/
/* */
/* {% block toolbar %}{% endblock %}*/
/* */
/* {% block menu %}*/
/* <span class="label">*/
/*     <span class="icon">{{ include('@WebProfiler/Icon/router.svg') }}</span>*/
/*     <strong>Routing</strong>*/
/* </span>*/
/* {% endblock %}*/
/* */
/* {% block panel %}*/
/*     {{ render(path('_profiler_router', { token: token })) }}*/
/* {% endblock %}*/
/* */
