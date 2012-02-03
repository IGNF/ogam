/**
 * A menu containing a {@link Genapp.form.picker.TreePicker} Component.
 * 
 * @class Genapp.form.menu.TreeMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new TreeMenu
 * @param {Object}
 *            config
 * @xtype treemenu
 */

Ext.namespace('Genapp.form.menu');

Genapp.form.menu.TreeMenu = Ext.extend(Ext.menu.Menu, {
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
	 * Manage multiple values,
	 */
	multiple : false,

	/**
	 * The {@link Genapp.form.picker.TreePicker} instance for this TreeMenu
	 * 
	 * @property treePicker
	 * @type Genapp.form.picker.TreePicker
	 */
	treePicker : null,

	// private
	initComponent : function() {

		// Initialise the Tree picker
		this.treePicker = new Genapp.form.picker.TreePicker(this.initialConfig);
		this.treePicker.multiple = this.multiple;

		Ext.apply(this, {
			plain : true,
			showSeparator : false,
			items : [ this.treePicker ]
		});
		Genapp.form.menu.TreeMenu.superclass.initComponent.call(this);
		this.relayEvents(this.treePicker, [ "select" ]);
	}
});
Ext.reg('treemenu', Genapp.form.menu.TreeMenu);