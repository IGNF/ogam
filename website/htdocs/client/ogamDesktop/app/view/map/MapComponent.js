
Ext.define("OgamDesktop.view.map.MapComponent",{
    extend: "GeoExt.component.Map",
    xtype: 'mapcomponent',
    reference: 'mapCmp',
    map: new ol.Map({
        logo: false, // no attributions to ol
        interactions: ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false}), // disable rotation
        layers: [
            new ol.layer.Vector({
                code: 'drawingLayer',
                printable: false,
                displayInLayerSwitcher: false,
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
            }),
            new ol.layer.Vector({
                code: 'wfsLayer',
                name: 'WFS Layer',
                source: new ol.source.Vector({
                    format: new ol.format.GML(),
                    //strategy: ol.loadingstrategy.bbox()
                }),
                style: new ol.style.Style({
                    fillOpacity : 0,
                    stroke : new ol.style.Stroke({
                        color: 'rgba(0, 255, 0, 1.0)',
                        width: 3
                    })
                }),
                printable: false,
                displayInLayerSwitcher: false
            }),
            new ol.layer.Vector({
                code: 'snappingLayer',
                name: 'Snapping layer',
                source: new ol.source.Vector({features: new ol.Collection()}),
                visible: false,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 255, 1.0)',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 2,
                        fill: new ol.style.Fill({
                            color: 'rgba(0, 0, 255, 1.0)'
                        })
                    })
                })
            })
        ],
        view: new ol.View({
            resolutions: OgamDesktop.map.resolutions,
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
            new ol.control.Scale ({className:'o-map-tools-map-scale'}),
            new ol.control.MousePosition({
                className:'o-map-tools-map-mouse-position',
                coordinateFormat :function(coords){
                    var template = 'X: {x} - Y: {y} ' + OgamDesktop.map.projection;
                    return ol.coordinate.format(coords, template);
            }})
        ]
    }),
            
   isResInLayerRange: function(lyr, res){
       if (res >= lyr.getMinResolution() && res < lyr.getMaxResolution()) { // in range
           return true;
       } else { // out of range
           return false;
       }
   },
   initComponent: function(){
       this.getMap().getLayers().forEach(function(lyr){
            lyr.setVisible(lyr.getVisible());
       });
       
       this.getMap().getView().on('change:resolution', function(e){
          curRes = e.target.get(e.key); // new value of resolution
          oldRes = e.oldValue; // old value of resolution
          this.getMap().getLayers().forEach(function(lyr){
              if (this.isResInLayerRange(lyr, curRes) && !this.isResInLayerRange(lyr, oldRes)) {
                  this.fireEvent('changelayervisibility', lyr, true);
              } else if (!this.isResInLayerRange(lyr, curRes) && this.isResInLayerRange(lyr, oldRes)) {
                  this.fireEvent('changelayervisibility', lyr, false);
              };
          }, this);
       }, this);
       this.callParent(arguments);
   }
});
