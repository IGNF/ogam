/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.FeatureInfoControl. Implements a very simple
 * control that generates a WKT request to get feature info and display it.
 */
OpenLayers.Control.FeatureInfoControl = OpenLayers.Class(OpenLayers.Control, {

	/**
	 * Internationalization.
	 */
	popupTitle : 'Feature information',

	/**
	 * @cfg {OpenLayers.Handler} handler Reference to the handler for this
	 *      control
	 */
	handler : null,

	/**
	 * @cfg {String} layerName The layer name
	 */
	layerName : null,

	/**
	 * @cfg {OpenLayers.map} map The map
	 */
	map : null,

	/**
	 * @cfg {GeoExt.Popup} popup a popup
	 */
	popup : null,

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

		this.handler = new OpenLayers.Handler.FeatureInfo(this, {
			'click' : this.click,
			'control' : this
		});
	},

	/**
	 * Display a popup with the information from the selected feature.
	 */
	displayPopup : function(longlat, featureInfo) {

		// If not empty (size of the prototype is 1)
		if (featureInfo.fields && Object.keys(featureInfo.fields).length > 1) {
			// Create a popup
			popup = new GeoExt.Popup({
				title : this.popupTitle,
				location : longlat,
				width : 200,
				map : this.map,
				html : this.json2html(featureInfo.fields),
				maximizable : false,
				collapsible : false,
				unpinnable : false
			});
			popup.show();
		}
	},

	/**
	 * Format a JSON object into an HTML string.
	 */
	json2html : function(obj, depth) {
		var html = '';
		if (typeof depth == 'undefined') {
			depth = 0;
		}
		if (typeof obj == 'object' && obj) {
			html += '<ul>';
			for ( var item in obj) {
				if (obj.hasOwnProperty(item)) {
					html += '<li>' + item + ': ';
					html += (typeof obj[item] == 'object' && obj[item] && depth < 10) ? Ext.util.Format.obj2ULtree(obj[item], (depth + 1)) : obj[item];
					html += '</li>';
				}
			}
			html += '</ul>';
		}
		return html;
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

	/**
	 * Destroy the control.
	 */
	destroy : function() {
		if (this.handler !== null) {
			this.handler.destroy();
			this.handler = null;
		}
		if (this.popup !== null) {
			this.popup.destroy();
			this.popup = null;
		}
		return OpenLayers.Control.prototype.destroy.apply(this, arguments);
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
		var url = Genapp.base_url + "proxy/getfeatureinfo?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typename=" + this.control.layerName + "&BBOX=" + ll.lon
				+ "," + ll.lat + "," + ll.lon + "," + ll.lat;
		url = url + "&MAXFEATURES=1";

		OpenLayers.loadURL(url, '', this, function(response) {
			try {
				var result = Ext.decode(response.responseText);
				this.control.displayPopup(ll, result);

			} catch (e) {
				Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
			}
		}, function(response) {
			Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		});

		Event.stop(evt);
	}

});
