
Ext.define('OgamDesktop.ux.tree.plugin.TreeViewContainer', {
    alias: 'plugin.treeviewcontainer',
    extend: 'Ext.tree.plugin.TreeViewDragDrop',
    
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    //configurables
    /**
     * @cfg {String} disabledCls
     * The CSS class applied when the {@link Ext.data.Model} of the node has a 'disabled' field with a true value.
     */
    disabledCls: 'dvp-tree-node-disabled',
    /**
     * @cfg {Boolean} preventSelection 
     * True to prevent selection of a node that is disabled. Default true.
     */
    preventSelection: true,
    
    //properties
    
    //private
    constructor: function(){
        this.callParent(arguments);
        // Dont pass the config so that it is not applied to 'this' again
        this.mixins.observable.constructor.call(this);
    },//eof constructor
    
    /**
     * @private
     * @param {Ext.tree.Panel} tree
     */
    init: function(tree) {
        var me = this,
            view = ( tree.is("treeview") )? tree : tree.getView(),
            origFn,
            origScope;
        
        me.callParent(arguments);
        this.tree = tree;
        origFn = view.getRowClass;
        if (origFn){
            origScope = view.scope || me;
            Ext.apply(view,{
                //append our value to the original function's return value
                getRowClass: function(){
                    var v1,v2;
                    v1 = origFn.apply(origScope,arguments) || '';
                    v2 = me.getRowClass.apply(me,arguments) || '';
                    return (v1 && v2) ? v1+' '+v2 : v1+v2;
                }
            });
        } else {
            Ext.apply(view, {
                getRowClass: Ext.Function.bind(me.getRowClass,me)
            });
        }
        
        Ext.apply(view, {
            //if our function returns false, the original function is not called
            onCheckChange: Ext.Function.createInterceptor(view.onCheckChange,me.onCheckChangeInterceptor,me)
        });
        
       /* if (me.preventSelection){
            me.mon(tree.getSelectionModel(),'beforeselect',me.onBeforeNodeSelect,me);
        }*/
        
		//tree.on('checkchange', me.checkNodes, view);
        tree.on('destroy', me.destroy, me, {single: true});
        tree.store.on('nodebeforemove', me.checkMove);
    },
    
    /**
     * Destroy the plugin.  Called automatically when the component is destroyed.
     */
    destroy: function() {
        this.callParent(arguments);
        this.clearListeners();
    },
    
    /**
     * Returns a properly typed result.
     * @return {Ext.tree.Panel}
     */
    getCmp: function() {
        return this.callParent(arguments);
    },
    
    /**
     * @private
     * @param {Ext.data.Model} record
     * @param {Number} index
     * @param {Object} rowParams
     * @param {Ext.data.Store} ds
     * @return {String}
     */
    getRowClass: function(record,index,rowParams,ds){
        return (record.get('disabled') && record.getData().leaf) ? this.disabledCls : '';
    },
    
    /**
     * @private
     * @param {Ext.selection.TreeModel} sm
     * @param {Ext.data.Model} node
     * @return {Boolean}
     */
    onBeforeNodeSelect: function(sm,node){
        if (node.get('disabled')){
            return false;
        }
    },
    
    /**
     * @private
     * @param {Ext.data.Model} record
     */
    onCheckChangeInterceptor: function(record) {
        if (record.get('disabled') && record.getData().leaf) {
            return false;
        } else if (!record.getData().leaf) { // useful to cancel layernode behavior for a group
        	record.set('checked', !record.get('checked'));
        	this.checkNodes(record, record.get('checked'));
        	return false;
        }
	},
		
	checkNodes: function(node, checked) {
		for (i in node.childNodes) {
			if (!node.childNodes[i].get('disabled')) {
				this.tree.fireEvent('checkchange', node.childNodes[i], checked);
			};
			
		};
	},

	checkMove: function(node, oldParent, newParent, index) {
		if (node.get('disabled') || !node.get('leaf')) {
			return false;
		} else if (oldParent != newParent) {
			Ext.Msg.alert("Error", "Forbidden move");
			return false;
		}
	}
});