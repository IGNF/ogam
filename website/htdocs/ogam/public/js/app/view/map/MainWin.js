Ext.define('Ogam.view.map.MainWin', {
	extend: 'Ogam.view.abstract.Win',
	xtype: 'map-mainwin',
	layout: 'border',
	title: 'Map',
	items: [{
		xtype: 'map-panel',
		region: 'center'
	},{
		xtype: 'map-addons-panel',
		region: 'east'
	}]
});