var harness = new Siesta.Harness.Browser.ExtJS();

harness.configure({
	title : 'OGAM Tests',

	preload : [

	]
});


harness.start(
	{
		// Test d'initialisation correcte de ExtJS et OgamDeskTop
		group : 'Sanity Tests',
		pageUrl : '../index.html?unittest',
		items : [ '010_sanity.t.js' ]
	},
	
	{    	
		// Test de la page de login du site
		group       : 'Application Tests - Login',
		preload : [
		           // ExtJS n'est pas chargé par cette page
		           ],
	    pageUrl     : '../../../user',
	    items       : [
	        'application-tests/login/login.js'
	    ]
	},
	
	
	{    	
    	group       : 'Application Tests - Query',
    	pageUrl : '../index.html?unittest',
    	items       : [
            'application-tests/query/query.js'
        ]
    }


);