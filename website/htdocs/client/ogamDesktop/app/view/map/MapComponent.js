
Ext.define("OgamDesktop.view.map.MapComponent",{
    extend: "GeoExt.component.Map",
    xtype: 'mapcomponent',
    reference: 'mapCmp',

    map: new ol.Map({
        logo: false, // no attributions to ol
        layers: [
            new ol.layer.Vector({
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
            new ol.control.ZoomToExtent(),
            new ol.control.ScaleLine(),
            new ol.control.MousePosition()
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