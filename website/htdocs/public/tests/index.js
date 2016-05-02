var isDev   = window.location.href.match(/localhost/);
var harness = new Siesta.Harness.Browser.ExtJS();


// Configuration commune pour les tests
// Chargement des librairies
harness.configure({
    title       : 'OGAM Test Suite',
    
    hostPageURL : '../',    
    
    preload     : [
        // version of ExtJS used by your application 
        // (not needed if you use Sencha Cmd which builds a complete 'all-file' including Ext JS itself)
        //'../js/extjs/resources/css/ext-all.css',
        //'../js/extjs/ext-all-debug.js',
        '../js/extjs/adapter/ext/ext-base.js',
        isDev ? '../js/extjs/ext-all-debug.js' : '../js/extjs/ext-all.js',

        './initGenapp.js',
        '../js/OpenLayers/OpenLayers.js',
        '../js/GeoExt/script/GeoExt.js',        
        '../js/genapp/genapp.pack-min.js',
        '../js/extjs/src/locale/ext-lang-fr.js',
        '../js/genapp/source/locale/genapp-lang-fr.js',
        '../js/genapp.conf.js',
       


        // CSS
        '../js/extjs/resources/css/ext-all.css',
        '../js/GeoExt/resources/css/geoext-all-debug.css',
        '../js/extjs/resources/css/xtheme-gray-extend.css',
        '../js/genapp/resources/css/genapp.pack-min.css',
        '../js/extjsux/basiccheckbox/BasicCheckBox.css',
        '../js/extjsux/superboxselect/SuperBoxSelect-gray-extend.css',
        '../js/extjsux/fileuploadfield/fileuploadfield.css',
        '../css/extjsux.css',
        
        
        //'./postinitGenapp.js',

    ],
    
    autoCheckGlobals    : true,
    expectedGlobals     : [ 'Ext', 'Genapp' ],
});

// Lancement des tests
harness.start(
    '010_sanity.t.js',
    {
    	group       : 'Unit Tests',
        items       : [
            'unit-tests/user-model.t.js'
        ]
    },
    {    	
    	group       : 'Application Tests - Login',
    	preload : [
    	           // ExtJS n'est pas chargé par cette page
    	           ],
        pageUrl     : '../user',
        items       : [
            'application-tests/login/login.js'
        ]
    },
    {    	
    	group       : 'Application Tests - Query',
    	sandbox : false, // Il faut être loggué pour que ces pages fonctionnent
    	preload : [    	           
    	          // '../map/get-map-parameters',
    	           //'../query/getGridParameters',
    	           ],
        pageUrl     : '../query/show-query-form/',
        items       : [
            'application-tests/query/query.js'
        ]
    }
    
);