/**
 * This class manages the map panel view.
 */
Ext.define('OgamDesktop.view.map.MapComponentController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mapcomponent',

   /**
    * The wkt format.
    * 
    * @type {ol.format.WKT}
    * @property wktFormat
    */
    wktFormat : new ol.format.WKT(),

    init : function() {
        this.map = this.getView().getMap();
        var drawingLayerSource = this.getMapLayer('drawingLayer').getSource();
        var listenerFct = this.fireEvent.bind(this.getView(), ['drawingLayerFeatureChange']);
        drawingLayerSource.on('addfeature', listenerFct);
        drawingLayerSource.on('removefeature', listenerFct);
        drawingLayerSource.on('changefeature', listenerFct);
    },

    getMapLayer : function (layerCode) {
        var me = {"layerCode":layerCode};
        this.map.getLayers().forEach(
            function(el, index, c_array){
                if (el.get('code') === this.layerCode) {
                    this.layer = el;
                }
            },
            me
        );
        return me.layer;
    },

    activateVectorLayerInfo : function() {
        if (this.selectedVectorLayer && this.selectedVectorLayer !== null) {
            var layerName = this.selectedVectorLayer.getData().code;
            var url = this.selectedVectorLayer.getData().url;
        }
//        if (value[0].data.code !== null) {
//            var layerName = value[0].data.code;
//            var url = value[0].data.url;
//            var popupTitle = this.popupTitle;
//            // Change the WFS layer typename
//            this.mapPanel.wfsLayer.protocol.featureType = layerName;
//            this.mapPanel.wfsLayer.protocol.options.featureType = layerName;
//            this.mapPanel.wfsLayer.protocol.format.featureType = layerName;
//            this.mapPanel.wfsLayer.protocol.params.typename = layerName;
//            this.mapPanel.wfsLayer.protocol.options.url = url;
//
//            // Remove all current features
//            this.mapPanel.wfsLayer.destroyFeatures();
//
//            // Copy the visibility range from the original
//            // layer
//            originalLayers = this.mapPanel.map.getLayersByName(layerName);
//            if (originalLayers != null) {
//                    originalLayer = originalLayers[0];
//                this.mapPanel.wfsLayer.maxResolution = originalLayer.maxResolution;
//                this.mapPanel.wfsLayer.maxScale = originalLayer.maxScale;
//                this.mapPanel.wfsLayer.minResolution = originalLayer.minResolution;
//                this.mapPanel.wfsLayer.minScale = originalLayer.minScale;
//                this.mapPanel.wfsLayer.alwaysInRange = false;
//                this.mapPanel.wfsLayer.calculateInRange();
//            }
//
//            // Make it visible
//            this.mapPanel.wfsLayer.setVisibility(true);
//
//            // Force a refresh (rebuild the WFS URL)
//            this.mapPanel.wfsLayer.moveTo(null, true, false);
//
//            // Set the layer name in other tools
//            if (this.mapPanel.getFeatureControl !== null) {
//                this.mapPanel.getFeatureControl.layerName = layerName;
//            }
//
//            this.mapPanel.wfsLayer.refresh();
//            this.mapPanel.wfsLayer.strategies[0].update({force:true});
//
//        } else {
//            // Hide the layer
//            this.mapPanel.wfsLayer.setVisibility(false);
//        }
//
//        // Set the layer name in feature info tool
//        if (this.mapPanel.featureInfoControl !== null) {
//            this.mapPanel.featureInfoControl.layerName = layerName;
//        }
    },

    // TODO: @PEG : Ajouter l'attribut code: 'results' à la couche des résultats,
    zoomToResultFeatures : function () {
        // Get wkt geometry corresponding to the result BBOX
        var resultsBBox = this.getView().resultsBBox ? this.getView().resultsBBox : 'POLYGON EMPTY';
        var wktGeom = this.wktFormat.readGeometry(resultsBBox);
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
            var feature = this.wktFormat.readFeature(wkt);
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