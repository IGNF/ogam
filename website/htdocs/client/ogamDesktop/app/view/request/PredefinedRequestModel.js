/**
 * This class is the ViewModel for the advanced request view.
 */
Ext.define('OgamDesktop.view.request.PredefinedRequestModel', {
    extend: 'Ext.app.ViewModel',
    requires: [
        'OgamDesktop.model.request.fieldset.Criterion'
    ],//needed to fieldsets association !
    alias: 'viewmodel.predefinedrequest',
    data:{
        requete:undefined
    },
    formulas:{
        criteria: {
            bind: {
                bindTo: '{requete.selection}',
                deep: true
            },
            get: function (c) {
                return c ? c.criteria().load({
                    type:'ajax',
                    url:Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetpredefinedrequestcriteria',
                    params:{
                        request_id:c.get('request_id')
                    },
                    noCache:false
                }): [];
            }
        } 
    }
});
