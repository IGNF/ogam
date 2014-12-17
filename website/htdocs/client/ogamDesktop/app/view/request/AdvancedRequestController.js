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
    	
    },
    
    onSubmit:function(button){
		button.up('form').getForm().submit({
			clientValidation: true,
			waitMsg: 'loading...',
			url: Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxgetresultcolumns',
			params: {
				newStatus: 'delivered'
			},
			success: function(form, action) {
				button.fireEvent('onGetGridColumns', action.result.columns);
			},
			failure: function(form, action) {
				switch (action.failureType) {
					case Ext.form.action.Action.CLIENT_INVALID:
						Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
						break;
					case Ext.form.action.Action.CONNECT_FAILURE:
						Ext.Msg.alert('Failure', 'Ajax communication failed');
						break;
					case Ext.form.action.Action.SERVER_INVALID:
						Ext.Msg.alert('Failure', action.result.msg);
				}
			}
		});
	}
});
