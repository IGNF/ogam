Ext.define('Ogam.view.map.MapAddonsPanel', {
	extend: 'Ext.tab.Panel',
	xtype: 'map-addons-panel',
	title: 'Layers & Legends',
	collapsible: true,
	collapsed: true,
	collapseDirection: 'right',
	width: 200,
	defaults: {
		closable: false
	},
	items: [{
		xtype: 'layers-panel'
	},{
		xtype: 'legends-panel'
	}]
});