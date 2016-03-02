/**
 * This class manages the legends panel view.
 */
Ext.define('OgamDesktop.view.map.MapAddonsPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mapaddonspanel',

    listen: {
         controller: {
             'mapcomponent': {
                 changevisibilityrange: 'toggleLayersAndLegendsForZoom',
                 onGetResultsBBox: 'enableRequestLayersAndLegends'
             }
         }
     },

    init : function() {
        this.layersPanel = this.getView().child('layers-panel');
        this.layersPanelCtrl = this.layersPanel.getController();
        this.legendsPanelCtrl = this.getView().child('legends-panel').getController();
    },

    /**
     * Toggle the layer and legend in function of the zoom
     * range
     * 
     * @param {OpenLayers.Layer}
     *            layer The layer to check
     * @param {Boolean}
     *            enable True to enable the layers and legends
     */
    toggleLayersAndLegendsForZoom : function(layer, enable) {
        var node = this.layersPanelCtrl.getLayerNode(layer);
        if (!Ext.isEmpty(node) && !node.hidden) {
            if (!enable) {
                // Disable Layers And Legends
                this.toggleLayersAndLegends(false, [ layer ], false, true);
            } else {
                if (node.forceDisable !== true) {
                    // Enable Layers And Legends
                    this.toggleLayersAndLegends(true, [ layer ], false, true);
                }
            }
        }
    },

    /**
     * Enable and show the layer(s) and show the legend(s)
     * 
     * @param {Boolean}
     *            enable True to enable the layers and legends
     * @param {Array}
     *            layers The layers
     * @param {Boolean}
     *            toggleNodeCheckbox True to toggle the layerTree node
     *            checkbox (default to false)
     * @param {Boolean}
     *            toggleNodeAvailability True to toggle the layerTree node
     *            availability (default to false)
     */
    toggleLayersAndLegends : function(enable, layers, toggleNodeCheckbox, toggleNodeAvailability) {
        if (!Ext.isEmpty(enable) && !Ext.isEmpty(layers)) {
            var node;
            for (var i in layers) {
                node = this.layersPanelCtrl.getLayerNode(layers[i]);
                if (!Ext.isEmpty(node)) {
                    node.getOlLayer().set('disabled', !enable);
                    toggleNodeCheckbox && this.layersPanelCtrl.toggleNodeCheckbox(node.id, enable);
                    toggleNodeAvailability && node.set("cls", enable ? '':'dvp-tree-node-disabled');
                }
            }
            this.legendsPanelCtrl.setLegendsVisible(layers, enable);
        } else {
            console.warn('toggleLayersAndLegends : enable or/and layers parameter(s) is/are empty.');
        }
    },

    /**
     * Enable and show the request layer(s) and legend(s)
     * 
     * @param {Array}
     *            layers The request layers
     * @param {Boolean}
     *            toggleNodeCheckbox True to toggle the layerTree node
     *            checkbox (default to false)
     */
    enableRequestLayersAndLegends: function(layers, toggleNodeCheckbox) {
        this.toggleLayersAndLegends(true, layers, toggleNodeCheckbox, true);
    }
});