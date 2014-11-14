Ext.define('OgamDesktop.store.map.LayerService',{
	extend: 'Ext.data.Store',
	id: 'serviceStore',
	model: 'OgamDesktop.model.map.LayerService',
	proxy: {
		type: 'ajax',
		url: Ext.manifest.OgamDesktop.requestServiceUrl +'../map/ajaxgetlayers',
		reader: {
			type: 'json',
			rootProperty: 'services'
		}
	},
	autoLoad: true
});