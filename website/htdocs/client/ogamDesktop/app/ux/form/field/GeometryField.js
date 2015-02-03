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
 * Provides a Geometry input field.
 * 
 * @class Genapp.form.GeometryField
 * @extends Ext.form.TriggerField
 * @constructor Create a new GeometryField
 * @param {Object}
 *            config
 * @xtype geometryfield
 */

Ext.define('OgamDesktop.ux.form.field.GeometryField',{
	extend: 'Ext.form.field.Text',
	xtype: 'geometryfield',

	/**
	 * Internationalization.
	 */
	fieldLabel : 'Location',

	/**
	 * @cfg {Boolean} hideWKT if true hide the WKT value.
	 */
	hideWKT : false,

	/**
	 * @cfg {String} triggerClass An additional CSS class used to style the
	 *      trigger button. The trigger will always get the class
	 *      'x-form-trigger' by default and triggerClass will be appended if
	 *      specified. (Default to 'x-form-map-trigger')
	 */
//	triggerWrapCls : 'x-form-map-trigger',
	/**
	 * @cfg {Boolean} editable false to prevent the user from typing text
	 *      directly into the field, the field will only respond to a click on
	 *      the trigger to set the value. (defaults to false).
	 */
	editable : false,

	/**
	 * The map panel.
	 * 
	 * @property mapPanel
	 * @type Genapp.GeoPanel
	 */
	mapPanel : null,
	/**
	 * The current state of the trigger.
	 * 
	 * @property isPressed
	 * @type {Boolean}
	 */
	isPressed : false,

	triggers:  {
		editMapTrigger: {
			cls: Ext.baseCSSPrefix + 'form-search-trigger',//'o-ux-form-field-tools-map-addgeomcriteria',
			handler: function(field, trigger, event) {
				if(field.isPressed){
					field.onUnPress();
				} else {
					field.onPress();
				}
			}
		} 
	},

	/**
	 * Function handling the press event
	 */
	onPress : function () {
		if(!this.isPressed){
			this.getTrigger('editMapTrigger').getEl().addCls('x-form-trigger-click');
			this.isPressed = true;
			this.fireEvent('geomCriteriaPress');
		}
	},

	/**
	 * Function handling the unPress event
	 */
	onUnPress : function () {
		if(this.isPressed){
			this.getTrigger('editMapTrigger').getEl().removeCls('x-form-trigger-click');
			this.isPressed = false;
			this.fireEvent('geomCriteriaUnpress');
		}
	},

	/**
	 * Initialise the component.
	 */
	initComponent : function() {
		var geometryFields = Ext.ComponentQuery.query('geometryfield');
		if (geometryFields.length) {
			geometryFields[0].destroy();
		}

		// Listen the submit button to unPress the trigger if need
		// TODO: find a better solution to do that register
		var submitButton = Ext.ComponentQuery.query('advanced-request button[action = submit]')[0];
		submitButton.on('onRequestFormSubmit', this.onUnPress, this);

		this.callParent(arguments);
	},

	/**
	 * On destroy of the geometry field, deactivate query tbar buttons
	 */
	onDestroy: function() {
		// Remove the listener on the submit button
		// TODO: find a better solution to do that register
		var submitButton = Ext.ComponentQuery.query('advanced-request button[action = submit]')[0];
		submitButton.un('onRequestFormSubmit', this.onUnPress, this);
		this.fireEvent('geomCriteriaDestroy');
		this.callParent(arguments);
	}
});