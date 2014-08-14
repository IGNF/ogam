Ext.require([
	'Ext.container.Viewport',
	'Ext.layout.container.Border',
	'GeoExt.tree.Panel',
	'Ext.tree.plugin.TreeViewDragDrop',
	'GeoExt.panel.Map',
	'GeoExt.tree.OverlayLayerContainer',
	'GeoExt.tree.BaseLayerContainer',
	'GeoExt.data.LayerTreeModel',
	'GeoExt.tree.View',
	'GeoExt.container.WmsLegend',
	'GeoExt.tree.Column',
	'Ext.util.Point',
	'Ext.form.Panel'
	]);

var map = new OpenLayers.Map({
	'numZoomLevels' : 22,
	'projection' : 'EPSG:3857',
	'allOverlays':false,
	'units' : 'm',
	'tileSize' : new OpenLayers.Size(256,256),
	'maxExtent' : new OpenLayers.Bounds(-1732980.3050402,4880351.3812726,2337138.5765223,7025480.1427692)});

var wms = new OpenLayers.Layer.WMS(
	"Scans",
	"http://wxs-i.ign.fr/7gr31kqe5xttprd2g7zbkqgo/geoportail/r/wms",
	{
		layers: 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD',
		version: '1.3.0'
	},{
		displayInLayerSwitcher : true
	});

map.addLayers([wms]);

Ext.define('Ogam.view.map.MapPanel', {
	extend: 'GeoExt.panel.Map',
	xtype: 'map-panel',
	map: map,
    zoom: 3,
    width:'100%',
    height:'100%',
    stateful: true,
    stateId: 'mappanel'	
});