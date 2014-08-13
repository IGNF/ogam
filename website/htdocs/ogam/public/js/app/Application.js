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
		Ext.create('Ogam.view.Main').show();
	}
});