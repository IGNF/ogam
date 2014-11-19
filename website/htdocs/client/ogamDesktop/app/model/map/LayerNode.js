/**
 * This class defines the model for the tree layers.
 */
Ext.define('OgamDesktop.model.map.LayerNode',{
	extend: 'Ext.data.Model',
	fields: [
		{name: 'text', type: 'string'},
		{name: 'expanded', type: 'boolean'},
		{name: 'checked', type: 'boolean'},
		{name: 'hidden', type: 'boolean'},
		{name: 'disabled', type: 'boolean'},
		{name: 'leaf', type: 'boolean'},
		{name: 'nodeType', type: 'string'},
		{name: 'nodeGroup', type: 'string'}
	]
});