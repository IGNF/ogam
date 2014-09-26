Ext.define('Ogam.store.map.LayerTreeNodes',{
	extend: 'Ext.data.TreeStore',
	//requires: 'Ogam.model.map.LayerTreeNode',
	requires: 'GeoExt.tree.GroupLayerContainer',
	model: 'Ogam.model.map.LayerTreeNode',
	//model: 'GeoExt.data.LayerTreeModel',
	root: {
		expanded: true,
		children: [{
			plugins: [{
				ptype: 'gx_layercontainer'
			}],
			expanded: true
		}]
	}
//	initComponent: function() {
//		
//		console.log(this.length);
//		
//		console.log('layertreenodes store : ');
//		console.log(this);
//		this.callParent(arguments);
//	}
});