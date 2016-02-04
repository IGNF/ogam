/**
 * This class defines the controller with actions related to 
 * tree layers, map layers, map controls.
 */
Ext.define('OgamDesktop.controller.map.Layer',{
	extend: 'Ext.app.Controller',
	requires: [
		'OgamDesktop.view.map.MapPanel',
		'OgamDesktop.view.map.LayersPanel',
		'OgamDesktop.store.map.Layer',
		'OgamDesktop.store.map.LayerService',
		'OgamDesktop.store.map.LayerNode',
		'Ext.window.MessageBox'
	],

	/**
	 * The map panel view.
	 * @private
	 * @property
	 * @type OgamDesktop.view.map.MapPanel
	 */
	mapPanel: null,

	/**
	 * The current edition field linked to the drawing toolbar
	 * @private
	 * @property
	 * @type OgamDesktop.ux.form.field.GeometryField
	 */
	currentEditionField: null,

	/**
	 * The previous edition field id linked to the drawing toolbar
	 * @private
	 * @property
	 * @type String
	 */
	previousEditionFieldId: null,

	/**
	 * The refs to get the views concerned
	 * and the control to define the handlers of the
	 * MapPanel, toolbar and LayersPanel events
	 */
	config: {
		refs: {
			layerspanel: 'layers-panel',
			legendspanel: 'legends-panel',
			mapaddonspanel: 'map-addons-panel',
			mappanel: 'map-panel',
			geometryfield: 'geometryfield',
			consultationpanel : '#consultationTab',
			mapmainwin :  'map-mainwin'
		},
		control: {
			'geometryfield': {
				geomCriteriaPress: 'onGeomCriteriaPress',
				geomCriteriaUnpress: 'onGeomCriteriaUnpress',
				geomCriteriaDestroy: 'onGeomCriteriaUnpress'
			},
			'map-panel toolbar combobox': {
				select: 'layerSelected'
			},
			'map-panel toolbar button[action="zoomtoresults"]': {
				click: 'zoomOnResultsBBox'
			},
			'map-mainwin': {
				afterrender: 'afterMapMainWinRender'
			},
			'map-panel': {
				afterinitmap: 'setMapLayers',
				getFeature: 'getFeature',
				resultswithautozoom: 'zoomOnResultsBBox',
				featureModified: 'updateCurrentEditionFieldValue',
				validateFeatureEdition:'onValidateFeatureEdition',
				cancelFeatureEdition:'onCancelFeatureEdition'
			},
			'layers-panel': {
				nodeEnable: 'nodeEnable'
			},
			'advanced-request button[action = submit]': {
				submitRequest: 'onSubmitRequest'
			}
		}
	},

	/**
	 * Manage the validateFeatureEdition event
	 */
	onValidateFeatureEdition: function() {
		this.currentEditionField.fireEvent('featureEditionValidated');
		this.unpressField();
	},

	/**
	 * Manage the cancelFeatureEdition event
	 */
	onCancelFeatureEdition: function() {
		this.currentEditionField.fireEvent('featureEditionCancelled');
		this.currentEditionField.setValue(this.currentEditionFieldOldValue);
		this.unpressField();
	},

	/**
	 * Set the features of the vector layer from a WKT
	 */
	setVectorLayerFeaturesFromWKT: function(wkt) {
		var mapPanel = this.getMappanel();
		this.removeVectorLayerFeatures();
		if (!Ext.isEmpty(wkt)) {
			var feature = mapPanel.wktFormat.read(wkt);
			if (Ext.isEmpty(feature)) {
				console.error(mapPanel.invalidWKTMsg);
			} else {
				if (!Array.isArray(feature)) {
					feature = [feature];
				}
				mapPanel.vectorLayer.addFeatures(feature);
			}
		}
	},

	/**
	 * Update the WKT value of the drawn vector layer into the geometry field of request panel
	 */
	updateCurrentEditionFieldValue: function() {
		var mapPanel = this.getMappanel();
		var wktValue = null;
		var featuresNbr = mapPanel.vectorLayer.features.length;
		if (featuresNbr === 1){ // Avoid the GEOMETRYCOLLECTION for only one feature
			wktValue = mapPanel.wktFormat.write(mapPanel.vectorLayer.features[0]);
		} else if (featuresNbr > 1) { // Return a GEOMETRYCOLLECTION
			wktValue = mapPanel.wktFormat.write(mapPanel.vectorLayer.features);
		}
		if (this.currentEditionField !== null){
			this.currentEditionField.setValue(wktValue);
		}
	},

	/**
	 * Manage the geometry field press event
	 * 
	 * @param {Ext.form.field.Field} field The pressed field
	 */
	onGeomCriteriaPress: function(field) {
		if (this.currentEditionField !== null) {
			// Deactivation of the previous edition mode and field
			this.previousEditionFieldId = this.currentEditionField.getId();
			this.currentEditionField.onUnpress();
		}
		this.currentEditionField = field;
		this.currentEditionFieldOldValue = field.getValue();
		this.setVectorLayerFeaturesFromWKT(field.getValue());
		this.toggleDrawingTbar(true);
		var consultationPanel = this.getConsultationpanel();
		consultationPanel.ownerCt.setActiveTab(consultationPanel);
		var mapMainWin = this.getMapmainwin();
		mapMainWin.ownerCt.setActiveTab(mapMainWin);
	},

	/**
	 * Manage the geometry field unpress event
	 * 
	 * @param {Ext.form.field.Field} field The unpressed field
	 */
	onGeomCriteriaUnpress: function(field) {
		if(field && field.getId() === this.previousEditionFieldId){ // Do nothing
			this.previousEditionFieldId = null;
		} else {
			this.currentEditionField = null;
			this.toggleDrawingTbar(false);
			this.removeVectorLayerFeatures();
		}
	},

	/**
	 * Deactivation of the previous edition mode and field on a request launch
	 */
	onSubmitRequest: function() {
		this.unpressField();
	},

	/**
	 * Unpress the current edition field linked to the drawing toolbar
	 */
	unpressField: function() {
		if (this.currentEditionField !== null) {
			this.currentEditionField.onUnpress();
		}
	},

	/**
	 * Setup the drawing toolbar buttons (visibilities and default controls)
	 */
	setupDrawingTbarButtons: function() {
		// Set the buttons visibilities
		var drawPointButton = this.getMappanel().getDockedItems('toolbar button[action = drawpoint]');
		if (drawPointButton.length) {
			drawPointButton[0].setVisible(!this.currentEditionField.hideDrawPointButton);
		}
		var drawLineButton = this.getMappanel().getDockedItems('toolbar button[action = drawline]');
		if (drawLineButton.length) {
			drawLineButton[0].setVisible(!this.currentEditionField.hideDrawLineButton);
		}
		var drawPolygonButton = this.getMappanel().getDockedItems('toolbar button[action = drawpolygon]');
		if (drawPolygonButton.length) {
			drawPolygonButton[0].setVisible(!this.currentEditionField.hideDrawPolygonButton);
		}
		var drawValidationButtons = this.getMappanel().getDockedItems('toolbar [group = drawValidation]');
		for (var i=0; i < drawValidationButtons.length; i++) {
			drawValidationButtons[i].setVisible(!this.currentEditionField.hideValidateAndCancelButtons);
		}

		// Set the default control
		switch (this.currentEditionField.defaultActivatedDrawingButton) {
			case 'point' : drawPointButton[0].toggle(true); break;
			case 'line' : drawLineButton[0].toggle(true); break;
			case 'polygon' : drawPolygonButton[0].toggle(true); break;
		}
	},

	/**
	 * Activates / Deactivates drawing tbar
	 * 
	 * @param {boolean} enable Enable or disable the drawing toolbar
	 */
	toggleDrawingTbar: function(enable) {
		if(enable){
			// Setup the drawing toolbar buttons
			this.setupDrawingTbarButtons();
		} else {
			// Deactivates all the drawing toolbar buttons controls on the toolbar disappearance
			var drawingTbarButtons = this.getMappanel().getDockedItems('toolbar buttongroup[action = drawing] button');
			for(var i = 0; i < drawingTbarButtons.length; i++){
				drawingTbarButtons[i].toggle(false);
			}
		}
		// Show or hide drawing buttons group
		var drawingTbar = this.getMappanel().getDockedItems('toolbar buttongroup[action = drawing]');
		if (drawingTbar.length) {
			drawingTbar[0].setVisible(enable);
		}
	},

	/**
	 * Hide vector layer features
	 */
	hideVectorLayerFeatures: function () {
		var mapPanel = this.getMappanel();
		for( var i = 0; i < mapPanel.vectorLayer.features.length; i++ ) {
			mapPanel.vectorLayer.features[i].style = { display: 'none' };
		}
		mapPanel.vectorLayer.redraw();
	},

	/**
	 * Remove vector layer features
	 */
	removeVectorLayerFeatures: function () {
		this.getMappanel().vectorLayer.removeAllFeatures({'silent':true});
	},

	/**
	 * Show vector layer features
	 */
	showVectorLayerFeatures: function () {
		var mapPanel = this.getMappanel();
		for( var i = 0; i < mapPanel.vectorLayer.features.length; i++ ) {
			mapPanel.vectorLayer.features[i].style = null;
		}
		mapPanel.vectorLayer.redraw();
	},

	/**
	 * Handler of 'nodeEnable' event fires (into Legend controller)
	 * enable or disable tree node.
	 * 
	 * @param {object}
	 *            node The node to enable / disable
	 * @param {boolean}
	 *            toEnable True if the node is to enable, false else
	 */
	nodeEnable: function(node, toEnable) {
		// The tabPanels must be activated before to show a
		// child component
		var isLayerPanelVisible = this.getLayerspanel().isVisible();
		this.getMapaddonspanel().setActiveItem(this.getLayerspanel());
		
		var parent = node.parentNode;
		if (toEnable === false) {
			// Apply css class for disabled node
			node.data.cls = 'dvp-tree-node-disabled';
		} else {
			// Apply default css class
			node.data.cls = '';
		}
		
		// Necessary to correctly update the tree panel
		if (!parent.collapsed) {
			parent.collapse();
			parent.expand();
		}
		
		// Keep the current activated panel activated
		if (!isLayerPanelVisible) {
			this.getMapaddonspanel().setActiveItem(this.getLegendspanel());
		}
	},

	/**
	 * Handler of 'afterrender' event for the MapPanel.
	 * 
	 * @param {object}
	 *            mappanel the MapPanel
	 */
	afterMapMainWinRender: function(mapmainwin) {
		this.mapMainWin = mapmainwin;
		this.mapPanel = this.getMappanel();
		// Load the LayerService store
		var serviceStore = this.getStore('map.LayerService');
		serviceStore.load({
			callback: this.onServiceStoreLoad,
			scope: this
		});
	},

	/**
	 * Get services and load Layer store.
	 */
	onServiceStoreLoad: function(services) {
		this.mapPanel.services = services;
		
		// Load the Layer store
		var layerStore = this.getStore('map.Layer');
		layerStore.load({
			callback: this.addLayers,
			scope: this
		});
	},

	/**
	 * Set the layers of the map
	 */
	//setMapLayers : function(map, vectorLayer, vector, baseLayer, wfsLayer) {
        setMapLayers : function(map) {
            // Add the base layer (always first)
            //map.addLayer(baseLayer);

            if (this.mapPanel) {
                // Add the available layers
                for ( var i = 0; i < this.mapPanel.layersList.length; i++) {
                    map.addLayer(this.mapPanel.layersList[i]);
                }
                // Add the WFS layer
                /*if (!this.hideLayerSelector && this.mapPanel.wfsLayer !== null) {
                    map.addLayer(this.mapPanel.wfsLayer);
                    this.mapPanel.snappingControl.addTargetLayer(this.mapPanel.wfsLayer);
                }*/
            }

            // Add the vector layer
//            map.addLayer(vectorLayer);
//            map.addLayer(vector);
	},

	/**
	 * Build the layers from the Layer store records and add them to the
	 * map. Get the layers tree from the LayerNode store and build the
	 * layers tree.
	 */
	addLayers : function(layers) {
		// Reset the arrays
		this.mapPanel.layersList = [];
		this.mapPanel.layersActivation = {};
		// Rebuild the list of available layers
		for (i in layers) {
			var layerObject = layers[i];
			// Get the view service name
			var viewServiceName = layerObject.data.viewServiceName;
			for (i in this.mapPanel.services) {
				var service = this.mapPanel.services[i];
				if (service.data.name == viewServiceName) {
					viewServiceObject = service;
					break;
				}
			};
			
			// Build the new OpenLayers layer object and add it
			// to the list
			var newLayer = this.buildLayer(layerObject, viewServiceObject);
			this.mapPanel.layersList.push(newLayer);

			// Fill the list of active layers
			var activateType = layerObject.data.params.activateType.toLowerCase();
			if (Ext.isEmpty(this.mapPanel.layersActivation[activateType])) {
				this.mapPanel.layersActivation[activateType] = [ layerObject.data.name ];
			} else {
				this.mapPanel.layersActivation[activateType].push(layerObject.data.name);
			}
			// Create the legends
			var legendServiceName = layerObject.data.legendServiceName;
			for (i in this.mapPanel.services) {
				var service = this.mapPanel.services[i];
				if (service.data.name == legendServiceName) {
					legendServiceObject = service;
					this.buildLegend(layerObject, legendServiceObject);
					break;
				}
			};
		};

		// Set the style
		/*var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
			fillOpacity : 0,
			strokeColor : "green",
			strokeWidth : 3,
			strokeOpacity : 1
		}, OpenLayers.Feature.Vector.style["default"]));

		this.mapPanel.wfsLayer = new OpenLayers.Layer.Vector("WFS Layer", 
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

		this.mapPanel.wfsLayer.printable = false;
		this.mapPanel.wfsLayer.displayInLayerSwitcher = false;
		this.mapPanel.wfsLayer.extractAttributes = false;
		this.mapPanel.wfsLayer.styleMap = styleMap;
		this.mapPanel.wfsLayer.visibility = false;*/

		//this.setMapLayers(this.mapPanel.map, this.mapPanel.baseLayer, this.mapPanel.vectorLayer, this.mapPanel.vector, this.mapPanel.wfsLayer);
                this.setMapLayers(this.mapPanel.mapCmp.getMap());

		// Gets the layer tree model to initialise the Layer
		// Tree
		var layerNodeStore = this.getStore('map.LayerNode');
		layerNodeStore.load({
			callback: this.initLayerTree,
			scope: this
		});
	},

	/**
	 * Build one OpenLayer Layer from the 'Layer' store record.
	 * @param {Object}
	 *            layerObject The 'Layer' store record
	 * @param {Object}
	 *            serviceObject The 'LayerService' store record for the legend
	 *            corresponding to the layer
	 * @return OpenLayers.Layer
	 */
	buildLayer : function(layerObject, serviceObject) {
            var url = serviceObject.data.config.urls;
            //Merges the service parameters and the layer parameters
            var paramsObj = {};
            for (var attrname in layerObject.data.params) { paramsObj[attrname] = layerObject.data.params[attrname]; }
            for (var attrname in serviceObject.data.config.params) { paramsObj[attrname] = serviceObject.data.config.params[attrname]; }
            if (paramsObj.SERVICE === "WMTS") {
                //creation and merging of wmts parameters
                var layer=paramsObj.layers[0];
                var origin = paramsObj.tileOrigin; //coordinates of top left corner of the matrixSet
                var resolutions = paramsObj.serverResolutions;
                var matrixIds = [];
                for (i in resolutions){
                    matrixIds[i] = i;
                };
                var tileGrid = new ol.tilegrid.WMTS({
                    origin: origin,
                    resolutions: resolutions,
                    matrixIds: matrixIds
                });
                
                var obj={
                    url:url.toString(),
                    layer:layer,
                    tileGrid:tileGrid
                };
                var objMergeParams= {};
                for (var attrname in obj) { objMergeParams[attrname] = obj[attrname]; }
                for (var attrname in paramsObj) { objMergeParams[attrname] = paramsObj[attrname]; }
                source = new ol.source.WMTS(objMergeParams);
                newLayer = new ol.layer.Tile({
                    opacity: layerObject.data.options.opacity,
                    source: source,
                    name: layerObject.data.options.label
                });

            } else if (paramsObj['SERVICE'] === "WMS"){
                source = new ol.source.TileWMS({
                    url: url,
                    params: paramsObj
                });
                layerOpts = layerObject.data.options;
                layerOpts['source'] = source;
                layerOpts['name'] = layerObject.data.options.label;
                newLayer = new ol.layer.Tile(layerOpts);
            } else {
                    Ext.Msg.alert("Please provide the \"" + layerObject.data.viewServiceName + "\" service type.");
            }

            newLayer.displayInLayerSwitcher = !layerObject.data.params.isHidden;

            return newLayer;
	},

	/**
	 * Build a Legend Object from a 'Layer' store record.
	 * @param {Object}
	 *            layerObject The 'Layer' store record
	 * @param {Object}
	 *            serviceObject The 'LayerService' store record for the legend
	 *            corresponding to the layer
	 * @return OpenLayers.Layer
	 */
	buildLegend : function(layerObject,serviceObject) {
		var legend = this.getLegendspanel()
		//legend = this.mapMainWin.getComponent(1).getComponent(1)
			.add(new Ext.Component({
				// Extjs 5 doesn't accept '.' into ids
				id : this.mapPanel.id + layerObject.data.name.replace(/\./g,'-'),
					autoEl : {
						tag : 'div',
						children : [{
							tag : 'span',
							html : layerObject.data.options.label,
							cls : 'x-form-item x-form-item-label'
						},{
							tag : 'img',
							src : serviceObject.data.config.urls.toString()
							+ 'LAYER='+ layerObject.data.params.layers
							+ '&SERVICE=' + serviceObject.data.config.params.SERVICE+ '&VERSION=' + serviceObject.data.config.params.VERSION + '&REQUEST=' + serviceObject.data.config.params.REQUEST
							+ '&Format=image/png&WIDTH=160&HASSLD=' + (layerObject.data.params.hasSLD ? 'true' : 'false')
						}]
					}
			}));
		if (layerObject.data.params.isDisabled || layerObject.data.params.isHidden || !layerObject.data.params.isChecked) {
			legend.on('render', function(cmp) {
				cmp.hide();
			});
		}
	},

	/**
	 * Build a Legend Object from a 'Layer' store record.
	 * @param {Array}
	 *            nodes The 'LayerNode' store records to fill the layers tree
	 */
	initLayerTree: function(nodes) {
                console.log('tree layer store nodes', nodes);
                groups =  [];
                for (i in nodes) {
                    node = nodes[i].getData();
                    console.log('node data', node)
                    if (!node.leaf) {
                        console.log('map panel layers', this.mapPanel.mapCmp.getMap().getLayers());
                        groupLayers = [];
                        this.mapPanel.mapCmp.getMap().getLayers().forEach(function(layer, idx){
                            console.log('layer', layer);
                            console.log('layer keys', layer.getKeys());
                            if (layer.get('nodeGroup') == node.nodeGroup) {
                                console.log('layer label', layer.get('label'));
                                groupLayers.push(layer);
                            }
                        
                        });
                        group = new ol.layer.Group({
                           name: node.text,
                           layers: groupLayers
                        });
                        this.mapPanel.mapCmp.getMap().getLayers().push(group)
                    };                 
                }
                
                treeLayerStore = Ext.create('GeoExt.data.store.LayersTree', {
                    layerGroup: this.mapPanel.mapCmp.getMap().getLayerGroup()
                });
		this.getLayerspanel().setConfig('store', treeLayerStore);
	},

	/**
	 * A layer has been selected in the layer selector
	 */
	layerSelected : function(combo, value) {
		if (value[0].data.code !== null) {
			var layerName = value[0].data.code;
			var url = value[0].data.url;
			var popupTitle = this.popupTitle;
			// Change the WFS layer typename
			this.mapPanel.wfsLayer.protocol.featureType = layerName;
			this.mapPanel.wfsLayer.protocol.options.featureType = layerName;
			this.mapPanel.wfsLayer.protocol.format.featureType = layerName;
			this.mapPanel.wfsLayer.protocol.params.typename = layerName;
			this.mapPanel.wfsLayer.protocol.options.url = url;

			// Remove all current features
			this.mapPanel.wfsLayer.destroyFeatures();

			// Copy the visibility range from the original
			// layer
			originalLayers = this.mapPanel.map.getLayersByName(layerName);
			if (originalLayers != null) {
				originalLayer = originalLayers[0];
				this.mapPanel.wfsLayer.maxResolution = originalLayer.maxResolution;
				this.mapPanel.wfsLayer.maxScale = originalLayer.maxScale;
				this.mapPanel.wfsLayer.minResolution = originalLayer.minResolution;
				this.mapPanel.wfsLayer.minScale = originalLayer.minScale;
				this.mapPanel.wfsLayer.alwaysInRange = false;
				this.mapPanel.wfsLayer.calculateInRange();
			}

			// Make it visible
			this.mapPanel.wfsLayer.setVisibility(true);

			// Force a refresh (rebuild the WFS URL)
			this.mapPanel.wfsLayer.moveTo(null, true, false);

			// Set the layer name in other tools
			if (this.mapPanel.getFeatureControl !== null) {
				this.mapPanel.getFeatureControl.layerName = layerName;
			}

			this.mapPanel.wfsLayer.refresh();
			this.mapPanel.wfsLayer.strategies[0].update({force:true});

		} else {
			// Hide the layer
			this.mapPanel.wfsLayer.setVisibility(false);
		}
		
		// Set the layer name in feature info tool
		if (this.mapPanel.featureInfoControl !== null) {
			this.mapPanel.featureInfoControl.layerName = layerName;
		}
	},
	
	/**
	 * A feature has been selected using the GetFeatureControl
	 * tool.
	 */
	getFeature : function(evt) {
		if (evt.mapId == this.mapPanel.map.id) {
			// Add the feature to the vector layer
			if (this.mapPanel.vectorLayer !== null) {
				this.mapPanel.vectorLayer.addFeatures(evt.feature);
			}
		}
	},

	/**
	 * Zoom to the passed feature on the map
	 * 
	 * @param {String}
	 *            id The plot id
	 * @param {String}
	 *            wkt The wkt feature
	 */
	zoomToFeature : function(id, wkt) {

		// Parse the feature location and create a Feature
		// Object
		var feature = this.mapPanel.wktFormat.read(wkt);

		// Add the plot id as an attribute of the object
		feature.attributes.id = id.substring(id.lastIndexOf('__') + 2);

		// Remove previous features
		this.mapPanel.vectorLayer.destroyFeatures(this.mapPanel.vectorLayer.features);

		// Move the vector layer above all others
		this.mapPanel.map.setLayerIndex(this.mapPanel.vectorLayer, 100);
		if (feature) {
			// Add the feature
			this.mapPanel.vectorLayer.addFeatures([ feature ]);
		} else {
			alert(this.mapPanel.invalidWKTMsg);
		}

		// Center on the feature
		this.mapPanel.map.setCenter(new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y), 7);
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
			var maxZoomLevel = this.mapPanel.map.numZoomLevels - 1;

			// Parse the feature location and create a Feature
			// Object
			var feature = this.mapPanel.wktFormat.read(wkt);

			var bounds = feature.geometry.getBounds();

			bounds = bounds.scale(ratio);

			var zoom = 0;
			if ((bounds.getWidth() === 0) && (bounds.getHeight() === 0)) {
				zoom = maxZoomLevel;
			} else {
				var desiredZoom = this.mapPanel.map.getZoomForExtent(bounds);
				zoom = (desiredZoom > maxZoomLevel) ? maxZoomLevel : desiredZoom;
			}
			this.mapPanel.map.setCenter(bounds.getCenterLonLat(), zoom);
		}
	},

	/**
	 * Zoom on the results bounding box
	 */
	zoomOnResultsBBox : function() {
		this.zoomOnBBox(this.mapPanel.resultsBBox);
	}
});