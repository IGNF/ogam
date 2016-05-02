// Login Test
StartTest(function(t) {

	// Cette page ne contient pas ExtJS
	
	document.getElementById('login').value = 'admin';
	document.getElementById('password').value = 'admin';
	
	document.getElementById('submit').click();
	
	// TODO : Tester qu'on arrive bien sur la page suivante
	
	//t.wait(500);
	
	//var connecte = document.getElementById('Se déconnecter');
	
	//t.ok(connecte, 'On est bien connecté');
		
	t.done(); // Optional, marks the correct exit point from the test
})