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
     *            nodeId The node id
     * @param {Boolean}
     *            toggleCheck True to check, false to uncheck the box. If no
     *            value was passed, toggles the checkbox
     */
    toggleNodeCheckbox : function(nodeId, toggleCheck) {
        var node = this.getView().getStore().getNodeById(nodeId);
        // Change check status
        this.getView().getView().fireEvent('checkchange', node, toggleCheck);
        node.set('checked', toggleCheck);
    }
});