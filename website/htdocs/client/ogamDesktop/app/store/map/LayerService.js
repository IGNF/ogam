/**
 * This class defines the store for the layers services.
 * 
 * TODO  Server side, send two different jsons for services and layers
 */
Ext.define('OgamDesktop.store.map.LayerService',{
	extend: 'Ext.data.Store',
	id: 'serviceStore',
	model: 'OgamDesktop.model.map.LayerService',
	// Way to access data (ajax) and to read them (json)
	proxy: {
		type: 'ajax',
		url: Ext.manifest.OgamDesktop.requestServiceUrl +'../map/ajaxgetlayers',
		reader: {
			type: 'json',
			// To get only services into the response
			rootProperty: 'services'
		}
	}
});