/**
 * This class defines the store for the layers.
 * 
 * TODO  Server side, send two different jsons for services and layers
 */
Ext.define('OgamDesktop.store.map.Layer',{
	extend: 'Ext.data.Store',
	id: 'layerStore',
	model: 'OgamDesktop.model.map.Layer',
	// Way to access data (ajax) and to read them (json)
	proxy: {
		type: 'ajax',
		url: Ext.manifest.OgamDesktop.mapServiceUrl +'ajaxgetlayers',
		actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
		reader: {
			type: 'json',
			// To get only layers into the response
			rootProperty: 'layers'
		}
	}
});
