/**
 * This class defines the store for the layers services.
 * 
 * OGAM-593 - TODO: Server side, send two different jsons for services and layers
 */
Ext.define('OgamDesktop.store.map.LayerService',{
	extend: 'Ext.data.Store',
	id: 'serviceStore',
	model: 'OgamDesktop.model.map.LayerService',
        autoLoad: true,
	// Way to access data (ajax) and to read them (json)
	proxy: {
		type: 'ajax',
                isSynchronous: true,
		url: Ext.manifest.OgamDesktop.mapServiceUrl +'ajaxgetlayerservices',
		actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
		reader: {
			type: 'json',
			// To get only services into the response
			rootProperty: 'data'
		}
	}
});