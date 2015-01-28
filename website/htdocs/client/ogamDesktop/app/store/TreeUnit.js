Ext.define('OgamDesktop.store.TreeUnit',{
	extend:'Ext.data.TreeStore',
	model:'OgamDesktop.model.UnitTree',
	root :{
		allowDrag : false,
		id : '*'
	}
});