// Sanity Test
StartTest(function(t) {
	t.diag("Sanity");

	// Test that ExtJS is loaded
	t.ok(Ext, 'ExtJS is here');
	t.ok(Ext.Window, 'ExtJS.window is here');

	// Test that GenApp is loaded
	t.ok(Genapp, 'Genapp is here');
	//t.ok(Genapp.cardPanel, 'Genapp.cardPanel is here');
	

	t.done(); // Optional, marks the correct exit point from the test
})