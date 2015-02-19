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
		'GeoExt.window.Popup',
		'Ext.container.ButtonGroup'
	],
	// Mixins: ['OgamDesktop.view.interface.MapPanel'],

	/**
	 * Internationalization.
	 */
	popupTitle : 'Feature information',
	tabTip : 'The map with the request\'s results\'s location',
//	layerPanelTitle : "Layers",
//	layerPanelTabTip : "The layers's tree",
//	legendPanelTitle : "Legends",
//	legendPanelTabTip : "The layers's legends",
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
	snappingControlTitle:'Snapping',
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
	hideDrawPointButton: true,
	hideDrawLineButton: true,
//	hideGeomCriteriaToolbarButton : true,
	
	/**
	 * @cfg {Boolean} autoZoomOnResultsFeatures True to zoom
	 *      automatically on the results features
	 */
	autoZoomOnResultsFeatures : true,
	
	/**
	 * @cfg {Boolean} hidePrintMapButton if true hide the Print
	 *      Map Button (defaults to false).
	 */
	hidePrintMapButton : false,
	
	/**
	 * @cfg {Boolean} isDrawingMap true to display the drawing
	 *      tools on the toolbar. (Default to false)
	 */
	isDrawingMap: true,
	
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
	 * @cfg {Object} layersActivation A object containing few
	 *      arrays of layers ordered by activation type
	 *      (defaults to <tt>{}</tt>) {
	 *      'request':[resultLayer, resultLayer0, resultLayer1]
	 */
	layersActivation : {},

	/**
	 * The list of OL layers.
	 * 
	 * @property layersList
	 * @type array of OpenLayers.Layer
	 */
	layersList: [],
	
	/**
	 * The 'LayerService' store records.
	 * @private
	 * @property services
	 * @type array
	 */
	services: [],
	
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
	vector: null,
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
			'zoomMethod': null,
			'units' : 'm',
			'tileSize' : new OpenLayers.Size(OgamDesktop.map.tilesize, OgamDesktop.map.tilesize),
			'maxExtent' : new OpenLayers.Bounds(OgamDesktop.map.x_min, OgamDesktop.map.y_min, OgamDesktop.map.x_max, OgamDesktop.map.y_max),
			'eventListeners' : {// Hide the legend if needed
				'changelayer' : function(o) {
					if (o.property === 'visibility') {
						this.fireEvent('onLayerVisibilityChange',o.layer);
					}
				},'getFeature' : function(evt) {
					this.fireEvent('getFeature',evt);
				},
				scope : this
			}
		});
		
		// Define the vector layer, used to draw polygons
		this.vectorLayer = new OpenLayers.Layer.Vector("Vector Layer", {
			printable : false, // This layers is never printed
			displayInLayerSwitcher : false
		});

		// Define the vector layer, used to display result details
		this.vector = new OpenLayers.Layer.Vector("Result details", {
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
		this.fireEvent('afterinitmap', map, this.vectorLayer, this.vector, this.baseLayer);

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
		
		drawingBtnGroup = Ext.create('Ext.container.ButtonGroup', {
			hidden: true,
			action: 'drawing',
			defaults: {
				iconAlign:'top'
			}
		});
		// Zoom to features button
		var zoomToFeatureControl = new OpenLayers.Control.ZoomToFeatures({
			map : this.map,
			layer: this.vectorLayer,
			maxZoomLevel : 9
		});
		var zoomToFeatureAction = Ext.create('GeoExt.Action',{
			control : zoomToFeatureControl,
			iconCls : 'o-map-tools-map-zoomstations',
			action: 'zoomstations',
			tooltip : this.zoomToFeaturesControlTitle
		});
		var zoomToFeatureButton = new Ext.button.Button(zoomToFeatureAction);
		drawingBtnGroup.add(zoomToFeatureButton);

		// Draw point button
		var drawPointButton = null;
		if (!this.hideDrawPointButton) {
			var drawPointControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Point);

			var drawPointAction = Ext.create('GeoExt.Action',{
				control : drawPointControl,
				map : this.map,
				tooltip : this.drawPointControlTitle,
				toggleGroup : "editing",
				group : "drawControl",
				checked : false,
				iconCls : 'o-map-tools-map-drawpoint',
				action : 'drawpoint'
			});
			var drawPointButton = new Ext.button.Button(drawPointAction)
			drawingBtnGroup.add(drawPointButton);
		}

		// Draw line button
		var drawLineButton = null;
		if (!this.hideDrawLineButton) {
			var drawLineControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Path);
			var drawLineAction = Ext.create('GeoExt.Action',{
				control : drawLineControl,
				map : this.map,
				tooltip : this.drawLineControlTitle,
				toggleGroup : "editing",
				group : "drawControl",
				checked : false,
				iconCls : 'o-map-tools-map-drawline',
				action : 'drawline'
			});
			var drawLineButton = new Ext.button.Button(drawLineAction);
			drawingBtnGroup.add(drawLineButton);
		}

		// Draw polygon button.
		var drawPolygonControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Polygon, {
			ref: this
		});

		var drawPolygonAction = Ext.create('GeoExt.Action',{
			control : drawPolygonControl,
			map : this.map,
			tooltip : this.drawFeatureControlTitle,
			toggleGroup : "drawControl",
			toggleGroup : "editing",
			checked : false,
			iconCls : 'o-map-tools-map-drawpolygon',
			action : 'drawpolygon'
		});
		var drawPolygonButton = new Ext.button.Button(drawPolygonAction);
		drawingBtnGroup.add(drawPolygonButton);

		// Modify feature.
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
			iconCls : 'o-map-tools-map-modifyfeature',
			action : 'modifyfeature'
		});
		var modifyFeatureButton = new Ext.button.Button(modifyFeatureAction);
		drawingBtnGroup.add(modifyFeatureButton);

		// Delete feature.
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
			iconCls : 'o-map-tools-map-deletefeature',
			action : 'deletefeature'
		});
		var deleteFeatureButton = new Ext.button.Button(deleteFeatureAction);
		drawingBtnGroup.add(deleteFeatureButton);

		// As a feature is modified, fire an event on the vector layer.
		this.vectorLayer.events.on({
			'afterfeaturemodified': this.onVectorLayerChange,
			'featureadded': this.onVectorLayerChange,
			'featureremoved': this.onVectorLayerChange,
			scope: this
		});

		tbar.add(drawingBtnGroup);

		tbar.add(Ext.create('Ext.toolbar.Spacer', {flex: 1}));

		wfsBtnGroup = Ext.create('Ext.container.ButtonGroup', {
			defaults: {
				iconAlign:'top'
			}
		});

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
				tooltip : this.snappingControlTitle,
				toggleGroup : "snapping",  // his own independant group
				group : "LayerTools",
				checked : false,
				iconCls : 'o-map-tools-map-snapping'
			});
			if (!this.hideSnappingButton) {
				wfsBtnGroup.add(new Ext.button.Button(snappingAction));
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
				iconCls : 'o-map-tools-map-selectFeature'
			});
			var getFeatureButton = new Ext.button.Button(getFeatureAction);
			
			if (!this.hideGetFeatureButton) {
				wfsBtnGroup.add(getFeatureButton);
			}

			// Feature Info Tool
			this.featureInfoControl = new OpenLayers.Control.FeatureInfoControl({
				popupTitle:this.popupTitle,
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
				iconCls : 'o-map-tools-map-featureinfo'
			});
			if (!this.hideFeatureInfoButton) {
				wfsBtnGroup.add(new Ext.button.Button(featureInfoAction));
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
						actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
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
			wfsBtnGroup.add(this.layerSelector);
			
			tbar.add(wfsBtnGroup);
			
			// Add separator
			tbar.add('-');
		}		

		navBtnGroup = Ext.create('Ext.container.ButtonGroup', {
			defaults: {
				iconAlign:'top'
			}
		});
		//
		// Navigation history : back and next
		//
		var historyControl = new OpenLayers.Control.NavigationHistory({});
		this.map.addControl(historyControl);
		historyControl.activate();

		var buttonPrevious = new Ext.button.Button({
			iconCls : 'o-map-tools-map-back',
			tooltip : this.tbarPreviousButtonTooltip,
			disabled : true,
			handler : historyControl.previous.trigger
		});

		var buttonNext = new Ext.button.Button({
			iconCls : 'o-map-tools-map-next',
			tooltip : this.tbarNextButtonTooltip,
			disabled : true,
			handler : historyControl.next.trigger
		});
		navBtnGroup.add(buttonPrevious);
		navBtnGroup.add(buttonNext);

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
			geoPanelId : this.id,
			requestServiceUrl: Ext.manifest.OgamDesktop.requestServiceUrl,
			maxfeatures: OgamDesktop.map.featureinfo_maxfeatures
		});
		locationInfoControl.events.register('activate', this, function(){
			this.fireEvent('getLocationInfoActivated', true);
		});

		locationInfoControl.events.register('deactivate', this, function(){
			this.fireEvent('getLocationInfoActivated', false);
		});

		locationInfoControl.events.register('getLocationInfo', this, function(evt){
			this.fireEvent('getLocationInfo', evt);
		});
		
		var locationInfoAction = Ext.create('GeoExt.Action',{
			control : locationInfoControl,
			map : this.map,
			toggleGroup : "editing",
			group : "navControl",
			checked : false,
			tooltip : this.locationInfoControlTitle,
			iconCls : 'o-map-tools-map-featureinfo'
		});
		navBtnGroup.add(new Ext.button.Button(locationInfoAction));
		
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
			iconCls : 'o-map-tools-map-zoomin'
		});
		navBtnGroup.add(new Ext.button.Button(zoomInAction));

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
			iconCls : 'o-map-tools-map-zoomout'
		});

		navBtnGroup.add(new Ext.button.Button(zoomOutAction));

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
			iconCls : 'o-map-tools-map-pan'
		});

		navBtnGroup.add(new Ext.button.Button(navigationAction));

		tbar.add(navBtnGroup);
		
		// Separator
		tbar.add('-');

		extentBtnGroup = Ext.create('Ext.container.ButtonGroup', {
			defaults: {
				iconAlign:'top'
			}
		});
		// Zoom to the Results
		var zoomToResultAction = Ext.create('GeoExt.Action',{
			scope : this,
			action: 'zoomtoresults',
			map : this.map,
			tooltip : this.zoomToResultControlTitle,
			checked : false,
			iconCls : 'o-map-tools-map-zoomstations'
		});

		extentBtnGroup.add(new Ext.button.Button(zoomToResultAction));

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
			iconCls : 'o-map-tools-map-zoomfull'
		});

		extentBtnGroup.add(new Ext.button.Button(zoomToMaxAction));
		
		tbar.add(extentBtnGroup);

		// Separator
		tbar.add('-');
		
		// Print the displayed map
		if (!this.hidePrintMapButton) {
			var printMapButton = new Ext.button.Button({
				xtype : 'button',
				action: 'print',
				iconCls : 'o-map-tools-map-printMap',
				text : this.printMapButtonText,
				scope : this
			});
			
		}
		tbar.add(printMapButton);
		return tbar;
	},
	
	onVectorLayerChange: function(){
		this.fireEvent('featureModified');
	},
	
	highlightObject: function(record) { // TODO
	},
	
	showObjectInDefaultStyle: function(record) { // TODO
	},
	
	/**
	 * Destroy additional objects on the (auto) destroy of component.
	 */
	onDestroy : function() {
		this.baseLayer = null;
		this.wktFormat = null;
		this.featureInfoControl = null;
		this.layersList = null;
		this.layersActivation = null;
		this.services = null;

		this.vectorLayer.events.unregister('afterfeaturemodified', this, this.onVectorLayerChange);
		this.vectorLayer.events.unregister('featureadded', this, this.onVectorLayerChange);
		this.vectorLayer.events.unregister('featureremoved', this, this.onVectorLayerChange);
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