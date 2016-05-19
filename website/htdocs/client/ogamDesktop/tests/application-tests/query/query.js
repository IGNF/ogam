// Application Test - Predefined Query
StartTest(function(t) {
	
	t.ok(Ext, 'ExtJS is here');
    
	// Initialiser la fenêtre "predefined request"
	
	t.chain(
			{ action : 'click', target : '>> [Requête prédéfinie]' },
			{ action : 'click', target : '>> [Distribution par espèce]' }
	);
	
	t.ok(OgamDesktop.PredefinedRequestPanel, 'OK');
	
	t.done(); // Optional, marks the correct exit point from the test
})