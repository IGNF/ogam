/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: LocationInfoControl. Implements a very simple control that generates a
 * WKT request.
 * 
 * Get information about a location
 */
OpenLayers.Control.LocationInfoControl = OpenLayers.Class(OpenLayers.Control, {

	/**
	 * Property: handler {Object} Reference to the <OpenLayers.Handler> for this
	 * control
	 */
	handler : null,

	/**
	 * Property: type {String} The type of <OpenLayers.Control> -- When added to
	 * a <Control.Panel>, 'type' is used by the panel to determine how to handle
	 * our events.
	 */
	type : OpenLayers.Control.TYPE_TOGGLE,

	/**
	 * Constructor: OpenLayers.Control.FeatureInfoControl
	 * 
	 * Parameters: options - {Object}
	 */
	initialize : function(map, options) {
		OpenLayers.Control.prototype.initialize.apply(this, [ options ]);

		// Register events
		Genapp.eventManager.addEvents('getLocationInfo');

		this.handler = new OpenLayers.Handler.LocationInfo(this, {
			'click' : this.click,
			'control' : this
		});
	},

	/**
	 * This function is called when a location info is received. Fire a event
	 * with the received info.
	 */
	getLocationInfo : function(result) {
		Genapp.eventManager.fireEvent('getLocationInfo', result);
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
OpenLayers.Handler.LocationInfo = OpenLayers.Class.create();
OpenLayers.Handler.LocationInfo.prototype = OpenLayers.Class.inherit(OpenLayers.Handler, {
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

	/**
	 * @cfg {OpenLayers.Control.FeatureInfoControl} control The control
	 */
	control : null,

	/**
	 * Handle the click event.
	 */
	click : function(evt) {
		// Calcul de la coordonnée correspondant au point cliqué par
		// l'utilisateur
		var px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
		var ll = this.map.getLonLatFromPixel(px);

		// Construction d'une URL pour faire une requête WFS sur le point
		var url = Genapp.base_url + "proxy/getlocationinfo?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typename=" + Genapp.map.featureinfo_typename + "&BBOX="
				+ (ll.lon - Genapp.map.featureinfo_margin) + "," + (ll.lat + Genapp.map.featureinfo_margin) + "," + (ll.lon + Genapp.map.featureinfo_margin)
				+ "," + (ll.lat - Genapp.map.featureinfo_margin);

		if (Genapp.map.featureinfo_maxfeatures !== 0) {
			url = url + "&MAXFEATURES=" + Genapp.map.featureinfo_maxfeatures;
		}

		OpenLayers.loadURL(url, '', this, function(response) {
			try {
				var result = Ext.decode(response.responseText);
				if (!Ext.isEmpty(result.data)) {
					this.control.getLocationInfo(result);
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
