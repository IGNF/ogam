Ext.define('Ogam.view.request.DeprecatedPredefinedRequestWin', {
	extend: 'Ogam.view.request.MainWin',
	xtype: 'deprecated-predefined-request-win',
	title: 'Criterias',
	layout : 'form',
	defaults : {
		labelStyle : 'padding: 0; margin-top:3px',
		width : 180
	},
	items: [{
		// The combobox with the list of available criterias
		xtype : 'combo',
		hiddenName : 'Criteria',
		editable : false,
		width : 220,
		maxHeight : 100
	}]
});