// Application Test - Predefined Query
StartTest(function(t) {
	
	t.ok(Ext, 'ExtJS is here');
    
	// Initialisation de l'application
    Genapp.configure();
	Genapp.buildApplication();
	Genapp.cardPanel.activate(0);
	
	
	t.ok(Genapp, 'Genapp is here');

	
	t.chain(
			{ action : 'click', target : Genapp.PredefinedRequestPanel } //,
			// Ext.getComponent n'est dispo qu'à partir de ExtJS 4
			//{ action : 'click', target : '>> [Distribution par espèce]' }
	);
	
	t.ok(Genapp.PredefinedRequestPanel, 'OK');
	
	t.done(); // Optional, marks the correct exit point from the test
})