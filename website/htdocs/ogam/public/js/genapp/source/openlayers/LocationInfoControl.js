/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */


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
	 * @cfg {OpenLayers.map} map The map
	 */
	map : null,

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
		Genapp.eventManager.fireEvent('getLocationInfo', result, this.map.id);
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

	CLASS_NAME : "OpenLayers.Control.LocationInfoControl"
});

/**
 * The handler for the control
 */
OpenLayers.Handler.LocationInfo = OpenLayers.Class(OpenLayers.Handler, {
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
	 * Handle the response from the server.
	 * 
	 * @param response
	 */
	handleResponse: function (response) {
		 if(response.status == 500) {
			 Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		 }
		 if(!response.responseText) {
			 Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		 }
		 
		 // Decode the response
		 try {
			var result = Ext.decode(response.responseText);
			if (!Ext.isEmpty(result.data)) {
				this.control.getLocationInfo(result);
			}
		 } catch (e) {
			console.log(e);
		 	Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		 }
	},

	/**
	 * Handle the click event.
	 */
	click: function(evt) {
		// Calcul de la coordonnée correspondant au point cliqué par
		// l'utilisateur
		var px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
		var ll = this.map.getLonLatFromPixel(px);

		// Construction d'une URL pour faire une requête WFS sur le point
		var url = Genapp.base_url + "query/ajaxgetlocationinfo?LON="+ll.lon+"&LAT="+ll.lat;

		if (Genapp.map.featureinfo_maxfeatures !== 0) {
			url = url + "&MAXFEATURES=" + Genapp.map.featureinfo_maxfeatures;
		}

		// Send a request
		OpenLayers.Request.GET({
				url : url, 
				scope : this,
				callback: this.handleResponse});
		
		
	}
});
