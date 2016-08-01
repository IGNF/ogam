/**
 * This class defines the store for the vector layers.
 */
Ext.define('OgamDesktop.store.map.VectorLayer', {
	extend: 'Ext.data.Store',
	requires: [
        'OgamDesktop.model.map.VectorLayer'
    ],

	model: 'OgamDesktop.model.map.VectorLayer',
	// Way to access data (ajax) and to read them (json)
	proxy: {
		type: 'ajax',
		url: Ext.manifest.OgamDesktop.mapServiceUrl +'ajaxgetvectorlayers',
		actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
		reader: {
			type: 'json',
			// To get only layers into the response
			rootProperty: 'layers'
		}
	}
});