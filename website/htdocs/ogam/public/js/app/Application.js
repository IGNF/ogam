Ext.application({
	name: 'Ogam',
	views: [
		//'request.DeprecatedAdvancedRequestWin'
	],

	controllers: [
		//'request.DeprecatedForm'
	],

	stores: [
		
	],
	
	launch : function() {
		Ext.create('Ogam.view.request.DeprecatedAdvancedRequestWin').show();
		Ext.create('Ogam.view.map.MainWin').show();
	}
});