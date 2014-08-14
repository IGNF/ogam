Ext.define('Ogam.view.map.MainWin', {
	extend: 'Ogam.view.abstract.Win',
	xtype: 'map-mainwin',
	layout: 'border',
	title: 'Map',
	items: [{
		xtype: 'map-panel',
		region: 'center',
		tbar: {xtype: 'map-addons-panel'}
	},{
		xtype: 'tabpanel',
		region: 'east',
		title: 'Layers & Legends',
		collapsible: true,
		collapsed: true,
		collapseDirection: 'right',
		width: 200,
		defaults: {
			closable: false
		},
		items: [{
			xtype: 'tab',
			title: 'Layers'
		},{
			xtype: 'tab',
			title: 'Legends'
		}]
	}]
});