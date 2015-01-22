Ext.define('OgamDesktop.view.navigation.MainWin', {
	extend: 'OgamDesktop.view.AbstractWin',
	xtype: 'navigation-mainwin',
	title: 'Details',
	titleCollapse : true,
	openDetails: function(record) {
		console.log('selected record', record);
	}
});