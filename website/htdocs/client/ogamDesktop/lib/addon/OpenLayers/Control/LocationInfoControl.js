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
	initialize : function(options) {
		OpenLayers.Control.prototype.initialize.apply(this, [ options ]);
		this.options = options;
		this.handler = new OpenLayers.Handler.LocationInfo(this, {
			'click' : this.click,
			'control' : this
		});
	},

	/**
	 * Fire a event with the received info.
	 */
	fireGetLocationInfoEvent : function(result, llLocation) {
		this.events.triggerEvent('getLocationInfo', {'result': result, 'coord': llLocation, 'mapId': this.map.id});
	},

	CLASS_NAME : "OpenLayers.Control.LocationInfoControl"
});