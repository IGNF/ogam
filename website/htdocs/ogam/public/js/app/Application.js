Ext.application({
	name: 'Ogam',
	views: [
		'request.DeprecatedAdvancedRequestWin'
	],

	controllers: [
	],

	stores: [
	],
	
	launch : function() {
		Ext.create('Ogam.view.Main').show();
	}
});