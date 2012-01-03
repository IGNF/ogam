/**
 * Provides a taxref field.
 * 
 * A taxref is a specialiced kind of tree used for taxonony.
 * 
 * @class Genapp.form.TaxrefField
 * @extends Ext.form.TreeField
 * @constructor Create a new TaxrefField
 * @param {Object}
 *            config
 * @xtype treefield
 */

Ext.namespace('Genapp.form');

Genapp.form.TaxrefField = Ext.extend(Genapp.form.TreeField, {
	

	// private
	initComponent : function() {
		Genapp.form.TaxrefField.superclass.initComponent.call(this);
	},


	// private
	onDestroy : function() {
		Ext.destroy(this.menu, this.wrap);
		Genapp.form.TaxrefField.superclass.onDestroy.call(this);
	}

});
Ext.reg('taxreffield', Genapp.form.TaxrefField);