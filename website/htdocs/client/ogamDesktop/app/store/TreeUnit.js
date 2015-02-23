Ext.define('OgamDesktop.store.TreeUnit',{
	extend:'Ext.data.TreeStore',
	model:'OgamDesktop.model.UnitTree',
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
		}
});