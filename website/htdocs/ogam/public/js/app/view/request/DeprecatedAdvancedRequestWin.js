Ext.define('Ogam.view.request.DeprecatedAdvancedRequestWin', {
	extend: 'Ogam.view.request.MainWin',
	items: [{
		region : 'center',
		xtype: 'deprecated-form-panel'
	},{
		region : 'north',
		xtype: 'process-panel'
	}]
});