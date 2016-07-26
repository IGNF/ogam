/*

Siesta 4.1.1
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.TestGridController', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.testgrid',

    requires        : [
        'Siesta.Harness.Browser.UI.AboutWindow'
    ],

    control : {
        '#tool-menu [option]' : { click : 'onMenuItemClick' },

        '[actionName^=run]' : { click : 'onRunBtnClicked' },
        '[actionName=show-coverage]' : { click : 'onShowCoverageReport' },

        '#aboutSiesta' : {
            click : 'onAboutSiesta'
        }
    },


    // Toolbar actions
    onShowCoverageReport : function () {
        this.getView().fireEvent('showcoverageinfo', this);
    },

    onRunBtnClicked : function (btn) {
        this.getView().fireEvent('buttonclick', this, btn, btn.actionName);
    },
    // EOF Toolbar actions



    // Menu actions
    onMenuItemClick : function (menuitem) {
        this.getView().fireEvent('optionchange', this, menuitem.option, menuitem.checked);
    },

    onAboutSiesta : function () {
        new Siesta.Harness.Browser.UI.AboutWindow().show();
    }
    // EOF Menu actions
})
