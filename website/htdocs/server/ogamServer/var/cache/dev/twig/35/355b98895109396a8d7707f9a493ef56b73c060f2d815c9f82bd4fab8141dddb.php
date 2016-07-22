<?php

/* base.html.twig */
class __TwigTemplate_65312669c0f6a5757ff43f960be4afe7f4beff921defc8e71e07f42597bc2b13 extends Twig_Template
{
    public function __construct(Twig_Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = array(
            'title' => array($this, 'block_title'),
            'stylesheets' => array($this, 'block_stylesheets'),
            'body' => array($this, 'block_body'),
            'javascripts' => array($this, 'block_javascripts'),
        );
    }

    protected function doDisplay(array $context, array $blocks = array())
    {
        $__internal_6df5344cf125f4d2bf22014fad1b9a09a7212a96f92b43f016b249da3f61983f = $this->env->getExtension("native_profiler");
        $__internal_6df5344cf125f4d2bf22014fad1b9a09a7212a96f92b43f016b249da3f61983f->enter($__internal_6df5344cf125f4d2bf22014fad1b9a09a7212a96f92b43f016b249da3f61983f_prof = new Twig_Profiler_Profile($this->getTemplateName(), "template", "base.html.twig"));

        // line 1
        echo "<!DOCTYPE html>
<html>
    <head>
        <meta charset=\"UTF-8\" />
        <title>";
        // line 5
        $this->displayBlock('title', $context, $blocks);
        echo "</title>
        ";
        // line 6
        $this->displayBlock('stylesheets', $context, $blocks);
        // line 7
        echo "        <link rel=\"icon\" type=\"image/x-icon\" href=\"";
        echo twig_escape_filter($this->env, $this->env->getExtension('asset')->getAssetUrl("favicon.ico"), "html", null, true);
        echo "\" />
    </head>
    <body>
        ";
        // line 10
        $this->displayBlock('body', $context, $blocks);
        // line 11
        echo "        ";
        $this->displayBlock('javascripts', $context, $blocks);
        // line 12
        echo "    </body>
</html>
";
        
        $__internal_6df5344cf125f4d2bf22014fad1b9a09a7212a96f92b43f016b249da3f61983f->leave($__internal_6df5344cf125f4d2bf22014fad1b9a09a7212a96f92b43f016b249da3f61983f_prof);

    }

    // line 5
    public function block_title($context, array $blocks = array())
    {
        $__internal_0831c3e6abe57dd4d8c2f784cb6e9873bac83c269b5df39c9952f093062d83bd = $this->env->getExtension("native_profiler");
        $__internal_0831c3e6abe57dd4d8c2f784cb6e9873bac83c269b5df39c9952f093062d83bd->enter($__internal_0831c3e6abe57dd4d8c2f784cb6e9873bac83c269b5df39c9952f093062d83bd_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "title"));

        echo "Welcome!";
        
        $__internal_0831c3e6abe57dd4d8c2f784cb6e9873bac83c269b5df39c9952f093062d83bd->leave($__internal_0831c3e6abe57dd4d8c2f784cb6e9873bac83c269b5df39c9952f093062d83bd_prof);

    }

    // line 6
    public function block_stylesheets($context, array $blocks = array())
    {
        $__internal_1a9a98c654aada0cfd8d0cfcaed8b5e7e9fe98748eb9719348c10ce6aebd94c1 = $this->env->getExtension("native_profiler");
        $__internal_1a9a98c654aada0cfd8d0cfcaed8b5e7e9fe98748eb9719348c10ce6aebd94c1->enter($__internal_1a9a98c654aada0cfd8d0cfcaed8b5e7e9fe98748eb9719348c10ce6aebd94c1_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "stylesheets"));

        
        $__internal_1a9a98c654aada0cfd8d0cfcaed8b5e7e9fe98748eb9719348c10ce6aebd94c1->leave($__internal_1a9a98c654aada0cfd8d0cfcaed8b5e7e9fe98748eb9719348c10ce6aebd94c1_prof);

    }

    // line 10
    public function block_body($context, array $blocks = array())
    {
        $__internal_15c4eb05d858301dc839f6863f0c4fe22067158d2424ac94aadbe00d996b8251 = $this->env->getExtension("native_profiler");
        $__internal_15c4eb05d858301dc839f6863f0c4fe22067158d2424ac94aadbe00d996b8251->enter($__internal_15c4eb05d858301dc839f6863f0c4fe22067158d2424ac94aadbe00d996b8251_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "body"));

        
        $__internal_15c4eb05d858301dc839f6863f0c4fe22067158d2424ac94aadbe00d996b8251->leave($__internal_15c4eb05d858301dc839f6863f0c4fe22067158d2424ac94aadbe00d996b8251_prof);

    }

    // line 11
    public function block_javascripts($context, array $blocks = array())
    {
        $__internal_7992c48e9a8dcbfa1709c248f3e10c9f7d443958d4da6ecb6896311308803aa5 = $this->env->getExtension("native_profiler");
        $__internal_7992c48e9a8dcbfa1709c248f3e10c9f7d443958d4da6ecb6896311308803aa5->enter($__internal_7992c48e9a8dcbfa1709c248f3e10c9f7d443958d4da6ecb6896311308803aa5_prof = new Twig_Profiler_Profile($this->getTemplateName(), "block", "javascripts"));

        
        $__internal_7992c48e9a8dcbfa1709c248f3e10c9f7d443958d4da6ecb6896311308803aa5->leave($__internal_7992c48e9a8dcbfa1709c248f3e10c9f7d443958d4da6ecb6896311308803aa5_prof);

    }

    public function getTemplateName()
    {
        return "base.html.twig";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  93 => 11,  82 => 10,  71 => 6,  59 => 5,  50 => 12,  47 => 11,  45 => 10,  38 => 7,  36 => 6,  32 => 5,  26 => 1,);
    }
}
/* <!DOCTYPE html>*/
/* <html>*/
/*     <head>*/
/*         <meta charset="UTF-8" />*/
/*         <title>{% block title %}Welcome!{% endblock %}</title>*/
/*         {% block stylesheets %}{% endblock %}*/
/*         <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}" />*/
/*     </head>*/
/*     <body>*/
/*         {% block body %}{% endblock %}*/
/*         {% block javascripts %}{% endblock %}*/
/*     </body>*/
/* </html>*/
/* */
