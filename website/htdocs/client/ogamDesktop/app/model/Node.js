Ext.define('OgamDesktop.model.Node', {
	extend : 'Ext.data.TreeModel',
	childType:'request.object.field.Code',

	proxy : {
		actionMethods : {
			create : 'POST',
			read : 'POST',
			update : 'POST',
			destroy : 'POST'
		},
		url : Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxgettreenodes',
		type : 'ajax',
		// reader: 'json',
		rootProperty : '',
		extraParams : {
			depth : '1'
		}
	},
	fields : [ {
		mapping : 'text',
		name : 'label'
	}, {
		mapping : 'id',
		name : 'code'
	} ]
});