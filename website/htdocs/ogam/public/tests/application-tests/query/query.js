// Sanity Test
StartTest(function(t) {
	
	// Get global variables from  the application
	//var Genapp   = t.global.Genapp;
    //var Ext     = t.global.Ext;
	t.ok(Ext, 'ExtJS is here');
    
	// Initialisation de l'application
    Genapp.configure();
	Genapp.buildApplication();
	Genapp.cardPanel.activate(0);
	

	t.done(); // Optional, marks the correct exit point from the test
})