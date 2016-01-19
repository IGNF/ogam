Ext.define("OgamDesktop.view.map.MapGx",{
    extend: "GeoExt.component.Map",
    xtype: 'mappanelgx',
    title: 'map gx',
	width: 490,
    map: new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.Stamen({
                    layer: 'watercolor'
                })
            }),
            new ol.layer.Tile({
                source: new ol.source.Stamen({
                    layer: 'terrain-labels'
                })
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat( [-8.751278, 40.611368] ),
            zoom: 12
        })
    }),
	initComponent: function(){
		
		this.callParent(arguments);
	}
});