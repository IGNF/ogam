/**
 * This class defines the OgamDesktop request predefined group model.
 */
Ext.define('OgamDesktop.model.request.predefined.Group',{
	extend: 'OgamDesktop.model.base',
	requires:['OgamDesktop.model.Process',
	          'OgamDesktop.model.request.predefined.Criterion'],
	idProperty:'request_name',
	fields:[
	    {name: 'request_name', type: 'string', mapping: 0},
        {name: 'label', type: 'string', mapping: 1},
        {name: 'definition', type: 'string', mapping: 2},
        {name: 'date', type: 'date', dateFormat: 'Y-m-d', mapping: 3},
        {name: 'position', type: 'int', mapping: 4},
        {name: 'group_name', type: 'string', mapping: 5},
        {name: 'group_label', type: 'string', mapping: 6},
        {name: 'group_position', type: 'int', mapping: 7},
        {name: 'dataset_id', reference: {type:'Process', role:'processus', unique:true}, mapping: 8}
	],
	        
	hasMany: [{// See Ext.data.reader.Reader documentation for example
	            model: 'OgamDesktop.model.request.predefined.Criterion',
	            name:'criteria',
	            associationKey: 'criteria',
	            proxy:{
					type:'ajax',
					url:Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetpredefinedrequestcriteria'
				}
	        }
/*	        {// See Ext.data.reader.Reader documentation for example
	            model: 'OgamDesktop.model.request.FieldSet', name:'reqfieldsets',  foreignKey: 'request_name',
	            associationKey: 'reqfieldsets'
	        }
*/
	        ],

	proxy:{
		type:'ajax',
		url:Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetpredefinedrequestlist',
		reader:{type:'array', rootProperty:'data'}
	}
});