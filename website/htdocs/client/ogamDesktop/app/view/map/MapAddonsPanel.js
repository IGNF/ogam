Ext.define('OgamDesktop.view.map.MapAddonsPanel', {
	extend: 'Ext.tab.Panel',
	xtype: 'map-addons-panel',
	title: 'Layers & Legends',
	collapsible: true,
	collapsed: false,
	collapseDirection: 'right',
	resizable: true,
	resizeHandles: 'w',
	border: true,
	width: 170,
	maxWidth: 600,
	defaults: {
		closable: false
	},
	items: [{
		title: 'Layers',
		xtype: 'layers-panel'
	},{
		title: 'Legends',
		xtype: 'legends-panel'
	}]
});