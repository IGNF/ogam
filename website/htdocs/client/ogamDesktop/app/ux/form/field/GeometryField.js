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
	/**
	 * Internationalization.
	 */
	fieldLabel : 'Location',
	mapWindowTitle : 'Draw the search zone on the map :',
	mapWindowValidateButtonText : 'Validate',
	mapWindowValidateAndSearchButtonText : 'Validate and search',
	mapWindowCancelButtonText : 'Cancel',
	
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
	triggerClass : 'x-form-map-trigger',
	/**
	 * @cfg {Boolean} editable false to prevent the user from typing text
	 *      directly into the field, the field will only respond to a click on
	 *      the trigger to set the value. (defaults to false).
	 */
	editable : false,
	/**
	 * @cfg {Boolean} hideMapDetails if true hide the details button in map
	 *      toolbar (defaults to false).
	 */
	hideMapDetails : true,
	/**
	 * @cfg {Boolean} hideSearchButton if true hide the "Validate and Search"
	 *      button.
	 */
	hideSearchButton : false,
	/**
	 * @cfg {Boolean} hideDrawPointButton Hide the "Draw Point" button
	 */
	hideDrawPointButton : false,
	/**
	 * @cfg {Boolean} hideDrawLineButton Hide the "Draw Line" button
	 */
	hideDrawLineButton : false,
   /**
     * @cfg {Boolean} hideLayerSelector Hide the layer selector
     */
    hideLayerSelector : false,
    /**
     * @cfg {Boolean} hideSnappingButton Hide the "Snapping" button
     */
    hideSnappingButton : false,
    /**
     * @cfg {Boolean} hideGetFeatureButton Hide the "Get Feature" button
     */
    hideGetFeatureButton : false,
    /**
     * @cfg {Boolean} hideFeatureInfoButton Hide the "Feature Info" button
     */
    hideFeatureInfoButton : false,
    /**
     * @cfg {Boolean} hidePrintMapButton Hide the "Print Map" button
     */
    hidePrintMapButton : true,
	/**
	 * @cfg {Boolean} maximizable True to display the 'maximize' tool button and
	 *      allow the user to maximize the window, false to hide the button and
	 *      disallow maximizing the window (defaults to true). Note that when a
	 *      window is maximized, the tool button will automatically change to a
	 *      'restore' button with the appropriate behavior already built-in that
	 *      will restore the window to its previous size.
	 */
	mapWindowMaximizable : true,
	/**
	 * @cfg {Boolean} maximized True to initially display the window in a
	 *      maximized state. (Defaults to false).
	 */
	mapWindowMaximized : false,
	/**
	 * @cfg {Number} height The height of the map window in pixels (defaults to
	 *      500). Note to express this dimension as a percentage or offset see
	 *      {@link Ext.Component#anchor}.
	 */
	mapWindowHeight : 500,
	/**
	 * @cfg {Number} width The width of the map window in pixels (defaults to
	 *      850). Note to express this dimension as a percentage or offset see
	 *      {@link Ext.Component#anchor}.
	 */
	mapWindowWidth : 850,
	/**
	 * @cfg {Integer} mapWindowMinZoomLevel The min zoom level for the map
	 *      (defaults to <tt>0</tt>)
	 */
	mapWindowMinZoomLevel : 0,
	/**
	 * @cfg {Boolean} zoomToFeatureOnInit zoom to features extend on init.
	 */
	zoomToFeatureOnInit : false,
    /**
     * @cfg {Boolean} enableResultLayers enable the result layers.
     */
	enableResultLayers : true,
    /**
     * @cfg {Boolean} setZoomAndCenter set the zoom and the center.
     */
	setZoomAndCenter : false,

	/**
	 * The map panel.
	 * 
	 * @property mapPanel
	 * @type Genapp.GeoPanel
	 */
	mapPanel : null,

	/**
	 * The map window.
	 * 
	 * @property mapWindow
	 * @type Ext.Window
	 */
	mapWindow : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {
		this.callParent(arguments);

		if (!this.hideTrigger) {
			this.onTriggerClick = function() {
				if (this.disabled) {
					return;
				}
				if (!(this.mapWindow instanceof Ext.Window)) {
					this.openMap(this);
				} else {
					this.mapWindow.show();
				}
			};
		}		
	},

	/**
	 * Open the map
	 */
	openMap : function() {
		if (!this.mapWindow) {

			// Define the GeoPanel
			this.mapPanel = Ext.create('OgamDesktop.view.map.MapPanel', {
				title : '',
				isDrawingMap : true,
				featureWKT : this.getRawValue(),
				hideMapDetails : this.hideMapDetails,
				hideDrawPointButton : this.hideDrawPointButton,
				hideDrawLineButton : this.hideDrawLineButton,
				hideLayerSelector : this.hideLayerSelector,
				hideSnappingButton : this.hideSnappingButton,
				hideGetFeatureButton : this.hideGetFeatureButton,
				hideFeatureInfoButton : this.hideFeatureInfoButton,
				minZoomLevel : this.mapWindowMinZoomLevel,
				hidePrintMapButton: this.hidePrintMapButton,
				zoomToFeatureOnInit : this.zoomToFeatureOnInit
			});

			// Define the buttons
			var buttons = [ {
				text : this.mapWindowCancelButtonText,
				handler : function() {
					this.mapWindow.destroy();
				},
				scope : this
			}, {
				text : this.mapWindowValidateButtonText,
				handler : this.onWindowValidate,
				scope : this
			} ];

			// Add the "Validate and Search" button
			if (!this.hideSearchButton) {
				buttons.push({
					text : this.mapWindowValidateAndSearchButtonText,
					handler : Ext.Function.pass(this.onWindowValidate, this, [ true ])
				});
			}

			// Define the Window
			this.mapWindow = new Ext.Window({
				layout : 'fit',
				maximizable : this.mapWindowMaximizable,
				maximized : this.mapWindowMaximized,
				title : this.mapWindowTitle,
				width : this.mapWindowWidth,
				height : this.mapWindowHeight,
				closeAction : 'destroy',
				draggable : true,
				resizable : true,
				modal : true,
				scope : true,
				items : this.mapPanel,
				buttons : buttons
			});

			// because Ext does not clean everything (mapWindow still instanceof
			// Ext.Window):
			this.mapWindow.on('destroy', function() {
			    delete this.mapPanel;
				delete this.mapWindow;
				if (this.submitRequest === true) {
					Ext.getCmp('consultation_panel').submitRequest();
					this.submitRequest = false;
				}
			}, this);

			// TODO : Remove dependency on consultationPanel
			// Set the zoom and the center
			if(this.setZoomAndCenter){
    			this.mapPanel.on('treerendered', function(mapPanel) {
    				var consultationPanel = Ext.getCmp('consultation_panel');
    				mapPanel.map.setCenter(consultationPanel.geoPanel.map.getCenter());
    				mapPanel.map.zoomTo(consultationPanel.geoPanel.map.getZoom() - this.mapWindowMinZoomLevel);
    				if(this.enableResultLayers){
    				    mapPanel.enableLayersAndLegends(mapPanel.layersActivation['request'], true, true);
    				}
    			}, this);
			}

			// Enable the result layers
			if(this.enableResultLayers && !this.setZoomAndCenter){
			    this.mapPanel.on('treerendered', function(mapPanel) {
			        mapPanel.enableLayersAndLegends(mapPanel.layersActivation['request'], true, true);
			    });
			}

		}
		this.mapWindow.show();
	},

	/**
	 * Function called when the window validate button is pressed
	 * 
	 * @param {Boolean}
	 *            search True to submit the request
	 */
	onWindowValidate : function(search) {
		var value = this.mapPanel.vectorLayer.features.length ? this.mapPanel.wktFormat.write(this.mapPanel.vectorLayer.features[0]) : '';
		this.setValue(value);
		if (search === true) {
			this.submitRequest = true;
		}
		this.mapWindow.destroy();
		if (this.hideWKT) {
			this.el.setStyle('visibility', 'hidden');
		} else {
			this.el.highlight();
		}
	}
});