/* Copyright (c) 2006-2009 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.ZoomToFeatures
 * Implements a very simple button control. Designed to be used with a 
 * <OpenLayers.Control.Panel>.
 * 
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ZoomToFeatures = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: type
     * {String} The type of <OpenLayers.Control> -- When added to a 
     *     <Control.Panel>, 'type' is used by the panel to determine how to 
     *     handle our events.
     */
    type: OpenLayers.Control.TYPE_BUTTON,
    
    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>} The vector layer containing the features we want to zoom to
     */
    layer: null,
    
    /**
     * APIProperty: maxZoomLevel
     * {integer} The maximum zoom level to zoom to (defaults to numZoomLevel-1)
     */
    maxZoomLevel: null,
    
    /**
     * APIProperty: ratio
     * {Float} The ratio by which features' bounding box should be scaled (defaults to 1)
     */
    ratio: 1,
    
    /**
     * APIProperty: autoActivate
     * {boolean} Whether to activate/deactivate itself automagically when required (defaults to false)
     *           This is useful for enabling/disabling the attached panel button for instance
     */
    autoActivate: false,
    
    /**
     * Constructor: OpenLayers.Control.ZoomToFeatures
     * 
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object}
     */
    initialize: function (layer, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        if (this.autoActivate) {
            if (!layer.features.length) {
                this.deactivate();
            } else {
                this.activate();
            }
            layer.events.register('featuresadded', this, this.activate);
            layer.events.register('featuresremoved', this, this.onFeaturesRemoved);
        }
        this.layer = layer;
    },
    
    /**
     * Method: setMap
     * Set the map property for the control.
     *
     * Parameters: 
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        if (!this.maxZoomLevel) {
            this.maxZoomLevel = map.numZoomLevels-1;
        }
        if (this.autoActivate) {
            map.events.register('moveend', this, this.onMapMoved);
        }
    },
    
    /*
     * Method: onFeaturesRemoved
     * Deactivate ourselves when no more features in vector layer
     */
    onFeaturesRemoved: function() {
        if (!this.layer.features.length) {
            this.deactivate();
        }
    },
    
    /*
     * Method: onMapMoved
     * Activate ourselves when map has moved, if needed
     */
    onMapMoved: function() {
        if (this.active) { 
            return;
        }
        var layer = this.layer;
        if (layer.features && layer.features.length) {
            this.activate();
        }
    },
    
    /*
     * Method: trigger
     * Do the zoom to the features extent.
     */
    trigger: function() {
        if (!this.active || !this.map) {
            return;
        }
        var map = this.map;
        var features = this.layer.features;
        var i = 0;
        while (!features[i].geometry) {
            i++;
        }
        
        var bounds = features[i].geometry.getBounds();
        for (var j=i+1; j<features.length; j++) {
            var geom = features[j].geometry;
            if (geom) {
                bounds.extend(geom.getBounds());
            }
        }
        bounds = bounds.scale(this.ratio);
        
        if ((bounds.getWidth() === 0) && (bounds.getHeight() === 0)){
            var zoom = this.maxZoomLevel;
        } else {
            var desiredZoom = map.getZoomForExtent(bounds);
            var zoom = (desiredZoom > this.maxZoomLevel) ? this.maxZoomLevel : desiredZoom;
        }
        map.setCenter(bounds.getCenterLonLat(), zoom);
        
        if (this.autoActivate) {
            this.deactivate();
        }
    },
    
    destroy: function() {
        if (this.autoActivate) {
            this.layer.events.unregister('featuresadded', this, this.activate);
            this.layer.events.unregister('featuresremoved', this, this.onFeaturesRemoved);
        }
        this.layer = null;
        
        if (this.map && this.autoActivate) {
            this.map.events.unregister('moveend', this, this.onMapMoved);
        }
        
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },
    
    CLASS_NAME: "OpenLayers.Control.ZoomToFeatures"
});