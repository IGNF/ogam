/**
 * This class manages the advanced request view.
 * 
 * TODO: Refactor this code for the next version
 * @deprecated
 */
Ext.define('OgamDesktop.view.request.AdvancedRequestController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.advancedrequest', // enable "controller: 'advancedrequest'" in the AdvancedRequest view

    config: {
    	listen: {
    		store:{
	            '#processStore': {
	                load: 'onProcessStoreLoad'
	            }
    		},
    		component:{
    			'#SubmitButton': {
					click:'onSubmit'
				}
    		}
        }
    },

    /**
     * Set the default process after the process store load.
     * 
     * @param {Ext.data.Store} this
     * @param {Ext.data.Model[]} records An array of records
     * @param {Boolean} successful True if the operation was successful.
     * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
     * @private
     */
    onProcessStoreLoad:function(store, records, successful, options) {   	
    	var defaultRecord;
    	
		if(successful){
			defaultRecord = store.findRecord('is_default', '1');
			defaultRecord = defaultRecord ? defaultRecord : store.first(); 
		}
		else {
			defaultRecord = undefined;
		}

    	this.getViewModel().set('currentProcess', defaultRecord);
    	
    	//console.log(defaultRecord.fieldsets());
    },
    
    onSubmit:function(button){
        // The getForm() method returns the Ext.form.Basic instance:
        console.log('request ',button.up('form').getValues());
    	// TODO set a store or set filters params for a store
    }
});
