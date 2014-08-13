Ext.define('Ogam.view.request.DeprecatedAdvancedRequestWin', {
	extend: 'Ogam.view.request.MainWin',
	xtype: 'deprecated-advanced-request-win',
	items: [{
		region : 'center',
		xtype: 'deprecated-form-panel'
	},{
		region : 'north',
		xtype: 'process-panel'
	}],
	bbar: [{
		type: 'button', text: 'Cancel'
	},'-',{
		type: 'button', text: 'Reset'
	},{
		type: 'button', text: 'Search'
	}]
});