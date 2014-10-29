Ext.define('OgamDesktop.view.map.MapPanel', {
	extend: 'GeoExt.panel.Map',
	requires: [
		'GeoExt.tree.LayerContainer',
		'GeoExt.Action',
		'GeoExt.slider.Zoom',
		'GeoExt.slider.Tip',
		'OgamDesktop.view.map.LayersPanel',
		'OgamDesktop.view.map.LegendsPanel'
	],
	id: 'mappanel',
	//mixins: ['OgamDesktop.view.interface.MapPanel'],
	
	
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
	hideLayerSelector : true,
	hideSnappingButton : true,
	hideGetFeatureButton : true,
	hideFeatureInfoButton : true,
	hideGeomCriteriaToolbarButton : true,
	hidePrintMapButton : false,
	layersList: [],
	
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
	minZoomLevel : 0,
	xtype: 'map-panel',
	width:'100%',
	height:'100%',
	items: [],
	initComponent: function(){
		
		// Creates the map Object (OpenLayers)
		this.map = this.initMap();

		// Create a zoom slider
		var zoomSlider = Ext.create('GeoExt.slider.Zoom', {
			vertical: true,
			height: 150,
			x: 18,
			y: 85,
			map: this.map,
			activeError: 'error',
			plugins: Ext.create('GeoExt.slider.Tip', {
				position: 'top',
				getText: function(thumb) {
					return Ext.String.format(
						'<div><b>{0}</b></div>',
						thumb.slider.getZoom()
					);
				}
			})
		});		
		
		this.tbar = Ext.create('Ext.toolbar.Toolbar');
		// Gets the layer tree model to initialise the Layer
		// Tree
//		Ext.Ajax.request({
//			url : Ext.manifest.OgamDesktop.requestServiceUrl +'../map/ajaxgettreelayers',
//			success : this.initLayerTree,
//			scope : this
//		});
		Ext.Ajax.request({
			url : Ext.manifest.OgamDesktop.requestServiceUrl +'../map/ajaxgetlayers',
			scope : this,
			success :this.addLayersAndLayersTree
		});
		// Init the toolbar
		this.initToolbar();
		this.callParent(arguments);

		// Add the zoom slider to the items
		this.add(zoomSlider);
		
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
				
				this.buildLegend(layerObject,legendServiceObject);
			}
		}
		
		// Openlayers have to pass through a proxy to request external 
		// server
		OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
		
		// Set the style
		var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
			fillOpacity : 0,
			strokeColor : "green",
			strokeWidth : 3,
			strokeOpacity : 1
		}, OpenLayers.Feature.Vector.style["default"]));
		
		this.wfsLayer = new OpenLayers.Layer.Vector("WFS Layer", 
			{
				strategies:[new OpenLayers.Strategy.BBOX()],
				protocol: new OpenLayers.Protocol.HTTP({
					url: null,
					params:
					{
						typename: null,
						service: "WFS",
						format: "WFS",
						version: "1.0.0",
						request: "GetFeature",
						srs: OgamDesktop.map.projection
					}, 
					format: new OpenLayers.Format.GML({extractAttributes: true})
				})									
			});

		this.wfsLayer.printable = false;
		this.wfsLayer.displayInLayerSwitcher = false;
		this.wfsLayer.extractAttributes = false;
		this.wfsLayer.styleMap = styleMap;
		this.wfsLayer.visibility = false;
		this.setMapLayers(this.map);

		// Gets the layer tree model to initialise the Layer
		// Tree
		Ext.Ajax.request({
			url : Ext.manifest.OgamDesktop.requestServiceUrl +'../map/ajaxgettreelayers',
			success : this.initLayerTree,
			scope : this
		});
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
		// Add the WFS layer
		if (!this.hideLayerSelector && this.wfsLayer !== null) {
			map.addLayer(this.wfsLayer);
			this.snappingControl.addTargetLayer(this.wfsLayer);
		}
	},
	
	initLayerTree: function(response) {
		rootChildren = Ext.decode(response.responseText);
		// initialize the Tree store based on the map layers
		layerStore = Ext.create('Ext.data.TreeStore', {
			model: 'GeoExt.data.LayerTreeModel',
			root: {},
			
		});
		// for each node, we create a store which is a selection of the map layers store
		for (i in rootChildren) {
			storeSelection = Ext.create('GeoExt.data.LayerStore');
			var rootChild = {};
			this.layers.each(function(layer) {
				if (layer.data.options.nodeGroup && layer.data.options.nodeGroup == rootChildren[i].nodeGroup) {
					storeSelection.add(layer);
				} else if (layer.data.title == rootChildren[i].layer) {

					// creation of the layer node
					rootChild = {
						text: rootChildren[i].text,
						layer: layer.data,
						plugins: [
							Ext.create('GeoExt.tree.LayerNode')
						]
					};
					// add of the container
					layerStore.root.appendChild(rootChild);
					rootChild = null;
				}
			});
			
			if (rootChild) {
				// creation of the layer group container
				rootChild = {
					text: rootChildren[i].text,
					plugins: [
						Ext.create('OgamDesktop.ux.map.GroupLayerContainer', {
							store: storeSelection,
							nodeGroup: rootChildren[i].nodeGroup,
							containerCheckedStatus: rootChildren[i].checked,
							containerExpandedStatus: rootChildren[i].expanded
						})
					]
				};
				// add of the container
				layerStore.root.appendChild(rootChild);
			}
		}
		
		
		this.layerTree = Ext.getCmp('layerspanel');
		this.layerTree.setConfig('store', layerStore);
		// Toggle layers and legends for zoom
		this.layerTree.on('load', function(treePanel) {
			this.layerTree.eachLayerChild(function(child) {
				if (child.attributes.disabled === true) {
					child.forceDisable = true;
				} else {
					child.forceDisable = false;
				}
			});
			for ( var i = 0; i < this.map.layers.length; i++) {
				this.toggleLayersAndLegendsForZoom(this.map.layers[i]);
			}
		}, this);
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
	 * Build a Legend Object from a JSON object.
	 * 
	 * @return OpenLayers.Layer
	 */
	buildLegend : function(layerObject,serviceObject) {
		legend = Ext.getCmp('legendspanel')
			.add(new Ext.Component({
				id : this.id + layerObject.name,
					autoEl : {
						tag : 'div',
						children : [{
							tag : 'span',
							html : layerObject.options.label,
							cls : 'x-form-item x-form-item-label'
						},{
							tag : 'img',
							src : serviceObject.urls.toString()
							+ 'LAYER='+ layerObject.params.layers
							+ '&SERVICE=' + serviceObject.params.SERVICE+ '&VERSION=' + serviceObject.params.VERSION + '&REQUEST=' + serviceObject.params.REQUEST
							+ '&Format=image/png&WIDTH=160&HASSLD=' + (layerObject.params.hasSLD ? 'true' : 'false')
						}]
					}
			}));
		if (layerObject.params.isDisabled || layerObject.params.isHidden || !layerObject.params.isChecked) {
			legend.on('render', function(cmp) {
				cmp.hide();
			});
		}
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
		
		// Create the map object
		var map = new OpenLayers.Map({
			'controls' : [],
			'resolutions' : resolutions,
			'numZoomLevels' : OgamDesktop.map.numZoomLevels,
			'projection' : OgamDesktop.map.projection,
			'units' : 'm',
			'zoomMethod': null,
			'tileSize' : new OpenLayers.Size(OgamDesktop.map.tilesize, OgamDesktop.map.tilesize),
			'maxExtent' : new OpenLayers.Bounds(OgamDesktop.map.x_min, OgamDesktop.map.y_min, OgamDesktop.map.x_max, OgamDesktop.map.y_max),
			'eventListeners' : {// Hide the legend if needed
				"changelayer" : function(o) {
					if (o.property === 'visibility') {
						this.toggleLayersAndLegendsForZoom(o.layer);
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
		map.setCenter(new OpenLayers.LonLat(OgamDesktop.map.x_center, OgamDesktop.map.y_center), OgamDesktop.map.defaultzoom);

		return map;
	},
	
	/**
	 * Initialize the layer tree.
	 */
//	initLayerTree : function(response) {
//
//		// Decode the JSON
//		var responseJSON = Ext.decode(response.responseText);
//		// Add a Tree Panel
//		this.layerTree = Ext.create('OgamDesktop.view.map.LayersPanel',{
//			rootChildren : responseJSON,
//			cls : 'genapp-query-layer-tree-panel',
//			map : this.map
//		});
//	},
	
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
		if (!this.hideLayerSelector) {
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
			if (!this.hideSnappingButton) {
				this.tbar.add(new Ext.button.Button(snappingButton));
			}
			
			// Get Feature tool
			this.getFeatureControl = new OpenLayers.Control.GetFeatureControl({
				map : this.map
			});
			var getFeatureButton = new GeoExt.Action({
				control : this.getFeatureControl,
				map : this.map,
				tooltip : this.selectFeatureControlTitle,
				toggleGroup : "editing",
				group : "LayerTools",
				checked : false,
				iconCls : 'selectFeature'
			});
			var getFeatureButtonButton = new Ext.button.Button(getFeatureButton);
			getFeatureButtonButton.on('getFeature', this.getFeature, this);
			if (!this.hideGetFeatureButton) {
				this.tbar.add(getFeatureButtonButton);
			}
			
			// Feature Info Tool
			this.featureInfoControl = new OpenLayers.Control.FeatureInfoControl({
				layerName : this.vectorLayer.name,
				map : this.map
			});
			
			var featureInfoButton = new GeoExt.Action({
				control : this.featureInfoControl,
				map : this.map,
				toggleGroup : "editing",
				group : "LayerTools",
				checked : false,
				tooltip : this.featureInfoControlTitle,
				iconCls : 'feature-info'
			});
			if (!this.hideFeatureInfoButton) {
				this.tbar.add(new Ext.button.Button(featureInfoButton));
			}
			
			// Layer selector
			this.layerSelector = Ext.create('Ext.form.field.ComboBox',{
				xtype : 'layerselector',
				editable: false,
				emptyText: this.LayerSelectorEmptyTextValue,
				//mode : 'remote',
				triggerAction : 'all',
				//geoPanelId: this.id,
				store : new Ext.data.Store({
					autoLoad : true,
					proxy: {
						type: 'ajax',
						url: Ext.manifest.OgamDesktop.requestServiceUrl + '../map/ajaxgetvectorlayers',
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
			// Listen for the layer selector events
			this.layerSelector.on('select', this.layerSelected, this);
			this.tbar.add(this.layerSelector);
			
			// Add separator
			this.tbar.add('-');
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

		var locationInfoControl = new OpenLayers.Control.LocationInfoControl({
			layerName : OgamDesktop.map.featureinfo_typename,
			geoPanelId : this.id
		});

		var locationInfoButton = new GeoExt.Action({
			control : locationInfoControl,
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

		// Séparateur
		this.tbar.add('-');

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
		
		if (!this.hidePrintMapButton) {
			var printMapButton = new Ext.button.Button({
				xtype : 'button',
				iconCls : 'genapp-query-center-panel-print-map-button-icon',
				text : this.printMapButtonText,
				handler : this.printMap,
				scope : this
			});
			
			// Séparateur
			this.tbar.add('-');
			
			this.tbar.add(printMapButton);
		}
	},
	

	/**
	 * A layer has been selected in the layer selector
	 */
	layerSelected : function(combo, value) {
		if (this.info) {
			this.info.destroy();
		}
//		if (geoPanelId == this.id) {
			if (value[0].data.code !== null) {
				var layerName = value[0].data.code;
				var url = value[0].data.url;
				var popupTitle = this.popupTitle;
				
				// Change the WFS layer typename
				this.wfsLayer.protocol.featureType = layerName;
				this.wfsLayer.protocol.options.featureType = layerName;
				this.wfsLayer.protocol.format.featureType = layerName;
				this.wfsLayer.protocol.params.typename = layerName;
				this.wfsLayer.protocol.options.url = url;

				// Remove all current features
				this.wfsLayer.destroyFeatures();

				// Copy the visibility range from the original
				// layer
				originalLayers = this.map.getLayersByName(layerName);
				if (originalLayers != null) {
					originalLayer = originalLayers[0];
					this.wfsLayer.maxResolution = originalLayer.maxResolution;
					this.wfsLayer.maxScale = originalLayer.maxScale;
					this.wfsLayer.minResolution = originalLayer.minResolution;
					this.wfsLayer.minScale = originalLayer.minScale;
					this.wfsLayer.alwaysInRange = false;
					this.wfsLayer.calculateInRange();
				}

				// Make it visible
				this.wfsLayer.setVisibility(true);

				// Force a refresh (rebuild the WFS URL)
				this.wfsLayer.moveTo(null, true, false);
				
				// Set the getfeature control
				if (this.getFeatureControl !== null) {
					this.getFeatureControl.protocol = new OpenLayers.Protocol.WFS({
						url : this.wfsLayer.protocol.url,
						featureType : this.wfsLayer.protocol.featureType
					});

				}
				// Set the layer name in other tools
				if (this.featureInfoControl !== null) {
					this.featureInfoControl.layerName = layerName;
				}
				if (this.getFeatureControl !== null) {
					this.getFeatureControl.layerName = layerName;
				}
				
				this.wfsLayer.refresh();
				this.wfsLayer.strategies[0].update({force:true});

			} else {
				// Hide the layer
				this.wfsLayer.setVisibility(false);
			}

			if (this.getFeatureControl !== null) {
			for (var i = 0 ; i < this.layersList.length ; i++) {
			if (this.layersList[i].name == layerName) {
			this.info = new OpenLayers.Control.WMSGetFeatureInfo({
				//title: 'Identify features by clicking',
				queryVisible: true,
				infoFormat : 'application/vnd.ogc.gml', // format utilisé pour la récupération des infos de la feature interrogée sur la couche WMS
				maxFeatures:1,
				multiple: false,
				layers: [this.layersList[i]],
				eventListeners: {
					getfeatureinfo: function(event) {
						if (window.DOMParser) {
							parser = new DOMParser();
							xmlDoc = parser.parseFromString(event.text,"text/xml");
						} else {// Internet Explorer
							xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
							xmlDoc.async=false;
							xmlDoc.loadXML(event.text);
						}

						var html = '<ul>';


						if (typeof(xmlDoc.children[0].children[0].children[0]) != 'undefined') {
						countXmlDoc = xmlDoc.children[0].children[0].children[0].children.length;
						for (var i = 1 ; i < countXmlDoc ; i++){
								html += '<li>';
								html += xmlDoc.children[0].children[0].children[0].children[i].localName + ': '+ xmlDoc.children[0].children[0].children[0].children[i].childNodes[0].nodeValue;
								html += '</li>';
							}
						}
						html += '</ul>';
						popup = Ext.create('GeoExt.window.Popup',{
							title : popupTitle,
							location : this.map.getLonLatFromPixel(event.xy),
							width : 200,
							map : this.map,
							html : html,
							maximizable : false,
							collapsible : false,
							unpinnable : false
						});
						popup.show();
					}
				}
			});
			this.map.addControl(this.info);
			this.info.activate();
			break;
			}
		}
		}
//		}
		
	},
	

	/**
	 * A feature has been selected using the GetFeatureControl
	 * tool.
	 */
	getFeature : function(feature, mapId) {
		if (mapId == this.map.id) {
			// Add the feature to the vector layer
			if (this.vectorLayer !== null) {
				this.vectorLayer.addFeatures(feature);
			}
		}

	},

	/**
	 * Zoom on the provided bounding box
	 * 
	 * {String} wkt The wkt of the bounding box
	 */
	zoomOnBBox : function(wkt) {
		if (!Ext.isEmpty(wkt)) {

			// The ratio by which features' bounding box should
			// be scaled
			var ratio = 1;

			// The maximum zoom level to zoom to
			var maxZoomLevel = this.map.numZoomLevels - 1;

			// Parse the feature location and create a Feature
			// Object
			var feature = this.wktFormat.read(wkt);

			var bounds = feature.geometry.getBounds();

			bounds = bounds.scale(ratio);

			var zoom = 0;
			if ((bounds.getWidth() === 0) && (bounds.getHeight() === 0)) {
				zoom = maxZoomLevel;
			} else {
				var desiredZoom = this.map.getZoomForExtent(bounds);
				zoom = (desiredZoom > maxZoomLevel) ? maxZoomLevel : desiredZoom;
			}
			this.map.setCenter(bounds.getCenterLonLat(), zoom);
		}
	},

	/**
	 * Zoom on the results bounding box
	 */
	zoomOnResultsBBox : function() {
		this.resultsBBox = 'POLYGON((3238896.99125923 2030902.4323881,3238896.99125923 3127534.58932965,4281140.26847362 3127534.58932965,4281140.26847362 2030902.4323881,3238896.99125923 2030902.4323881))';
		this.zoomOnBBox(this.resultsBBox);
	},

	/**
	 * Convenience function to hide or show a legend by boolean.
	 * 
	 * @param {Array}
	 *            layerNames The layers name
	 * @param {Boolean}
	 *            visible True to show, false to hide
	 */
	setLegendsVisible : function(layerNames, visible) {
		var i;
		this.legendPanel = Ext.getCmp('legendspanel');
		for (i = 0; i < layerNames.length; i++) {
			var legendCmp = this.legendPanel.getComponent(this.id + layerNames[i]);
			if (!Ext.isEmpty(legendCmp)) {
				if (visible === true) {
					var layers = this.map.getLayersByName(layerNames[i]);
					if (layers[0].calculateInRange() && layers[0].getVisibility()) {
						legendCmp.show();
					} else {
						legendCmp.hide();
					}
				} else {
					legendCmp.hide();
				}
			}
		}
	},

	/**
	 * Toggle the layer node and legend in function of the zoom
	 * range
	 * 
	 * @param {OpenLayers.Layer}
	 *            layer The layer to check
	 */
	toggleLayersAndLegendsForZoom : function(layer) {
		if (!Ext.isEmpty(this.layerTree)) {
			var node;
			layerStore = this.layerTree.store;
			layerStore.each(function(layerNode){
				if (layerNode.data.name == layer.name){
					node = layerNode;
				}
			})
			if (!Ext.isEmpty(node) && !node.hidden) {
				if (!layer.calculateInRange()) {
					node.zoomDisable = true;
					this.disableLayersAndLegends([ layer.name ], false, false, false);
				} else {
					node.zoomDisable = false;
					if (node.forceDisable !== true) {
						this.enableLayersAndLegends([ layer.name ], false, false);
					}
				}
			}
		}
	},
	
	
	
	/**
	 * Enable and show the layer(s) node and show the legend(s)
	 * 
	 * @param {Array}
	 *            layerNames The layer names
	 * @param {Boolean}
	 *            check True to check the layerTree node
	 *            checkbox (default to false)
	 * @param {Boolean}
	 *            setForceDisable Set the layerTree node
	 *            forceDisable parameter (default to true) The
	 *            forceDisable is used by the
	 *            'toggleLayersAndLegendsForZoom' function to
	 *            avoid to enable, a node disabled for another
	 *            cause that the zoom range.
	 */
	enableLayersAndLegends : function(layerNames, check, setForceDisable) {
		if (!Ext.isEmpty(layerNames)) {
			// The tabPanels must be activated before to show a
			// child component
			var isLayerPanelVisible = this.layerTree.isVisible(), i;

			Ext.getCmp('mapaddonspanel').setActiveItem(this.layerTree);
			for (i = 0; i < layerNames.length; i++) {
				var node;
				layerStore = this.layerTree.store;
				layerStore.each(function(layerNode){
					if (layerNode.data.name == layerNames[i]){
						node = layerNode;
					}
				})
				if (!Ext.isEmpty(node)) {
					var nodeId = node.id;
					if (setForceDisable !== false) {
						this.layerTree.store.getNodeById(nodeId).forceDisable = false;
					}
					if (this.layerTree.store.getNodeById(nodeId).zoomDisable !== true) {
//						this.layerTree.getNodeById(nodeId).enable();
						node.data.disabled = false;
						this.layerTree.fireEvent('nodeEnabled', node);
					}
//					this.layerTree.store.getNodeById(nodeId).getUI().show();

					if (check === true) {
						// Note: the redraw must be done before
						// to
						// check the node
						// to avoid to redisplay the old layer
						// images before the new one
						var layers = this.map.getLayersByName(layerNames[i]);
						layers[0].redraw(true);
						this.layerTree.toggleNodeCheckbox(nodeId, true);
					}
				}
			}

			Ext.getCmp('mapaddonspanel').setActiveItem(Ext.getCmp('legendspanel'));
			this.setLegendsVisible(layerNames, true);

			// Keep the current activated panel activated
			if (isLayerPanelVisible) {
				Ext.getCmp('mapaddonspanel').setActiveItem(this.layerTree);
			}
		} else {
			console.warn('EnableLayersAndLegends : layerNames parameter is empty.');
		}
	},

	/**
	 * Disable (and hide if asked) the layer(s) And hide the
	 * legend(s)
	 * 
	 * @param {Array}
	 *            layerNames The layer names
	 * @param {Boolean}
	 *            uncheck True to uncheck the layerTree node
	 *            checkbox (default to false)
	 * @param {Boolean}
	 *            hide True to hide the layer(s) and legend(s)
	 *            (default to false)
	 * @param {Boolean}
	 *            setForceDisable Set the layerTree node
	 *            forceDisable parameter (default to true) The
	 *            forceDisable is used by the
	 *            'toggleLayersAndLegendsForZoom' function to
	 *            avoid to enable, a node disable for another
	 *            cause that the zoom range.
	 */
	disableLayersAndLegends : function(layerNames, uncheck, hide, setForceDisable) { // hide ne sert à rien
		var i;
		if (!Ext.isEmpty(layerNames) && (this.layerTree !== null)) {
			for (i = 0; i < layerNames.length; i++) {
				var node;
				layerStore = this.layerTree.store;
				layerStore.each(function(layerNode){
					if (layerNode.data.name == layerNames[i]){
						node = layerNode;
					}
				})
				if (!Ext.isEmpty(node)) {
					var nodeId = node.id;
					if (uncheck === true) {
						this.layerTree.toggleNodeCheckbox(nodeId, false);
					}
					node.data.disabled = true;
					this.layerTree.fireEvent('nodeDisabled', node);
				}
				this.setLegendsVisible([ layerNames[i] ], false);
			}
		}
	},

	/**
	 * Create and submit a form
	 * 
	 * @param {String}
	 *            url The form url
	 * @param {object}
	 *            params The form params
	 */
	post: function(url, params) {
		var temp = document.createElement("form"), x;
		temp.action = url;
		temp.method = "POST";
		temp.style.display = "none";
		for (x in params) {
			var opt = document.createElement("textarea");
			opt.name = x;
			opt.value = params[x];
			temp.appendChild(opt);
		}
		document.body.appendChild(temp);
		temp.submit();
		return temp;
	}, 


	/**
	 * Print the map
	 * 
	 * @param {Ext.Button}
	 *            button The print map button
	 * @param {EventObject}
	 *            event The click event
	 */
	printMap : function(button, event) {
		// Get the BBOX
		var center = this.map.center, zoom = this.map.zoom, i;

		// Get the layers
		var activatedLayers = this.map.getLayersBy('visibility', true);
		var activatedLayersNames = '';
		for (i = 0; i < activatedLayers.length; i++) {
			currentLayer = activatedLayers[i];
			if (currentLayer.printable !== false &&
				currentLayer.visibility == true &&
				currentLayer.inRange == true) {
				activatedLayersNames += activatedLayers[i].name + ',';
			}
		}
		activatedLayersNames = activatedLayersNames.substr(0, activatedLayersNames.length - 1);
		this.post(Ext.manifest.OgamDesktop.requestServiceUrl +'../map/printmap', {
			center : center,
			zoom : zoom,
			layers : activatedLayersNames
		});
	}

});
