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

	/**
	 * The datastore
	 */
	store : null,

	/**
	 * Value field in the store
	 */
	valueField : 'id',

	/**
	 * Display field in the store,
	 */
	displayField : 'text',

	/**
	 * Manage multiple values,
	 */
	muliple : false,

	/**
	 * The field menu (displayed on a trigger click).
	 * 
	 * @property menu
	 * @type Genapp.form.menu.TreeMenu
	 */
	menu : null,

	// private
	initComponent : function() {

		// Create the datastore
		this.store = new Ext.data.ArrayStore({
			// store configs
			autoDestroy : true,
			// reader configs
			idIndex : 0,
			fields : [ 'id', 'text' ]
		});

		// Set the submit name of the field
		this.hiddenName = this.name;

		// Add the default value to the store
		this.getStore().add([ new Ext.data.Record({
			id : this.value,
			text : this.valueLabel
		}) ]);

		// Set the current value to the default value
		this.setValue(this.value);

		Genapp.form.TreeField.superclass.initComponent.call(this);
	},

	/**
	 * The function that handle the trigger's click event. Implements the
	 * default empty TriggerField.onTriggerClick function to display the
	 * TreePicker
	 * 
	 * @method onTriggerClick
	 * @hide
	 */
	onTriggerClick : function() {
		if (this.disabled) {
			return;
		}
		if (!this.menu) {
			this.menu = new Genapp.form.menu.TreeMenu({
				hideOnClick : false,
				hideValidationButton : this.hideValidationButton,
				dataUrl : this.dataUrl,
				multiple : this.multiple
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
	onSelect : function(selectedValue) {
		this.menu.hide();
		if (selectedValue !== null) {

			if (selectedValue instanceof Array) {
				var valueId = [];
				for ( var i = 0; i < selectedValue.length; i++) {
					var attributes = selectedValue[i].attributes;
					this.getStore().add([ new Ext.data.Record({
						id : attributes.id,
						text : attributes.text
					}) ]);
					valueId.push(attributes.id);
				}
				this.setValue(valueId);
			} else {
				this.getStore().add([ new Ext.data.Record({
					id : selectedValue.attributes.id,
					text : selectedValue.attributes.text
				}) ]);
				this.setValue(selectedValue.attributes.id);
			}
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