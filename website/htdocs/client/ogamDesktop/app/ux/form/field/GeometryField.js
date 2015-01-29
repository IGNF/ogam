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

	triggers:  {
		foo: {
			cls: 'o-ux-form-field-tools-map-addgeomcriteria',
			handler: function() {
				this.fireEvent('geomCriteriaClick');
			}
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
		this.callParent(arguments);		
	},

	/**
	 * On destroy of the geometry field, deactivate query tbar buttons
	 */
	onDestroy: function() {
		var geometryFields = Ext.ComponentQuery.query('geometryfield');
		var drawingTbar = Ext.ComponentQuery.query('map-panel toolbar buttongroup');
		if (drawingTbar.length) {
			drawingTbar[0].setVisible(false);
		}
		var drawPolygonButton = Ext.ComponentQuery.query('map-panel toolbar button[iconCls = drawpolygon]');
		if (drawPolygonButton.length) {
			drawPolygonButton[0].toggle(false);
		}
		var modifyButton = Ext.ComponentQuery.query('map-panel toolbar button[iconCls = modifyfeature]');
		if (modifyButton.length) {
			modifyButton[0].toggle(false);
		}
		var deleteFeatureButton = Ext.ComponentQuery.query('map-panel toolbar button[iconCls = deletefeature]');
		if (deleteFeatureButton.length) {
			deleteFeatureButton[0].toggle(false);
		}
		var mapPanel = Ext.ComponentQuery.query('map-panel')[0];
		if (mapPanel.vectorLayer) {
			mapPanel.vectorLayer.removeAllFeatures();
		}
		this.callParent(arguments);
	}
});