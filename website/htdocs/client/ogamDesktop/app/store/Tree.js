/**
 * This class defines the OgamDesktop tree store.
 */
Ext.define('OgamDesktop.store.Tree',{
	extend:'Ext.data.TreeStore',
	model:'OgamDesktop.model.Node',
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