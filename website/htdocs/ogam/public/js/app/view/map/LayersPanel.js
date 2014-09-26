Ext.define('Ogam.view.map.LayersPanel', {
	extend: 'GeoExt.tree.Panel',
	mixins: ['Ogam.view.interface.LayersPanel'],
	xtype: 'layers-panel',
	border: false,
	rootVisible: false,
	autoScroll: true,
	lines: false,
	store: 'map.LayerTreeNodes',
	viewConfig: {
		plugins: [{
			ptype: 'treeviewdragdrop',
			//appendOnly: false
		}]
	}
});