/**
 * This class defines the controller with actions related to 
 * legends.
 */
Ext.define('OgamDesktop.controller.map.Legend',{
	extend: 'Ext.app.Controller',
//	mixins: ['OgamDesktop.view.interface.LegendsPanel'],
	requires: [
            'OgamDesktop.view.map.LayersPanel',
            'OgamDesktop.view.map.LegendsPanel',
            'OgamDesktop.view.map.MapPanel'
	],

	/**
	 * The refs to get the views concerned
	 * and the control to define the handlers of the
	 * MapPanel.
	 */
	config: {
            refs: {
                layerspanel: 'layers-panel',
                legendspanel: 'legends-panel',
                mappanel: 'map-panel',
                mapaddonspanel: 'map-addons-panel'
            },
            control: {
//			'map-panel': {
//				onLayerVisibilityChange: 'toggleLayersAndLegendsForZoom',
//				onGetResultsBBox: 'enableLayersAndLegends'
//			},
                'mapcomponent': {
                    changelayervisibility: 'toggleLayersAndLegendsForZoom'
                }
            }
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
            // The tabPanels must be activated before to show a
            // child component
            var isLayerPanelVisible = this.getLayerspanel().isVisible();
            this.getMapaddonspanel().setActiveItem(this.getLegendspanel());

            var i;
            for (i = 0; i < layerNames.length; i++) {
                var legendCmp = this.getLegendspanel().getComponent(this.getMappanel().id + layerNames[i]);
                if (!Ext.isEmpty(legendCmp)) {
                    if (visible === true) {
                        var layers = [];
                        this.getMappanel().lookupReference('mapCmp').getMap().getLayers().forEach(function(lyr) {
                            for (j in layerNames){
                                lyrName = layerNames[j];
                                if (lyr.leaf && lyr.getSource().params_ && lyr.getSource().params_.layers[0] == lyrName){
                                    layers.push(lyr);
                                    if (lyr.getVisible()){
                                        legendCmp.show();
                                    } else {
                                        legendCmp.hide();
                                    }
                                }
                            }
                        });
                    } else {
                        legendCmp.hide();
                    }
                }
            }

            // Keep the current activated panel activated
            if (isLayerPanelVisible) {
                this.getMapaddonspanel().setActiveItem(this.getLayerspanel());
            }
	},

	/**
	 * Toggle the layer node and legend in function of the zoom
	 * range
	 * 
	 * @param {OpenLayers.Layer}
	 *            layer The layer to check
	 */
	toggleLayersAndLegendsForZoom : function(layer, toEnable) {
            if (!Ext.isEmpty(this.getLayerspanel())) {
                var node;
                // Get the tree store of the layers tree panel
                // and scan it.
                var layerStore = this.getLayerspanel().store;
                layerStore.each(function(layerNode){
                    if (!layerNode.data.isLayerGroup && layerNode.data.get('name') == layer.get('name')) {
                        node = layerNode;
                    }
                });
                if (!Ext.isEmpty(node) && !node.hidden) {
                    if (!toEnable) {
                        node.zoomDisable = true;
                        this.disableLayersAndLegends([ layer.getSource().params_.layers[0] ], false, false, false);
                    } else {
                        node.zoomDisable = false;
                        if (node.forceDisable !== true) {
                            this.enableLayersAndLegends([ layer.getSource().params_.layers[0] ], false, false);
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
                var i;
                for (i = 0; i < layerNames.length; i++) {
                    var node;
                    // Get the tree store of the layers tree panel
                    // and scan it.
                    var layerStore = this.getLayerspanel().store;
                    layerStore.each(function(layerNode){
                        if (layerNode.data.layer && layerNode.data.layer.name == layerNames[i]){
                            node = layerNode;
                        }
                    })
                    if (!Ext.isEmpty(node)) {
                        var nodeId = node.id;
                        if (setForceDisable !== false) {
                            this.getLayerspanel().store.getNodeById(nodeId).forceDisable = false;
                        }
                        if (this.getLayerspanel().store.getNodeById(nodeId).zoomDisable !== true) {
                            node.data.disabled = false;
                            this.getLayerspanel().fireEvent('nodeEnable', node, true);
                        }

                        if (check === true) {
                            // Change check status
                            this.getLayerspanel().fireEvent('checkchange', node, true);

                            // Note: the redraw must be done before
                            // to
                            // check the node
                            // to avoid to redisplay the old layer
                            // images before the new one
                            var layers = this.getMappanel().map.getLayersByName(layerNames[i]);
                            layers[0].redraw(true);
                            this.toggleNodeCheckbox(nodeId, true);
                        }
                    }
                }
                this.setLegendsVisible(layerNames, true);

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
            if (!Ext.isEmpty(layerNames) && (this.getLayerspanel() !== null)) {
                for (i = 0; i < layerNames.length; i++) {
                    var node;
                    // Get the tree store of the layers tree panel
                    // and scan it.
                    var layerStore = this.getLayerspanel().store;
                    layerStore.each(function(layerNode){
                        if (layerNode.data.name == layerNames[i]){
                            node = layerNode;
                        }
                    })
                    if (!Ext.isEmpty(node)) {
                        var nodeId = node.id;
                        if (uncheck === true) {
                            this.toggleNodeCheckbox(nodeId, false);
                        }
                        node.data.disabled = true;
                        this.getLayerspanel().fireEvent('nodeEnable', node, false);
                    }
                    this.setLegendsVisible([ layerNames[i] ], false);
                }
            }
	},

	/**
	 * Toggle the node checkbox
	 * 
	 * @param {Integer}
	 *            nodeId The node id
	 * @param {Boolean}
	 *            toggleCheck True to check, false to uncheck the box. If no
	 *            value was passed, toggles the checkbox
	 */
	toggleNodeCheckbox : function(nodeId, toggleCheck) {
            var node = this.getLayerspanel().store.getNodeById(nodeId);
            node.set('checked', toggleCheck);
	}
});