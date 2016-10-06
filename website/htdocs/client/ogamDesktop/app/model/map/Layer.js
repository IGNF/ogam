/**
 * This class defines the model for the layers.
 */
Ext.define('OgamDesktop.model.map.Layer',{
	extend: 'OgamDesktop.model.map.base',
	requires:[
	    'OgamDesktop.model.map.ZoomLevel',
	    'OgamDesktop.model.map.LayerService'
	],
	fields: [
	    {name: 'id', type: 'string'},
	    {name: 'name', type: 'string'},
	    {name: 'label', type: 'string'},
	    {name: 'serviceLayerName', type: 'string'},
	    {name: 'isTransparent', type: 'boolean'},
	    {name: 'defaultOpacity', type: 'integer'},
	    {name: 'isBaseLayer', type: 'boolean'},
	    {name: 'isUntiled', type: 'boolean'},
	    {name: 'maxZoomLevel', reference:'ZoomLevel'},
	    {name: 'minZoomLevel', reference:'ZoomLevel'},
	    {name: 'hasLegend', type: 'boolean'},
	    {name: 'providerId', type: 'string'},
	    {name: 'activateType', type: 'string'},
	    {name: 'viewService', reference:'LayerService'},
	    {name: 'legendService', reference:'LayerService'},
	    {name: 'detailService', reference:'LayerService'},
	    {name: 'featureService', reference:'LayerService'}
	]
});