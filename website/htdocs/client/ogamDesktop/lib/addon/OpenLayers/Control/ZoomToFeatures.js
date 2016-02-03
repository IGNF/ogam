/**
 * Copyright (c) 2006-2009 MetaCarta, Inc., published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. 
 */

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
OpenLayers.Control.ZoomToFeatures = OpenLayers.Class(OpenLayers.Control.Button, {
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
     * Method: trigger
     * Do the zoom to the features extent.
     */
    trigger: function() {
    	
        if (!this.map || !this.layer) {
    		console.warn('ZoomToFeature created without map or layer', this);
        	return;
    	}
        
        if ( !this.layer.features || !this.layer.features.length) {
        	return;
        }

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
            var desiredZoom = this.map.getZoomForExtent(bounds);
            var zoom = (desiredZoom > this.maxZoomLevel) ? this.maxZoomLevel : desiredZoom;
        }
        this.map.setCenter(bounds.getCenterLonLat(), zoom);
    },
    
    
    CLASS_NAME: "OpenLayers.Control.ZoomToFeatures"
});