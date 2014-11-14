Ext.define('OgamDesktop.model.map.Layer',{
	extend: 'Ext.data.Model',
	fields: [
		{name: 'singleTile',  type: 'boolean'},
		{name: 'name',   type: 'string'},
		{name: 'viewServiceName', type: 'string'},
		{name: 'featureServiceName', type: 'string'},
		{name: 'legendServiceName', type: 'string'},
		{name: 'featureInfoServiceName', type: 'string'},
		{name: 'params', type: 'auto'},
		{name: 'options', type: 'auto'}
	]
});