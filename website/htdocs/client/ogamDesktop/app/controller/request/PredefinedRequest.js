/**
 * This class defines a controller with actions related to predefined request
 */
Ext.define('OgamDesktop.controller.request.PredefinedRequest', {
    extend: 'Ext.app.Controller',
    session:{},

    config: {
        refs: {
            mainView:'app-main',
            predefReqView: 'predefined-request',
            advReqView: 'advanced-request',
            predefinedRequestGridPanel: '#predefinedRequestGridPanel',
            advancedRequestSelector: '#advancedRequestSelector'
        },
        control: {
            'predefined-request button#launchRequest': {//#launchRequest
                click: 'onLaunchRequest'
            },
            'predefined-request': {
                predefinedRequestEdition: 'onPredefinedRequestEdition',
                predefinedRequestDeletion: 'onPredefinedRequestDeletion'
            }
         }
    },
    
    routes:{
        'predefined_request':'onPredefinedRequest'
    },

    /**
      * @cfg {String} loadingMsg
      * The loading message (defaults to <tt>'Loading...'</tt>)
      */
    loadingMsg: 'Loading...',
    
    /**
     * @cfg {String} deletionConfirmTitle
     * The deletion confirm title (defaults to <tt>'Deletion of the request :'</tt>)
     */
    deletionConfirmTitle: 'Deletion of the request :',
    
    /**
     * @cfg {String} deletionConfirmMessage
     * The deletion confirm message (defaults to <tt>'Are you sure you want to delete the request?'</tt>)
     */
    deletionConfirmMessage: 'Are you sure you want to delete the request?', 

    /**
     * Open the predefined request tab
     * @private
     */
    onPredefinedRequest:function(){
        this.getMainView().setActiveItem(this.getPredefReqView());
    },

    /**
     * Manages the predefined request launch button click event:
     *
     * - Set the process,
     * - Reload the form,
     * - Launch the request.
     * @param {button} button The predefined request launch button
     * @param {e} e The click event
     * @param {eopt} eopt The event options
     * @private
     */
    onLaunchRequest:function(button,e, eopt){
        
        var prModel= this.getPredefReqView().lookupReference('requete');
       
        //console.log(prModel.selection.reqfieldsets());
        adModel = this.getAdvReqView().getViewModel();
        this.getAdvReqView().lookupReference('processComboBox').setValue(prModel.selection.get('dataset_id'));
        //prModel.selection.getProcessus({success:function(record){adModel.set('currentProcess',record);},scope:adModel});
        
        prModel.selection.reqfieldsets({
            success:function(records){
                var selectedCodes = {};
                this.getPredefReqView().child('predefined-request-selector').items.each(function(item){
                    if(item instanceof Ext.form.field.Tag) {
                        selectedCodes[item.getName()] = item.getValueRecords();
                    } else {
                        selectedCodes[item.getName()] = new OgamDesktop.model.request.object.field.Code({
                            code: item.getValue(),
                            label: item.getRawValue()
                        });
                    }
                });
                this.getAdvReqView().getViewModel().set({
                    'userchoices' : selectedCodes,
                    'fieldsets':records
                });
                this.getAdvReqView().getViewModel().notify();
                this.getAdvancedRequestSelector().reloadForm();
                this.getAdvReqView().down('#SubmitButton').click(e); // submitButton.click(); doesn't work because the event is required (Bug Ext 6.0.1).
            },
            scope:this
        });
        
        this.getMainView().getLayout().setActiveItem('consultationTab');
        this.getAdvReqView().collapse();
    },

    /**
     * Manages the predefined request edit button click event:

     * @param Object record The record corresponding to the button's row
     * @private
     */
    onPredefinedRequestEdition:function(record){
        // record.criteria() return a 'Ext.data.Store' of 'OgamDesktop.model.request.predefined.Criterion'
        this.getPredefReqView().mask(this.loadingMsg);
        record.criteria().load({
            type:'ajax',
            url:Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetpredefinedrequestcriteria',
            params:{
                request_id:record.get('request_id')
            },
            noCache:false,
            callback: function(records, operation, success) {
                this.getPredefReqView().unmask();
                this.getAdvReqView().mask(this.loadingMsg);
                this.getAdvReqView().lookupReference('processComboBox').setValue(record.get('dataset_id'));
                record.reqfieldsets({
                    success:function(records){

                        var selectedCodes = {};
                        record._criteria.each(function(criterion) { // OgamDesktop.model.request.predefined.Criterion
                            selectedCodes[criterion.getCriteriaField().name] = new OgamDesktop.model.request.object.field.Code({
                                code: criterion.get('default_value'),
                                label: criterion.get('default_label')
                            });
                        }, this);
                        this.getAdvReqView().getViewModel().set({
                            'userchoices' : selectedCodes,
                            'fieldsets': records,
                            'requestId': record.get('request_id')
                        });
                        this.getAdvReqView().getViewModel().notify();
                        this.getAdvancedRequestSelector().reloadForm();
                        this.getAdvReqView().unmask();
                    },
                    scope:this
                });
                
                this.getMainView().getLayout().setActiveItem('consultationTab');
            },
            scope: this
        });
    },

    /**
     * Manages the predefined request delete button click event
     * @param Object record The record corresponding to the button's row
     * @private
     */
    onPredefinedRequestDeletion:function(record){
    	Ext.Msg.confirm(
    		this.deletionConfirmTitle,
    		this.deletionConfirmMessage,
    		function(buttonId, value, opt){
    			if(buttonId === 'yes'){
    		        // Asks the request deletion to the server
    		        this.getPredefinedRequestGridPanel().mask(this.loadingMsg);
    		        Ext.Ajax.request({
    		            url: Ext.manifest.OgamDesktop.requestServiceUrl + 'predefinedrequest/' + record.get('request_id'),
    		            method: 'DELETE',
    		            success: function(response, opts) {
    		            	// Remove the request from the model if necessary
                            var modelRequestId = this.getAdvReqView().getViewModel().get('requestId');
                            if (record.get('request_id') === modelRequestId) {
                            	this.getAdvReqView().getViewModel().set('requestId', null);
                            }
    		                Ext.getStore('PredefinedRequestTabRequestStore').remove(record);
    		                this.getPredefinedRequestGridPanel().unmask();
    		            },
    		            failure: function(response, opts) {
    		                console.log('server-side failure with status code ' + response.status);
    		                this.getPredefinedRequestGridPanel().unmask();
    		            },
    		            scope :this
    		        });
    			}
    		}, 
    		this
    	);
    }
});