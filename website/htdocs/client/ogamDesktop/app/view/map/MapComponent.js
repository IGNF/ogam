
Ext.define("OgamDesktop.view.map.MapComponent",{
    extend: "GeoExt.component.Map",
    xtype: 'mapcomponent',
    reference: 'mapCmp',
    map: new ol.Map({
        logo: false, // no attributions to ol
        interactions: ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false}), // disable rotation
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
