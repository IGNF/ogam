/**
 * This class manages the advanced request view.
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
				},
    			'#CancelButton': {
					click:'onCancel'
				},
    			'#ResetButton': {
					click:'onReset'
				}
    		}
        }
    },

    /**
     * Set the default process after the process store load.
     * @param {Ext.data.Store} this
     * @param {Ext.data.Model[]} records An array of records
     * @param {Boolean} successful True if the operation was successful.
     * @param {Object} eOpts The options object passed to Ext.util.Observable.addListener.
     * @private
     */
    onProcessStoreLoad: function(store, records, successful, options) {
    	var defaultRecord;

		if(successful){
			defaultRecord = store.findRecord('is_default', true);
			defaultRecord = defaultRecord ? defaultRecord : store.first(); 
		}
		else {
			defaultRecord = undefined;
		}
		Ext.Function.defer(this.getViewModel().set, 200, this.getViewModel(), ['currentProcess', defaultRecord]);
    	//this.getViewModel().set('currentProcess', defaultRecord);
    	
    },

	/**
	 * Submit the current request form
	 * @param button submit boutton
	 */
    onSubmit: function(button){
    	button.fireEvent('submitRequest', this);//the form may fire beforeaction
    	
    	Ext.Ajax.on('beforerequest', function(conn, options) {
    		this.requestConn = conn;
    	}, this, {
    		single : true
    	});
		button.up('form').getForm().submit({
			clientValidation: true,
			submitEmptyText: false,
			//waitMsg: Ext.view.AbstractView.prototype.loadingText,
			autoAbort:true,
			url: Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxbuildrequest',
			success: function(form, action) {
				this.requestConn = null;
				this.fireEvent('requestSuccess', action.result.columns);
			},
			failure: function(form, action) {
				switch (action.failureType) {
					case Ext.form.action.Action.CLIENT_INVALID:
						Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
						break;
				}
			},
			scope: this
		});
	},

	/**
	 * Fonction handling the select event on the process combobox.
	 * @param {Ext.form.field.ComboBox} combo This combo box
     * @param {Ext.data.Model/Ext.data.Model[]} record With {@link #multiSelect}
     * `false`, the value will be a single record. With {@link #multiSelect} `true`, the 
     * value will be an array of records.
     * @param {Object} eOpts The options object passed to {@link Ext.util.Observable.addListener}.
	 */
	onUpdateDataset:function(combo, record, eOpts){
		this.getViewModel().set('userchoices',[]);
		 combo.selection.fieldsets({success:function(records){
			this.getViewModel().set('fieldsets',records);
		 }, scope:this});
	},

	/**
	 * Cancels the current ajax request.
	 */
	onCancel: function(button) {
		if (this.requestConn && this.requestConn !== null) {
			this.requestConn.abort();
		}
	},

	/**
	 * Resets the current request form.
	 */
	onReset : function(button) {
		this.lookupReference('advancedRequestSelector').reloadForm();
	}
});
