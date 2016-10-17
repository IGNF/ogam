/**
 * This class defines the model for the layers services.
 */
Ext.define('OgamDesktop.model.map.LayerService',{
	extend: 'OgamDesktop.model.base',
	fields: [
	    {name: 'id', type: 'string'},
		{name: 'name', type: 'string'},
		{name: 'config'} // type: object
	]
});