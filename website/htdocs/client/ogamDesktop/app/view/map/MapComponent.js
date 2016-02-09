
Ext.define("OgamDesktop.view.map.MapComponent",{
    extend: "GeoExt.component.Map",
    xtype: 'mapcomponent',
    reference: 'mapCmp',

	    map: new ol.Map({
		logo: false, // no attributions to ol
		layers: [
		    new ol.layer.Vector({
			code: 'drawingLayer',
			name: 'Drawing layer',
			source: new ol.source.Vector({features: new ol.Collection()}),
			style: new ol.style.Style({
			    fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			    }),
			    stroke: new ol.style.Stroke({
				color: '#ffcc33',
				width: 2
			    }),
			    image: new ol.style.Circle({
				radius: 7,
				fill: new ol.style.Fill({
				  color: '#ffcc33'
				})
			    })
			})
		    })
		],
		view: new ol.View({
		    resolutions: OgamDesktop.map.resolutions.slice(this.minZoomLevel),
		    projection : OgamDesktop.map.projection,
		    center: [OgamDesktop.map.x_center, OgamDesktop.map.y_center],
		    zoom: OgamDesktop.map.defaultzoom,
		    extent: [
			OgamDesktop.map.x_min,
			OgamDesktop.map.y_min,
			OgamDesktop.map.x_max,
			OgamDesktop.map.y_max
		    ]
		}),
		controls:  [
		    new ol.control.ZoomSlider(),
		    new ol.control.ScaleLine(),
		    new ol.control.MousePosition({
				className:'o-map-tools-map-mouse-position',
				coordinateFormat :function(coords){
					var template = 'X: {x} - Y: {y} ' + OgamDesktop.map.projection;
					return ol.coordinate.format(coords, template);
		    }})
		]
	    })

}
);