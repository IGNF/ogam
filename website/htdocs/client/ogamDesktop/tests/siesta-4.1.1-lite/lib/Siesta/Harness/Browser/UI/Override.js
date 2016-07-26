/*

Siesta 4.1.1
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
// @define Siesta.Harness.Browser.UI.Override
// @require Ext.Template
// @require Ext.XTemplate
// @require Ext.data.Connection
// @require Ext.util.XTemplateCompiler
// @require Ext.data.schema.Schema

// Exceptions happening in grid cell rendering should not be silenced
Ext.XTemplate.override({
    strict   : true
});


// Override to allow report to fetch the data from file system
// http://www.sencha.com/forum/showthread.php?10621-Why-Ajax-can-not-get-local-file-while-prototypejs-can&s=3ce6b6ad58be217b173c3b31b8f0ad5d
Ext.data.Connection.override({

    parseStatus : function (status) {
        var result = this.callOverridden(arguments);
        if (status === 0) {
            result.success = true;
        }
        return result;
    }
});

// workaround for: https://www.sencha.com/forum/showthread.php?311863-6.0.2-Ext.util.XTemplateCompiler-leaks-global-in-minified-version&p=1138706
!function () {
    Ext.util.XTemplateCompiler.prototype.useEval = false;
    Ext.Template.prototype.useEval = false;
    
    window.$ = window.jQuery;
    
    var proxy = Ext.data.schema.Schema.get('default').getProxy()
    
    proxy.apply = proxy.compile(proxy.template)
}()