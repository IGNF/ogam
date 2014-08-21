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
	'allOverlays':false
});
var layers= [
         new OpenLayers.Layer.WMS("Global Imagery",
             "http://maps.opengeo.org/geowebcache/service/wms", {
                 layers: "bluemarble",
                 format: "image/png8"
             }, {
                 buffer: 0,
                 visibility: false
             }
         ),
         new OpenLayers.Layer.WMS("OpenStreetMap WMS",
             "http://ows.terrestris.de/osm/service?",
             {layers: 'OSM-WMS'},
             {
                 attribution: '&copy; terrestris GmbH & Co. KG <br>' +
                     'Data &copy; OpenStreetMap ' +
                     '<a href="http://www.openstreetmap.org/copyright/en"' +
                     'target="_blank">contributors<a>'
             }
         ),
         new OpenLayers.Layer.WMS("Country Borders",
             "http://ows.terrestris.de/geoserver/osm/wms", {
                 layers: "osm:osm-country-borders",
                 transparent: true,
                 format: "image/png"
             }, {
                 isBaseLayer: false,
                 buffer: 0
             }
         ),
         new OpenLayers.Layer.WMS("Gas Stations",
             "http://ows.terrestris.de/geoserver/osm/wms", {
                 layers: "osm:osm-fuel",
                 transparent: true,
                 format: "image/png"
             }, {
                 isBaseLayer: false,
                 buffer: 0
             }
         ),
         new OpenLayers.Layer.WMS("Bus Stops",
             "http://ows.terrestris.de/osm-haltestellen?",
             {
                 layers: 'OSM-Bushaltestellen',
                 format: 'image/png',
                 transparent: true
             },
             {
                 singleTile: true,
                 visibility: false
             }
         ),
         // create a group layer (with several layers in the "layers" param)
         // to show how the LayerParamLoader works
         new OpenLayers.Layer.WMS("Tasmania (Group Layer)",
             "http://demo.opengeo.org/geoserver/wms", {
                 layers: [
                     "topp:tasmania_state_boundaries",
                     "topp:tasmania_water_bodies",
                     "topp:tasmania_cities",
                     "topp:tasmania_roads"
                 ],
                 transparent: true,
                 format: "image/gif"
             }, {
                 isBaseLayer: false,
                 buffer: 0,
                 // exclude this layer from layer container nodes
                 displayInLayerSwitcher: false,
                 visibility: false
             }
         )
];
map.addLayers(layers);

Ext.define('Ogam.view.map.MapPanel', {
	extend: 'GeoExt.panel.Map',
	xtype: 'map-panel',
	map: map,
    zoom: 3,
    width:'100%',
    height:'100%',
    stateful: true,
    stateId: 'mappanel'	,
	tbar: [{
		xtype: 'tbspacer',
		flex: 1
	},{
		type: 'button', text: 'i'
	},{
		type: 'button', text: 'sl'
	},'-',{
		type: 'button', text: 'p'
	},{
		type: 'button', text: 'n'
	},{
		type: 'button', text: 'i'
	},{
		type: 'button', text: 'zi'
	},{
		type: 'button', text: 'zo'
	},{
		type: 'button', text: 'dm'
	},'-',{
		type: 'button', text: 'zr'
	},{
		type: 'button', text: 'me'
	}]
});