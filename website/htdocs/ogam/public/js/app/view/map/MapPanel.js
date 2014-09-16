Ext.define('Ogam.view.map.MapPanel', {
	extend: 'GeoExt.panel.Map',
	requires: ['GeoExt.tree.LayerContainer'],
	id: 'mappanel',
	//mixins: ['Ogam.view.interface.MapPanel'],
    layersList: [],
	minZoomLevel : 0,
	xtype: 'map-panel',
    width:'100%',
    height:'100%',
	tbar: [{
		xtype: 'tbspacer',
		flex: 1
	},{
		type: 'button', text: 'i'
	},{
		type: 'button', text: 'sl'
	},'-',{
		type: 'button', text: 'p'
	},{
		type: 'button', text: 'n'
	},{
		type: 'button', text: 'i'
	},{
		type: 'button', text: 'zi'
	},{
		type: 'button', text: 'zo'
	},{
		type: 'button', text: 'dm'
	},'-',{
		type: 'button', text: 'zr'
	},{
		type: 'button', text: 'me'
	}],
	initComponent: function(){
	    //this.map = new OpenLayers.Map("map",{allOverlays: false});

		// Creates the map Object (OpenLayers)
		this.map = this.initMap();
		
		Ext.Ajax.request({
			url : Ogam.base_url + 'map/ajaxgetlayers',
			scope : this,
			success :this.addLayersAndLayersTree
		});
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
		
		// Define the WFS layer, used as a grid for snapping
		/*if (!this.hideLayerSelector) {
			
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
							srs: Ogam.map.projection
						}, 
						format: new OpenLayers.Format.GML({extractAttributes: true})
					})									
				});
			this.wfsLayer.printable = false;
			this.wfsLayer.displayInLayerSwitcher = false;
			this.wfsLayer.extractAttributes = false;
			this.wfsLayer.styleMap = styleMap;
			this.wfsLayer.visibility = false;
			
		}*/
		this.setMapLayers(this.map);
		
		// Gets the layer tree model to initialise the Layer
		// Tree
		Ext.Ajax.request({
			url : Ogam.base_url + 'map/ajaxgettreelayers',
			success : this.initLayerTree,
			scope : this
		});
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
		// Add the WFS layer
		/*if (!this.hideLayerSelector && this.wfsLayer !== null) {
			map.addLayers(this.wfsLayer);
			this.snappingControl.addTargetLayer(this.wfsLayer);
		}*/

		// Add the vector layer
		//map.addLayer(this.vectorLayer);

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
/*
		// Mouse position
		map.addControl(new OpenLayers.Control.MousePosition({
			prefix : 'X: ',
			separator : ' - Y: ',
			suffix : this.projectionLabel,
			numDigits : 0,
			title : 'MousePosition'
		}));
*/
		// Scale
		map.addControl(new OpenLayers.Control.Scale());
		map.addControl(new OpenLayers.Control.ScaleLine({
			title : 'ScaleLine',
			bottomOutUnits : '',
			bottomInUnits : ''
		}));
		

		// Zoom the map to the user country level
		map.setCenter(new OpenLayers.LonLat(Ogam.map.x_center, Ogam.map.y_center), Ogam.map.defaultzoom);
/*
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
*/
		return map;
	}
});
