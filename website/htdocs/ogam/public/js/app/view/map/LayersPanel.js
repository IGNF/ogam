Ext.define('Ogam.view.map.LayersPanel', {
	extend: 'GeoExt.tree.Panel',
	mixins: ['Ogam.view.interface.LayersPanel'],
	xtype: 'layers-panel',
	border: false,
	//autoScroll: true,
	rootVisible: false,
	lines: false,
	viewConfig: {
		plugins: [{
			ptype: 'treeviewdragdrop',
			appendOnly: false
		}]
	},
	initComponent: function(){
		//layersStore = Ext.getCmp('mappanel').layers;
		this.store = Ext.create('Ext.data.TreeStore',{
			model: 'GeoExt.data.LayerTreeModel',
			root: {
				expanded: true,
				children: [{
					plugins: [{
						ptype: 'gx_layercontainer',
						//store: layersStore
					}],
					expanded: true
				}]
			}
		});
		this.callParent(arguments);
	}
});