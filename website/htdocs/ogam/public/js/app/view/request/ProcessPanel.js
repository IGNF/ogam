Ext.define('Ogam.view.request.ProcessPanel', {
	extend: 'Ext.panel.Panel',
	xtype: 'process-panel',
	frame : true,
	margins : '10 0 5 0',
	height: 60,
	title: 'Dataset',
	layout: 'fit',
	items: [{
		xtype: 'combo',
		maxHeight : 100,
		width: 345,
		editable : false
	}]
});