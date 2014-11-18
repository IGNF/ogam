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
	layersList: [],
	layers: [],
	services: [],
	mapPanel: null,

	config: {
		refs: {
			layerspanel: 'layers-panel',
			legendspanel: 'legends-panel',
			mapaddonspanel: 'map-addons-panel'
		},		
		control: {
			'map-panel toolbar combobox': {
				select: 'layerSelected'
			},
			'map-panel toolbar button[action="zoomtoresults"]': {
				click: 'zoomOnResultsBBox'
			},
			'map-panel': {
				afterrender: 'afterMapPanelRender',
				afterinitmap: 'setMapLayers',
				getFeature: 'getFeature'
			},
			'layers-panel': {
				checkchange: 'onCheckChange',
				nodeEnable: 'nodeEnable'
			}
		}
	},
	
	nodeEnable: function(node, toEnable) {
		// The tabPanels must be activated before to show a
		// child component
		var isLayerPanelVisible = this.getLayerspanel().isVisible();
		this.getMapaddonspanel().setActiveItem(this.getLayerspanel());
		
		var parent = node.parentNode;
		if (toEnable === false) {
			node.data.cls = 'dvp-tree-node-disabled';
		} else {
			node.data.cls = '';
		}
		if (!parent.collapsed) {
			parent.collapse();
			parent.expand();
		}
		
		// Keep the current activated panel activated
		if (!isLayerPanelVisible) {
			this.getMapaddonspanel().setActiveItem(this.getLegendspanel());
		}
	},

	afterMapPanelRender: function(mappanel) {
		this.mapPanel = mappanel;
		var serviceStore = this.getStore('map.LayerService');
		serviceStore.load({
			callback: this.onServiceStoreLoad,
			scope: this
		});
	},

	onServiceStoreLoad: function(services) {
		this.services = services;
		var layerStore = this.getStore('map.Layer');
		layerStore.load({
			callback: this.addLayers,
			scope: this
		});
	},

	addLayers : function(layers) {
		this.layers = layers;
		// Reset the arrays
		this.layersList = [];
		this.layersActivation = {};
		// Rebuild the list of available layers
		for (i in this.layers) {
			var layerObject = this.layers[i];
			// Get the view service name
			var viewServiceName = layerObject.data.viewServiceName;
			for (i in this.services) {
				var service = this.services[i];
				if (service.data.name == viewServiceName) {
					viewServiceObject = service;
					break;
				}
			};
			
			// Build the new OpenLayers layer object and add it
			// to the list
			var newLayer = this.buildLayer(layerObject,viewServiceObject);
			this.layersList.push(newLayer);

			// Fill the list of active layers
			var activateType = layerObject.data.params.activateType.toLowerCase();
			if (Ext.isEmpty(this.layersActivation[activateType])) {
				this.layersActivation[activateType] = [ layerObject.name ];
			} else {
				this.layersActivation[activateType].push(layerObject.name);
			}

			// Create the legends
			var legendServiceName = layerObject.data.legendServiceName;
			for (i in this.services) {
				var service = this.services[i];
				if (service.data.name == legendServiceName) {
					legendServiceObject = service;
					this.buildLegend(layerObject, legendServiceObject);
					break;
				}
			};
		};

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
		
		this.setMapLayers(this.mapPanel.map, this.mapPanel.baseLayer, this.mapPanel.vectorLayer, this.mapPanel.wfsLayer);

		// Gets the layer tree model to initialise the Layer
		// Tree
		var layerNodeStore = this.getStore('map.LayerNode');
		layerNodeStore.load({
			callback: this.initLayerTree,
			scope: this
		});
	},

	/**
	 * Build one OpenLayer Layer from a JSON object.
	 * 
	 * @return OpenLayers.Layer
	 */
	buildLayer : function(layerObject,serviceObject) {
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
		newLayer.displayInLayerSwitcher = true;

		return newLayer;
	},

	/**
	 * Build a Legend Object from a JSON object.
	 */
	buildLegend : function(layerObject,serviceObject) {
		legend = this.getLegendspanel()
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
	 * Set the layers of the map
	 */
	setMapLayers : function(map, vectorLayer, baseLayer, wfsLayer) {
		// Add the base layer (always first)
		map.addLayer(baseLayer);

		// Add the available layers
		for ( var i = 0; i < this.layersList.length; i++) {
			map.addLayer(this.layersList[i]);
		}
		// Add the WFS layer
		if (this.mapPanel && !this.hideLayerSelector && this.mapPanel.wfsLayer !== null) {
			map.addLayer(this.mapPanel.wfsLayer);
			this.mapPanel.snappingControl.addTargetLayer(this.mapPanel.wfsLayer);
		}
		// Add the vector layer
		map.addLayer(vectorLayer);
	},
	
	/**
	 * 
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

					// creation of the layer node
					rootChild = {
						text: node.data.text,
						layer: layer.data,
						plugins: [
							Ext.create('GeoExt.tree.LayerNode')
						]
					};
					// add of the container
					treeLayerStore.root.appendChild(rootChild);
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
				treeLayerStore.root.appendChild(rootChild);
			}
		}
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
	getFeature : function(feature, mapId) {
		console.log(feature);
		console.log(mapId);
		if (mapId == this.mapPanel.map.id) {
			// Add the feature to the vector layer
			if (this.mapPanel.vectorLayer !== null) {
				this.mapPanel.vectorLayer.addFeatures(feature);
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

	addgeomcriteria: function(){
		console.log(Ext.getCmp('geometryfield'));
		Ext.getCmp('geometryfield').openMap();
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
		// To test :
		//this.mapPanel.resultsBBox = 'POLYGON((939200 2283600,939200 2463600,1026200 2463600,1026200 2283600,939200 2283600))';
			
		this.zoomOnBBox(this.mapPanel.resultsBBox);
	}
});