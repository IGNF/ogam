/**
 * A menu containing a {@link Genapp.form.picker.NumberRangePicker} Component.
 * 
 * @class Genapp.form.menu.NumberRangeMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new NumberRangeMenu
 * @param {Object}
 *            config
 * @xtype numberrangemenu
 */

Ext.namespace('Genapp.form.menu');

Genapp.form.menu.NumberRangeMenu = Ext.extend(Ext.menu.Menu, {
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
	cls : 'x-number-range-menu',

	/**
	 * The {@link Genapp.form.picker.NumberRangePicker} instance for this
	 * NumberRangeMenu
	 * 
	 * @property rangePicker
	 * @type Genapp.form.picker.NumberRangePicker
	 */
	rangePicker : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Initialise the range picker
		this.rangePicker = new Genapp.form.picker.NumberRangePicker(this.initialConfig);

		Ext.apply(this, {
			plain : true,
			showSeparator : false,
			items : [ this.rangePicker ]
		});
		Genapp.form.menu.NumberRangeMenu.superclass.initComponent.call(this);
		this.relayEvents(this.rangePicker, [ "select" ]);
	}
});
Ext.reg('numberrangemenu', Genapp.form.menu.NumberRangeMenu);