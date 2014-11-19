/**
 * This class defines the model for the layers services.
 */
Ext.define('OgamDesktop.model.map.LayerService',{
	extend: 'Ext.data.Model',
	fields: [
		{name: 'name', type: 'string'},
		{name: 'config', type: 'auto'} // type: object
	]
});