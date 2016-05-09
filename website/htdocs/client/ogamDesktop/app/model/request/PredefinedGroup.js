/**
 * This class defines the OgamDesktop request predefined group model.
 */
Ext.define('OgamDesktop.model.request.PredefinedGroup',{
	extend: 'Ext.data.Model',
	requires:['OgamDesktop.model.Process',
	          'OgamDesktop.model.request.fieldset.Criterion',
	          'OgamDesktop.model.request.FieldSet'],
	idProperty:'request_name',
	fields:[     {name: 'request_name', type: 'string'},//0
	             {name: 'label', type: 'string' },//1
	             {name: 'definition', type: 'string'},//2
	             //{name: 'click', type: 'int},//3
	             {name: 'date', type: 'date', dateFormat: 'Y-m-d'},//4
	            // {name: 'criteria_hint', type: 'string' },//5
	             {name: 'position', type: 'int'},//6
	             {name: 'group_name', type: 'string'},//7
	             {name: 'group_label', type: 'string'},//8
	             {name: 'group_position', type: 'int'},//9
	             {name: 'dataset_id', reference: {type:'OgamDesktop.model.Process', role:'processus', unique:true}}//10
	        ],
	        
	hasMany: [{// See Ext.data.reader.Reader documentation for example
	            model: 'OgamDesktop.model.request.fieldset.Criterion', name:'criteria', associationKey: 'criteria',proxy:{
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
		reader:{type:'array', rootProperty:'rows'}
	}
});