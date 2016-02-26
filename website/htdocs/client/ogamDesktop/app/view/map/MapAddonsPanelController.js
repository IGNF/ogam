/**
 * This class manages the legends panel view.
 */
Ext.define('OgamDesktop.view.map.MapAddonsPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mapaddonspanel',

    listen: {
         controller: {
             'mapcomponent': {
                 //changelayervisibility: 'toggleLayersAndLegends',
                 changevisibilityrange: 'toggleLayersAndLegendsForZoom',
                 onGetResultsBBox: 'enableRequestLayersAndLegends'
             }
         }
     },

    init : function() {
        this.LayersPanel = this.getView().child('layers-panel');
        this.LayersPanelCtrl = this.LayersPanel.getController();
        this.LegendsPanelCtrl = this.getView().child('legends-panel').getController();
    },

    /**
     * Toggle the layer node and legend in function of the zoom
     * range
     * 
     * @param {OpenLayers.Layer}
     *            layer The layer to check
     * @param {Boolean}
     *            enable True to enable the layers and legends
     */
    toggleLayersAndLegendsForZoom : function(layer, enable) {
        var node;
        // Get the tree store of the layers tree panel and scan it.
        var layerStore = this.LayersPanel.getStore();
        layerStore.each(function(layerNode){
            if (!layerNode.data.isLayerGroup && layerNode.data.get('code') === layer.get('code')) {
                node = layerNode;
            }
        });
        if (!Ext.isEmpty(node) && !node.hidden) {
            node.set("cls", enable ? '':'dvp-tree-node-disabled');
            if (!enable) {
                this.disableLayersAndLegends([ layer ], false);
            } else {
                if (node.forceDisable !== true) {
                    this.enableLayersAndLegends([ layer ], false);
                }
            }
        }
    },

    /**
     * Enable and show the layer(s) node and show the legend(s)
     * 
     * @param {Boolean}
     *            enable True to enable the layers and legends
     * @param {Array}
     *            layers The layers
     * @param {Boolean}
     *            toggleNodeCheckbox True to toggle the layerTree node
     *            checkbox (default to false)
     */
    toggleLayersAndLegends : function(enable, layers, toggleNodeCheckbox) {
        if (!Ext.isEmpty(enable) && !Ext.isEmpty(layers)) {
            for (var i in layers) {
                var node;
                // Get the tree store of the layers tree panel and scan it.
                var layerStore = this.LayersPanel.getStore();
                layerStore.each(function(layerNode){
                    if (layerNode.getOlLayer().get('code') === layers[i].get('code')){
                        node = layerNode;
                    }
                });
                if (!Ext.isEmpty(node)) {
                    node.getOlLayer().set('disabled', !enable);
                    toggleNodeCheckbox && this.LayersPanelCtrl.toggleNodeCheckbox(node.id, enable);
                }
            }
            this.LegendsPanelCtrl.setLegendsVisible(layers, enable);
        } else {
            console.warn('EnableLayersAndLegends : enable or/and layers parameter(s) is/are empty.');
        }
    },

    /**
     * Enable and show the layer(s) node and show the legend(s)
     * 
     * @param {Array}
     *            layers The layers
     * @param {Boolean}
     *            check True to check the layerTree node
     *            checkbox (default to false)
     */
    enableLayersAndLegends : function(layers, check) {
        this.toggleLayersAndLegends(true, layers, check);
    },

    /**
     * Disable (and hide if asked) the layer(s) And hide the
     * legend(s)
     * 
     * @param {Array}
     *            layers The layers
     * @param {Boolean}
     *            uncheck True to uncheck the layerTree node
     *            checkbox (default to false)
    **/
    disableLayersAndLegends : function(layers, uncheck) {
        this.toggleLayersAndLegends(false, layers, uncheck);
    },

    enableRequestLayersAndLegends: function(layers, check) {
        if (!Ext.isEmpty(layers)) {
            for (var i in layers) {
                var node;
                // Get the tree store of the layers tree panel and scan it.
                var layerStore = this.LayersPanel.getStore();
                layerStore.each(function(layerNode){
                    if (layerNode.getOlLayer().get('code') === layers[i].get('code')){
                        node = layerNode;
                    }
                });
                if (!Ext.isEmpty(node)) {
                    node.set("cls", '');
                }
            }
        } else {
            console.warn('EnableLayersAndLegends : enable or/and layers parameter(s) is/are empty.');
        }
        this.toggleLayersAndLegends(true, layers, check);
    }
});