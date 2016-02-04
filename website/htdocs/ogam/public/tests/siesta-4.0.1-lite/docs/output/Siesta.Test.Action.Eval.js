Ext.data.JsonP.Siesta_Test_Action_Eval({"tagname":"class","name":"Siesta.Test.Action.Eval","autodetected":{},"files":[{"filename":"Eval.js","href":"Eval.html#Siesta-Test-Action-Eval"}],"extends":"Siesta.Test.Action","members":[{"name":"desc","tagname":"cfg","owner":"Siesta.Test.Action","id":"cfg-desc","meta":{}},{"name":"options","tagname":"cfg","owner":"Siesta.Test.Action.Eval","id":"cfg-options","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-Siesta.Test.Action.Eval","short_doc":"This action can be included in the t.chain steps only with a plain string. ...","component":false,"superclasses":["Siesta.Test.Action"],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/Siesta.Test.Action' rel='Siesta.Test.Action' class='docClass'>Siesta.Test.Action</a><div class='subclass '><strong>Siesta.Test.Action.Eval</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/Eval.html#Siesta-Test-Action-Eval' target='_blank'>Eval.js</a></div></pre><div class='doc-contents'><p>This action can be included in the <code>t.chain</code> steps only with a plain string. Siesta will examine the passed string,\nand call an apropriate method of the test class. String should have the following format:</p>\n\n<pre><code>methodName(params) \n</code></pre>\n\n<p>Method name is anything until the first parenthes. Method name may have an optional prefix <code>t.</code>.\nEverything in between of outermost parentheses will be treated as parameters for method call. For example:</p>\n\n<pre><code>t.chain(\n    // string should look like a usual method call, \n    // but arguments can't reference any variables\n    // strings should be quoted, to include quoting symbol in string use double slash: \\\\\n    't.click(\"combo[type=some\\\\\"Type] =&gt; .x-form-trigger\")',\n\n    // leading \"t.\" is optional, but quoting is not\n    'waitForComponent(\"combo[type=someType]\")',\n\n    // JSON objects are ok, but they should be a valid JSON - ie object properties should be quoted\n    'myClick([ 10, 10 ], { \"foo\" : \"bar\" })',\n)\n</code></pre>\n\n<p><strong>Note</strong> You can pass the JSON objects as arguments, but they should be serialized as valid JSON - ie object properties should be quoted.</p>\n\n<p><strong>Note</strong> A callback for next step in chain will be always appended to provided parameters. Make sure it is placed in a correct spot!\nFor example if method signature is <code>t.someMethod(param1, param2, callback)</code> and you are calling this method as:</p>\n\n<pre><code>t.chain(\n    `t.someMethod(\"text\")`\n)\n</code></pre>\n\n<p>it will fail - callback will be provided in place of <code>param2</code>. Instead call it as:</p>\n\n<pre><code>t.chain(\n    `t.someMethod(\"text\", null)`\n)\n</code></pre>\n\n<p>This action may save you few keystrokes, when you need to perform some action with static arguments (known prior the action).</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-desc' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/Siesta.Test.Action' rel='Siesta.Test.Action' class='defined-in docClass'>Siesta.Test.Action</a><br/><a href='source/Action4.html#Siesta-Test-Action-cfg-desc' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Siesta.Test.Action-cfg-desc' class='name expandable'>desc</a> : String<span class=\"signature\"></span></div><div class='description'><div class='short'>When provided, once step is completed, a passing assertion with this text will be added to a test. ...</div><div class='long'><p>When provided, once step is completed, a passing assertion with this text will be added to a test.\nThis configuration option can be useful to indicate the progress of \"wait\" steps</p>\n</div></div></div><div id='cfg-options' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Siesta.Test.Action.Eval'>Siesta.Test.Action.Eval</span><br/><a href='source/Eval.html#Siesta-Test-Action-Eval-cfg-options' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Siesta.Test.Action.Eval-cfg-options' class='name expandable'>options</a> : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>Any options that will be used when simulating the event. ...</div><div class='long'><p>Any options that will be used when simulating the event. For information about possible\nconfig options, please see: <a href=\"https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent\">https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent</a></p>\n</div></div></div></div></div></div></div>","meta":{}});