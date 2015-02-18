Ext.onReady(function() {
	if (typeof (OpenLayers) !== "undefined") {
	    if (OpenLayers.Control.FeatureInfoControl.prototype) {
	        Ext.apply(OpenLayers.Control.FeatureInfoControl.prototype, {
	            popupTitle : "Information(s) sur la géométrie"
	        });
	    }
		if (OpenLayers.Handler.FeatureInfo.prototype) {
			Ext.apply(OpenLayers.Handler.FeatureInfo.prototype, {
				alertErrorTitle : "Erreur :",
				alertRequestFailedMsg : "Désolé, la demande d'informations sur la géométrie a échoué..."
			});
		}
	    if (OpenLayers.Handler.GetFeature.prototype) {
	        Ext.apply(OpenLayers.Handler.GetFeature.prototype, {
	            alertErrorTitle : "Erreur :",
	            alertRequestFailedMsg : "Désolé, la demande d'informations sur la géométrie a échoué..."
	        });
	    }
	    if (OpenLayers.Handler.LocationInfo.prototype) {
	        Ext.apply(OpenLayers.Handler.LocationInfo.prototype, {
	            alertErrorTitle : "Erreur :",
	            alertRequestFailedMsg : "Désolé, la demande d'informations sur la géométrie a échoué..."
	        });
	    }
	}
});