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
		//Ogam.eventManager.addEvents('getLocationInfo');

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
		//Ogam.eventManager.fireEvent('getLocationInfo', result, this.map.id);
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