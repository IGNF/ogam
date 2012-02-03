/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.FeatureInfoControl. Implements a very simple
 * control that generates a WKT request.
 */
OpenLayers.Control.FeatureInfoControl = OpenLayers.Class.create();
OpenLayers.Control.FeatureInfoControl.prototype = OpenLayers.Class.inherit(OpenLayers.Control, {
	type : OpenLayers.Control.TYPE_TOOL,
	/**
	 * Constructor: OpenLayers.Control.FeatureInfoControl
	 * 
	 * Parameters: options - {Object}
	 */
	initialize : function(map, options) {
		OpenLayers.Control.prototype.initialize.apply(this, [ options ]);
	},

	draw : function() {
		this.handler = new OpenLayers.Handler.FeatureInfo(this, {
			'click' : this.click
		});
		// this.activate();
	},

	/**
	 * Method: activate Activates the control.
	 * 
	 * Returns: {Boolean} The control was effectively activated.
	 */
	activate : function() {
		if (!this.active) {
			this.handler.activate();
		}
		return OpenLayers.Control.prototype.activate.apply(this, arguments);
	},

	/**
	 * Method: deactivate Deactivates the control.
	 * 
	 * Returns: {Boolean} The control was effectively deactivated.
	 */
	deactivate : function() {
		return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
	},

	CLASS_NAME : "OpenLayers.Control.FeatureInfoControl"
});

/**
 * The handler for the control
 */
OpenLayers.Handler.FeatureInfo = OpenLayers.Class.create();
OpenLayers.Handler.FeatureInfo.prototype = OpenLayers.Class.inherit(OpenLayers.Handler, {
	/**
	 * @cfg {String} alertErrorTitle The alert Error Title (defaults to
	 *      <tt>'Error :'</tt>)
	 */
	alertErrorTitle : 'Error :',
	/**
	 * @cfg {String} alertRequestFailedMsg The alert Request Failed Msg
	 *      (defaults to <tt>'Sorry, the request failed...'</tt>)
	 */
	alertRequestFailedMsg : 'Sorry, the feature info request failed...',

	click : function(evt) {
		// Calcul de la coordonnée correspondant au point cliqué par
		// l'utilisateur
		var px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
		var ll = this.map.getLonLatFromPixel(px);

		// Construction d'une URL pour faire une requête WFS sur le point
		var url = Genapp.base_url + "proxy/getInfo?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typename=" + Genapp.map.featureinfo_typename + "&BBOX="
				+ (ll.lon - Genapp.map.featureinfo_margin) + "," + (ll.lat + Genapp.map.featureinfo_margin) + "," + (ll.lon + Genapp.map.featureinfo_margin)
				+ "," + (ll.lat - Genapp.map.featureinfo_margin);

		if (Genapp.map.featureinfo_maxfeatures !== 0) {
			url = url + "&MAXFEATURES=" + Genapp.map.featureinfo_maxfeatures;
		}

		OpenLayers.loadURL(url, '', this, function(response) {
			try {
				var result = Ext.decode(response.responseText);
				if (!Ext.isEmpty(result.data)) {
					if (Genapp.map.featureinfo_maxfeatures === 1) {
						Genapp.cardPanel.consultationPage.openDetails(result.data[0][0], 'getdetails');
					} else {
						Genapp.cardPanel.consultationPage.openFeaturesInformationSelection(result);
					}
				}
			} catch (e) {
				Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
			}
		}, function(response) {
			Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		});

		Event.stop(evt);
	}
});
