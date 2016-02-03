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
	displayPopup : function(coordPx, featureInfo) {
		if (featureInfo.fields) {
			// Create a popup
			popup = Ext.create('GeoExt.window.Popup',{
				title : this.popupTitle,
				location : coordPx,
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