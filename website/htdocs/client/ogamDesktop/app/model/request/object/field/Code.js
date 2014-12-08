Ext.define('OgamDesktop.model.request.object.field.Code',{
	extend: 'Ext.data.Model',
	idProperty : 'code',
	fields : [ {
		name : 'code',
		type: 'auto'
	}, {
		name : 'label',
		type: 'string'
	} ]
});