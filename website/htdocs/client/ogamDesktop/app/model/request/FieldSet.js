/**
 * @deprecated
 */
Ext.define('OgamDesktop.model.request.FieldSet', {
	extend: 'Ext.data.Model',
	idProperty: 'id',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'label', type: 'string' },
        // See Ext.data.field.Field at config reference documentation for example
        { name: 'processId', reference: {type:'OgamDesktop.model.Process', inverse:'fieldsets'}}
    ],
    hasMany: [{// See Ext.data.reader.Reader documentation for example
        model: 'OgamDesktop.model.request.fieldset.Criterion', name:'criteria', associationKey: 'criteria'
    },{
        model: 'OgamDesktop.model.request.fieldset.Column', name:'columns', associationKey: 'columns'
    }],

	proxy: {
		type: 'ajax',
		url: Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetqueryform',
        reader:{
        	  rootProperty: 'data'
        }
    }
});