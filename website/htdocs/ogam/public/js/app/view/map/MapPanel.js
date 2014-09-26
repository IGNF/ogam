Ext.define('Ogam.view.map.MapPanel', {
	extend: 'GeoExt.panel.Map',
	requires: ['GeoExt.tree.LayerContainer','GeoExt.Action'],
	id: 'mappanel',
	//mixins: ['Ogam.view.interface.MapPanel'],
	
	
	/**
	 * Internationalization.
	 */
	title : 'Map',
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
	selectFeatureControlTitle : "Select a feature from the selected layer",
	featureInfoControlTitle : "Get information about the selected layer",
	legalMentionsLinkText : "Legal Mentions",
	addGeomCriteriaButtonText : "Select an area",
	
	
	layersList: [],
	minZoomLevel : 0,
	xtype: 'map-panel',
	width:'100%',
	height:'100%',
	
	initComponent: function(){
	    //this.map = new OpenLayers.Map("map",{allOverlays: false});

		// Creates the map Object (OpenLayers)
		this.map = this.initMap();

		this.tbar = Ext.create('Ext.toolbar.Toolbar'),
		// Gets the layer tree model to initialise the Layer
		// Tree
		Ext.Ajax.request({
			url : Ogam.base_url + 'map/ajaxgettreelayerslist',
			success : this.initLayerTree,
			scope : this
		});
		Ext.Ajax.request({
			url : Ogam.base_url + 'map/ajaxgetlayers',
			scope : this,
			success :this.addLayersAndLayersTree
		});
		

		// Init the toolbar
		this.initToolbar();
		this.callParent(arguments);
		
	},
	
	addLayersAndLayersTree : function(response) {
		
		// Reset the arrays
		this.layersList = [];
		this.layersActivation = {};
		var layersObject = Ext.decode(response.responseText), i;

		// Rebuild the list of available layers
		for (j = 0; j < layersObject.layers.length; j++) {
			// Get the JSON description of the layer
			var layerObject = layersObject.layers[j];

			// Get the JSON view service name
			var viewServiceName=layerObject.viewServiceName;
			var viewServiceNameStr = 'layersObject.view_services.'+viewServiceName.toString();
			var viewServiceObject=eval('('+viewServiceNameStr+')');
			
			// Build the new OpenLayers layer object and add it
			// to the list
			var newLayer = this.buildLayer(layerObject,viewServiceObject);
			this.layersList.push(newLayer);
			
			// Fill the list of active layers
			var activateType = layerObject.params.activateType.toLowerCase();
			if (Ext.isEmpty(this.layersActivation[activateType])) {
				this.layersActivation[activateType] = [ layerObject.name ];
			} else {
				this.layersActivation[activateType].push(layerObject.name);
			}

			// Create the legends
			if (layerObject.legendServiceName != '') {

				// Get the JSON legend service name
				var legendServiceName=layerObject.legendServiceName;
				var legendServiceNameStr = 'layersObject.legend_services.'+legendServiceName.toString();
				var legendServiceObject=eval('('+legendServiceNameStr+')');
				
				//this.buildLegend(layerObject,legendServiceObject);
			}
		}
		
		this.setMapLayers(this.map);

	},
	
	/**
	 * Build one OpenLayer Layer from a JSON object.
	 * 
	 * @return OpenLayers.Layer
	 */
	buildLayer : function(layerObject,serviceObject) {
		
		var url = serviceObject.urls;
			//Merges the service parameters and the layer parameters
			var paramsObj = {};
		    for (var attrname in layerObject.params) { paramsObj[attrname] = layerObject.params[attrname]; }
		    for (var attrname in serviceObject.params) { paramsObj[attrname] = serviceObject.params[attrname]; }
		    if (serviceObject.params.SERVICE=="WMTS") {
		    	//creation and merging of wmts parameters
		    	var layer=paramsObj.layers[0];
		    	var tileOrigin = new OpenLayers.LonLat(-20037508,20037508); //coordinates of top left corner of the matrixSet : usual value of geoportal, google maps 
		    	var serverResolutions = [156543.033928,78271.516964,39135.758482,19567.879241,9783.939621,4891.969810,2445.984905,1222.992453,611.496226,305.748113,152.874057,76.437028,38.218514,19.109257,9.554629,4.777302,2.388657,1.194329,0.597164,0.298582,0.149291,0.074646]; 
		    	// the usual 22 values of resolutions accepted by wmts servers geoportal
		    	
		    	var obj={options:layerObject.options,name:layerObject.name,url:url.toString(),layer:layer,tileOrigin:tileOrigin,serverResolutions:serverResolutions,opacity:layerObject.options.opacity,visibility:layerObject.options.visibility,isBaseLayer:layerObject.options.isBaseLayer};
		    	var objMergeParams= {};
		    	for (var attrname in obj) { objMergeParams[attrname] = obj[attrname]; }
		    	for (var attrname in paramsObj) { objMergeParams[attrname] = paramsObj[attrname]; }
		    	newLayer = new OpenLayers.Layer.WMTS(objMergeParams);

		    } else if (serviceObject.params.SERVICE=="WMS"){
		    	newLayer = new OpenLayers.Layer.WMS(layerObject.name , url , paramsObj , layerObject.options);
		    } else {
		    	Ext.Msg.alert("Please provide the \"" + layerObject.servicename + "\" service type.");
		    }
		newLayer.displayInLayerSwitcher = true;

		return newLayer;
	},
	/**
	 * Set the layers of the map
	 */
	setMapLayers : function(map) {
		// Add the base layer (always first)
		map.addLayer(this.baseLayer);

		// Add the available layers
		for ( var i = 0; i < this.layersList.length; i++) {
			map.addLayer(this.layersList[i]);
		}

	},
	
	
	/**
	 * Initialize the map
	 * 
	 * @param {String}
	 *            consultationMapDivId The consultation map div
	 *            id
	 * @hide
	 */
	initMap : function() {
		// Create the map config resolution array
		var resolutions = [];
		for ( var i = this.minZoomLevel; i < Ogam.map.resolutions.length; i++) {
			resolutions.push(Ogam.map.resolutions[i]);
		}
		
		// Create the map object
		var map = new OpenLayers.Map({
			'controls' : [],
			'resolutions' : resolutions,
			'numZoomLevels' : Ogam.map.numZoomLevels,
			'projection' : Ogam.map.projection,
			'units' : 'm',
			'tileSize' : new OpenLayers.Size(Ogam.map.tilesize, Ogam.map.tilesize),
			'maxExtent' : new OpenLayers.Bounds(Ogam.map.x_min, Ogam.map.y_min, Ogam.map.x_max, Ogam.map.y_max),
			/*'eventListeners' : {// Hide the legend if needed
				"changelayer" : function(o) {
					if (o.property === 'visibility') {
						this.toggleLayersAndLegendsForZoom(o.layer);
					}
				},
				scope : this
			}*/
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
		// Set the minimum mandatory layer for the map
		// 
		this.setMapLayers(map);

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
		map.setCenter(new OpenLayers.LonLat(Ogam.map.x_center, Ogam.map.y_center), Ogam.map.defaultzoom);

		return map;
	},
	
	/**
	 * Initialize the layer tree.
	 */
	initLayerTree : function(response) {

		// Decode the JSON
		var responseJSON = Ext.decode(response.responseText);
		// Add a Tree Panel
		this.layerTree = Ext.create('Ogam.view.map.LayersPanel',{
			rootChildren : responseJSON,
			map : this.map
		});
	},
	
	/**
	 * Initialize the map toolbar
	 * 
	 * @hide
	 */
	initToolbar : function() {

		// Link the toolbar to the map
		this.tbar.map = this.map;
		
		//
		// Drawing tools
		//
		if (this.isDrawingMap) {
			// Zoom to features button
//			this.zoomToFeatureControl = new OpenLayers.Control.ZoomToFeatures(this.vectorLayer, {
//				map : this.map,
//				maxZoomLevel : 9,
//				ratio : 1.05,
//				autoActivate : false
			// otherwise will
			// desactivate after
			// first init
//			});
			var zoomToFeatureButton = new GeoExt.Action({
				control : this.zoomToFeatureControl,
				iconCls : 'zoomstations',
				tooltip : this.zoomToFeaturesControlTitle
			});
			this.tbar.add(new Ext.button.Button(zoomToFeatureButton));

			// Draw point button
			if (!this.hideDrawPointButton) {
				var drawPointControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Point);

				var drawPointButton = new GeoExt.Action({
					control : drawPointControl,
					map : this.map,
					tooltip : this.drawPointControlTitle,
					toggleGroup : "editing",
					group : "drawControl",
					checked : false,
					iconCls : 'drawpoint'
				});
				this.tbar.add(new Ext.button.Button(drawPointButton));
			}

			// Draw line button
			if (!this.hideDrawLineButton) {
				var drawLineControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Path);

				var drawLineButton = new GeoExt.Action({
					control : drawLineControl,
					map : this.map,
					tooltip : this.drawLineControlTitle,
					toggleGroup : "editing",
					group : "drawControl",
					checked : false,
					iconCls : 'drawline'
				});
				this.tbar.add(new Ext.button.Button(drawLineButton));
			}

			// Draw polygon button
			var drawPolygonControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Polygon);

			var drawPolygonButton = new GeoExt.Action({
				control : drawPolygonControl,
				map : this.map,
				tooltip : this.drawFeatureControlTitle,
				toggleGroup : "drawControl",
				toggleGroup : "editing",
				checked : false,
				iconCls : 'drawpolygon'
			});
			this.tbar.add(new Ext.button.Button(drawPolygonButton));

			// Modify feature
			var modifyFeatureControl = new OpenLayers.Control.ModifyFeature(this.vectorLayer, {
				mode : OpenLayers.Control.ModifyFeature.RESHAPE
			});

			var modifyFeatureButton = new GeoExt.Action({
				control : modifyFeatureControl,
				map : this.map,
				tooltip : this.modifyFeatureControlTitle,
				toggleGroup : "editing",
				group : "drawControl",
				checked : false,
				iconCls : 'modifyfeature'
			});
			this.tbar.add(new Ext.button.Button(modifyFeatureButton));

			// Delete feature
			var deleteFeatureControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
				displayClass : 'olControlModifyFeature',
				onSelect : function(feature) {
					this.vectorLayer.destroyFeatures([ feature ]);
				},
				scope : this,
				type : OpenLayers.Control.TYPE_TOOL
			});

			var deleteFeatureButton = new GeoExt.Action({
				control : deleteFeatureControl,
				map : this.map,
				tooltip : this.tbarDeleteFeatureButtonTooltip,
				toggleGroup : "editing",
				group : "drawControl",
				checked : false,
				iconCls : 'deletefeature'
			});
			this.tbar.add(new Ext.button.Button(deleteFeatureButton));

			// Separator
			this.tbar.add('-');

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
                this.tbar.add(addGeomCriteriaButton);
			}
		}
		
		this.tbar.add(new Ext.toolbar.Spacer({flex: 1}))
		
		//
		// Layer Based Tools
		//
		

		// Layer selector
		this.layerSelector = {
			xtype : 'layerselector',
			geoPanelId : this.id
		};

		// Snapping tool
		this.snappingControl = new OpenLayers.Control.Snapping({
			layer : this.vectorLayer,
			targets : [ this.vectorLayer ],
			greedy : false
		});
		var snappingButton = new GeoExt.Action({
			control : this.snappingControl,
			map : this.map,
			tooltip : 'Snapping',
			toggleGroup : "snapping",  // his own independant group
			group : "LayerTools",
			checked : false,
			iconCls : 'snapping'
		});
		// Listen for the layer selector events
		//Ogam.eventManager.on('selectLayer', this.layerSelected, this);
		// Get Feature tool
//		this.getFeatureControl = new OpenLayers.Control.GetFeatureControl({
//			map : this.map
//		});
		var getFeatureButton = new GeoExt.Action({
			control : this.getFeatureControl,
			map : this.map,
			tooltip : this.selectFeatureControlTitle,
			toggleGroup : "editing",
			group : "LayerTools",
			checked : false,
			iconCls : 'selectFeature'
		});

		// Listen the get feature tool events
		//Ogam.eventManager.on('getFeature', this.getFeature, this);
		// Feature Info Tool
//		this.featureInfoControl = new OpenLayers.Control.FeatureInfoControl({
//			layerName : this.vectorLayer.name,
//			map : this.map
//		});

		var featureInfoButton = new GeoExt.Action({
			control : this.featureInfoControl,
			map : this.map,
			toggleGroup : "editing",
			group : "LayerTools",
			checked : false,
			tooltip : this.featureInfoControlTitle,
			iconCls : 'feature-info'
		});
		if (!this.hideSnappingButton) {
			this.tbar.add(new Ext.button.Button(snappingButton));
		}
		
		if (!this.hideGetFeatureButton) {
			this.tbar.add(new Ext.button.Button(getFeatureButton));
		}
		
		if (!this.hideFeatureInfoButton) {
			this.tbar.add(new Ext.button.Button(featureInfoButton));
		}
		this.tbar.add(new Ext.form.field.ComboBox({emptyText:'Choisir une couche'}));

		
		this.tbar.add('-');
		
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
		this.tbar.add(buttonPrevious);
		this.tbar.add(buttonNext);

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

//		var locationInfoControl = new OpenLayers.Control.LocationInfoControl({
//			layerName : Genapp.map.featureinfo_typename,
//			geoPanelId : this.id
//		});

		var locationInfoButton = new GeoExt.Action({
			//control : locationInfoControl,
			map : this.map,
			toggleGroup : "editing",
			group : "navControl",
			checked : false,
			tooltip : this.locationInfoControlTitle,
			iconCls : 'feature-info'
		});
		this.tbar.add(new Ext.button.Button(locationInfoButton));

		
		//
		// Navigation controls
		//

		// Zoom In
		var zoomInControl = new OpenLayers.Control.ZoomBox({
			title : this.zoomBoxInControlTitle
		});
		
		

		var zoomInButton = new GeoExt.Action({
			control : zoomInControl,
			map : this.map,
			tooltip : this.zoomBoxInControlTitle,
			toggleGroup : "editing",
			group : "navControl",
			checked : false,
			iconCls : 'zoomin'
		});
		this.tbar.add(new Ext.button.Button(zoomInButton));

		// Zoom Out
		var zoomOutControl = new OpenLayers.Control.ZoomBox({
			out : true,
			title : this.zoomBoxOutControlTitle
		});

		var zoomOutButton = new GeoExt.Action({
			control : zoomOutControl,
			map : this.map,
			tooltip : this.zoomBoxOutControlTitle,
			toggleGroup : "editing",
			group : "navControl",
			checked : false,
			iconCls : 'zoomout'
		});

		this.tbar.add(new Ext.button.Button(zoomOutButton));

		// Navigation
		var navigationControl = new OpenLayers.Control.Navigation({
			isDefault : true,
			mouseWheelOptions : {
				interval : 100
			}
		});

		var navigationButton =new GeoExt.Action({
			control : navigationControl,
			map : this.map,
			tooltip : this.navigationControlTitle,
			toggleGroup : "editing",
			group : "navControl",
			checked : true,
			iconCls : 'pan'
		});

		this.tbar.add(new Ext.button.Button(navigationButton));

//		// Séparateur
		this.tbar.add('-');
//
		// Zoom to the Results
		var zoomToResultButton = new GeoExt.Action({
			handler : this.zoomOnResultsBBox,
			scope : this,
			map : this.map,
			tooltip : this.zoomToResultControlTitle,
			checked : false,
			iconCls : 'zoomstations'
		});

		this.tbar.add(new Ext.button.Button(zoomToResultButton));

		// Zoom to max extend
		var zoomToMaxControl = new OpenLayers.Control.ZoomToMaxExtent({
			map : this.map,
			active : false
		});

		var zoomToMaxButton = new GeoExt.Action({
			control : zoomToMaxControl,
			map : this.map,
			tooltip : this.zoomToMaxExtentControlTitle,
			checked : false,
			iconCls : 'zoomfull'
		});

		this.tbar.add(new Ext.button.Button(zoomToMaxButton));
	},
});
