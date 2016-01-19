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
		xtype: 'mappanelgx',
		region: 'west',
		split: true
	},{
		xtype: 'map-panel',
		region: 'center'
	},{
		xtype: 'map-addons-panel',
		region: 'east',
		split:{
			tracker:{
				//with tolerance less than splitter width
				tolerance:1
			}
		}
	}]
});