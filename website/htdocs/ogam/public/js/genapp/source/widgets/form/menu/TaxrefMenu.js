/**
 * A menu containing a {@link Genapp.form.picker.TaxrefPicker} Component.
 * 
 * @class Genapp.form.menu.TaxrefMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new TaxrefMenu
 * @param {Object}
 *            config
 * @xtype taxrefmenu
 */

Ext.namespace('Genapp.form.menu');

Genapp.form.menu.TaxrefMenu = Ext.extend(Genapp.form.menu.TreeMenu, {

	/**
	 * The {@link Genapp.form.picker.TaxrefPicker} instance for this TaxrefMenu.
	 * 
	 * @property taxrefPicker
	 * @type Genapp.form.picker.TaxrefPicker
	 */
	taxrefPicker : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Initialise the picker linked to this menu
		this.taxrefPicker = new Genapp.form.picker.TaxrefPicker(this.initialConfig);
		this.treePicker.multiple = this.multiple;

		Ext.apply(this, {
			plain : true,
			showSeparator : false,
			items : [ this.taxrefPicker ]
		});
		Genapp.form.menu.TaxrefMenu.superclass.initComponent.call(this);
		this.relayEvents(this.taxrefPicker, [ "select" ]);
	}
});
Ext.reg('taxrefmenu', Genapp.form.menu.TaxrefMenu);