Ext.define('OgamDesktop.store.map.Layer',{
	extend: 'Ext.data.Store',
	id: 'layerStore',
	model: 'OgamDesktop.model.map.Layer',
	proxy: {
		type: 'ajax',
		url: Ext.manifest.OgamDesktop.requestServiceUrl +'../map/ajaxgetlayers',
		reader: {
			type: 'json',
			rootProperty: 'layers'
		}
	},
	autoLoad: true
});
