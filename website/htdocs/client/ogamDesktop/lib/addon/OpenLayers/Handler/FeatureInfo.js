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
OpenLayers.Handler.FeatureInfo = OpenLayers.Class(OpenLayers.Handler, {
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
	 * @cfg {String} alertRequestFailedMsg The alert Request Failed Msg
	 *      (defaults to <tt>'Sorry, the request failed...'</tt>)
	 */
	alertNoLayerMsg : 'Please select a vector layer...',

	/**
	 * @cfg {OpenLayers.Control.FeatureInfoControl} control The control
	 */
	control : null,
	
	/**
	 * @cfg long and lat 
	 */
	ll : null, 
	
	/**
	 * Handle the response from the server.
	 * 
	 * @param response
	 */
	handleResponse: function (response) {
		 if(response.status == 500) {
			Ext.create('Ext.window.MessageBox').alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		 }
		 if(!response.responseText) {
			Ext.create('Ext.window.MessageBox').alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		 }
		 
		 // Decode the response
		 try {
			var result = Ext.decode(response.responseText);
			this.control.displayPopup(this.px, result);
		} catch (e) {
			Ext.create('Ext.window.MessageBox').alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		}
	},

	/**
	 * Handle the click event.
	 */
	click : function(evt) {
		this.px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
		if (!this.control.layerName){
//			Ext.create('Ext.window.MessageBox').alert(this.alertErrorTitle, this.alertNoLayerMsg);
			popup = Ext.create('GeoExt.window.Popup',{
				title : this.alertErrorTitle,
				location : this.px,
				width : 200,
				map : this.map,
				html : '<p>'+this.alertNoLayerMsg+'</p>',
				maximizable : false,
				collapsible : false,
				unpinnable : false
			});
			popup.show();
		} else {
			// Calcul de la coordonnée correspondant au point cliqué par
			// l'utilisateur
			this.ll = this.map.getLonLatFromPixel(this.px);

			// Construction d'une URL pour faire une requête WFS sur le point
			var url = Ext.manifest.OgamDesktop.requestServiceUrl + "../proxy/getfeatureinfo?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typename=" + this.control.layerName + "&BBOX=" + this.ll.lon
					+ "," + this.ll.lat + "," + this.ll.lon + "," + this.ll.lat;
			url = url + "&MAXFEATURES=1";
			
			// Send a request
			OpenLayers.Request.GET({
					url : url, 
					scope : this,
					callback: this.handleResponse});

		}
	}

});