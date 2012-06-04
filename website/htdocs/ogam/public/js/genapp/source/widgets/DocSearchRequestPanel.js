/**
 * A DocSearchRequestPanel.
 * 
 * @class Genapp.DocSearchRequestPanel
 * @extends Ext.Panel
 * @constructor Create a new DocSearchRequestPanel 
 * @param {Object} config The config object
 * @xtype docsearchrequestpanel
 */
Genapp.DocSearchRequestPanel = Ext.extend(Ext.Panel, {

    title:'Filtre(s)',
    frame:true,
    textFieldLabel: 'Text search in the document body',
    /**
     * @cfg {String} alertRequestFailedMsg The alert Request
     *      Failed Msg (defaults to
     *      <tt>'Sorry, the request failed...'</tt>)
     */
    alertRequestFailedMsg : 'Sorry, the request failed...',

    // private
    initComponent : function() {

        this.getMetadataFields();

        if (!this.items) {
            this.items = [{
                xtype: 'form',
                ref:'formPanel',
                labelWidth: 130, // label settings here cascade unless overridden
                bodyStyle:'padding:5px 10px 0',
                defaults: {width: 230},
                defaultType: 'textfield',
                items:[{
                    xtype: 'textfield',
                    name: 'TEXT',
                    fieldLabel: this.textFieldLabel,
                    enableKeyEvents: true,
                    listeners:{
                        'keydown':function(cmp, event){console.log('titi');
                            if(event.keyCode === event.ENTER){
                                this.launchFilteredRequest();
                            }
                        },
                        scope:this
                    }
                },{
                    xtype: 'hidden',
                    name: 'INDEX_KEY',
                    value: this.indexKey
                }],
                buttons:[{
                    xtype: 'button',
                    text: 'Effacer filtres',
                    handler:function(){
                        this.formPanel.form.reset();
                    },
                    scope:this
                },{
                    xtype: 'button',
                    text: 'Filtrer',
                    handler:this.launchFilteredRequest,
                    scope:this
                }]
            }];
        }

        Genapp.DocSearchRequestPanel.superclass.initComponent.call(this);
    },

    launchFilteredRequest: function(){
        this.formPanel.getForm().submit({
            url : Genapp.base_url + 'fileindexation/search',
            timeout : 480000,
            success : function(form, action) {
                this.fireEvent('requestResponse',action.result.hits);
            },// TODO: failure function
            failure : function(form, action) {
                /*if (action.result && action.result.errorMessage) {
                    Ext.Msg.alert(this.alertErrorTitle, action.result.errorMessage);
                } else {
                    Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
                }*/
            },
            scope : this
        });
    },

    addMetadataFields: function(fields){
        var i, j, field, data;
        for(i = 0; i < fields.length; i++ ){
            field = fields[i];
            // Format the data of the fields for the reader
            data = [];
            for(j = 0; j < field.data.length; j++){
                data.push([field.data[j]]);
            }
            this.formPanel.insert(i, {
                xtype: 'combo',
                name: field.name,
                fieldLabel: field.label,
                mode: 'local',
                editable: false,
                store: new Ext.data.ArrayStore({
                    id: 0,
                    fields: [
                        'code'
                    ],
                    data: data
                }),
                valueField: 'code',
                displayField: 'code',
                enableKeyEvents: true,
                listeners:{
                    'keydown':function(cmp, event){
                        if(event.keyCode === event.ENTER){
                            this.launchFilteredRequest();
                        }
                    },
                    scope:this
                }
            });
        }
        this.formPanel.doLayout();
    },

    // Request of the metadata information
    getMetadataFields: function(){
        Ext.Ajax.request({
            url: Genapp.base_url + 'fileindexation/getmetadatafields',
            // The method and the disableCaching are set to have a browser catching
            method: 'GET',
            disableCaching: false,
            params: { 'INDEX_KEY': this.indexKey },
            timeout: 480000,
            success: function(response, opts) {
                fields = Ext.decode(response.responseText);
                this.addMetadataFields(fields);
            },// TODO: failure function
            failure: function(response, opts) { console.log(response); console.log(opts);
                if (action.result && action.result.errorMessage) {
                    Ext.Msg.alert(this.alertErrorTitle, action.result.errorMessage);
                } else {
                    Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
                }
            },
            scope: this
         });
    }
});
Ext.reg('docsearchrequestpanel', Genapp.DocSearchRequestPanel);