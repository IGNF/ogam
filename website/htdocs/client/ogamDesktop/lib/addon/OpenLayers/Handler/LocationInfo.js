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
	 * @cfg {OpenLayers.map} map The map
	 */
	map : null,

	/**
	 * @cfg {String} request server adress
	 */
	requestServiceUrl : null, 
	
	/**
	 * @cfg {integer} max features to ask
	 */
	maxfeatures: null,
	
	/**
	 * Handle the response from the server.
	 * 
	 * @param response
	 */
	handleResponse: function (response) {
		 if(response.status == 500) {
			if (Ext) {
				Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
			} else {
				alert(this.alertErrorTitle, this.alertRequestFailedMsg);
			}
			 
		}
		if(!response.responseText) {
			if (Ext) {
				Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
			} else {
				alert(this.alertErrorTitle, this.alertRequestFailedMsg);
			}
		}
		
		// Decode the response
		try {
			var result = Ext.decode(response.responseText);
			if (result.data && result.data.length) {
				this.control.fireGetLocationInfoEvent(result, this.ll);
			}
		} catch (e) {
			console.log(e);
			if (Ext) {
				Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
			} else {
				alert(this.alertErrorTitle, this.alertRequestFailedMsg);
			}
		}
	},

	/**
	 * Handle the click event.
	 */
	click: function(evt) {
		// Calcul de la coordonnée correspondant au point cliqué par
		// l'utilisateur
		this.px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
		this.ll = this.map.getLonLatFromPixel(this.px);

		// Construction d'une URL pour faire une requête WFS sur le point
		var url = this.control.options.requestServiceUrl + "ajaxgetlocationinfo?LON="+this.ll.lon+"&LAT="+this.ll.lat;
		if (this.control.options.maxfeatures !== 0) {
			url = url + "&MAXFEATURES=" + this.control.options.maxfeatures;
		}
		// Send a request
		OpenLayers.Request.GET({
			url : url,
			scope : this,
			callback: this.handleResponse
		});
	}
});