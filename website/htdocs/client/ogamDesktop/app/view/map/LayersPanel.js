Ext.define('OgamDesktop.view.map.LayersPanel', {
	extend: 'GeoExt.tree.Panel',
	mixins: ['OgamDesktop.view.interface.LayersPanel'],
	xtype: 'layers-panel',
	title: 'Layers',
	border: true,
	autoScroll: true,
	//store: store,
	rootVisible: false,
	lines: false
});