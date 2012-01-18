/**
 * 
 * LayerTreePanel Class
 * 
 * @class Genapp.tree.LayerTreePanel
 * @extends Ext.tree.TreePanel
 * @constructor Create a new LayerTreePanel
 * @param {Object} config
 * @xtype Ext.tree.TreePanel
 */

Ext.namespace('Genapp.tree');

Genapp.tree.LayerTreePanel = Ext.extend( Ext.tree.TreePanel, {

    autoScroll : true,
    rootVisible : false,
    enableDD: true,
    title : '',
    border : false,
    layerNodeIds: [],
    listeners: {
        // Toggle the children checkbox on the parent checkbox change
        'checkchange': function(node, checked) { 
            if (checked === true) {
                for(var i = 0; i < node.childNodes.length; i++){
                    var child = node.childNodes[i];
                    if(!child.ui.isChecked()){
                        child.ui.toggleCheck(true);
                    }
                }
            } else {
                for(var i = 0; i < node.childNodes.length; i++){
                    var child = node.childNodes[i];
                    if(child.ui.isChecked()){
                        child.ui.toggleCheck(false);
                    }
                }
            }
        },
        'scope':this
    },

    plugins : [
       {
            init: function(layerTree) {
                layerTree.getRootNode().cascade(
                function(child) {
                    if(child.attributes.disabled == true){
                        child.forceDisable = true;
                    }else{
                        child.forceDisable = false;
                    }
                }
                );
            }
        }/*, TODO: look for an equivalent with geoext
        mapfish.widgets.LayerTree.createContextualMenuPlugin(['opacitySlide'])*/
        ],
    
    // private
    initComponent: function(){
        this.root = new Ext.tree.AsyncTreeNode({
            children : this.rootChildren,
            leaf: false,
            expanded : true
        });
        this.on('afterrender', function(treePanel) {
            var root = treePanel.getRootNode();
            this.setNodeText(root);
            this.setLayerNodeIds(root);
        }, this);
        Genapp.tree.LayerTreePanel.superclass.initComponent.call(this);
    },

    /**
     * Set the layerNodeIds array
     * 
     * @param {Ext.tree.TreeNode} node The current node where search the layer
     * @hide
     */
    setLayerNodeIds : function(node){
        for(var i = 0; i < node.childNodes.length; i++){
            var child = node.childNodes[i];
            if(!Ext.isEmpty(child.layer)){
                this.layerNodeIds[child.layer.name] = child.id;
            } else if(!child.isLeaf()) {
                this.setLayerNodeIds(child);
            }
        }
    },

    /**
     * Return the node id for the passed layer name
     * 
     * @param {String} layerName The layer name
     */
    getLayerNodeId : function(layerName){
        return this.layerNodeIds[layerName];
    },

    /**
     * Set the text node to the layer label
     * 
     * @param {Ext.tree.TreeNode} node The current node where set the layer text
     * @hide
     */
    setNodeText : function (node){
        for(var i = 0; i < node.childNodes.length; i++){
            var child = node.childNodes[i];
            if(!Ext.isEmpty(child.layer)){
                child.setText(child.layer.options.label);
            } else if(!child.isLeaf()) {
                this.setNodeText(child);
            }
        }
    },

    /**
     * Toggle the node checkbox
     * 
     * @param {Integer} nodeId The node id
     * @param {Boolean} toggleCheck True to check, false to uncheck the box. 
     * If no value was passed, toggles the checkbox
     */
    toggleNodeCheckbox : function(nodeId, toggleCheck){
        var node = this.getNodeById(nodeId);
        node.ui.toggleCheck(toggleCheck);
        
    }
});
Ext.reg('layertreepanel', Genapp.tree.LayerTreePanel);