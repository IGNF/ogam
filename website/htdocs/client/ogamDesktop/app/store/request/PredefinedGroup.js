/**
 * This class defines the OgamDesktop request predefined group store.
 */
Ext.define('OgamDesktop.store.request.PredefinedGroup',{
	extend: 'Ext.data.Store',
	model:'OgamDesktop.model.request.PredefinedGroup',
	autoLoad:true,
	remoteSort: false,
	sorters:{property: 'group_position', direction: "ASC"},
	proxy:{
		type:'ajax',
		url:Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetpredefinedrequestlist',
		reader:{type:'array', rootProperty:'rows'}
	}
});