/**
 * A menu containing a {@link Genapp.form.picker.TaxrefPicker} Component.
 *
 * @class Genapp.form.menu.TaxrefMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new TaxrefMenu
 * @param {Object} config
 * @xtype taxrefmenu
 */

Ext.namespace('Genapp.form.menu');

Genapp.form.menu.TaxrefMenu = Ext.extend( Genapp.form.menu.TreeMenu, {

    // private
    initComponent: function(){
        /**
         * The {@link Genapp.form.picker.TaxrefPicker} instance for this TaxrefMenu
         * @property rangePicker
         * @type Genapp.form.picker.TaxrefPicker
         */
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: [this.taxrefPicker = new Genapp.form.picker.TaxrefPicker(this.initialConfig)]
        });
        Genapp.form.menu.TaxrefMenu.superclass.initComponent.call(this);
        this.relayEvents(this.taxrefPicker, ["select"]);
    }
});
Ext.reg('taxrefmenu', Genapp.form.menu.TaxrefMenu);