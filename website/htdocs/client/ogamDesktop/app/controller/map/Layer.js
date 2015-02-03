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
		'Ext.MessageBox'
	],

	/**
	 * The map panel view.
	 * @private
	 * @property
	 * @type OgamDesktop.view.map.MapPanel
	 */
	mapPanel: null,

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
			geometryfield: 'geometryfield'
		},
		control: {
			'geometryfield': {
				geomCriteriaPress: 'showQueryTbar',
				geomCriteriaUnpress: 'hideQueryTbar',
				geomCriteriaDestroy: 'hideQueryTbarAndRemoveFeatures',
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
				featureModified: 'updateVectorLayer'
			},
			'layers-panel': {
				checkchange: 'onCheckChange',
				nodeEnable: 'nodeEnable'
			},
			'advanced-request button[action = submit]': {
				onRequestFormSubmit: 'hideQueryTbar'
			}
		}
	},
	
	/**
	 * Update the WKT value of the drawn vector layer into the geometry field of request panel
	 * 
	 */
	updateVectorLayer: function() {
		var wktValue = null;
		if (this.getMappanel().vectorLayer.features.length){
			wktValue = 'MULTIPOLYGON('; 
			for (var i = 0 ; i < this.getMappanel().vectorLayer.features.length ; i++) {
				var val = (this.getMappanel().wktFormat.write(this.getMappanel().vectorLayer.features[i]));
				if (val.indexOf('MULTIPOLYGON', 0) == -1) {
					val = val.split('POLYGON')[1];
				} else {
					val = val.split('MULTIPOLYGON(')[1];
					val = val.substring(0, val.lastIndexOf(')'));
				}
				wktValue = wktValue + val + ',';
			}
			wktValue = wktValue.substring(0, wktValue.lastIndexOf(',')) + ')';
		}
		var geometryField = Ext.ComponentQuery.query('geometryfield');
		if (geometryField.length){
			geometryField[0].setValue(wktValue);
		}
	},

	showQueryTbar: function() {
		this.setQueryMode(true);
	},

	hideQueryTbar: function() {
		this.setQueryMode(false);
	},
	
	hideQueryTbarAndRemoveFeatures: function() {
		this.setQueryMode(false, true);
	},
	
	/**
	 * Activates / Deactivates drawing tbar
	 * @param {boolean}
	 *            enable Tbar to Enable or not
	 */
	setQueryMode: function(enable, removeFeatures) {
		// Activate drawing buttons group
		var drawingTbar = this.getMappanel().getDockedItems('toolbar buttongroup[action = drawing]');
		if (drawingTbar.length) {
			drawingTbar[0].setVisible(enable);
		}
		
		var drawPolygonButton = this.getMappanel().getDockedItems('toolbar button[action = drawpolygon]');
		if (drawPolygonButton.length) {
			drawPolygonButton[0].toggle(enable);
		}
		if (!enable) {
			// Deactivate drawing tbar buttons as tbar disapears
			var modifyButton = this.getMappanel().getDockedItems('toolbar button[action = modifyfeature]');
			if (modifyButton.length) {
				modifyButton[0].toggle(false);
			}
			var deleteFeatureButton = this.getMappanel().getDockedItems('toolbar button[action = deletefeature]');
			if (deleteFeatureButton.length) {
				deleteFeatureButton[0].toggle(false);
			}
			if(removeFeatures){
				this.getMappanel().vectorLayer.removeAllFeatures();
			} else {
				// Hide vector layer features
				for( var i = 0; i < this.getMappanel().vectorLayer.features.length; i++ ) {
					this.getMappanel().vectorLayer.features[i].style = { display: 'none' };
				}
			}
			this.getMappanel().vectorLayer.redraw();
		} else {
			// Show vector layer features
			for( var i = 0; i < this.getMappanel().vectorLayer.features.length; i++ ) {
				this.getMappanel().vectorLayer.features[i].style = null;
			}
			this.getMappanel().vectorLayer.redraw();
		}
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
		this.mapMainWin.getComponent(1).setActiveItem(this.mapMainWin.getComponent(1).getComponent(0));
		
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
			this.mapMainWin.getComponent(1).setActiveItem(this.mapMainWin.getComponent(1).getComponent(1));
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
		this.mapPanel = this.mapMainWin.getComponent(0);
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
	setMapLayers : function(map, vectorLayer, vector, baseLayer, wfsLayer) {
		// Add the base layer (always first)
		map.addLayer(baseLayer);
		
		if (this.mapPanel) {
			// Add the available layers
			for ( var i = 0; i < this.mapPanel.layersList.length; i++) {
				map.addLayer(this.mapPanel.layersList[i]);
			}
			// Add the WFS layer
			if (!this.hideLayerSelector && this.mapPanel.wfsLayer !== null) {
				map.addLayer(this.mapPanel.wfsLayer);
				this.mapPanel.snappingControl.addTargetLayer(this.mapPanel.wfsLayer);
			}
		}
		
		// Add the vector layer
		map.addLayer(vectorLayer);
		map.addLayer(vector);
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
		var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
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
		this.mapPanel.wfsLayer.visibility = false;

		this.setMapLayers(this.mapPanel.map, this.mapPanel.baseLayer, this.mapPanel.vectorLayer, this.mapPanel.vector, this.mapPanel.wfsLayer);

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
			if (serviceObject.data.config.params.SERVICE=="WMTS") {
				//creation and merging of wmts parameters
				var layer=paramsObj.layers[0];
				var tileOrigin = new OpenLayers.LonLat(-20037508,20037508); //coordinates of top left corner of the matrixSet : usual value of geoportal, google maps 
				var serverResolutions = [156543.033928,78271.516964,39135.758482,19567.879241,9783.939621,4891.969810,2445.984905,1222.992453,611.496226,305.748113,152.874057,76.437028,38.218514,19.109257,9.554629,4.777302,2.388657,1.194329,0.597164,0.298582,0.149291,0.074646]; 
				// the usual 22 values of resolutions accepted by wmts servers geoportal
				
				var obj={options:layerObject.data.options,name:layerObject.data.name,url:url.toString(),layer:layer,tileOrigin:tileOrigin,serverResolutions:serverResolutions,opacity:layerObject.data.options.opacity,visibility:layerObject.data.options.visibility,isBaseLayer:layerObject.data.options.isBaseLayer};
				var objMergeParams= {};
				for (var attrname in obj) { objMergeParams[attrname] = obj[attrname]; }
				for (var attrname in paramsObj) { objMergeParams[attrname] = paramsObj[attrname]; }
				newLayer = new OpenLayers.Layer.WMTS(objMergeParams);

			} else if (serviceObject.data.config.params.SERVICE=="WMS"){
				newLayer = new OpenLayers.Layer.WMS(layerObject.data.name , url , paramsObj , layerObject.data.options);
			} else {
				Ext.Msg.alert("Please provide the \"" + layerObject.data.viewServiceName + "\" service type.");
			}
			
			if (layerObject.data.params.isHidden) {
				newLayer.displayInLayerSwitcher = false;
			} else {
				newLayer.displayInLayerSwitcher = true;
			}

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
//		legend = this.getLegendspanel()
		legend = this.mapMainWin.getComponent(1).getComponent(1)
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
		
		// initialize the Tree store based on the map layers
		treeLayerStore = Ext.create('Ext.data.TreeStore', {
			model: 'GeoExt.data.LayerTreeModel',
			root: {}
		});
		// for each node, we create a store which is a selection of the map layers store
		for (i in nodes) {
			var node = nodes[i];
			var storeSelection = Ext.create('GeoExt.data.LayerStore');
			var rootChild = {};

			this.mapPanel.layers.each(function(layer) {
				if (layer.data.options.nodeGroup && layer.data.options.nodeGroup == node.data.nodeGroup) {
					storeSelection.add(layer);
				} else if (layer.data.title == node.data.layer) {
					// Creation of the layer node
						rootChild = {
						text: node.data.text,
						layer: layer.data,
						disabled: node.raw.disabled,
						plugins: [
							Ext.create('GeoExt.tree.LayerNode')
						]
					};
					// Add of the container
					if (!node.data.hidden) {
						treeLayerStore.root.appendChild(rootChild);
					}
					rootChild = null;
				}
			});

			if (rootChild) {
				// creation of the layer group container
				rootChild = {
					text: node.data.text,
					plugins: [
						Ext.create('OgamDesktop.ux.map.GroupLayerContainer', {
							store: storeSelection,
							nodeGroup: nodes[i].data.nodeGroup,
							containerCheckedStatus: node.data.checked,
							containerExpandedStatus: node.data.expanded
						})
					]
				};
				// add of the container
				if (!node.data.hidden) {
					treeLayerStore.root.appendChild(rootChild);
				}
				
			}
		}
		this.mapMainWin.getComponent(1).getComponent(0).setConfig('store', treeLayerStore);
//		this.getLayerspanel().setConfig('store', treeLayerStore);
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
	 * Toggle the children checkbox on the parent checkbox change
	 * 
	 * @param {Ext.tree.TreeNode}
	 *            node The parent node
	 * @param {Boolean}
	 *            checked The checked status
	 * @hide
	 */
	onCheckChange : function(node, checked) {
		if (node.firstChild == null) {
			if(checked != node.get('layer').getVisibility()) {
				node._visibilityChanging = true;
				var layer = node.get('layer');
				if(checked && layer.isBaseLayer && layer.map) {
					layer.map.setBaseLayer(layer);
				} else if(!checked && layer.isBaseLayer && layer.map &&
					layer.map.baseLayer && layer.id == layer.map.baseLayer.id) {
					// Must prevent the unchecking of radio buttons
					node.set('checked', layer.getVisibility());
				} else {
					layer.setVisibility(checked);
				}
				delete node._visibilityChanging;
			}
		}
		for ( var i = 0 ; i < node.childNodes.length ; i++) {
			var child = node.childNodes[i];
			if (!child.get('disabled')) {
				child.set('checked', checked);
				this.onCheckChange(child, checked);
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