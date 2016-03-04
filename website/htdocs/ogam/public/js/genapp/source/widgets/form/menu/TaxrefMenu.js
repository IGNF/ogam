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

Genapp.form.menu.TaxrefMenu = Ext.extend(Ext.menu.Menu, {
	
	/**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to 'auto'.
	 *      Note: The layout 'menu' doesn't work on FF3.5, the rangePicker items
	 *      are not rendered because the rangePicker is hidden... But it's
	 *      working on IE ???
	 */
	layout : 'auto',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-number-range-menu'). This can be
	 *      useful for adding customized styles to the component or any of its
	 *      children using standard CSS rules.
	 */
	cls : 'x-tree-menu',

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