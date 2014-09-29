Ext.define('OgamDesktop.view.map.MainWin', {
	extend: 'OgamDesktop.view.AbstractWin',
	xtype: 'map-mainwin',
	layout: 'border',
	height: Ext.getBody().getViewSize().height - 160,
	title: 'Map',
	items: [/*{
		xtype: 'map-panel',
		region: 'center'
	},{
		xtype: 'map-addons-panel',
		region: 'east'
	}*/]
});