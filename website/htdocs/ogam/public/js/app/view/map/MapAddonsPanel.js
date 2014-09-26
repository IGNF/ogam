Ext.define('Ogam.view.map.MapAddonsPanel', {
	extend: 'Ext.tab.Panel',
	xtype: 'map-addons-panel',
	title: 'Layers & Legends',
	collapsible: true,
	collapsed: false,
	collapseDirection: 'right',
	width: 170,
	defaults: {
		closable: false
	},
	items: [{
		xtype: 'container',
		title: 'Layers',
		items: [{
			xtype: 'layers-panel'
		}]
	},{
		xtype: 'container',
		title: 'Legends',
		items: [{
			xtype: 'legends-panel'
		}]
	}]
});