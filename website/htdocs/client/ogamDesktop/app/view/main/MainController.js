/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('OgamDesktop.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',
    control : {
        '#main' : {
            tabchange : 'onTabChange'
        }
    },
     listen : {
        controller : {
            '#' : {
                unmatchedroute : 'onUnmatchedRoute'
            }
        }
    },

    onUnmatchedRoute : function(hash) {
       console.debug('unmatch route', hash);
    },
    routes: {
	//id-tab routes
    	'consultation_panel':'onConsulation',
	'edition_panel':'onEdition',
	
	//action routes
    	'edition-edit:key':{
    			action:'onEdition',
    			conditions:{
    				':key':'(?:(?:\/){1}([%a-zA-Z0-9\/\\-\\_\\.\\s,]+))?'
    			}
    	},
	'edition-add:key':{
		action:'onAdd',
		conditions:{
			':key':'(?:(?:\/){1}([%a-zA-Z0-9\/\\-\\_\\.\\s,]+))?'
		}
	}
	
    },
    
    onTabChange : function(tabPanel, newItem) {
        var id    = newItem.getId(),
            child = newItem.child('tabpanel'),
            subid = '',
            hash  =  id;

        if (child) {
            newItem = child.getActiveTab();
            subid   = ':' + newItem.getId();

            hash += subid;
        }

        this.redirectTo(hash);
    },
    
	onConsulation:function (){
		this.getView().setActiveItem(1);
	},

    onEdition:function(key){

    	if (key !== undefined) {
	    	var href = Ext.manifest.OgamDesktop.editionServiceUrl + 'show-edit-data/'+key;
            var loadEditionPage = true;

            if ( this.getView().down('editionpage') !== null ) {
                loadEditionPage = this.getView().down('editionpage').isDischargeable();
            }

            if (loadEditionPage) {
                this.getView().down('#edition_panel').getLoader().load({
                    removeAll:true,
                    renderer:'component',
                    loadMask:true,
                    url:href
                });
            }
    	}
    	this.getView().setActiveItem('edition_panel');
    	
    },
        onAdd:function(key){
    	
    	if (key !== undefined) {
	    	var href = Ext.manifest.OgamDesktop.editionServiceUrl + 'show-add-data/'+key;
	    	this.getView().down('#edition_panel').getLoader().load({
	    		removeAll:true,
	    		renderer:'component',
	    		loadMask:true,
	    		url:href
	    	});
    	}
    	this.getView().setActiveItem('edition_panel');
    	
    }
});
