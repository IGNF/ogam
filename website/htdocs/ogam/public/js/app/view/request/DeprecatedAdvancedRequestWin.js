Ext.define('Ogam.view.request.DeprecatedAdvancedRequestWin', {
	extend: 'Ogam.view.request.MainWin',
	xtype: 'deprecated-advanced-request-win',
	layout: 'border',
	height: Ext.getBody().getViewSize().height - 160,
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
		xtype: 'tbspacer',
		flex: 1
	},{
		type: 'button', text: 'Search'
	}]
});