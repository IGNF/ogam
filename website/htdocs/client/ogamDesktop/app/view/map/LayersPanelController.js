/**
 * This class manages the legends panel view.
 */
Ext.define('OgamDesktop.view.map.LayersPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.layerspanel',

    /**
     * Initializes the controller.
     * @private
     */
    init: function() {
        Ext.apply(this.getView().getView(), {
            onCheckChange: Ext.Function.createInterceptor(this.getView().getView().onCheckChange,function(e) {
                if (e.record.getOlLayer().get('disabled')) {
                    return false;
                }
            })
        });
    },

    /**
     * Toggle the node checkbox.
     * @param {Integer} node The node
     * @param {Boolean} toggleCheck True to check, false to uncheck the box. If no value was passed, toggles the checkbox
     */
    toggleNodeCheckbox : function(node, toggleCheck) {
        // Change check status
        this.getView().getView().fireEvent('checkchange', node, toggleCheck);
        node.set('checked', toggleCheck);
    },

    /**
     * Return the layer node.
     * @param {OpenLayers.Layer} layer The layer
     * @return {GeoExt.data.model.LayerTreeNode/Ext.data.NodeInterface} The layer node
     */
    getLayerNode : function(layer) {
        var foundLayerNode = null;
        // Get the tree store of the layers tree panel and scan it.
        var layerStore = this.getView().getStore();
        layerStore.each(function(layerNode){
            if (!layerNode.get('isLayerGroup') && layerNode.getOlLayer().get('name') === layer.get('name')) {
                foundLayerNode = layerNode;
                return false; // Break the each loop
            }
        });
        return foundLayerNode;
    },

    /**
     * Enable/Disable the passed layer node.
     * @param {GeoExt.data.model.LayerTreeNode/Ext.data.NodeInterface} node
     * @param {Boolean} enable True to enable the node
     */
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