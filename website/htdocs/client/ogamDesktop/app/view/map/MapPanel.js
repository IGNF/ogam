/**
 * This class defines the map view (definition + initializations of
 * the map and the toolbar).
 * 
 * TODO: An interface for GeoExt
 */
Ext.define('OgamDesktop.view.map.MapPanel', {
	extend: 'GeoExt.panel.Map',
	xtype: 'map-panel',
	width:'100%',
	height:'100%',
	layout: 'container',
	requires: [
		'GeoExt.tree.LayerContainer',
		'GeoExt.Action',
		'GeoExt.slider.Zoom',
		'GeoExt.slider.Tip',
		'OgamDesktop.view.map.LayersPanel',
		'OgamDesktop.view.map.LegendsPanel',
		'OgamDesktop.ux.form.field.GeometryField',
		'GeoExt.window.Popup'
	],
//	id: 'mappanel',
	// Mixins: ['OgamDesktop.view.interface.MapPanel'],
	
	
	/**
	 * Internationalization.
	 */
	popupTitle : 'Feature information',
	tabTip : 'The map with the request\'s results\'s location',
	layerPanelTitle : "Layers",
	layerPanelTabTip : "The layers's tree",
	legendPanelTitle : "Legends",
	legendPanelTabTip : "The layers's legends",
	panZoomBarControlTitle : "Zoom",
	navigationControlTitle : "Drag the map",
	invalidWKTMsg : "The feature cannot be displayed",
	zoomToFeaturesControlTitle : "Zoom to the features",
	zoomToResultControlTitle : "Zoom to the results",
	drawPointControlTitle : "Draw a point",
	drawLineControlTitle : "Draw a line",
	drawFeatureControlTitle : "Draw a polygon",
	modifyFeatureControlTitle : "Update the feature",
	tbarDeleteFeatureButtonTooltip : "Delete the feature",
	tbarPreviousButtonTooltip : "Previous Position",
	tbarNextButtonTooltip : "Next Position",
	zoomBoxInControlTitle : "Zoom in",
	zoomBoxOutControlTitle : "Zoom out",
	zoomToMaxExtentControlTitle : "Zoom to max extend",
	locationInfoControlTitle : "Get information about the result location",
	LayerSelectorEmptyTextValue: "Select Layer",
	selectFeatureControlTitle : "Select a feature from the selected layer",
	featureInfoControlTitle : "Get information about the selected layer",
	legalMentionsLinkText : "Legal Mentions",
	addGeomCriteriaButtonText : "Select an area",
	printMapButtonText : 'Print map',
	
	/**
	 * @cfg {Boolean} hideLayerSelector if true hide the layer
	 *      selector. The layer selector is required for the
	 *      following tools.
	 */
	hideLayerSelector : false,
	hideSnappingButton : false,
	hideGetFeatureButton : false,
	hideFeatureInfoButton : false,
	hideGeomCriteriaToolbarButton : false,
	
	/**
	 * @cfg {Boolean} hidePrintMapButton if true hide the Print
	 *      Map Button (defaults to false).
	 */
	hidePrintMapButton : false,
	
	/**
	 * @cfg {Boolean} isDrawingMap true to display the drawing
	 *      tools on the toolbar. (Default to false)
	 */
	isDrawingMap: false,
	
	/**
	 * @cfg {Integer} minZoomLevel The min zoom level for the
	 *      map (defaults to <tt>0</tt>)
	 */
	minZoomLevel : 0,
	
	/**
	 * @cfg {String} resultsBBox The results bounding box
	 *      (defaults to <tt>null</tt>)
	 */
	resultsBBox : null,
	
	/**
	 * The wkt format.
	 * 
	 * @type {OpenLayers.Format.WKT}
	 * @property wktFormat
	 */
	wktFormat : new OpenLayers.Format.WKT(),

	/**
	 * The WFS layer.
	 * 
	 * @type {OpenLayers.Layer.Vector}
	 * @property wfsLayer
	 */
	wfsLayer : null,
	
	/**
	 * The vector layer.
	 * 
	 * @type {OpenLayers.Layer.Vector}
	 * @property vectorLayer
	 */
	vectorLayer : null,

	/**
	 * The map object (linked to the map panel).
	 * 
	 * @type {OpenLayers.Map}
	 * @property map
	 */
	map : null,
	
	/**
	 * The zoom slider for the map.
	 */
	items: [{
		xtype: 'gx_zoomslider',
		itemId: 'zoomslider',
		vertical: true,
		height: 150,
		x: 18,
		y: 85,
		activeError: 'error',
		// The tip with the zoom level at hover
		plugins: Ext.create('GeoExt.slider.Tip', {
			position: 'top',
			getText: function(thumb) {
				return Ext.String.format(
						'<div><b>{0}</b></div>',
						thumb.slider.getZoom()
				);
			}
		})
	}],

	initComponent: function(){
		// Init the map
		this.map = this.initMap();
		
		// Init the Toolbar
		this.tbar = this.initToolbar();
		
		this.callParent(arguments);
	},

	/**
	 * Initialize the map
	 * 
	 * @param {String}
	 *			consultationMapDivId The consultation map div
	 *			id
	 * @hide
	 */
	initMap : function() {
		// Create the map config resolution array
		var resolutions = [];
		for ( var i = this.minZoomLevel; i < OgamDesktop.map.resolutions.length; i++) {
			resolutions.push(OgamDesktop.map.resolutions[i]);
		}

		// Tell OpenLayers where the control images are (remember the trailing slash)
		OpenLayers.ImgPath = Ext.manifest.OgamDesktop.OpenLayers.imgPath;

		// Create the map object
		var map = new OpenLayers.Map({
			'theme' : Ext.manifest.OgamDesktop.OpenLayers.theme, // Tell OpenLayers where the css default theme is
			'controls' : [],
			'resolutions' : resolutions,
			'numZoomLevels' : OgamDesktop.map.numZoomLevels,
			'projection' : OgamDesktop.map.projection,
			'units' : 'm',
			'tileSize' : new OpenLayers.Size(OgamDesktop.map.tilesize, OgamDesktop.map.tilesize),
			'maxExtent' : new OpenLayers.Bounds(OgamDesktop.map.x_min, OgamDesktop.map.y_min, OgamDesktop.map.x_max, OgamDesktop.map.y_max),
			'eventListeners' : {// Hide the legend if needed
				'changelayer' : function(o) {
					if (o.property === 'visibility') {
						this.fireEvent('onLayerVisibilityChange',o.layer);
					}
				},
				scope : this
			}
		});
		
		// Define the vector layer, used to draw polygons
		this.vectorLayer = new OpenLayers.Layer.Vector("Vector Layer", {
			printable : false, // This layers is never printed
			displayInLayerSwitcher : false
		});

		// Define the base layer of the map
		this.baseLayer = new OpenLayers.Layer("Empty baselayer", {
			isBaseLayer : true,
			printable : false, // This layers is never printed
			displayInLayerSwitcher : false
		});

		//
		// Set the minimum mandatory layer for the map :
		// 'afterinitmap' event is catched by the layer controller
		// that applies the 'setMapLayers' handlers
		// 
		this.fireEvent('afterinitmap', map, this.vectorLayer, this.baseLayer);

		//
		// Add the controls
		//
		map.addControl(new OpenLayers.Control.Navigation());

		// Mouse position
		map.addControl(new OpenLayers.Control.MousePosition({
			prefix : 'X: ',
			separator : ' - Y: ',
			suffix : this.projectionLabel,
			numDigits : 0,
			title : 'MousePosition'
		}));

		// Scale
		map.addControl(new OpenLayers.Control.Scale());
		map.addControl(new OpenLayers.Control.ScaleLine({
			title : 'ScaleLine',
			bottomOutUnits : '',
			bottomInUnits : ''
		}));

		// Zoom the map to the user country level
		map.setCenter(new OpenLayers.LonLat(OgamDesktop.map.x_center, OgamDesktop.map.y_center), OgamDesktop.map.defaultzoom);

		// For the GEOM criteria
		// TODO : Split this in another file
		if (this.isDrawingMap) {
			if (!Ext.isEmpty(this.maxFeatures)) {
				this.vectorLayer.preFeatureInsert = function(feature) {
					if (this.features.length > this.maxFeatures) {
						// remove first drawn feature:
						this.removeFeatures([ this.features[0] ]);
					}
				};
			}

			var sfDraw = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
				multiple : false,
				clickout : true,
				toggle : true,
				title : this.selectFeatureControlTitle
			});
			map.addControl(sfDraw);
			sfDraw.activate();

			if (this.featureWKT) {
				// display it with WKT format reader.
				var feature = this.wktFormat.read(this.featureWKT);
				if (feature) {
					this.vectorLayer.addFeatures([ feature ]);
				} else {
					alert(this.invalidWKTMsg);
				}
			}
		} else {
			// Add a control that display a tooltip on the
			// features
			var selectControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
				hover : true
			});
			map.addControl(selectControl);
			selectControl.activate();
		}
		return map;
	},

	/**
	 * Initialize the map toolbar
	 * 
	 * @hide
	 */
	initToolbar : function() {
		// Creation of the toolbar
		tbar = Ext.create('Ext.toolbar.Toolbar');
		// Link the toolbar to the map
		tbar.map = this.map;
		
		//
		// Drawing tools
		//
		if (this.isDrawingMap) {
			// Zoom to features button
			this.zoomToFeatureControl = new OpenLayers.Control.ZoomToFeatures(this.vectorLayer, {
				map : this.map,
				maxZoomLevel : 9,
				ratio : 1.05,
				autoActivate : false
			// otherwise will
			// desactivate after
			// first init
			});
			var zoomToFeatureAction = Ext.create('GeoExt.Action',{
				control : this.zoomToFeatureControl,
				iconCls : 'zoomstations',
				tooltip : this.zoomToFeaturesControlTitle
			});
			tbar.add(new Ext.button.Button(zoomToFeatureAction));

			// Draw point button
			if (!this.hideDrawPointButton) {
				var drawPointControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Point);

				var drawPointAction = Ext.create('GeoExt.Action',{
					control : drawPointControl,
					map : this.map,
					tooltip : this.drawPointControlTitle,
					toggleGroup : "editing",
					group : "drawControl",
					checked : false,
					iconCls : 'drawpoint'
				});
				tbar.add(new Ext.button.Button(drawPointAction));
			}

			// Draw line button
			if (!this.hideDrawLineButton) {
				var drawLineControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Path);

				var drawLineAction = Ext.create('GeoExt.Action',{
					control : drawLineControl,
					map : this.map,
					tooltip : this.drawLineControlTitle,
					toggleGroup : "editing",
					group : "drawControl",
					checked : false,
					iconCls : 'drawline'
				});
				tbar.add(new Ext.button.Button(drawLineAction));
			}

			// Draw polygon button
			var drawPolygonControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Polygon);

			var drawPolygonAction = Ext.create('GeoExt.Action',{
				control : drawPolygonControl,
				map : this.map,
				tooltip : this.drawFeatureControlTitle,
				toggleGroup : "drawControl",
				toggleGroup : "editing",
				checked : false,
				iconCls : 'drawpolygon'
			});
			tbar.add(new Ext.button.Button(drawPolygonAction));

			// Modify feature
			var modifyFeatureControl = new OpenLayers.Control.ModifyFeature(this.vectorLayer, {
				mode : OpenLayers.Control.ModifyFeature.RESHAPE
			});

			var modifyFeatureAction = Ext.create('GeoExt.Action',{
				control : modifyFeatureControl,
				map : this.map,
				tooltip : this.modifyFeatureControlTitle,
				toggleGroup : "editing",
				group : "drawControl",
				checked : false,
				iconCls : 'modifyfeature'
			});
			tbar.add(new Ext.button.Button(modifyFeatureAction));
			
			// Delete feature
			var deleteFeatureControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
				displayClass : 'olControlModifyFeature',
				onSelect : function(feature) {
					this.vectorLayer.destroyFeatures([ feature ]);
				},
				scope : this,
				type : OpenLayers.Control.TYPE_TOOL
			});

			var deleteFeatureAction = Ext.create('GeoExt.Action',{
				control : deleteFeatureControl,
				map : this.map,
				tooltip : this.tbarDeleteFeatureButtonTooltip,
				toggleGroup : "editing",
				group : "drawControl",
				checked : false,
				iconCls : 'deletefeature'
			});
			tbar.add(new Ext.button.Button(deleteFeatureAction));

			// Separator
			tbar.add('-');

		} else {
			if (!this.hideGeomCriteriaToolbarButton) {
				// Add geom criteria tool
				var addGeomCriteriaButton = new Ext.button.Button({
					text : this.addGeomCriteriaButtonText,
					iconCls : 'addgeomcriteria',
					handler : function(){
						this.fireEvent('addgeomcriteria');
					},
					scope:this
				});
				tbar.add(addGeomCriteriaButton);
			}
		}
		
		tbar.add(new Ext.toolbar.Spacer({flex: 1}))
		
		//
		// Layer Based Tools
		//
		if (!this.hideLayerSelector) {
			
			// Snapping tool
			this.snappingControl = new OpenLayers.Control.Snapping({
				layer : this.vectorLayer,
				targets : [ this.vectorLayer ],
				greedy : false
			});
			var snappingAction = Ext.create('GeoExt.Action',{
				control : this.snappingControl,
				map : this.map,
				tooltip : 'Snapping',
				toggleGroup : "snapping",  // his own independant group
				group : "LayerTools",
				checked : false,
				iconCls : 'snapping'
			});
			if (!this.hideSnappingButton) {
				tbar.add(new Ext.button.Button(snappingAction));
			}
			
			// Get Feature tool
			this.getFeatureControl = new OpenLayers.Control.GetFeatureControl({
				map : this.map
			});
			var getFeatureAction = Ext.create('GeoExt.Action',{
				control : this.getFeatureControl,
				map : this.map,
				tooltip : this.selectFeatureControlTitle,
				toggleGroup : "editing",
				group : "LayerTools",
				checked : false,
				iconCls : 'selectFeature'
			});
			var getFeatureButton = new Ext.button.Button(getFeatureAction);
			
			if (!this.hideGetFeatureButton) {
				tbar.add(getFeatureButton);
			}
			
			// Feature Info Tool
			this.featureInfoControl = new OpenLayers.Control.FeatureInfoControl({
				layerName : this.vectorLayer.name,
				map : this.map
			});
			
			var featureInfoAction = Ext.create('GeoExt.Action',{
				control : this.featureInfoControl,
				map : this.map,
				toggleGroup : "editing",
				group : "LayerTools",
				checked : false,
				tooltip : this.featureInfoControlTitle,
				iconCls : 'feature-info'
			});
			if (!this.hideFeatureInfoButton) {
				tbar.add(new Ext.button.Button(featureInfoAction));
			}

			// Layer selector
			this.layerSelector = Ext.create('Ext.form.field.ComboBox',{
				xtype: 'layerselector',
				editable: false,
				emptyText: this.LayerSelectorEmptyTextValue,
				triggerAction : 'all',
				store : Ext.create('Ext.data.Store',{
					autoLoad: true,
					proxy: {
						type: 'ajax',
						url: Ext.manifest.OgamDesktop.mapServiceUrl + 'ajaxgetvectorlayers',
						reader: {
							type: 'json',
							rootProperty: 'layerNames'
						}
					},
					fields : [ {
						name : 'code',
						mapping : 'code'
					}, {
						name : 'label',
						mapping : 'label'
					}, {
						name : 'url',
						mapping : 'url'
					}, {
						name : 'url_wms',
						mapping : 'url_wms'
					}]
				}),
				valueField : 'code',
				displayField : 'label'
			});
			tbar.add(this.layerSelector);
			
			// Add separator
			tbar.add('-');
		}		
		
		//
		// Navigation history : back and next
		//
		var historyControl = new OpenLayers.Control.NavigationHistory({});
		this.map.addControl(historyControl);
		historyControl.activate();

		var buttonPrevious = new Ext.button.Button({
			iconCls : 'back',
			tooltip : this.tbarPreviousButtonTooltip,
			disabled : true,
			handler : historyControl.previous.trigger
		});

		var buttonNext = new Ext.button.Button({
			iconCls : 'next',
			tooltip : this.tbarNextButtonTooltip,
			disabled : true,
			handler : historyControl.next.trigger
		});
		tbar.add(buttonPrevious);
		tbar.add(buttonNext);

		historyControl.previous.events.register("activate", buttonPrevious, function() {
			this.setDisabled(false);
		});

		historyControl.previous.events.register("deactivate", buttonPrevious, function() {
			this.setDisabled(true);
		});

		historyControl.next.events.register("activate", buttonNext, function() {
			this.setDisabled(false);
		});

		historyControl.next.events.register("deactivate", buttonNext, function() {
			this.setDisabled(true);
		});

		//
		// Get info on the feature
		//
		var locationInfoControl = new OpenLayers.Control.LocationInfoControl({
			layerName : OgamDesktop.map.featureinfo_typename,
			geoPanelId : this.id
		});

		var locationInfoAction = Ext.create('GeoExt.Action',{
			control : locationInfoControl,
			map : this.map,
			toggleGroup : "editing",
			group : "navControl",
			checked : false,
			tooltip : this.locationInfoControlTitle,
			iconCls : 'feature-info'
		});
		tbar.add(new Ext.button.Button(locationInfoAction));

		//
		// Navigation controls
		//

		// Zoom In
		var zoomInControl = new OpenLayers.Control.ZoomBox({
			title : this.zoomBoxInControlTitle
		});

		var zoomInAction = Ext.create('GeoExt.Action',{
			control : zoomInControl,
			map : this.map,
			tooltip : this.zoomBoxInControlTitle,
			toggleGroup : "editing",
			group : "navControl",
			checked : false,
			iconCls : 'zoomin'
		});
		tbar.add(new Ext.button.Button(zoomInAction));

		// Zoom Out
		var zoomOutControl = new OpenLayers.Control.ZoomBox({
			out : true,
			title : this.zoomBoxOutControlTitle
		});

		var zoomOutAction = Ext.create('GeoExt.Action',{
			control : zoomOutControl,
			map : this.map,
			tooltip : this.zoomBoxOutControlTitle,
			toggleGroup : "editing",
			group : "navControl",
			checked : false,
			iconCls : 'zoomout'
		});

		tbar.add(new Ext.button.Button(zoomOutAction));

		// Navigation
		var navigationControl = new OpenLayers.Control.Navigation({
			isDefault : true,
			mouseWheelOptions : {
				interval : 100
			}
		});

		var navigationAction =Ext.create('GeoExt.Action',{
			control : navigationControl,
			map : this.map,
			tooltip : this.navigationControlTitle,
			toggleGroup : "editing",
			group : "navControl",
			checked : true,
			iconCls : 'pan'
		});

		tbar.add(new Ext.button.Button(navigationAction));

		// Separator
		tbar.add('-');

		// Zoom to the Results
		var zoomToResultAction = Ext.create('GeoExt.Action',{
			scope : this,
			action: 'zoomtoresults',
			map : this.map,
			tooltip : this.zoomToResultControlTitle,
			checked : false,
			iconCls : 'zoomstations'
		});

		tbar.add(new Ext.button.Button(zoomToResultAction));

		// Zoom to max extend
		var zoomToMaxControl = new OpenLayers.Control.ZoomToMaxExtent({
			map : this.map,
			active : false
		});

		var zoomToMaxAction = Ext.create('GeoExt.Action',{
			control : zoomToMaxControl,
			map : this.map,
			tooltip : this.zoomToMaxExtentControlTitle,
			checked : false,
			iconCls : 'zoomfull'
		});

		tbar.add(new Ext.button.Button(zoomToMaxAction));
		
		// Print the displayed map
		if (!this.hidePrintMapButton) {
			var printMapButton = new Ext.button.Button({
				xtype : 'button',
				action: 'print',
				iconCls : 'printMap',
				text : this.printMapButtonText,
				scope : this
			});
			
			// Separator
			tbar.add('-');
			
			tbar.add(printMapButton);
		}

		return tbar;
	},

	/**
	 * Destroy additional objects on the (auto) destroy of component.
	 */
	onDestroy : function() {
		this.baseLayer = null;
		this.wktFormat = null;
		this.featureInfoControl = null;

		if (this.map) {
			this.map.destroy();
			this.map = null;
		}
		if (this.vectorLayer) {
			this.vectorLayer.destroy();
			this.vectorLayer = null;
		}
		if (this.wfsLayer) {
			this.wfsLayer.destroy();
			this.wfsLayer = null;
		}
		this.callParent(arguments);
	}
});