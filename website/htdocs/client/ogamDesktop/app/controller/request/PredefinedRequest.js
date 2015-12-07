Ext.define('OgamDesktop.controller.request.PredefinedRequest', {
	extend: 'Ext.app.Controller',
	session:{},
    config: {
    	refs: {
    		mainView:'app-main',
			predefReqView: 'predefined-request',
			advReqView: 'advanced-request',
		},
        control: {
            'predefined-request button#launchRequest': {//#launchRequest
                click: 'onLaunchRequest'
            }
         }
    },
    
    routes:{
    	'predefined_request':'onPredefinedRequest'
    },
    
    onPredefinedRequest:function(){
    	this.getMainView().setActiveItem(this.getPredefReqView());
    },
	
	/**
	 * Show the FormPanel corresponding to the selected row into the predefined requests grid.
	 */
	onGridRowSelect: function(){
		
	},
    onLaunchRequest:function(){
    	console.log('va chercher');

    /*	OgamDesktop.model.request.PredefinedGroup.load("DEP", {
    	    success: function(requete) {
    	        console.log("requete: " + requete.get('label'));
    	        requete.getProcess(true);
    	        console.log(requete, requete.reqfieldsets);
    	        console.log(requete.reqfieldsets(true).reload());
    	    }
    	});*/
    	
    	var prModel= this.getPredefReqView().lookupReference('requete');
   	
    	//console.log(prModel.selection.reqfieldsets());
    	adModel = this.getAdvReqView().getViewModel();
    	this.getAdvReqView().lookupReference('processComboBox').setValue(prModel.selection.get('dataset_id'));
    	//prModel.selection.getProcessus({success:function(record){adModel.set('currentProcess',record);},scope:adModel});
    	
    	prModel.selection.reqfieldsets({
    		success:function(records){
	    		console.log('reqfieldsets', records );
	    		this.getAdvReqView().getViewModel().set({
	    			'userchoices' : this.getPredefReqView().getForm().getValues(),
	    			'fieldsets':records
	    		});
	    		this.getAdvReqView().lookupReference('advancedRequestSelector').reloadForm();
    		},
    		scope:this
    	});
    	
    	this.getMainView().getLayout().setActiveItem('consultationTab');

    }
});