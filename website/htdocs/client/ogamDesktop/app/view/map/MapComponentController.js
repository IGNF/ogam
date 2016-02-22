/**
 * This class manages the map panel view.
 */
Ext.define('OgamDesktop.view.map.MapComponentController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mapcomponent',

    init : function() {console.log('init',this);
        this.map = this.getView().getMap();
    },

    getMapLayer : function (layerCode) {
        var me = {"layerCode":layerCode};
        var lyrGrp;
        if (arguments.length > 1) {
            lyrGrp = arguments[1];
        } else {
            lyrGrp = this.map.getLayerGroup();
        }
        lyrGrp.getLayers().forEach(
            function(el, index, c_array){
                if (el.get('code') === me.layerCode) {
                    me.layer = el;
                    return;
                } else if (el.isLayerGroup) {
                    if (this.getMapLayer(layerCode, el)) {
                        me.layer = this.getMapLayer(layerCode, el)
                        return;
                    };
                }
            },
            this
        );
        return me.layer;
    },

    activateVectorLayerInfo : function() {
        if (this.selectedVectorLayer && this.selectedVectorLayer !== null) {
            var layerName = this.selectedVectorLayer.getData().code;
            var url = this.selectedVectorLayer.getData().url;
        }
    },

    // TODO: @PEG : Ajouter l'attribut code: 'results' à la couche des résultats,
    zoomToResultFeatures : function () {
        // Get wkt geometry corresponding to the result BBOX
        var resultsBBox = this.getView().resultsBBox ? this.getView().resultsBBox : 'POLYGON EMPTY';
        var wktGeom = this.getView().wktFormat.readGeometry(resultsBBox);
        var extent = wktGeom.getExtent();
        /*var extent = this.getMapLayer('results').getSource().getExtent();*/
        if (ol.extent.isEmpty(extent)) {
            Ext.Msg.alert('Zoom to result features :', 'The results layer contains no feature on which to zoom.');
        } else {
            this.map.getView().fit(
                extent, 
                this.map.getSize()
            );
        }
        this.map.render();
    },

    /**
     * Zoom to the passed feature on the map
     * 
     * @param {String}
     *            id The plot id
     * @param {String}
     *            wkt The wkt feature
     */
    zoomToFeature : function(id, wkt) {
            var feature = this.getView().wktFormat.readFeature(wkt);
            var source = new ol.source.Vector();
            var vectorLyr = new ol.layer.Vector({
               source : source
            });

            var start = new Date().getTime();
            var listenerKey;
            var duration = 1500; // Animation duration
            var map = this.map;
                    map.addLayer(vectorLyr);
            function animate(event) {
                var vectorContext = event.vectorContext;
                var frameState = event.frameState;
                var flashGeom = feature.getGeometry().clone();
                var elapsed = frameState.time - start;
                var elapsedRatio = elapsed / duration;
                // radius will be 5 at start and 30 at end.
                var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
                var opacity = ol.easing.easeOut(1 - elapsedRatio);
      //          console.log(flashGeom);
                var flashStyle = new ol.style.Circle({
                    radius: radius,
                    snapToPixel: false,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 0, 0, ' + opacity + ')',
                        width: 1
                    })
                });
                var highlightStyle = new ol.style.Style({
                    geometry: flashGeom,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 0, 0, ' + opacity + ')',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 0, 0, ' + opacity + ')'
                    }),
                            image: new ol.style.Circle({
                                radius: 7,
                                fill: new ol.style.Fill({
                                  color: 'rgba(255, 0, 0, ' + opacity + ')'
                                })
                            })
                });
                var geomType = feature.getGeometry().getType();
                if (geomType === 'Polygon'){
                    vectorContext.setImageStyle(flashStyle);
                    vectorContext.drawPointGeometry(flashGeom, null);
                    if (elapsed > duration) {
                        ol.Observable.unByKey(listenerKey);
                        return;
                    }
                    // tell OL3 to continue postcompose animation
                    map.render();
//                } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
                    // @TODO 
                } else if (geomType === 'Point' || geomType === 'MultiPolygon') {
                    vectorLyr.setStyle(highlightStyle);
                    if (source.getFeatures().length == 0) {
                        source.addFeature(feature);
                    }
                    if (elapsed > duration) {
                        ol.Observable.unByKey(listenerKey);
                        return;
                    }
                    map.render();
                }
            }
            listenerKey = map.on('postcompose', animate);
            map.getView().fit(feature.getGeometry().getExtent(), map.getSize());
    }
});