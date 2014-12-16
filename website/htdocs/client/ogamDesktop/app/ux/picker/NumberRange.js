/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * Â© European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

/**
 * Simple number range picker class.
 * 
 * @class Genapp.form.picker.NumberRangePicker
 * @extends Ext.Panel
 * @constructor Create a new NumberRangePicker
 * @param {Object}
 *            config The config object
 * @xtype numberrangepicker
 */


Ext.define('OgamDesktop.ux.picker.NumberRange', {
    extend:'Ext.Panel',//TODO a component with tpl or menu may be lighter ?
    alias: 'widget.numberrangepicker',
	alternateClassName:['OgamDesktop.ux.picker.NumberRangePicker'],
	requires:['OgamDesktop.ux.form.field.TwinNumberField'],
	/**
	 * Internationalization.
	 */
	//<locale>
	minFieldLabel : "Min",
	maxFieldLabel : "Max",
	okButtonText : "ok",
	//</locale>
	/**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to 'form'.
	 */
	layout : 'form',
	/**
	 * @cfg {Number} height The height of this component in pixels (defaults to
	 *      59).
	 */
	height : 59,
	/**
	 * @cfg {Number} width The width of this component in pixels (defaults to
	 *      194).
	 */
	width : 194,
	/**
	 * @cfg {Number} labelWidth The width of labels in pixels. This property
	 *      cascades to child containers and can be overridden on any child
	 *      container (e.g., a fieldset can specify a different labelWidth for
	 *      its fields) (defaults to 30). See
	 *      {@link Ext.form.FormPanel#labelWidth} also.
	 */
	labelWidth : 30,
	/**
	 * @cfg {String} buttonAlign The alignment of any {@link #buttons} added to
	 *      this panel. Valid values are 'right', 'left' and 'center' (defaults
	 *      to 'center').
	 */
	buttonAlign : 'center',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-menu-number-range-item'). This
	 *      can be useful for adding customized styles to the component or any
	 *      of its children using standard CSS rules.
	 */
	cls : 'x-menu-number-range-item',

	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : true,

	/**
	 * The min field.
	 * 
	 * @property minField
	 * @type Genapp.form.TwinNumberField
	 */
	minField : null,

	/**
	 * The max field.
	 * 
	 * @property maxField
	 * @type Genapp.form.TwinNumberField
	 */
	maxField : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Initialise the fields
		this.minField = new OgamDesktop.ux.form.field.TwinNumberField({
			fieldLabel : this.minFieldLabel
		});
		this.maxField = new OgamDesktop.ux.form.field.TwinNumberField({
			fieldLabel : this.maxFieldLabel
		});

		Ext.apply(this, {
			items : [ this.minField, this.maxField ]
		});
		if (!this.hideValidationButton) {
			this.buttons =[{
				xtype:'button',
				itemId:'okButton',
				text : this.okButtonText,
				handler : Ext.Function.bind(this.onOkButtonPress,this)
			} ];
			this.height = this.height + 28;
		}

		this.callParent();
	},

	//extended
	initEvents:function() {
		this.callParent();
		/**
		 * key nav in the picker
		 * enter & tab are listen to
		 * 
		 * @property popupkeyNav
		 * @type Ext.util.KeyNav
		 * @private
		 */
		this.popupkeyNav = new Ext.util.KeyNav({
			target:this.el,
			enter : Ext.Function.bind(this.onOkButtonPress,this, [ null, true ]),
			tab :{
				fn: this.onTabButtonPress,
				scope : this
			},
			scope : this
		});
	},
	
	// private
	onOkButtonPress : function(button, state) {
		if (state) {
			this.fireEvent('select', this, {
				minValue : this.minField.getValue(),
				maxValue : this.maxField.getValue()
			});
		}
	},

	// private
	onTabButtonPress : function(event) {
		var cpm = Ext.get(event.target).component;
		var index = this.items.findIndex('id', cpm.id) + 1;

		if (index >= this.items.getCount()) {
			index = 0;
		}
		this.items.getAt(index).focus(true);
	},
	
	beforeDestroy:function(){
		me.callParent();
		Ext.destroy(this.popupkeyNav);
	 }
});