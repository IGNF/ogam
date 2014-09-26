Ext.application({
	name: 'Ogam',
	views: [
		'request.DeprecatedAdvancedRequestWin'
	],

	controllers: [
	],

	stores: [
		'map.LayerTreeNodes'
	],
	
	launch : function() {
		Ext.create('Ogam.view.Main').show();
	}
});