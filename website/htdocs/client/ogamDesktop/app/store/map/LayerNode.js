/**
 * This class defines the store for the tree layers nodes.
 */
Ext.define('OgamDesktop.store.map.LayerNode',{
	extend: 'Ext.data.Store',
	model: 'OgamDesktop.model.map.LayerNode',
	// Way to access data (ajax) and to read them (json)
	proxy: {
		type: 'ajax',
		url: Ext.manifest.OgamDesktop.requestServiceUrl +'../map/ajaxgettreelayers',
		reader: {
			type: 'json',
			rootProperty: ''
		}
	}
});