/**
 * This class defines the controller with actions related to 
 * tree layers, map layers, map controls.
 */
Ext.define('OgamDesktop.controller.map.Layer',{
	extend: 'Ext.app.Controller',
	requires: [
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
			mappanel: '#map-panel'
		},
		control: {
//			'#map-panel toolbar combobox': {
//				select: 'layerSelected'
//			},
			'map-mainwin': {
				afterrender: 'afterMapMainWinRendered'
			}
//                        'mapcomponent': {
//                            changelayervisibility: 'updateLayerNode'
//                        },
//			'layers-panel': {
//				nodeEnable: 'nodeEnable'
//			},
		}
	},
    
    afterMapMainWinRendered : function(mapMainWin) {
        // Retrieve layer services
        // Load the LayerService store
        var layersList = [];
        Ext.Ajax.request({
            url: Ext.manifest.OgamDesktop.mapServiceUrl + 'ajaxgettreelayers',
            method: 'POST',
            scope: this,
            success: function(response, options) {
                var layerNodes = Ext.decode(response.responseText);
                for (i in layerNodes) {
                    var lyrNode = layerNodes[i];
                    if (!lyrNode.leaf) {
                        olGrp = new ol.layer.Group({
                            name: lyrNode.text,
                            code: lyrNode.nodeGroup,
                            visible: !lyrNode.hidden,
                            displayInLayerSwitcher: !lyrNode.hidden
                        });
                        layersList.push(olGrp);
                    }
                }
                Ext.Ajax.request({
                    url: Ext.manifest.OgamDesktop.mapServiceUrl +'ajaxgetlayers',
                    method: 'POST',
                    success: function(response, options) {
                        var result = Ext.decode(response.responseText);
                        var layers = result.layers;
                        var services = result.services;
                        for (var i in layers) {
                            var layer = layers[i];
                            var sourceWMSOpts = {};
                            var sourceWMTSOpts = {};
                            var olLayerOpts = {};
                            for (var j in services) {
                                var service = services[j];
                                if (service.name === layer.viewServiceName) {
                                    var source;
                                    if (service.config.params.SERVICE === 'WMS') {
                                        sourceWMSOpts['params'] = {
                                            'layers': layer.params.layers,
                                            'REQUEST': service.config.params.REQUEST,
                                            'VERSION': service.config.params.VERSION,
                                            'session_id': layer.params.session_id
                                        };
                                        sourceWMSOpts['urls'] = service.config.urls;
                                        source = new ol.source.TileWMS(sourceWMSOpts);
                                    } else if (service.config.params.SERVICE === 'WMTS') {
//                                        creation and merging of wmts parameters
                                        var origin = service.config.params.tileOrigin; //coordinates of top left corner of the matrixSet
                                        var resolutions = service.config.params.serverResolutions;
                                        var matrixIds = [];
                                        for (i in resolutions){
                                            matrixIds[i] = i;
                                        };
                                        var tileGrid = new ol.tilegrid.WMTS({
                                            origin: origin,
                                            resolutions: resolutions,
                                            matrixIds: matrixIds
                                        });
                                        sourceWMTSOpts['urls'] = service.config.urls;
                                        sourceWMTSOpts['layer'] = layer.name;
                                        sourceWMTSOpts['tileGrid'] = tileGrid;
                                        sourceWMTSOpts['matrixSet'] = service.config.params.matrixSet;
                                        sourceWMTSOpts['style'] = service.config.params.style;
                                        olLayerOpts['session_id'] = layer.params.session_id;
                                        source = new ol.source.WMTS(sourceWMTSOpts);
                                    }
                                    var activateType = layer.params.activateType.toLowerCase();
                                    var mapCmp = this.getMappanel().child('mapcomponent');
                                    if (Ext.isEmpty(mapCmp.layersActivation[activateType])) {
                                        mapCmp.layersActivation[activateType] = [layer.name];
                                    } else {
                                        mapCmp.layersActivation[activateType].push(layer.name);
                                    }
                                    olLayerOpts['source'] = source;
                                    olLayerOpts['name'] = layer.options.label;
                                    olLayerOpts['opacity'] = layer.options.opacity;
                                    olLayerOpts['code'] = layer.name;
                                    olLayerOpts['printable'] = true;
                                    olLayerOpts['visible'] = !layer.params.isHidden;
                                    olLayerOpts['displayInLayerSwitcher'] = !layer.params.isHidden;
                                    //olLayerOpts['minResolution'] = layer.params.minResolution;
                                    //olLayerOpts['maxResolution'] = layer.params.maxResolution;
                                    var olLayer = new ol.layer.Tile(olLayerOpts);
                                    if (layer.options.nodeGroup == -1){
                                        layersList.push(olLayer);
                                    } else {
                                        for (var k in layersList) {
                                            var lyr =  layersList[k];
                                            if (layer.options.nodeGroup == lyr.get('code')) {
                                                var lyrs = lyr.getLayers();
                                                lyrs.push(olLayer);
                                                lyr.setLayers(lyrs);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        var map = this.getMappanel().child('mapcomponent').getMap();
                        for (var i in layersList) {
                            var lyr = layersList[i];
                            map.addLayer(lyr);
                        }
                        var layersCollection = new Ext.util.MixedCollection();
                        layersCollection.addAll(layersList);
                        var displayInLayerSwitcher = new Ext.util.Filter({
                            filterFn : function(item) {
                                return item.get('displayInLayerSwitcher');
                            }
                        });
                        var treeLayersCollection = layersCollection.filter(displayInLayerSwitcher);
                        var treeLayersGroup = new ol.layer.Group({
                            layers: treeLayersCollection.getRange()
                        });
                        treeLayerStore = Ext.create('GeoExt.data.store.LayersTree', {
                            layerGroup: treeLayersGroup
                        });
                        this.getLayerspanel().setConfig('store', treeLayerStore);
                    },
                    scope: this
                });
            }
        }); 
    },

//
//	/**
//	 * Handler of 'nodeEnable' event fires (into Legend controller)
//	 * enable or disable tree node.
//	 * 
//	 * @param {object}
//	 *            node The node to enable / disable
//	 * @param {boolean}
//	 *            toEnable True if the node is to enable, false else
//	 */
//	nodeEnable: function(node, toEnable) {
//		// The tabPanels must be activated before to show a
//		// child component
//		var isLayerPanelVisible = this.getLayerspanel().isVisible();
//		this.getMapaddonspanel().setActiveItem(this.getLayerspanel());
//		
//		var parent = node.parentNode;
//		if (toEnable === false) {
//			// Apply css class for disabled node
//			node.data.cls = 'dvp-tree-node-disabled';
//		} else {
//			// Apply default css class
//			node.data.cls = '';
//		}
//		
//		// Necessary to correctly update the tree panel
//		if (!parent.collapsed) {
//			parent.collapse();
//			parent.expand();
//		}
//		
//		// Keep the current activated panel activated
//		if (!isLayerPanelVisible) {
//			this.getMapaddonspanel().setActiveItem(this.getLegendspanel());
//		}
//	},
//        updateLayerNode: function(lyr, toEnable) {
//            console.log('--------  UPDATE LAYER NODE HANDLER  --------');
//            console.log('lyr', lyr);
//            console.log('visibility', toEnable);
//            
//            
//        },
//	/**
//	 * Build a Legend Object from a 'Layer' store record.
//	 * @param {Object}
//	 *            layerObject The 'Layer' store record
//	 * @param {Object}
//	 *            serviceObject The 'LayerService' store record for the legend
//	 *            corresponding to the layer
//	 * @return OpenLayers.Layer
//	 */
//	buildLegend : function(layerObject,serviceObject) {
//		var legend = this.getLegendspanel()
//		//legend = this.mapMainWin.getComponent(1).getComponent(1)
//			.add(new Ext.Component({
//				// Extjs 5 doesn't accept '.' into ids
//				id : this.mapPanel.id + layerObject.data.name.replace(/\./g,'-'),
//					autoEl : {
//						tag : 'div',
//						children : [{
//							tag : 'span',
//							html : layerObject.data.options.label,
//							cls : 'x-form-item x-form-item-label'
//						},{
//							tag : 'img',
//							src : serviceObject.data.config.urls.toString()
//							+ 'LAYER='+ layerObject.data.params.layers
//							+ '&SERVICE=' + serviceObject.data.config.params.SERVICE+ '&VERSION=' + serviceObject.data.config.params.VERSION + '&REQUEST=' + serviceObject.data.config.params.REQUEST
//							+ '&Format=image/png&WIDTH=160&HASSLD=' + (layerObject.data.params.hasSLD ? 'true' : 'false')
//						}]
//					}
//			}));
//		if (layerObject.data.params.isDisabled || layerObject.data.params.isHidden || !layerObject.data.params.isChecked) {
//			legend.on('render', function(cmp) {
//				cmp.hide();
//			});
//		}
//	},
//
//
//	/**
//	 * A layer has been selected in the layer selector
//	 */
//	layerSelected : function(combo, value) {
//		if (value[0].data.code !== null) {
//			var layerName = value[0].data.code;
//			var url = value[0].data.url;
//			var popupTitle = this.popupTitle;
//			// Change the WFS layer typename
//			this.mapPanel.wfsLayer.protocol.featureType = layerName;
//			this.mapPanel.wfsLayer.protocol.options.featureType = layerName;
//			this.mapPanel.wfsLayer.protocol.format.featureType = layerName;
//			this.mapPanel.wfsLayer.protocol.params.typename = layerName;
//			this.mapPanel.wfsLayer.protocol.options.url = url;
//
//			// Remove all current features
//			this.mapPanel.wfsLayer.destroyFeatures();
//
//			// Copy the visibility range from the original
//			// layer
//			originalLayers = this.mapPanel.map.getLayersByName(layerName);
//			if (originalLayers != null) {
//				originalLayer = originalLayers[0];
//				this.mapPanel.wfsLayer.maxResolution = originalLayer.maxResolution;
//				this.mapPanel.wfsLayer.maxScale = originalLayer.maxScale;
//				this.mapPanel.wfsLayer.minResolution = originalLayer.minResolution;
//				this.mapPanel.wfsLayer.minScale = originalLayer.minScale;
//				this.mapPanel.wfsLayer.alwaysInRange = false;
//				this.mapPanel.wfsLayer.calculateInRange();
//			}
//
//			// Make it visible
//			this.mapPanel.wfsLayer.setVisibility(true);
//
//			// Force a refresh (rebuild the WFS URL)
//			this.mapPanel.wfsLayer.moveTo(null, true, false);
//
//			// Set the layer name in other tools
//			if (this.mapPanel.getFeatureControl !== null) {
//				this.mapPanel.getFeatureControl.layerName = layerName;
//			}
//
//			this.mapPanel.wfsLayer.refresh();
//			this.mapPanel.wfsLayer.strategies[0].update({force:true});
//
//		} else {
//			// Hide the layer
//			this.mapPanel.wfsLayer.setVisibility(false);
//		}
//		
//		// Set the layer name in feature info tool
//		if (this.mapPanel.featureInfoControl !== null) {
//			this.mapPanel.featureInfoControl.layerName = layerName;
//		}
//	},

	onLaunch:function(){
		//clean previous request or result in server side
		Ext.Ajax.request({
		 url: Ext.manifest.OgamDesktop.requestServiceUrl+'ajaxrestresultlocation',
		 failure: function(response, opts) {

			 console.warm('server-side failure with status code ' + response.status);
		 }
		});
	}
});