Ext.define('OgamDesktop.store.map.Layer',{
	mixins: ['GeoExt.data.LayerStore'],
	extend: 'Ext.data.TreeStore',
	requires: ['OgamDesktop.view.map.MapPanel'],
	model: 'OgamDesktop.model.map.Layer',
	load: function() {
		
//		this.layerstore = Ext.create('Ext.data.TreeStore', {
//			model: 'GeoExt.data.LayerTreeModel',
//			root: {
//				plugins: [{
//					ptype: 'gx_grouplayercontainer',
//					store: Ext.getCmp('mappanel').layers
//				}],
//				expanded: true
//			}			
//		});
		Ext.Ajax.request({
			url : Ext.manifest.OgamDesktop.requestServiceUrl +'../map/ajaxgettreelayers',
			success : this.initLayerTree,
			scope : this
		});
		this.callParent(arguments);
		console.log(this);
	},

	initLayerTree: function(response) {
		rootChildren = Ext.decode(response.responseText);
		this.root.appendChild(rootChildren);
		this.root.eachChild(function(node) {
			node.set('container', Ext.create('GeoExt.tree.LayerContainer'));
		}, this);
		while (this.layerstore.data.items.length > 0){
			for (i in this.layerstore.data.items) {
				layerNode = this.layerstore.data.items[i];
				console.log(layerNode);
				this.root.eachChild(function(node) {
					if (node.data.nodeGroup == layerNode.data.layer.options.nodeGroup) {
						node.appendChild(layerNode);
						return false;
					}
				}, this);
			}
		}
	}
});

//Ext.define('OgamDesktop.store.map.Layer', {
//		extend: 'Ext.data.TreeStore',
//		model: 'GeoExt.data.LayerTreeModel',
//		root: {
//			plugins: [{
//				ptype: 'gx_layercontainer',
////				store: Ext.getCmp('mappanel').layers
//			}],
//			expanded: true
//		}
//});