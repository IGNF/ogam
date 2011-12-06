/**
 * Provides a tree field
 * 
 * @class Genapp.form.TreeField
 * @extends Ext.form.TriggerField
 * @constructor Create a new TreeField
 * @param {Object}
 *            config
 * @xtype treefield
 */

Ext.namespace('Genapp.form');

Genapp.form.TreeField = Ext.extend(Ext.form.ComboBox, {
	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : false,
	store : new Ext.data.ArrayStore({
		// store configs
		autoDestroy : true,
		// reader configs
		idIndex : 0,
		fields : [ 'id', 'text' ]
	}),
	valueField : 'id',
	displayField : 'text',

	// private
	initComponent : function() {
		this.hiddenName = this.name;
		this.getStore().add([ new Ext.data.Record({
            id : this.value,
            text : this.valueLabel
        }) ]);
        this.setValue(this.value);
		Genapp.form.TreeField.superclass.initComponent.call(this);
	},

	/**
	 * The function that handle the trigger's click event. Implements the
	 * default empty TriggerField.onTriggerClick function to display the
	 * NumberRangePicker
	 * 
	 * @method onTriggerClick
	 * @hide
	 */
	onTriggerClick : function() {
		if (this.disabled) {
			return;
		}
		if (!this.menu) {
			/**
			 * The field menu (displayed on a trigger click).
			 * 
			 * @property menu
			 * @type Genapp.form.menu.TreeMenu
			 */
			this.menu = new Genapp.form.menu.TreeMenu({
				hideOnClick : false,
				hideValidationButton : this.hideValidationButton,
				dataUrl : this.dataUrl
			});
		}
		this.onFocus();

		this.menu.show(this.el, "tl-bl?");
		this.menuEvents('on');
	},

	// private
	menuEvents : function(method) {
		this.menu[method]('select', this.onSelect, this);
		this.menu[method]('hide', this.onMenuHide, this);
		this.menu[method]('show', this.onFocus, this);
	},

	// private
	onSelect : function(value) {
		this.menu.hide();
		if (value !== null) {
			this.getStore().add([ new Ext.data.Record({
				id : value.id,
				text : value.text
			}) ]);
			this.setValue(value.id);
		}
	},

	// private
	onMenuHide : function() {
		this.focus(false, 60);
		this.menuEvents('un');
	},

	// private
	// Provides logic to override the default TriggerField.validateBlur which
	// just returns true
	validateBlur : function() {
		return !this.menu || !this.menu.isVisible();
	},

	// private
	onDestroy : function() {
		Ext.destroy(this.menu, this.wrap);
		Genapp.form.TreeField.superclass.onDestroy.call(this);
	}

});
Ext.reg('treefield', Genapp.form.TreeField);