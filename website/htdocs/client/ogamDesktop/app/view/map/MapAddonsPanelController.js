/**
 * This class manages the legends panel view.
 */
Ext.define('OgamDesktop.view.map.MapAddonsPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mapaddonspanel',
    listen: {
         controller: {
             'mapcomponent': {
                 resultsBBoxChanged: 'enableRequestLayersAndLegends'
             },
             'layerspanel':{
                checkchange: 'onLayerCheckChange'
             }
         }
     },

    /**
     * Initializes the controller.
     * @private
     */
    init : function() {
        this.layersPanel = this.getView().child('layers-panel');
        this.layersPanelCtrl = this.layersPanel.getController();
        this.legendsPanelCtrl = this.getView().child('legends-panel').getController();
    },

    /**
     * Toggle the legend in function of the layer tree node check state
     * @private
     * @param {GeoExt.data.model.LayerTreeNode} node The layer tree node
     * @param {Boolean} checked True if the node is checked
     */
    onLayerCheckChange : function(node, checked) {
        this.legendsPanelCtrl.setLegendsVisible([node.getOlLayer()], checked);
    },

    /**
     * Enable and show the layer(s) and show the legend(s)
     * @private
     * @param {Boolean} enable True to enable the layers and legends
     * @param {Array} layers The layers
     * @param {Boolean} toggleNodeCheckbox True to toggle the layerTree node checkbox (default to false)
     */
    toggleLayersAndLegends : function(enable, layers, toggleNodeCheckbox) {
        if (!Ext.isEmpty(enable) && !Ext.isEmpty(layers)) {
            var node;
            for (var i in layers) {
                node = this.layersPanelCtrl.getLayerNode(layers[i]);
                if (!Ext.isEmpty(node)) {
                    this.layersPanelCtrl.updateLayerNode(node, enable);
                    toggleNodeCheckbox && this.layersPanelCtrl.toggleNodeCheckbox(node, enable);
                }
            }
            this.legendsPanelCtrl.setLegendsVisible(layers, enable);
        } else {
            console.warn('toggleLayersAndLegends : enable or/and layers parameter(s) is/are empty.');
        }
    },

    /**
     * Enable and show the request layer(s) and legend(s).
     * @private
     * @param {OgamDesktop.view.map.MapComponentController} mapCmpCtrl The map component controller
     */
    enableRequestLayersAndLegends: function(mapCmpCtrl) {
        this.toggleLayersAndLegends(true, mapCmpCtrl.requestLayers, true);
    }
});