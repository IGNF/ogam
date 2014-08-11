Ext.application({
	name: 'Ogam',
	views: [
		'request.MainWin'
	],

	controllers: [
		'request.DeprecatedForm'
	],

	stores: [
	
	],
	
	launch : function() {
		Ext.create('Ogam.view.request.DeprecatedAdvancedRequestWin').show();
	}
});