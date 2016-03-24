/**
 * This class defines the model for the vector layers.
 *
 * TODO : Merge this file with the layer model file
 */
Ext.define('OgamDesktop.model.map.VectorLayer',{
	extend: 'Ext.data.Model',
	fields: [
		{name : 'serviceLayerName',type: 'string'},
        {name : 'layerLabel', type: 'string'},
        {name : 'featureServiceUrl', type: 'string'}
	]
});