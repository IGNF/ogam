Ext.onReady(function() {
	if (typeof (OpenLayers) !== "undefined") {
	    if (OpenLayers.Control.FeatureInfoControl.prototype) {
	        Ext.apply(OpenLayers.Control.FeatureInfoControl.prototype, {
	            popupTitle : "Information about the geometry"
	        });
	    }
		if (OpenLayers.Handler.FeatureInfo.prototype) {
			Ext.apply(OpenLayers.Handler.FeatureInfo.prototype, {
				alertErrorTitle : "Error:",
				alertRequestFailedMsg : "Sorry, the demand of information failed...",
				alertNoLayerMsg : 'Please select a vector layer...'
			});
		}
	    if (OpenLayers.Handler.GetFeature.prototype) {
	        Ext.apply(OpenLayers.Handler.GetFeature.prototype, {
	            alertErrorTitle : "Error :",
	            alertRequestFailedMsg : "Sorry, the demand of information about the geometry failed..."
	        });
	    }
	    if (OpenLayers.Handler.LocationInfo.prototype) {
	        Ext.apply(OpenLayers.Handler.LocationInfo.prototype, {
	            alertErrorTitle : "Error :",
	            alertRequestFailedMsg : "Sorry, the demand of information about the geometry failed..."
	        });
	    }
	}
}); 