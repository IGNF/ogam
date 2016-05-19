var harness = new Siesta.Harness.Browser.ExtJS();

harness.configure({
	title : 'OGAM Tests',

	preload : [

	]
});


harness.start(
	//
	// Sanity tests
	// 
	{
		// Test d'initialisation correcte de ExtJS et OgamDeskTop
		group : 'Sanity Tests',
		pageUrl : '../index.html?unittest',
		items : [ '010_sanity.t.js' ]
	},
	
	
	//
	// Unit test.
	// Test single components
	//
	{    	
		// Test de la page de login du site
		group       : 'Unit Tests - Login',
		pageUrl : '../index.html?unittest',
	    items       : [
	        'unit-tests/model/map/layers.t.js'
	    ]
	},
	
	
	//
	// Application tests.
	// Test directly on the web site that some actions produce the expacted results.
	//
	{    	
		// Test de la page de login du site
		group       : 'Application Tests - Login',
	    pageUrl     : '../../../user',
	    items       : [
	        'application-tests/login/login.js'
	    ]
	},
	
	
	{    	
    	group       : 'Application Tests - Query',
    	pageUrl : '../index.html',
    	items       : [
            'application-tests/query/query.js'
        ]
    }


);