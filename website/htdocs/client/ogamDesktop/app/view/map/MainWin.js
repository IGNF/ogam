/**
 * This class defines the global view that contains the map panel
 * and the map addons panel (= layers panel + legends panel).
 */
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