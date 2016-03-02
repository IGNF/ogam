/**
 * This class manages the legends panel view.
 */
Ext.define('OgamDesktop.view.map.LayersPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.layerspanel',

    /**
     * Toggle the node checkbox
     * 
     * @param {Integer}
     *            node The node
     * @param {Boolean}
     *            toggleCheck True to check, false to uncheck the box. If no
     *            value was passed, toggles the checkbox
     */
    toggleNodeCheckbox : function(node, toggleCheck) {
        // Change check status
        this.getView().getView().fireEvent('checkchange', node, toggleCheck);
        node.set('checked', toggleCheck);
    },

    /**
     * Return the layer node
     * 
     * @param {OpenLayers.Layer}
     *            layer The layer
     */
    getLayerNode : function(layer) {
        var node;
        // Get the tree store of the layers tree panel and scan it.
        var layerStore = this.getView().getStore();
        layerStore.each(function(layerNode){
            if (!layerNode.data.isLayerGroup && layerNode.data.get('code') === layer.get('code')) {
                node = layerNode;
            }
        });
        return node;
    },

    updateLayerNode: function(node, enable) {
        if (enable) {
            node.getOlLayer().set('disabled', false);
            node.set("cls", ''); 
        } else {
            node.getOlLayer().set('disabled', true);
            node.set("cls", 'dvp-tree-node-disabled'); 
        }
    }
});