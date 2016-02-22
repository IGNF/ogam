/**
 * This class defines the controller with actions related to 
 * legends.
 */
Ext.define('OgamDesktop.controller.map.Legend',{
	extend: 'Ext.app.Controller',
//	mixins: ['OgamDesktop.view.interface.LegendsPanel'],
	requires: [
            'OgamDesktop.view.map.LayersPanel',
            'OgamDesktop.view.map.LegendsPanel'
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
                mappanel: '#map-panel',
                mapaddonspanel: 'map-addons-panel'
            },
            control: {
                'mapcomponent': {
                    changelayervisibility: 'toggleLayersAndLegendsForZoom',
                    changevisibilityrange: 'toggleLayersAndLegendsForZoom',
                    onGetResultsBBox: 'enableLayersAndLegends'
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

            for (var i in layerNames) {
                var lyrName = layerNames[i];
                var legendCmp = this.getLegendspanel().getComponent(this.getMappanel().id + layerNames[i]);
                if (!Ext.isEmpty(legendCmp)) {
                    if (visible === true) {
                        var layers = [];
                        var olLyr = this.getMappanel().child('mapcomponent').getController().getMapLayer(lyrName);
                        if (olLyr && !olLyr.isLayerGroup) {
                            layers.push(olLyr);
                            if (olLyr.getVisible()){
                                legendCmp.show();
                            } else {
                                legendCmp.hide();
                            }
                        }
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
            
//            this.setLegendsVisible
            
            
            if (!Ext.isEmpty(this.getLayerspanel())) {
                var node;
                // Get the tree store of the layers tree panel
                // and scan it.
                var layerStore = this.getLayerspanel().getStore();
                layerStore.each(function(layerNode){
                    if (!layerNode.data.isLayerGroup && layerNode.data.get('name') == layer.get('name')) {
                        node = layerNode;
                    }
                });
                if (!Ext.isEmpty(node) && !node.hidden) {
                    if (!toEnable) {
                        this.disableLayersAndLegends([ layer.get('code') ], false);
                    } else {
                        if (node.forceDisable !== true) {
                            this.enableLayersAndLegends([ layer.get('code') ], false);
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
	 */
	enableLayersAndLegends : function(layerNames, check) {
            if (!Ext.isEmpty(layerNames)) {
                for (var i in layerNames) {
                    var node;
                    var olLyr;
                    // Get the tree store of the layers tree panel
                    // and scan it.
                    var layerStore = this.getLayerspanel().getStore();
                    layerStore.each(function(layerNode){
                        if (layerNode.getOlLayer().get('code') === layerNames[i]){
                            node = layerNode;
                            olLyr = layerNode.getOlLayer();
                        }
                    });
                    if (!Ext.isEmpty(node)) {
                        if (check) {
                            this.toggleNodeCheckbox(node.id, true);
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
        **/
	disableLayersAndLegends : function(layerNames, uncheck) {
            if (!Ext.isEmpty(layerNames) && (this.getLayerspanel() !== null)) {
                for (var i in layerNames) {
                    var node;
                    var olLyr;
                    // Get the tree store of the layers tree panel
                    // and scan it.
                    var layerStore = this.getLayerspanel().store;
                    layerStore.each(function(layerNode){
                        if (layerNode.getOlLayer().get('code') === layerNames[i]){
                            node = layerNode;
                            olLyr = layerNode.getOlLayer();
                        }
                    });
                    if (!Ext.isEmpty(node)) {
                        node.getOlLayer().set('disabled', true);
                        node.set("cls", 'dvp-tree-node-disabled'); 
                        if (uncheck) {
                            this.toggleNodeCheckbox(node.id, false);
                        }
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
            var node = this.getLayerspanel().getStore().getNodeById(nodeId);
            // Change check status
            this.getLayerspanel().getView().fireEvent('checkchange', node, toggleCheck);
            node.set('checked', toggleCheck);
	}
});