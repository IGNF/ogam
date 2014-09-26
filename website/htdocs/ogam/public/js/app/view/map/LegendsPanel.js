Ext.define('Ogam.view.map.LegendsPanel', {
	extend: 'GeoExt.tree.Panel',
	//extend: 'Ext.tab.Tab',
	mixins: ['Ogam.view.interface.LayersPanel'],
	xtype: 'legends-panel',
	border: false,
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
		this.store = Ext.create('Ogam.store.map.LayerTreeNodes');
		this.callParent(arguments);
	}
});