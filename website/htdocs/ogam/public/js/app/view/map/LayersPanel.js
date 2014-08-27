Ext.define('Ogam.view.map.LayersPanel', {
	extend: 'GeoExt.tree.Panel',
	mixins: ['Ogam.view.interface.LayersPanel'],
	xtype: 'layers-panel',
	title: 'Layers',
	border: true,
	autoScroll: true,
	//store: store,
	rootVisible: false,
	lines: false
});