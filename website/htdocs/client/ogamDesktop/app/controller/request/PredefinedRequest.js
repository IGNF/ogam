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
            advReqView: 'advanced-request'
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
                this.getAdvReqView().lookupReference('advancedRequestSelector').reloadForm();
                this.getAdvReqView().down('#SubmitButton').click(e);
            },
            scope:this
        });
        
        this.getMainView().getLayout().setActiveItem('consultationTab');
        this.getAdvReqView().collapse();
    }
});