/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

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
		this.taxrefPicker.multiple = this.multiple;

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