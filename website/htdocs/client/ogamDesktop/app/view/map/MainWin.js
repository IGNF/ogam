Ext.define('OgamDesktop.view.map.MainWin', {
	extend: 'OgamDesktop.view.AbstractWin',
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