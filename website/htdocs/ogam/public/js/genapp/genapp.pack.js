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
	displayPopup : function(longlat, featureInfo) {

		if (featureInfo.fields) {
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
			 Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		 }
		 if(!response.responseText) {
			 Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		 }
		 
		 // Decode the response
		 try {
			var result = Ext.decode(response.responseText);
			this.control.displayPopup(this.ll, result);

		} catch (e) {
			Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		}
	},

	/**
	 * Handle the click event.
	 */
	click : function(evt) {
		// Calcul de la coordonnée correspondant au point cliqué par
		// l'utilisateur
		var px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
		this.ll = this.map.getLonLatFromPixel(px);

		// Construction d'une URL pour faire une requête WFS sur le point
		var url = Genapp.base_url + "proxy/getfeatureinfo?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typename=" + this.control.layerName + "&BBOX=" + this.ll.lon
				+ "," + this.ll.lat + "," + this.ll.lon + "," + this.ll.lat;
		url = url + "&MAXFEATURES=1";
		
		// Send a request
		OpenLayers.Request.GET({
				url : url, 
				scope : this,
				callback: this.handleResponse});

	}

});
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
 * Class: OpenLayers.Control.GetFeatureControl. Implements a very simple control
 * that generates a WKT request to get a feature geometry and add it to the map.
 */
OpenLayers.Control.GetFeatureControl = OpenLayers.Class(OpenLayers.Control, {

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
	 * Property: type {String} The type of <OpenLayers.Control> -- When added to
	 * a <Control.Panel>, 'type' is used by the panel to determine how to handle
	 * our events.
	 */
	type : OpenLayers.Control.TYPE_TOGGLE,

	/**
	 * Constructor: OpenLayers.Control.GetFeatureControl
	 * 
	 * Parameters: options - {Object}
	 */
	initialize : function(map, options) {
		OpenLayers.Control.prototype.initialize.apply(this, [ options ]);
		
		// Register events
		Genapp.eventManager.addEvents('getFeature');

		this.handler = new OpenLayers.Handler.GetFeature(this, {
			'click' : this.click,
			'control' : this
		});
	},

	/**
	 * This function is called when a feature is received. Fire a event with the
	 * received feature.
	 */
	getFeature : function(feature) {
		Genapp.eventManager.fireEvent('getFeature', feature, this.map.id);
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
		return OpenLayers.Control.prototype.destroy.apply(this, arguments);
	},

	CLASS_NAME : "OpenLayers.Control.GetFeatureControl"
});

/**
 * The handler for the control
 */
OpenLayers.Handler.GetFeature = OpenLayers.Class(OpenLayers.Handler, {
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
	 * The gml format used to read the response.
	 * 
	 * @type {OpenLayers.Format.GML}
	 * @property wktFormat
	 */
	gmlFormat : new OpenLayers.Format.GML(),
	
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
			var feature = this.gmlFormat.read(response.responseText);
			this.control.getFeature(feature);

		} catch (e) {
			Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
		}
	},

	/**
	 * Handle the click event.
	 */
	click : function(evt) {
		// Calcul de la coordonnée correspondant au point cliqué par
		// l'utilisateur
		var px = new OpenLayers.Pixel(evt.xy.x, evt.xy.y);
		var ll = this.map.getLonLatFromPixel(px);

		// Construction d'une URL pour faire une requête WFS sur le point
		var url = Genapp.base_url + "proxy/getwfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&typename=" + this.control.layerName + "&BBOX=" + ll.lon + ","
				+ ll.lat + "," + ll.lon + "," + ll.lat;
		url = url + "&MAXFEATURES=1";

		// Send a request
		OpenLayers.Request.GET({
				url : url, 
				scope : this,
				callback: this.handleResponse});
	}

});
/**
 * Copyright (c) 2006-2009 MetaCarta, Inc., published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. 
 */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.ZoomToFeatures
 * Implements a very simple button control. Designed to be used with a 
 * <OpenLayers.Control.Panel>.
 * 
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ZoomToFeatures = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: type
     * {String} The type of <OpenLayers.Control> -- When added to a 
     *     <Control.Panel>, 'type' is used by the panel to determine how to 
     *     handle our events.
     */
    type: OpenLayers.Control.TYPE_BUTTON,
    
    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>} The vector layer containing the features we want to zoom to
     */
    layer: null,
    
    /**
     * APIProperty: maxZoomLevel
     * {integer} The maximum zoom level to zoom to (defaults to numZoomLevel-1)
     */
    maxZoomLevel: null,
    
    /**
     * APIProperty: ratio
     * {Float} The ratio by which features' bounding box should be scaled (defaults to 1)
     */
    ratio: 1,
    
    /**
     * APIProperty: autoActivate
     * {boolean} Whether to activate/deactivate itself automagically when required (defaults to false)
     *           This is useful for enabling/disabling the attached panel button for instance
     */
    autoActivate: false,
    
    /**
     * Constructor: OpenLayers.Control.ZoomToFeatures
     * 
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object}
     */
    initialize: function (layer, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        if (this.autoActivate) {
            if (!layer.features.length) {
                this.deactivate();
            } else {
                this.activate();
            }
            layer.events.register('featuresadded', this, this.activate);
            layer.events.register('featuresremoved', this, this.onFeaturesRemoved);
        }
        this.layer = layer;
    },
    
    /**
     * Method: setMap
     * Set the map property for the control.
     *
     * Parameters: 
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        if (!this.maxZoomLevel) {
            this.maxZoomLevel = map.numZoomLevels-1;
        }
        if (this.autoActivate) {
            map.events.register('moveend', this, this.onMapMoved);
        }
    },
    
    /*
     * Method: onFeaturesRemoved
     * Deactivate ourselves when no more features in vector layer
     */
    onFeaturesRemoved: function() {
        if (!this.layer.features.length) {
            this.deactivate();
        }
    },
    
    /*
     * Method: onMapMoved
     * Activate ourselves when map has moved, if needed
     */
    onMapMoved: function() {
        if (this.active) { 
            return;
        }
        var layer = this.layer;
        if (layer.features && layer.features.length) {
            this.activate();
        }
    },
    
    /*
     * Method: trigger
     * Do the zoom to the features extent.
     */
    trigger: function() {
        if (!this.active || !this.map) {
            return;
        }
        var map = this.map;
        var features = this.layer.features;
        var i = 0;
        while (!features[i].geometry) {
            i++;
        }
        
        var bounds = features[i].geometry.getBounds();
        for (var j=i+1; j<features.length; j++) {
            var geom = features[j].geometry;
            if (geom) {
                bounds.extend(geom.getBounds());
            }
        }
        bounds = bounds.scale(this.ratio);
        
        if ((bounds.getWidth() === 0) && (bounds.getHeight() === 0)){
            var zoom = this.maxZoomLevel;
        } else {
            var desiredZoom = map.getZoomForExtent(bounds);
            var zoom = (desiredZoom > this.maxZoomLevel) ? this.maxZoomLevel : desiredZoom;
        }
        map.setCenter(bounds.getCenterLonLat(), zoom);
        
        if (this.autoActivate) {
            this.deactivate();
        }
    },
    
    destroy: function() {
        if (this.autoActivate) {
            this.layer.events.unregister('featuresadded', this, this.activate);
            this.layer.events.unregister('featuresremoved', this, this.onFeaturesRemoved);
        }
        this.layer = null;
        
        if (this.map && this.autoActivate) {
            this.map.events.unregister('moveend', this, this.onMapMoved);
        }
        
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },
    
    CLASS_NAME: "OpenLayers.Control.ZoomToFeatures"
});Ext.namespace('Ext.ux.form');

Ext.ux.form.BasicCheckbox = Ext.extend(Ext.form.Field, {
	/**
	 * @cfg {String} focusClass The CSS class to use when the checkbox receives
	 * focus (defaults to undefined).
	 */
	focusClass : undefined,
	/**
	 * @cfg {String} fieldClass The default CSS class for the checkbox (defaults
	 * to "x-form-field").
	 */
	fieldClass: "x-form-field",
	/**
	 * @cfg {Boolean} checked True if the the checkbox should render already
	 * checked (defaults to false). When checked is false, first value will
	 * associated to {@link #inputValue} in all {@link #mode}.
	 */
	checked: false,
	/**
	 * @cfg {String} mode Determinates that how the checkbox will be work. You
	 * can choose from three working mode:
	 * <ul>
	 * <li><b>compat</b>: This is how the normal checkbox works - ONLY if checked,
	 * {@link #inputValue} being send to the remote server.</li>
	 * <li><b>switch</b>: In this mode a checkbox must be have a value based on
	 * its state checked/unchecked.</li>
	 * <li><b>cycled</b>: This mode evolves <i>switch</i>-mode, values and looks
	 * cycled on evry clicks, a value must have.</li>
	 * Default is: compat
	 */
	mode: 'compat',
	/**
	 * @cfg {Boolean} themedCompat True if use themes in compat mode (defaults
	 * to false).
	 */
	themedCompat: false,
	/**
	 * @cfg {String/Object} autoCreate A DomHelper element spec, or true for a
	 * default element spec (defaults to {tag: "input", type: "checkbox",
	 * autocomplete: "off"})
	 */
	defaultAutoCreate : { tag: "input", type: 'checkbox', autocomplete: "off"},
	/**
	 * @cfg {String} boxLabel The text that appears beside the checkbox.
	 */
	boxLabel: undefined,
	/**
	 * @cfg {String} inputValue The value that should go into the generated
	 * input element's value attribute.
	 */
	inputValue: undefined,
	/**
	 * @cfg {String} markEl Defines that what element used to marking invalid.
	 */
	markEl: 'wrap',
	/**
	 * @cfg {Boolean} mustCheck True if want to mark as invalid if checkbox
	 * unchecked (defaults to false). Only works in <i>compat</i>-{@link #mode}.
	 */
	mustCheck: false,
	/**
	 * @cfg {String} mustCheckText Specifies what message will be appear if
	 * checkbox marked as invalid.
	 */
	mustCheckText: 'This field is required',
	/**
	 * @cfg {Object} compatConfig This is a mode config describes what class
	 * to be use if <i>compat</i> checkbox enabled/disabled and checked/unchecked.
	 * <pre><code>compatConfig: {
	enabled: {
		'no': 'checkbox_off',
		'on': 'checkbox_on'
	},
	disabled: {
		'no': 'checkbox_off_dled',
		'on': 'checkbox_on_dled'
	},
	width: 23,
	height: 23
	}</code></pre>
	 * The keys <i>on</i> and <i>no</i> are fixed and must not changed - their
	 * value pairs are changeable and must be valid CSS class names with a
	 * visible background image.
	 * <p><b>Important:</b> If you want to redefine a setting, you MUST redefine
	 * all settings in this section!</p>
	 * <p><b>DO NOT USE boolean true/false for keys or values!</b></p>
	 */
	compatConfig: {
		enabled: {
			'no': 'checkbox_off',
			'on': 'checkbox_on'
		},
		disabled: {
			'no': 'checkbox_off_dled',
			'on': 'checkbox_on_dled'
		},
		width: 14,
		height: 16
	},
	/**
	 * @cfg {Object} switchConfig This is a mode config describes what class
	 * to be use if <i>switch</i> checkbox enabled/disabled and checked/unchecked.
	 * <pre><code>switchConfig: {
	enabled: {
		'0': 'checkbox_off',
		'1': 'checkbox_on'
	},
	disabled: {
		'0': 'checkbox_off_dled',
		'1': 'checkbox_on_dled'
	},
	width: 23,
	height: 23
	}</code></pre>
	 * The keys - defaults to <i>0</i> and <i>1</i> - and their value pairs are
	 * changeable. Keys used to set checkbox value when checkbox checked/unchecked,
	 * values are valid CSS class names with a visible background image.
	 * <p><b>Important:</b> If you want to redefine a setting, you MUST redefine
	 * all settings in this section!</p>
	 * <p><b>DO NOT USE boolean true/false for keys or values!</b></p>
	 */
	switchConfig: {
		enabled: {
			'0': 'checkbox_off',
			'1': 'checkbox_on'
		},
		disabled: {
			'0': 'checkbox_off_dled',
			'1': 'checkbox_on_dled'
		},
		width: 14,
		height: 16
	},
	/**
	 * @cfg {Object} cycledConfig This is a mode config describes what class
	 * to be use if <i>cycled</i> checkbox enabled/disabled in any state.
	 * <pre><code>cycledConfig: {
	enabled: {
		'0': 'flag_blue',
		'1': 'flag_green',
		'2': 'flag_orange',
		'3': 'flag_pink',
		'4': 'flag_purple',
		'5': 'flag_red',
		'6': 'flag_yellow'
	},
	disabled: {
		'0': 'flag_grey',
		'1': 'flag_grey',
		'2': 'flag_grey',
		'3': 'flag_grey',
		'4': 'flag_grey',
		'5': 'flag_grey',
		'6': 'flag_grey'
	},
	width: 23,
	height: 16
	}</code></pre>
	 * The keys - defaults to <i>0</i> ... <i>6</i> - and their value pairs are
	 * changeable. Keys used to set checkbox value when checkbox is in a specific
	 * state of its cycle, values are valid CSS class names with a visible
	 * background image.
	 * <p><b>Important:</b> If you want to redefine a setting, you MUST redefine
	 * all settings in this section!</p>
	 * <p><b>DO NOT USE boolean true/false for keys or values!</b></p>
	 */
	cycledConfig: {
		enabled: {
			'0': 'flag_blue',
			'1': 'flag_green',
			'2': 'flag_orange',
			'3': 'flag_pink',
			'4': 'flag_purple',
			'5': 'flag_red',
			'6': 'flag_yellow'
		},
		disabled: {
			'0': 'flag_grey',
			'1': 'flag_grey',
			'2': 'flag_grey',
			'3': 'flag_grey',
			'4': 'flag_grey',
			'5': 'flag_grey',
			'6': 'flag_grey'
		},
		width: 16,
		height: 16
	},
	// private - stores the first value of this checkbox
	originalValue: undefined,
	// private - stores active value all the time
	protectedValue: undefined,

	// private
	initComponent : function(){
		Ext.ux.form.BasicCheckbox.superclass.initComponent.call(this);
		this.addEvents(
			/**
			 * @event check
			 * Fires when the checkbox is checked or unchecked.
			 * @param {Ext.form.Checkbox} this This checkbox
			 * @param {Boolean} checked The new checked value
			 * @param {Mixed} value The new {@link #inputValue} value
			 */
			'check',
			/**
			 * @event click
			 * Fires when clicking on the checkbox.
			 * @param {Ext.form.Checkbox} this This checkbox
			 * @param {Boolean} checked The new checked value
			 * @param {Mixed} value The new {@link #inputValue} value
			 */
			'click'
		);
	},

	// private
	onResize : function()
	{
		Ext.ux.form.BasicCheckbox.superclass.onResize.apply(this, arguments);
		if (!this.boxLabel)
		{
			this.el.alignTo(this.wrap, 'c-c');
		}
	},

	// private
	initEvents : function()
	{
		Ext.ux.form.BasicCheckbox.superclass.initEvents.call(this);
		if (this.mode !== 'compat' || this.themedCompat)
		{
			this.mon(this.el, {
				click: this.onClick,
				change: this.onChange,
				mouseenter: this.onMouseEnter,
				mouseleave: this.onMouseLeave,
				mousedown: this.onMouseDown,
				mouseup: this.onMouseUp,
				scope: this
			});
		}
		else
		{
			this.mon(this.el, {
				click: this.onClick,
				change: this.onChange,
				scope: this
			});
		}
	},

	// private
	getResizeEl : function()
	{
		return this.wrap;
	},

	// private
	getPositionEl: function()
	{
		return this.wrap;
	},

	// private
	alignErrorIcon: function()
	{
		this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
	},

	/**
	 * Mark this field as invalid, using {@link #msgTarget} to determine how to
	 * display the error and applying {@link #invalidClass} to the field's
	 * element.
	 * @param {String} msg (optional) The validation message (defaults to
	 * {@link #invalidText})
	 */
	markInvalid: function(msg)
	{
		Ext.ux.form.BasicCheckbox.superclass.markInvalid.call(this, msg);
	},

	/**
	 * Clear any invalid styles/messages for this field.
	 */
	clearInvalid: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.clearInvalid.call(this);
	},

	// private
	validateValue: function(value)
	{
		var v = (this.rendered? this.el.dom.value : this.inputValue);
		var d = ((this.rendered? this.el.dom.disabled : this.disabled)? 'disabled' : 'enabled');
		if (this.mode === 'compat' && this.mustCheck && !value)
		{
			this.markInvalid(this.mustCheckText);
			return false;
		}
		if (this.mode !== 'compat')
		{
			if (v !== undefined && v !== null && this[this.mode+'Config'][d][v] === undefined)
			{
				this.markInvalid();
				return false;
			}
		}
		if (this.vtype)
		{
			var vt = Ext.form.VTypes;
			if (!vt[this.vtype](value, this))
			{
				this.markInvalid(this.vtypeText || vt[this.vtype +'Text']);
				return false;
			}
		}
		if (typeof this.validator === "function")
		{
			var msg = this.validator(value);
			if (msg !== true)
			{
				this.markInvalid(msg);
				return false;
			}
		}
		if (this.regex && !this.regex.test(value))
		{
			this.markInvalid(this.regexText);
			return false;
		}
		return true;
	},

	// private
	onRender : function(ct, position)
	{
		Ext.ux.form.BasicCheckbox.superclass.onRender.call(this, ct, position);
		var vw = this[this.mode+'Config'].width;
		var vh = this[this.mode+'Config'].height;

		this.protectedValue = this.inputValue;
		if (this.protectedValue !== undefined)
		{
			this.el.dom.value = this.protectedValue;
		}
		else
		{
			this.setNextValue(); // initialize first value set
		}

		if (this.mode !== 'compat' || this.themedCompat) {this.el.setOpacity(0);}
		this.innerWrap = this.el.wrap({cls: "x-sm-form-check-innerwrap"});
		this.innerWrap.setStyle({
			'position': 'relative',
			'display': 'inline'
		});
		this.wrap = this.innerWrap.wrap({cls: "x-form-check-wrap"});
		this.vel = this.innerWrap.createChild({tag: 'div', cls: 'x-sm-form-check'}, this.el.dom);
		if (this.mode !== 'compat' || this.themedCompat)
		{
			this.vel.setSize(vw, vh);
			this.el.setStyle({
				'position': 'absolute'
			});
			this.el.setTop(Math.round((vh-16)/2));
			this.el.setLeft(Math.round((vw-14)/2));
		}

		if (this.boxLabel)
		{
			this.wrap.createChild({tag: 'label', htmlFor: this.el.id, cls: 'x-form-cb-label', html: this.boxLabel});
		}

		if (this.mode === 'compat')
		{
			this.checked = (this.checked? true : (this.el.dom.checked? true : false));
			this.setValue(this.checked);
		}
		else
		{
			this.el.dom.checked = true;
			this.el.dom.defaultChecked = true;
			this.setValue(this.protectedValue);
		}
	},

	// private
	manageActiveClass: function()
	{
		if (this.rendered && (this.mode !== 'compat' || this.themedCompat))
		{
			var v = (this.mode === 'compat'? this.protectedValue : (this.rendered? this.el.dom.value : this.protectedValue));
			var d = ((this.rendered? this.el.dom.disabled : this.disabled)? 'disabled' : 'enabled');
			var c = this[this.mode+'Config'][d][v];
			var fval;
			var i;

			for (i in this[this.mode+'Config'][d])
			{
				fval = i;
				break;
			}

			if (c === undefined)
			{
				c = this[this.mode+'Config'][d][fval];
			}

			if (this.previousClass !== undefined)
			{
				this.vel.removeClass(this.previousClass);
			}
			this.previousClass = c; // store previously set classname.
			this.vel.addClass(c);
		}
	},

	// private
	setNextValue: function()
	{
		var v = (this.mode === 'compat'? this.protectedValue : (this.rendered? this.el.dom.value : this.protectedValue));
		var d = ((this.rendered? this.el.dom.disabled : this.disabled)? 'disabled' : 'enabled');
		var setNewValue = false;
		var fval = null;
		var i;

		this.protectedValue = null;
		for (i in this[this.mode+'Config'][d])
		{
			if (fval === null)  {fval = i;}
			if (v === undefined) {break;} // undefined sets first value
			if (setNewValue && this.protectedValue === null)
			{
				this.protectedValue = i;
			}
			if (i === v)
			{
				setNewValue = true;
			}
		}
		if (this.protectedValue === null) {this.protectedValue = fval;}

		if (this.mode !== 'compat')
		{
			this.inputValue = this.protectedValue;
		}
		if (this.rendered && this.inputValue !== undefined)
		{
			this.el.dom.value = this.inputValue;
		}
	},

	// private
	onDestroy : function(){
		if (this.wrap) {this.wrap.remove();}
		Ext.ux.form.BasicCheckbox.superclass.onDestroy.call(this);
	},

	// private
	initValue : function()
	{
		// reference to original value for reset
		this.originalValue = this.inputValue;
		if (this.mode === 'compat')
		{
			this.originalValue = this.checked;
		}
	},

	/**
	 * Returns the raw data value which may or may not be a valid, defined
	 * value. To return a normalized value see {@link #getValue}.
	 * @return {Mixed} value The field value
	 */
	getRawValue : function()
	{
		if (this.mode === 'compat')
		{
			if (this.rendered) {return this.el.dom.checked;}
			else {return this.checked;}
		}
		var v = this.rendered ? this.el.getValue() : Ext.value(this.value, '');
		return v;
	},

	/**
	 * In <i>compat</i>-{@link #mode} returns the checked state of the checkbox.
	 * In other modes returns the state`s value.
	 * @return {Boolean/Mixed} True if checked, else false, Mixed on non-compat
	 * modes.
	 */
	getValue : function()
	{
		var result = false;

		if (this.mode === 'compat') {if (this.rendered) {result = this.el.dom.checked;}}
		else {result = this.protectedValue;}

		return result;
	},

	// private
	onClick : function()
	{
		if (this.mode === 'compat')
		{
			if (this.el.dom.checked !== this.checked)
			{
				this.setNextValue();
				this.checked = this.el.dom.checked;
			}
		}
		else
		{
			this.setNextValue();
			this.el.dom.checked = true;
			this.el.dom.defaultChecked = true;
		}
		this.manageActiveClass();
		this.validate();
		this.fireEvent('check', this, this.checked, this.inputValue);
		this.fireEvent('click', this, this.checked, this.inputValue);
	},

	// private
	onChange : function()
	{
		if (this.mode === 'compat')
		{
			if (this.el.dom.checked !== this.checked)
			{
				this.setNextValue();
				this.checked = this.el.dom.checked;
			}
		}
		else
		{
			this.inputValue = this.el.dom.value;
			this.protectedValue = this.inputValue;
			this.el.dom.checked = true;
			this.el.dom.defaultChecked = true;
		}
		this.manageActiveClass();
		this.validate();
		this.fireEvent('check', this, this.checked, this.inputValue);
		this.fireEvent('change', this, this.checked, this.inputValue);
	},

	/**
	 * Sets the checked state of the checkbox.
	 * @param {Boolean/Mixed} value In <i>compat</i>-{@link #mode}, boolean
	 * true, 'true', '1', or 'on' to check the checkbox, any other value will
	 * uncheck it. In other modes, boolean values ignored, valid modevalues
	 * sets checkbox input value and changing state, invalid values sets to
	 * first valid value.
	 * @return {Ext.form.Field} this
	 */
	setValue : function(value)
	{
		var i;
		if (this.mode === 'compat')
		{
			this.checked = (value === true || value === 'true' || value === '1' || String(value).toLowerCase() === 'on');
			if (this.rendered)
			{
				this.el.dom.checked = this.checked;
				this.el.dom.defaultChecked = this.checked;
			}
			this.protectedValue = (this.checked? 'on' : 'no');
		}
		else
		{
			var d = ((this.rendered? this.el.dom.disabled : this.disabled)? 'disabled' : 'enabled');
			this.checked = true;
			if (this[this.mode+'Config'][d][value] !== undefined)
			{
				this.protectedValue = value;
			}
			else
			{
				for (i in this[this.mode+'Config'][d])
				{
					this.protectedValue = i;
					break;
				}
			}
			this.inputValue = this.protectedValue;
			if (this.rendered && this.inputValue !== undefined)
			{
				this.el.dom.value = this.inputValue;
			}
		}
		this.manageActiveClass();
		this.validate();
		this.fireEvent("check", this, this.checked);
		return this;
	},

	disable: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.disable.call(this);
		this.manageActiveClass();
	},

	enable: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.enable.call(this);
		this.manageActiveClass();
	},

	onMouseEnter: function()
	{
		this.wrap.addClass('x-sm-form-check-over');
	},

	onMouseLeave: function()
	{
		this.wrap.removeClass('x-sm-form-check-over');
	},

	onMouseDown: function()
	{
		this.wrap.addClass('x-sm-form-check-down');
	},

	onMouseUp: function()
	{
		this.wrap.removeClass('x-sm-form-check-down');
	},

	onFocus: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.onFocus.call(this);
		this.wrap.addClass('x-sm-form-check-focus');
	},

	onBlur: function()
	{
		Ext.ux.form.BasicCheckbox.superclass.onBlur.call(this);
		this.wrap.removeClass('x-sm-form-check-focus');
	}
});

/**
 * 
 * A ConsultationPanel correspond to the complete page for querying request results.
 * 
 * @class Ext.ux.form.BasicCheckbox
 * @extends Ext.form.Field
 * @constructor Create a new BasicCheckbox
 * @param {Object} config The config object
 * @xtype checkbox
 */
Ext.form.Checkbox = Ext.ux.form.BasicCheckbox;
Ext.reg('checkbox', Ext.form.Checkbox);

/**
 * 
 * A ConsultationPanel correspond to the complete page for querying request results.
 * 
 * @class Ext.ux.form.Checkbox
 * @extends Ext.ux.form.BasicCheckbox
 * @constructor Create a new Checkbox
 * @param {Object} config The config object
 * @xtype switch_checkbox
 */
Ext.ux.form.Checkbox = Ext.extend(Ext.ux.form.BasicCheckbox, {
	mode: 'switch'
});
Ext.reg('switch_checkbox', Ext.ux.form.Checkbox);

/**
 * 
 * A ConsultationPanel correspond to the complete page for querying request results.
 * 
 * @class Ext.ux.form.CycleCheckbox
 * @extends Ext.ux.form.BasicCheckbox
 * @constructor Create a new CycleCheckbox
 * @param {Object} config The config object
 * @xtype cycle_checkbox
 */
Ext.ux.form.CycleCheckbox = Ext.extend(Ext.ux.form.BasicCheckbox, {
	mode: 'cycled'
});
Ext.reg('cycle_checkbox', Ext.ux.form.CycleCheckbox);

// This is where I say, credit to Condor for implement his replacement!

Ext.override(Ext.form.Field, {
	markEl: 'el',
	markInvalid: function(msg){
		if(!this.rendered || this.preventMark){
			return;
		}
		msg = msg || this.invalidText;
		var mt = this.getMessageHandler();
		if(mt){
			mt.mark(this, msg);
		}else if(this.msgTarget){
			this[this.markEl].addClass(this.invalidClass);
			var t = Ext.getDom(this.msgTarget);
			if(t){
				t.innerHTML = msg;
				t.style.display = this.msgDisplay;
			}
		}
		this.fireEvent('invalid', this, msg);
	},
	clearInvalid : function(){
		if(!this.rendered || this.preventMark){
			return;
		}
		var mt = this.getMessageHandler();
		if(mt){
			mt.clear(this);
		}else if(this.msgTarget){
			this[this.markEl].removeClass(this.invalidClass);
			var t = Ext.getDom(this.msgTarget);
			if(t){
				t.innerHTML = '';
				t.style.display = 'none';
			}
		}
		this.fireEvent('valid', this);
	}
});
Ext.apply(Ext.form.MessageTargets, {
	'qtip': {
		mark: function(field, msg){
			var markEl = field[(field.markEl? field.markEl : 'el')];
			markEl.addClass(field.invalidClass);
			markEl.dom.qtip = msg;
			markEl.dom.qclass = 'x-form-invalid-tip';
			if(Ext.QuickTips){
				Ext.QuickTips.enable();
			}
		},
		clear: function(field){
			var markEl = field[(field.markEl? field.markEl : 'el')];
			markEl.removeClass(field.invalidClass);
			markEl.dom.qtip = '';
		}
	},
	'title': {
		mark: function(field, msg){
			var markEl = field[(field.markEl? field.markEl : 'el')];
			markEl.addClass(field.invalidClass);
			markEl.dom.title = msg;
		},
		clear: function(field){
			field[field.markEl].dom.title = '';
		}
	},
	'under': {
		mark: function(field, msg){
			var markEl = field[(field.markEl? field.markEl : 'el')], errorEl = field.errorEl;
			markEl.addClass(field.invalidClass);
			if(!errorEl){
				var elp = field.getErrorCt();
				if(!elp){
					markEl.dom.title = msg;
					return;
				}
				errorEl = field.errorEl = elp.createChild({cls:'x-form-invalid-msg'});
				errorEl.setWidth(elp.getWidth(true) - 20);
			}
			errorEl.update(msg);
			Ext.form.Field.msgFx[field.msgFx].show(errorEl, field);
		},
		clear: function(field){
			var markEl = field[(field.markEl? field.markEl : 'el')], errorEl = field.errorEl;
			markEl.removeClass(field.invalidClass);
			if(errorEl){
				Ext.form.Field.msgFx[field.msgFx].hide(errorEl, field);
			}else{
				markEl.dom.title = '';
			}
		}
	},
	'side': {
		mark: function(field, msg){
			var markEl = field[(field.markEl? field.markEl : 'el')], errorIcon = field.errorIcon;
			markEl.addClass(field.invalidClass);
			if(!errorIcon){
				var elp = field.getErrorCt();
				if(!elp){
					markEl.dom.title = msg;
					return;
				}
				errorIcon = field.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});
			}
			field.alignErrorIcon();
			errorIcon.dom.qtip = msg;
			errorIcon.dom.qclass = 'x-form-invalid-tip';
			errorIcon.show();
			field.on('resize', field.alignErrorIcon, field);
		},
		clear: function(field){
			var markEl = field[(field.markEl? field.markEl : 'el')], errorIcon = field.errorIcon;
			markEl.removeClass(field.invalidClass);
			if(errorIcon){
				errorIcon.dom.qtip = '';
				errorIcon.hide();
				field.un('resize', field.alignErrorIcon, field);
			}else{
				markEl.dom.title = '';
			}
		}
	}
});//************************************************************************************
// Date class
//************************************************************************************
(function() {

 // create private copy of Ext's String.format() method
 // - to remove unnecessary dependency
 // - to resolve namespace conflict with M$-Ajax's implementation
 function xf(format) {
     var args = Array.prototype.slice.call(arguments, 1);
     return format.replace(/\{(\d+)\}/g, function(m, i) {
         return args[i];
     });
 }

var $f = Date.formatCodeToRegex;

// private
Date.createParser = function() {
    var code = [
        "var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,",
            "def = Date.defaults,",
            "results = String(input).match(Date.parseRegexes[{0}]);", // either null, or an array of matched strings

        "if(results){",
            "{1}",

            "if(u != null){", // i.e. unix time is defined
                "v = new Date(u * 1000);", // give top priority to UNIX time
            "}else{",
                // create Date object representing midnight of the current day;
                // this will provide us with our date defaults
                // (note: clearTime() handles Daylight Saving Time automatically)
                "dt = (new Date()).clearTime();",

                // date calculations (note: these calculations create a dependency on Ext.num())
                "y = y >= 0? y : Ext.num(def.y, dt.getFullYear());",
                "m = m >= 0? m : Ext.num(def.m - 1, dt.getMonth());",
                "d = d || Ext.num(def.d, dt.getDate());",

                // time calculations (note: these calculations create a dependency on Ext.num())
                "h  = h || Ext.num(def.h, dt.getHours());",
                "i  = i || Ext.num(def.i, dt.getMinutes());",
                "s  = s || Ext.num(def.s, dt.getSeconds());",
                "ms = ms || Ext.num(def.ms, dt.getMilliseconds());",

                "if(z >= 0 && y >= 0){",
                    // both the year and zero-based day of year are defined and >= 0.
                    // these 2 values alone provide sufficient info to create a full date object

                    // create Date object representing January 1st for the given year
                    "v = new Date(y, 0, 1, h, i, s, ms);",
                    

                    // then add day of year, checking for Date "rollover" if necessary
                    "v = !strict? v : (strict === true && (z <= 364 || (v.isLeapYear() && z <= 365))? v.add(Date.DAY, z) : null);",
                "}else if(strict === true && !Date.isValid(y, m + 1, d, h, i, s, ms)){", // check for Date "rollover"
                    "v = null;", // invalid date, so return null
                "}else{",
                    // plain old Date object
                    "v = new Date(y, m, d, h, i, s, ms);",
                "}",
            "}",
        "}",
        
        "if(v){",
        //**************************************************
        //The only one line added to have the possibility to set the year under 100.
            "v.setFullYear(y);",
        //**************************************************
        // favour UTC offset over GMT offset
            "if(zz != null){",
                // reset to UTC, then add offset
                "v = v.add(Date.SECOND, -v.getTimezoneOffset() * 60 - zz);",
            "}else if(o){",
                // reset to GMT, then add offset
                "v = v.add(Date.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));",
            "}",
        "}",

        "return v;"
    ].join('\n');

    return function(format) {
        var regexNum = Date.parseRegexes.length,
            currentGroup = 1,
            calc = [],
            regex = [],
            special = false,
            ch = "",
            i;

        for (i = 0; i < format.length; ++i) {
            ch = format.charAt(i);
            if (!special && ch === "\\") {
                special = true;
            } else if (special) {
                special = false;
                regex.push(String.escape(ch));
            } else {
                var obj = $f(ch, currentGroup);
                currentGroup += obj.g;
                regex.push(obj.s);
                if (obj.g && obj.c) {
                    calc.push(obj.c);
                }
            }
        }

        Date.parseRegexes[regexNum] = new RegExp("^" + regex.join('') + "$", "i");
        Date.parseFunctions[format] = new Function("input", "strict", xf(code, regexNum, calc.join('')));
    };
}();
//**************************************************
//Format for example the year 2 to 0002
Date.formatCodes['f'] = "String.leftPad(this.getFullYear(), 4, '0')";
Date.parseCodes['f'] = Date.parseCodes['Y'];
//**************************************************
}());

//************************************************************************************
// DatePicker class
//************************************************************************************
//private
Ext.DatePicker.prototype.onMonthClick = function(e, t){
    e.stopEvent();
    var el = new Ext.Element(t), pn;
    if(el.is('button.x-date-mp-cancel')){
        this.hideMonthPicker();
    }
    else if(el.is('button.x-date-mp-ok')){
        var d = new Date(this.mpSelYear, this.mpSelMonth, (this.activeDate || this.value).getDate());
        if(d.getMonth() !== this.mpSelMonth){
            // "fix" the JS rolling date conversion if needed
            d = new Date(this.mpSelYear, this.mpSelMonth, 1).getLastDateOfMonth();
        }
        //*****************************************************
        d.setFullYear(this.mpSelYear);
        //*****************************************************
        this.update(d);
        this.hideMonthPicker();
    }
    else if(pn = el.up('td.x-date-mp-month', 2)){
        this.mpMonths.removeClass('x-date-mp-sel');
        pn.addClass('x-date-mp-sel');
        this.mpSelMonth = pn.dom.xmonth;
    }
    else if(pn = el.up('td.x-date-mp-year', 2)){
        this.mpYears.removeClass('x-date-mp-sel');
        pn.addClass('x-date-mp-sel');
        this.mpSelYear = pn.dom.xyear;
    }
    else if(el.is('a.x-date-mp-prev')){
        this.updateMPYear(this.mpyear-10);
    }
    else if(el.is('a.x-date-mp-next')){
        this.updateMPYear(this.mpyear+10);
    }
};

// private
Ext.DatePicker.prototype.onMonthDblClick = function(e, t){
    e.stopEvent();
    var el = new Ext.Element(t), pn;
    //*****************************************************
    var date = null;
    //*****************************************************
    if(pn = el.up('td.x-date-mp-month', 2)){
        //*****************************************************
        date = new Date(this.mpSelYear, pn.dom.xmonth, (this.activeDate || this.value).getDate());
        date.setFullYear(this.mpSelYear);
        this.update(date);
        //*****************************************************
        this.hideMonthPicker();
    }
    else if(pn = el.up('td.x-date-mp-year', 2)){
        //*****************************************************
        date = new Date(pn.dom.xyear, this.mpSelMonth, (this.activeDate || this.value).getDate());
        date.setFullYear(pn.dom.xyear);
        this.update(date);
        //*****************************************************
        this.hideMonthPicker();
    }
};
// private
Ext.DatePicker.prototype.update = function(date, forceRefresh){
    if(this.rendered){
        var vd = this.activeDate, vis = this.isVisible();
        this.activeDate = date;
        if(!forceRefresh && vd && this.el){
            var t = date.getTime();
            if(vd.getMonth() === date.getMonth() && vd.getFullYear() === date.getFullYear()){
                this.cells.removeClass('x-date-selected');
                this.cells.each(function(c){
                   if(c.dom.firstChild.dateValue === t){
                       c.addClass('x-date-selected');
                       if(vis && !this.cancelFocus){
                           Ext.fly(c.dom.firstChild).focus(50);
                       }
                       return false;
                   }
                }, this);
                return;
            }
        }
        var days = date.getDaysInMonth(),
            firstOfMonth = date.getFirstDateOfMonth(),
            startingPos = firstOfMonth.getDay()-this.startDay;

        if(startingPos < 0){
            startingPos += 7;
        }
        days += startingPos;

        var pm = date.add('mo', -1),
            prevStart = pm.getDaysInMonth()-startingPos,
            cells = this.cells.elements,
            textEls = this.textNodes,
            // convert everything to numbers so it's fast
            day = 86400000,
            d = (new Date(pm.getFullYear(), pm.getMonth(), prevStart)).clearTime(),
            today = new Date().clearTime().getTime(),
            sel = date.clearTime(true).getTime(),
            min = this.minDate ? this.minDate.clearTime(true) : Number.NEGATIVE_INFINITY,
            max = this.maxDate ? this.maxDate.clearTime(true) : Number.POSITIVE_INFINITY,
            ddMatch = this.disabledDatesRE,
            ddText = this.disabledDatesText,
            ddays = this.disabledDays ? this.disabledDays.join('') : false,
            ddaysText = this.disabledDaysText,
            format = this.format;

            //*****************************************************
            d.setFullYear(pm.getFullYear());
            //*****************************************************

        if(this.showToday){
            var td = new Date().clearTime(),
                disable = (td < min || td > max ||
                (ddMatch && format && ddMatch.test(td.dateFormat(format))) ||
                (ddays && ddays.indexOf(td.getDay()) !== -1));

            if(!this.disabled){
                this.todayBtn.setDisabled(disable);
                this.todayKeyListener[disable ? 'disable' : 'enable']();
            }
        }

        var setCellClass = function(cal, cell){
            cell.title = '';
            var t = d.getTime();
            cell.firstChild.dateValue = t;
            if(t === today){
                cell.className += ' x-date-today';
                cell.title = cal.todayText;
            }
            if(t === sel){
                cell.className += ' x-date-selected';
                if(vis){
                    Ext.fly(cell.firstChild).focus(50);
                }
            }
            // disabling
            if(t < min) {
                cell.className = ' x-date-disabled';
                cell.title = cal.minText;
                return;
            }
            if(t > max) {
                cell.className = ' x-date-disabled';
                cell.title = cal.maxText;
                return;
            }
            if(ddays){
                if(ddays.indexOf(d.getDay()) !== -1){
                    cell.title = ddaysText;
                    cell.className = ' x-date-disabled';
                }
            }
            if(ddMatch && format){
                var fvalue = d.dateFormat(format);
                if(ddMatch.test(fvalue)){
                    cell.title = ddText.replace('%0', fvalue);
                    cell.className = ' x-date-disabled';
                }
            }
        };

        var i = 0;
        for(; i < startingPos; i++) {
            textEls[i].innerHTML = (++prevStart);
            d.setDate(d.getDate()+1);
            cells[i].className = 'x-date-prevday';
            setCellClass(this, cells[i]);
        }
        for(; i < days; i++){
            var intDay = i - startingPos + 1;
            textEls[i].innerHTML = (intDay);
            d.setDate(d.getDate()+1);
            cells[i].className = 'x-date-active';
            setCellClass(this, cells[i]);
        }
        var extraDays = 0;
        for(; i < 42; i++) {
             textEls[i].innerHTML = (++extraDays);
             d.setDate(d.getDate()+1);
             cells[i].className = 'x-date-nextday';
             setCellClass(this, cells[i]);
        }

        this.mbtn.setText(this.monthNames[date.getMonth()] + ' ' + date.getFullYear());

        if(!this.internalRender){
            var main = this.el.dom.firstChild,
                w = main.offsetWidth;
            this.el.setWidth(w + this.el.getBorderWidth('lr'));
            Ext.fly(main).setWidth(w);
            this.internalRender = true;
            // opera does not respect the auto grow header center column
            // then, after it gets a width opera refuses to recalculate
            // without a second pass
            if(Ext.isOpera && !this.secondPass){
                main.rows[0].cells[1].style.width = (w - (main.rows[0].cells[0].offsetWidth+main.rows[0].cells[2].offsetWidth)) + 'px';
                this.secondPass = true;
                this.update.defer(10, this, [date]);
            }
        }
    }
};/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
Ext.namespace('Ext.ux.grid');

/**
 * @class Ext.ux.grid.RowExpander
 * @extends Ext.util.Observable
 * Plugin (ptype = 'rowexpander') that adds the ability to have a Column in a grid which enables
 * a second row body which expands/contracts.  The expand/contract behavior is configurable to react
 * on clicking of the column, double click of the row, and/or hitting enter while a row is selected.
 *
 * @ptype rowexpander
 */
Ext.ux.grid.RowExpander = Ext.extend(Ext.util.Observable, {
    /**
     * @cfg {Boolean} expandOnEnter
     * <tt>true</tt> to toggle selected row(s) between expanded/collapsed when the enter
     * key is pressed (defaults to <tt>true</tt>).
     */
    expandOnEnter : true,
    /**
     * @cfg {Boolean} expandOnDblClick
     * <tt>true</tt> to toggle a row between expanded/collapsed when double clicked
     * (defaults to <tt>true</tt>).
     */
    expandOnDblClick : true,
    /**
     * @cfg {Boolean} expandOnClick
     * <tt>true</tt> to toggle a row between expanded/collapsed when double clicked
     * (defaults to <tt>true</tt>).
     */
    expandOnClick : true,
    /**
     * @cfg {HtmlElement} lastExpandedRow
     * The last expanded row. Used in the accordion mode.
     */
    lastExpandedRow : null,
    /**
     * @cfg {Boolean} accordionMode
     * <tt>true</tt> to collapse the previous clicked row when a row is expanded
     * (defaults to <tt>true</tt>).
     */
    accordionMode : true,

    header : '',
    width : 20,
    sortable : false,
    fixed : true,
    hideable: false,
    menuDisabled : true,
    dataIndex : '',
    id : 'expander',
    lazyRender : true,
    enableCaching : true,

    constructor: function(config){
        Ext.apply(this, config);

        this.addEvents({
            /**
             * @event beforeexpand
             * Fires before the row expands. Have the listener return false to prevent the row from expanding.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} body body element for the secondary row.
             * @param {Number} rowIndex The current row index.
             */
            beforeexpand: true,
            /**
             * @event expand
             * Fires after the row expands.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} body body element for the secondary row.
             * @param {Number} rowIndex The current row index.
             */
            expand: true,
            /**
             * @event beforecollapse
             * Fires before the row collapses. Have the listener return false to prevent the row from collapsing.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} body body element for the secondary row.
             * @param {Number} rowIndex The current row index.
             */
            beforecollapse: true,
            /**
             * @event collapse
             * Fires after the row collapses.
             * @param {Object} this RowExpander object.
             * @param {Object} Ext.data.Record Record for the selected row.
             * @param {Object} body body element for the secondary row.
             * @param {Number} rowIndex The current row index.
             */
            collapse: true
        });

        Ext.ux.grid.RowExpander.superclass.constructor.call(this);

        if(this.tpl){
            if(typeof this.tpl === 'string'){
                this.tpl = new Ext.Template(this.tpl);
            }
            this.tpl.compile();
        }

        this.state = {};
        this.bodyContent = {};
    },

    getRowClass : function(record, rowIndex, p, ds){
        p.cols = p.cols-1;
        var content = this.bodyContent[record.id];
        if(!content && !this.lazyRender){
            content = this.getBodyContent(record, rowIndex);
        }
        if(content){
            p.body = content;
        }
        return this.state[record.id] ? 'x-grid3-row-expanded' : 'x-grid3-row-collapsed';
    },

    init : function(grid){
        this.grid = grid;

        var view = grid.getView();
        view.getRowClass = this.getRowClass.createDelegate(this);

        view.enableRowBody = true;


        grid.on('render', this.onRender, this);
        grid.on('destroy', this.onDestroy, this);
    },

    // @private
    onRender: function() {
        var grid = this.grid;
        var mainBody = grid.getView().mainBody;
        mainBody.on('mousedown', this.onMouseDown, this, {delegate: '.x-grid3-row-expander'});
        if (this.expandOnEnter) {
            this.keyNav = new Ext.KeyNav(this.grid.getGridEl(), {
                'enter' : this.onEnter,
                scope: this
            });
        }
        if (this.expandOnClick) {
            grid.on('rowclick', this.onRowClick, this);
        }
        if (this.expandOnDblClick) {
            grid.on('rowdblclick', this.onRowDblClick, this);
        }
    },
    
    // @private    
    onDestroy: function() {
        if(this.keyNav){
            this.keyNav.disable();
            delete this.keyNav;
        }
        /*
         * A majority of the time, the plugin will be destroyed along with the grid,
         * which means the mainBody won't be available. On the off chance that the plugin
         * isn't destroyed with the grid, take care of removing the listener.
         */
        var mainBody = this.grid.getView().mainBody;
        if(mainBody){
            mainBody.un('mousedown', this.onMouseDown, this);
        }
    },
    // @private
    onRowDblClick: function(grid, rowIdx, e) {
        this.toggleRow(rowIdx);
    },
    // @private
    onRowClick: function(grid, rowIdx, e) {
        this.expandRow(rowIdx);
    },

    onEnter: function(e) {
        var g = this.grid,
            sm = g.getSelectionModel(),
            sels = sm.getSelections(),
            i,
            len;
        for (i = 0, len = sels.length; i < len; i++) {
            var rowIdx = g.getStore().indexOf(sels[i]);
            this.toggleRow(rowIdx);
        }
    },

    getBodyContent : function(record, index){
        if(!this.enableCaching){
            return this.tpl.apply(record.data);
        }
        var content = this.bodyContent[record.id];
        if(!content){
            content = this.tpl.apply(record.data);
            this.bodyContent[record.id] = content;
        }
        return content;
    },

    onMouseDown : function(e, t){
        e.stopEvent();
        var row = e.getTarget('.x-grid3-row');
        this.toggleRow(row);
    },

    renderer : function(v, p, record){
        p.cellAttr = 'rowspan="2"';
        return '<div class="x-grid3-row-expander">&#160;</div>';
    },

    beforeExpand : function(record, body, rowIndex){
        if(this.fireEvent('beforeexpand', this, record, body, rowIndex) !== false){
            if(this.tpl && this.lazyRender){
                body.innerHTML = this.getBodyContent(record, rowIndex);
            }
            return true;
        }else{
            return false;
        }
    },

    toggleRow : function(row){
        if(typeof row === 'number'){
            row = this.grid.view.getRow(row);
        }
        this[Ext.fly(row).hasClass('x-grid3-row-collapsed') ? 'expandRow' : 'collapseRow'](row);
    },

    expandRow : function(row){
        if(typeof row === 'number'){
            row = this.grid.view.getRow(row);
        }
        var record = this.grid.store.getAt(row.rowIndex);
        var body = Ext.DomQuery.selectNode('tr:nth(2) div.x-grid3-row-body', row);
        if(this.beforeExpand(record, body, row.rowIndex)){
            if (this.accordionMode === true){
                if (this.lastExpandedRow !== null) {
                    this.collapseRow(this.lastExpandedRow);
                }
                this.lastExpandedRow = row;
            }
            this.state[record.id] = true;
            Ext.fly(row).replaceClass('x-grid3-row-collapsed', 'x-grid3-row-expanded');
            this.fireEvent('expand', this, record, body, row.rowIndex);
        }
    },

    collapseRow : function(row){
        if(typeof row === 'number'){
            row = this.grid.view.getRow(row);
        }
        var record = this.grid.store.getAt(row.rowIndex);
        var body = Ext.fly(row).child('tr:nth(1) div.x-grid3-row-body', true);
        if(this.fireEvent('beforecollapse', this, record, body, row.rowIndex) !== false){
            this.state[record.id] = false;
            Ext.fly(row).replaceClass('x-grid3-row-expanded', 'x-grid3-row-collapsed');
            this.fireEvent('collapse', this, record, body, row.rowIndex);
        }
    }
});

Ext.preg('rowexpander', Ext.ux.grid.RowExpander);

//backwards compat
Ext.grid.RowExpander = Ext.ux.grid.RowExpander;Ext.namespace('Ext.ux.form');
/**
 * <p>
 * SuperBoxSelect is an extension of the ComboBox component that displays
 * selected items as labelled boxes within the form field. As seen on facebook,
 * hotmail and other sites.
 * </p>
 * 
 * @author <a href="mailto:dan.humphrey@technomedia.co.uk">Dan Humphrey</a>
 * @class Ext.ux.form.SuperBoxSelect
 * @extends Ext.form.ComboBox
 * @constructor
 * @component
 * @version 1.0
 * @license TBA (To be announced)
 * 
 */
Ext.ux.form.SuperBoxSelect = function(config) {
    Ext.ux.form.SuperBoxSelect.superclass.constructor.call(this,config);
    this.addEvents(
        /**
		 * Fires before an item is added to the component via user interaction.
		 * Return false from the callback function to prevent the item from
		 * being added.
		 * 
		 * @event beforeadditem
		 * @memberOf Ext.ux.form.SuperBoxSelect
		 * @param {SuperBoxSelect}
		 *            this
		 * @param {Mixed}
		 *            value The value of the item to be added
		 * @param {Record}
		 *            rec The record being added
		 * @param {Mixed}
		 *            filtered Any filtered query data (if using queryFilterRe)
		 */
        'beforeadditem',

        /**
		 * Fires after a new item is added to the component.
		 * 
		 * @event additem
		 * @memberOf Ext.ux.form.SuperBoxSelect
		 * @param {SuperBoxSelect}
		 *            this
		 * @param {Mixed}
		 *            value The value of the item which was added
		 * @param {Record}
		 *            record The store record which was added
		 */
        'additem',

        /**
		 * Fires when the allowAddNewData config is set to true, and a user
		 * attempts to add an item that is not in the data store.
		 * 
		 * @event newitem
		 * @memberOf Ext.ux.form.SuperBoxSelect
		 * @param {SuperBoxSelect}
		 *            this
		 * @param {Mixed}
		 *            value The new item's value
		 * @param {Mixed}
		 *            filtered Any filtered query data (if using queryFilterRe)
		 */
        'newitem',

        /**
		 * Fires when an item's remove button is clicked. Return false from the
		 * callback function to prevent the item from being removed.
		 * 
		 * @event beforeremoveitem
		 * @memberOf Ext.ux.form.SuperBoxSelect
		 * @param {SuperBoxSelect}
		 *            this
		 * @param {Mixed}
		 *            value The value of the item to be removed
		 */
        'beforeremoveitem',

        /**
		 * Fires after an item has been removed.
		 * 
		 * @event removeitem
		 * @memberOf Ext.ux.form.SuperBoxSelect
		 * @param {SuperBoxSelect}
		 *            this
		 * @param {Mixed}
		 *            value The value of the item which was removed
		 * @param {Record}
		 *            record The store record which was removed
		 */
        'removeitem',
        /**
		 * Fires after the component values have been cleared.
		 * 
		 * @event clear
		 * @memberOf Ext.ux.form.SuperBoxSelect
		 * @param {SuperBoxSelect}
		 *            this
		 */
        'clear'
    );
    
};
/**
 * @private hide from doc gen
 */
Ext.ux.form.SuperBoxSelect = Ext.extend(Ext.ux.form.SuperBoxSelect,Ext.form.ComboBox,{
    /**
	 * @cfg {Boolean} addNewDataOnBlur Allows adding new items when the user
	 *      tabs from the input element.
	 */
    addNewDataOnBlur : false,
    /**
	 * @cfg {Boolean} allowAddNewData When set to true, allows items to be added
	 *      (via the setValueEx and addItem methods) that do not already exist
	 *      in the data store. Defaults to false.
	 */
    allowAddNewData: false,
    /**
	 * @cfg {Boolean} allowQueryAll When set to false, prevents the trigger
	 *      arrow from rendering, and the DOWN key from triggering a query all.
	 *      Defaults to true.
	 */
    allowQueryAll : true,
    /**
	 * @cfg {Boolean} backspaceDeletesLastItem When set to false, the BACKSPACE
	 *      key will focus the last selected item. When set to true, the last
	 *      item will be immediately deleted. Defaults to true.
	 */
    backspaceDeletesLastItem: true,
    /**
	 * @cfg {String} classField The underlying data field that will be used to
	 *      supply an additional class to each item.
	 */
    classField: null,

    /**
	 * @cfg {String} clearBtnCls An additional class to add to the in-field
	 *      clear button.
	 */
    clearBtnCls: '',
    /**
	 * @cfg {Boolean} clearLastQueryOnEscape When set to true, the escape key
	 *      will clear the lastQuery, enabling the previous query to be
	 *      repeated.
	 */
    clearLastQueryOnEscape : false,
    /**
	 * @cfg {Boolean} clearOnEscape When set to true, the escape key will clear
	 *      the input text when the component is not expanded.
	 */
    clearOnEscape : false,
    
    /**
	 * @cfg {String/XTemplate} displayFieldTpl A template for rendering the
	 *      displayField in each selected item. Defaults to null.
	 */
    displayFieldTpl: null,

    /**
	 * @cfg {String} extraItemCls An additional css class to apply to each item.
	 */
    extraItemCls: '',

    /**
	 * @cfg {String/Object/Function} extraItemStyle Additional css style(s) to
	 *      apply to each item. Should be a valid argument to
	 *      Ext.Element.applyStyles.
	 */
    extraItemStyle: '',

    /**
	 * @cfg {String} expandBtnCls An additional class to add to the in-field
	 *      expand button.
	 */
    expandBtnCls: '',

    /**
	 * @cfg {Boolean} fixFocusOnTabSelect When set to true, the component will
	 *      not lose focus when a list item is selected with the TAB key.
	 *      Defaults to true.
	 */
    fixFocusOnTabSelect: true,
    /**
	 * @cfg {Boolean} forceFormValue When set to true, the component will always
	 *      return a value to the parent form getValues method, and when the
	 *      parent form is submitted manually. Defaults to false, meaning the
	 *      component will only be included in the parent form submission (or
	 *      getValues) if at least 1 item has been selected.
	 */
    forceFormValue: true,
    /**
	 * @cfg {Boolean} forceSameValueQuery When set to true, the component will
	 *      always query the server even when the last query was the same.
	 *      Defaults to false.
	 */
    forceSameValueQuery : false,
    /**
	 * @cfg {Number} itemDelimiterKey A key code which terminates keying in of
	 *      individual items, and adds the current item to the list. Defaults to
	 *      the ENTER key.
	 */
    itemDelimiterKey: Ext.EventObject.ENTER,    
    /**
	 * @cfg {Boolean} navigateItemsWithTab When set to true the tab key will
	 *      navigate between selected items. Defaults to true.
	 */
    navigateItemsWithTab: true,
    /**
	 * @cfg {Boolean} pinList When set to true and the list is opened via the
	 *      arrow button, the select list will be pinned to allow for multiple
	 *      selections. Defaults to true.
	 */
    pinList: true,

    /**
	 * @cfg {Boolean} preventDuplicates When set to true unique item values will
	 *      be enforced. Defaults to true.
	 */
    preventDuplicates: true,
    /**
	 * @cfg {String|Regex} queryFilterRe Used to filter input values before
	 *      querying the server, specifically useful when allowAddNewData is
	 *      true as the filtered portion of the query will be passed to the
	 *      newItem callback.
	 */
    queryFilterRe: '',
    /**
	 * @cfg {String} queryValuesDelimiter Used to delimit multiple values
	 *      queried from the server when mode is remote.
	 */
    queryValuesDelimiter: '|',
    
    /**
	 * @cfg {String} queryValuesIndicator A request variable that is sent to the
	 *      server (as true) to indicate that we are querying values rather than
	 *      display data (as used in autocomplete) when mode is remote.
	 */
    queryValuesIndicator: 'valuesqry',

    /**
	 * @cfg {Boolean} removeValuesFromStore When set to true, selected records
	 *      will be removed from the store. Defaults to true.
	 */
    removeValuesFromStore: true,

    /**
	 * @cfg {String} renderFieldBtns When set to true, will render in-field
	 *      buttons for clearing the component, and displaying the list for
	 *      selection. Defaults to true.
	 */
    renderFieldBtns: true,
    
    /**
	 * @cfg {Boolean} stackItems When set to true, the items will be stacked 1
	 *      per line. Defaults to false which displays the items inline.
	 */
    stackItems: false,

    /**
	 * @cfg {String} styleField The underlying data field that will be used to
	 *      supply additional css styles to each item.
	 */
    styleField : null,
    
     /**
		 * @cfg {Boolean} supressClearValueRemoveEvents When true, the
		 *      removeitem event will not be fired for each item when the
		 *      clearValue method is called, or when the clear button is used.
		 *      Defaults to false.
		 */
    supressClearValueRemoveEvents : false,
    
    /**
	 * @cfg {String/Boolean} validationEvent The event that should initiate
	 *      field validation. Set to false to disable automatic validation
	 *      (defaults to 'blur').
	 */
	validationEvent : 'blur',
	
	/**
	 * @cfg {Boolean} Hide the Clear all button
	 */
	hideClearButton : false,
	
    /**
	 * @cfg {String} valueDelimiter The delimiter to use when joining and
	 *      splitting value arrays and strings.
	 */
    valueDelimiter: ',',
    initComponent:function() {
       Ext.apply(this, {
            items            : new Ext.util.MixedCollection(false),
            usedRecords      : new Ext.util.MixedCollection(false),
            addedRecords	 : [],
            remoteLookup	 : [],
            hideTrigger      : true,
            grow             : false,
            resizable        : false,
            multiSelectMode  : false,
            preRenderValue   : null,
            filteredQueryData: ''
            
        });
        if(this.queryFilterRe){
            if(Ext.isString(this.queryFilterRe)){
                this.queryFilterRe = new RegExp(this.queryFilterRe);
            }
        }
        if(this.transform){
            this.doTransform();
        }
        if(this.forceFormValue){
        	this.items.on({
        	   add: this.manageNameAttribute,
        	   remove: this.manageNameAttribute,
        	   clear: this.manageNameAttribute,
        	   scope: this
        	});
        }
        
        Ext.ux.form.SuperBoxSelect.superclass.initComponent.call(this);
        if(this.mode === 'remote' && this.store){
        	this.store.on('load', this.onStoreLoad, this);
        }
    },
    onRender:function(ct, position) {
    	var h = this.hiddenName;
    	this.hiddenName = null;
        Ext.ux.form.SuperBoxSelect.superclass.onRender.call(this, ct, position);
        this.hiddenName = h;
        this.manageNameAttribute();
       
        var extraClass = (this.stackItems === true) ? 'x-superboxselect-stacked' : '';
        if(this.renderFieldBtns){
            extraClass += ' x-superboxselect-display-btns';
        }
        this.el.removeClass('x-form-text').addClass('x-superboxselect-input-field');
        
        this.wrapEl = this.el.wrap({
            tag : 'ul'
        });
        
        this.outerWrapEl = this.wrapEl.wrap({
            tag : 'div',
            cls: 'x-form-text x-superboxselect ' + extraClass
        });
       
        this.inputEl = this.el.wrap({
            tag : 'li',
            cls : 'x-superboxselect-input'
        });
        
        if(this.renderFieldBtns){
            this.setupFieldButtons().manageClearBtn();
        }
        
        this.setupFormInterception();
    },
    doTransform : function() {
    	var s = Ext.getDom(this.transform), transformValues = [];
            if(!this.store){
                this.mode = 'local';
                var d = [], opts = s.options;
                for(var i = 0, len = opts.length;i < len; i++){
                    var o = opts[i], oe = Ext.get(o),
                        value = oe.getAttributeNS(null,'value') || '',
                        cls = oe.getAttributeNS(null,'className') || '',
                        style = oe.getAttributeNS(null,'style') || '';
                    if(o.selected) {
                        transformValues.push(value);
                    }
                    d.push([value, o.text, cls, typeof(style) === "string" ? style : style.cssText]);
                }
                this.store = new Ext.data.SimpleStore({
                    'id': 0,
                    fields: ['value', 'text', 'cls', 'style'],
                    data : d
                });
                Ext.apply(this,{
                    valueField: 'value',
                    displayField: 'text',
                    classField: 'cls',
                    styleField: 'style'
                });
            }
           
            if(transformValues.length){
                this.value = transformValues.join(',');
            }
    },
    setupFieldButtons : function(){
        this.buttonWrap = this.outerWrapEl.createChild({
            cls: 'x-superboxselect-btns'
        });
        
        if (!this.hideClearButton) {
        this.buttonClear = this.buttonWrap.createChild({
            tag:'div',
            cls: 'x-superboxselect-btn-clear ' + this.clearBtnCls
        });
    	}
        
        if(this.allowQueryAll){
            this.buttonExpand = this.buttonWrap.createChild({
                tag:'div',
                cls: 'x-superboxselect-btn-expand ' + this.expandBtnCls
            });
        }
        
        this.initButtonEvents();
        
        return this;
    },
    initButtonEvents : function() {
    	  if (!this.hideClearButton) {
        this.buttonClear.addClassOnOver('x-superboxselect-btn-over').on('click', function(e) {
            e.stopEvent();
            if (this.disabled) {
                return;
            }
            this.clearValue();
            this.el.focus();
        }, this);
    	}
        
        if(this.allowQueryAll){
            this.buttonExpand.addClassOnOver('x-superboxselect-btn-over').on('click', function(e) {
                e.stopEvent();
                if (this.disabled) {
                    return;
                }
                if (this.isExpanded()) {
                    this.multiSelectMode = false;
                } else if (this.pinList) {
                    this.multiSelectMode = true;
                }
                this.onTriggerClick();
            }, this);
        }
    },
    removeButtonEvents : function() {
    	  if (!this.hideClearButton) {
        this.buttonClear.removeAllListeners();
    	  }
        if(this.allowQueryAll){
            this.buttonExpand.removeAllListeners();
        }
        return this;
    },
    clearCurrentFocus : function(){
        if(this.currentFocus){
            this.currentFocus.onLnkBlur();
            this.currentFocus = null;
        }  
        return this;        
    },
    initEvents : function() {
        var el = this.el;
        el.on({
            click   : this.onClick,
            focus   : this.clearCurrentFocus,
            blur    : this.onBlur,
            keydown : this.onKeyDownHandler,
            keyup   : this.onKeyUpBuffered,
            scope   : this
        });

        this.on({
            collapse: this.onCollapse,
            expand: this.clearCurrentFocus,
            scope: this
        });

        this.wrapEl.on('click', this.onWrapClick, this);
        this.outerWrapEl.on('click', this.onWrapClick, this);
        
        this.inputEl.focus = function() {
            el.focus();
        };

        Ext.ux.form.SuperBoxSelect.superclass.initEvents.call(this);

        Ext.apply(this.keyNav, {
            tab: function(e) {
                if (this.fixFocusOnTabSelect && this.isExpanded()) {
                    e.stopEvent();
                    el.blur();
                    this.onViewClick(false);
                    this.focus(false, 10);
                    return true;
                }

                this.onViewClick(false);
                if (el.dom.value !== '') {
                    this.setRawValue('');
                }

                return true;
            },

            down: function(e) {
                if (!this.isExpanded() && !this.currentFocus) {
                    if(this.allowQueryAll){
                        this.onTriggerClick();
                    }
                } else {
                    this.inKeyMode = true;
                    this.selectNext();
                }
            },

            enter: function(){}
        });
    },

    onClick: function() {
        this.clearCurrentFocus();
        this.collapse();
        this.autoSize();
    },

    beforeBlur: function(){
        if(this.allowAddNewData && this.addNewDataOnBlur){
            var v = this.el.dom.value;
            if(v !== ''){
                this.fireNewItemEvent(v);
            }
        }
        Ext.form.ComboBox.superclass.beforeBlur.call(this);
    },

    onFocus: function() {
        this.outerWrapEl.addClass(this.focusClass);

        Ext.ux.form.SuperBoxSelect.superclass.onFocus.call(this);
    },

    onBlur: function() {
        this.outerWrapEl.removeClass(this.focusClass);

        this.clearCurrentFocus();

        if (this.el.dom.value !== '') {
            this.applyEmptyText();
            this.autoSize();
        }

        Ext.ux.form.SuperBoxSelect.superclass.onBlur.call(this);
    },

    onCollapse: function() {
    	this.view.clearSelections();
        this.multiSelectMode = false;
    },

    onWrapClick: function(e) {
        e.stopEvent();
        this.collapse();
        this.el.focus();
        this.clearCurrentFocus();
    },
    markInvalid : function(msg) {
        var elp, t;

        if (!this.rendered || this.preventMark ) {
            return;
        }
        this.outerWrapEl.addClass(this.invalidClass);
        msg = msg || this.invalidText;

        switch (this.msgTarget) {
            case 'qtip':
                Ext.apply(this.el.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                Ext.apply(this.wrapEl.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                if (Ext.QuickTips) { // fix for floating editors interacting
										// with DND
                    Ext.QuickTips.enable();
                }
                break;
            case 'title':
                this.el.dom.title = msg;
                this.wrapEl.dom.title = msg;
                this.outerWrapEl.dom.title = msg;
                break;
            case 'under':
                if (!this.errorEl) {
                    elp = this.getErrorCt();
                    if (!elp) { // field has no container el
                        this.el.dom.title = msg;
                        break;
                    }
                    this.errorEl = elp.createChild({cls:'x-form-invalid-msg'});
                    this.errorEl.setWidth(elp.getWidth(true) - 20);
                }
                this.errorEl.update(msg);
                Ext.form.Field.msgFx[this.msgFx].show(this.errorEl, this);
                break;
            case 'side':
                if (!this.errorIcon) {
                    elp = this.getErrorCt();
                    if (!elp) { // field has no container el
                        this.el.dom.title = msg;
                        break;
                    }
                    this.errorIcon = elp.createChild({cls:'x-form-invalid-icon'});
                }
                this.alignErrorIcon();
                Ext.apply(this.errorIcon.dom, {
                    qtip    : msg,
                    qclass  : 'x-form-invalid-tip'
                });
                this.errorIcon.show();
                this.on('resize', this.alignErrorIcon, this);
                break;
            default:
                t = Ext.getDom(this.msgTarget);
                t.innerHTML = msg;
                t.style.display = this.msgDisplay;
                break;
        }
        this.fireEvent('invalid', this, msg);
    },
    clearInvalid : function(){
        if(!this.rendered || this.preventMark){ // not rendered
            return;
        }
        this.outerWrapEl.removeClass(this.invalidClass);
        switch(this.msgTarget){
            case 'qtip':
                this.el.dom.qtip = '';
                this.wrapEl.dom.qtip ='';
                break;
            case 'title':
                this.el.dom.title = '';
                this.wrapEl.dom.title = '';
                this.outerWrapEl.dom.title = '';
                break;
            case 'under':
                if(this.errorEl){
                    Ext.form.Field.msgFx[this.msgFx].hide(this.errorEl, this);
                }
                break;
            case 'side':
                if(this.errorIcon){
                    this.errorIcon.dom.qtip = '';
                    this.errorIcon.hide();
                    this.un('resize', this.alignErrorIcon, this);
                }
                break;
            default:
                var t = Ext.getDom(this.msgTarget);
                t.innerHTML = '';
                t.style.display = 'none';
                break;
        }
        this.fireEvent('valid', this);
    },
    alignErrorIcon : function(){
        if(this.wrap){
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [Ext.isIE ? 5 : 2, 3]);
        }
    },
    expand : function(){
        if (this.isExpanded() || !this.hasFocus) {
            return;
        }
        if(this.bufferSize){
            this.doResize(this.bufferSize);
            delete this.bufferSize;
        }
        this.list.alignTo(this.outerWrapEl, this.listAlign).show();
        this.innerList.setOverflow('auto'); // necessary for FF 2.0/Mac
        this.mon(Ext.getDoc(), {
            scope: this,
            mousewheel: this.collapseIf,
            mousedown: this.collapseIf
        });
        this.fireEvent('expand', this);
    },
    restrictHeight : function(){
        var inner = this.innerList.dom,
            st = inner.scrollTop, 
            list = this.list;
        
        inner.style.height = '';
        
        var pad = list.getFrameWidth('tb')+(this.resizable?this.handleHeight:0)+this.assetHeight,
            h = Math.max(inner.clientHeight, inner.offsetHeight, inner.scrollHeight),
            ha = this.getPosition()[1]-Ext.getBody().getScroll().top,
            hb = Ext.lib.Dom.getViewHeight()-ha-this.getSize().height,
            space = Math.max(ha, hb, this.minHeight || 0)-list.shadowOffset-pad-5;
        
        h = Math.min(h, space, this.maxHeight);
        this.innerList.setHeight(h);

        list.beginUpdate();
        list.setHeight(h+pad);
        list.alignTo(this.outerWrapEl, this.listAlign);
        list.endUpdate();
        
        if(this.multiSelectMode){
            inner.scrollTop = st;
        }
    },
    validateValue: function(val){
        if(this.items.getCount() === 0){
             if(this.allowBlank){
                 this.clearInvalid();
                 return true;
             }else{
                 this.markInvalid(this.blankText);
                 return false;
             }
        }
        this.clearInvalid();
        return true;
    },
    manageNameAttribute :  function(){
    	if(this.items.getCount() === 0 && this.forceFormValue){
    	   this.el.dom.setAttribute('name', this.hiddenName || this.name);
    	}else{
    		this.el.dom.removeAttribute('name');
    	}
    },
    setupFormInterception : function(){
        var form;
        this.findParentBy(function(p){ 
            if(p.getForm){
                form = p.getForm();
            }
        });
        if(form){
        	var formGet = form.getValues;
            form.getValues = function(asString){
                this.el.dom.disabled = true;
                var oldVal = this.el.dom.value;
                this.setRawValue('');
                var vals = formGet.call(form);
                this.el.dom.disabled = false;
                this.setRawValue(oldVal);
                if(this.forceFormValue && this.items.getCount() === 0){
                	vals[this.name] = '';
                }
                return asString ? Ext.urlEncode(vals) : vals ;
            }.createDelegate(this);
        }
    },
    onResize : function(w, h, rw, rh) {
        var reduce = Ext.isIE6 ? 4 : Ext.isIE7 ? 1 : Ext.isIE8 ? 1 : 0;
        if(this.wrapEl){
            this._width = w;
            this.outerWrapEl.setWidth(w - reduce);
            if (this.renderFieldBtns) {
                reduce += (this.buttonWrap.getWidth() + 5);
                this.wrapEl.setWidth(w - reduce);
        	}
        }
        Ext.ux.form.SuperBoxSelect.superclass.onResize.call(this, w, h, rw, rh);
        this.autoSize();
    },
    onEnable: function(){
        Ext.ux.form.SuperBoxSelect.superclass.onEnable.call(this);
        this.items.each(function(item){
            item.enable();
        });
        if (this.renderFieldBtns) {
            this.initButtonEvents();
        }
    },
    onDisable: function(){
        Ext.ux.form.SuperBoxSelect.superclass.onDisable.call(this);
        this.items.each(function(item){
            item.disable();
        });
        if(this.renderFieldBtns){
            this.removeButtonEvents();
        }
    },
    /**
	 * Clears all values from the component.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name clearValue
	 * @param {Boolean}
	 *            supressRemoveEvent [Optional] When true, the 'removeitem'
	 *            event will not fire for each item that is removed.
	 */
    clearValue : function(supressRemoveEvent){
        Ext.ux.form.SuperBoxSelect.superclass.clearValue.call(this);
        this.preventMultipleRemoveEvents = supressRemoveEvent || this.supressClearValueRemoveEvents || false;
    	this.removeAllItems();
    	this.preventMultipleRemoveEvents = false;
        this.fireEvent('clear',this);
        return this;
    },
    fireNewItemEvent : function(val){
        this.view.clearSelections();
        this.collapse();
        this.setRawValue('');
        if(this.queryFilterRe){
            val = val.replace(this.queryFilterRe, '');
            if(!val){
                return;
            }
        }
        this.fireEvent('newitem', this, val, this.filteredQueryData);  
    },
    onKeyUp : function(e) {
        if (this.editable !== false && (!e.isSpecialKey() || e.getKey() === e.BACKSPACE) && this.itemDelimiterKey.indexOf !== e.getKey()  && (!e.hasModifier() || e.shiftKey)) {
            this.lastKey = e.getKey();
            this.dqTask.delay(this.queryDelay);
        }        
    },
    onKeyDownHandler : function(e,t) {
    	    	
        var toDestroy,nextFocus,idx;
        
        if(e.getKey() === e.ESC){
            if(!this.isExpanded()){
                if(this.el.dom.value != '' && (this.clearOnEscape || this.clearLastQueryOnEscape)){
                    if(this.clearOnEscape){
                        this.el.dom.value = '';    
                    }
                    if(this.clearLastQueryOnEscape){
                        this.lastQuery = '';    
                    }
                    e.stopEvent();
                }
            }
        }
        if ((e.getKey() === e.DELETE || e.getKey() === e.SPACE) && this.currentFocus){
            e.stopEvent();
            toDestroy = this.currentFocus;
            this.on('expand',function(){this.collapse();},this,{single: true});
            idx = this.items.indexOfKey(this.currentFocus.key);
            this.clearCurrentFocus();
            
            if(idx < (this.items.getCount() -1)){
                nextFocus = this.items.itemAt(idx+1);
            }
            
            toDestroy.preDestroy(true);
            if(nextFocus){
                (function(){
                    nextFocus.onLnkFocus();
                    this.currentFocus = nextFocus;
                }).defer(200,this);
            }
        
            return true;
        }
        
        var val = this.el.dom.value, it, ctrl = e.ctrlKey;
        
        if(this.itemDelimiterKey === e.getKey()){
            e.stopEvent();
            if (val !== "") {
                if (ctrl || !this.isExpanded())  {  // ctrl+enter for new items
                	this.fireNewItemEvent(val);
                } else {
                	this.onViewClick();
                    // removed from 3.0.1
                    if(this.unsetDelayCheck){
                        this.delayedCheck = true;
                        this.unsetDelayCheck.defer(10, this);
                    }
                }
            }else{
                if(!this.isExpanded()){
                    return;
                }
                this.onViewClick();
                // removed from 3.0.1
                if(this.unsetDelayCheck){
                    this.delayedCheck = true;
                    this.unsetDelayCheck.defer(10, this);
                }
            }
            return true;
        }
        
        if(val !== '') {
            this.autoSize();
            return;
        }
        
        // select first item
        if(e.getKey() === e.HOME){
            e.stopEvent();
            if(this.items.getCount() > 0){
                this.collapse();
                it = this.items.get(0);
                it.el.focus();
                
            }
            return true;
        }
        // backspace remove
        if(e.getKey() === e.BACKSPACE){
            e.stopEvent();
            if(this.currentFocus) {
                toDestroy = this.currentFocus;
                this.on('expand',function(){
                    this.collapse();
                },this,{single: true});
                
                idx = this.items.indexOfKey(toDestroy.key);
                
                this.clearCurrentFocus();
                if(idx < (this.items.getCount() -1)){
                    nextFocus = this.items.itemAt(idx+1);
                }
                
                toDestroy.preDestroy(true);
                
                if(nextFocus){
                    (function(){
                        nextFocus.onLnkFocus();
                        this.currentFocus = nextFocus;
                    }).defer(200,this);
                }
                
                return;
            }else{
                it = this.items.get(this.items.getCount() -1);
                if(it){
                    if(this.backspaceDeletesLastItem){
                        this.on('expand',function(){this.collapse();},this,{single: true});
                        it.preDestroy(true);
                    }else{
                        if(this.navigateItemsWithTab){
                            it.onElClick();
                        }else{
                            this.on('expand',function(){
                                this.collapse();
                                this.currentFocus = it;
                                this.currentFocus.onLnkFocus.defer(20,this.currentFocus);
                            },this,{single: true});
                        }
                    }
                }
                return true;
            }
        }
        
        if(!e.isNavKeyPress()){
            this.multiSelectMode = false;
            this.clearCurrentFocus();
            return;
        }
        // arrow nav
        if(e.getKey() === e.LEFT || (e.getKey() === e.UP && !this.isExpanded())){
            e.stopEvent();
            this.collapse();
            // get last item
            it = this.items.get(this.items.getCount()-1);
            if(this.navigateItemsWithTab){ 
                // focus last el
                if(it){
                    it.focus(); 
                }
            }else{
                // focus prev item
                if(this.currentFocus){
                    idx = this.items.indexOfKey(this.currentFocus.key);
                    this.clearCurrentFocus();
                    
                    if(idx !== 0){
                        this.currentFocus = this.items.itemAt(idx-1);
                        this.currentFocus.onLnkFocus();
                    }
                }else{
                    this.currentFocus = it;
                    if(it){
                        it.onLnkFocus();
                    }
                }
            }
            return true;
        }
        if(e.getKey() === e.DOWN){
            if(this.currentFocus){
                this.collapse();
                e.stopEvent();
                idx = this.items.indexOfKey(this.currentFocus.key);
                if(idx == (this.items.getCount() -1)){
                    this.clearCurrentFocus.defer(10,this);
                }else{
                    this.clearCurrentFocus();
                    this.currentFocus = this.items.itemAt(idx+1);
                    if(this.currentFocus){
                        this.currentFocus.onLnkFocus();
                    }
                }
                return true;
            }
        }
        if(e.getKey() === e.RIGHT){
            this.collapse();
            it = this.items.itemAt(0);
            if(this.navigateItemsWithTab){ 
                // focus first el
                if(it){
                    it.focus(); 
                }
            }else{
                if(this.currentFocus){
                    idx = this.items.indexOfKey(this.currentFocus.key);
                    this.clearCurrentFocus();
                    if(idx < (this.items.getCount() -1)){
                        this.currentFocus = this.items.itemAt(idx+1);
                        if(this.currentFocus){
                            this.currentFocus.onLnkFocus();
                        }
                    }
                }else{
                    this.currentFocus = it;
                    if(it){
                        it.onLnkFocus();
                    }
                }
            }
        }
    },
    onKeyUpBuffered : function(e){
        if(!e.isNavKeyPress()){
            this.autoSize();
        }
    },
    reset :  function(){
    	this.killItems();
        Ext.ux.form.SuperBoxSelect.superclass.reset.call(this);
        this.addedRecords = [];
        this.autoSize().setRawValue('');
    },
    applyEmptyText : function(){
		this.setRawValue('');
        if(this.items.getCount() > 0){
            this.el.removeClass(this.emptyClass);
            this.setRawValue('');
            return this;
        }
        if(this.rendered && this.emptyText && this.getRawValue().length < 1){
            this.setRawValue(this.emptyText);
            this.el.addClass(this.emptyClass);
        }
        return this;
    },
    /**
	 * @private
	 * 
	 * Use clearValue instead
	 */
    removeAllItems: function(){
    	this.items.each(function(item){
            item.preDestroy(true);
        },this);
        this.manageClearBtn();
        return this;
    },
    killItems : function(){
    	this.items.each(function(item){
            item.kill();
        },this);
        this.resetStore();
        this.items.clear();
        this.manageClearBtn();
        return this;
    },
    resetStore: function(){
        this.store.clearFilter();
        if(!this.removeValuesFromStore){
            return this;
        }
        this.usedRecords.each(function(rec){
            this.store.add(rec);
        },this);
        this.usedRecords.clear();
        if(!this.store.remoteSort){
            this.store.sort(this.displayField, 'ASC');	
        }
        
        return this;
    },
    sortStore: function(){
        var ss = this.store.getSortState();
        if(ss && ss.field){
            this.store.sort(ss.field, ss.direction);
        }
        return this;
    },
    getCaption: function(dataObject){
        if(typeof this.displayFieldTpl === 'string') {
            this.displayFieldTpl = new Ext.XTemplate(this.displayFieldTpl);
        }
        var caption, recordData = dataObject instanceof Ext.data.Record ? dataObject.data : dataObject;
      
        if(this.displayFieldTpl) {
            caption = this.displayFieldTpl.apply(recordData);
        } else if(this.displayField) {
            caption = recordData[this.displayField];
        }
        
        return caption;
    },
    addRecord : function(record) {
        var display = record.data[this.displayField],
            caption = this.getCaption(record),
            val = record.data[this.valueField],
            cls = this.classField ? record.data[this.classField] : '',
            style = this.styleField ? record.data[this.styleField] : '';

        if (this.removeValuesFromStore) {
            this.usedRecords.add(val, record);
            this.store.remove(record);
        }
        
        this.addItemBox(val, display, caption, cls, style);
        this.fireEvent('additem', this, val, record);
    },
    createRecord : function(recordData){
        if(!this.recordConstructor){
            var recordFields = [
                {name: this.valueField},
                {name: this.displayField}
            ];
            if(this.classField){
                recordFields.push({name: this.classField});
            }
            if(this.styleField){
                recordFields.push({name: this.styleField});
            }
            this.recordConstructor = Ext.data.Record.create(recordFields);
        }
        return new this.recordConstructor(recordData);
    },
    /**
	 * Adds an array of items to the SuperBoxSelect component if the
	 * {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to
	 * true.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name addItem
	 * @param {Array}
	 *            newItemObjects An Array of object literals containing the
	 *            property names and values for an item. The property names must
	 *            match those specified in
	 *            {@link #Ext.ux.form.SuperBoxSelect-displayField},
	 *            {@link #Ext.ux.form.SuperBoxSelect-valueField} and
	 *            {@link #Ext.ux.form.SuperBoxSelect-classField}
	 */
    addItems : function(newItemObjects){
    	if (Ext.isArray(newItemObjects)) {
			Ext.each(newItemObjects, function(item) {
				this.addItem(item);
			}, this);
		} else {
			this.addItem(newItemObjects);
		}
    },
    /**
	 * Adds a new non-existing item to the SuperBoxSelect component if the
	 * {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to
	 * true. This method should be used in place of addItem from within the
	 * newitem event handler.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name addNewItem
	 * @param {Object}
	 *            newItemObject An object literal containing the property names
	 *            and values for an item. The property names must match those
	 *            specified in {@link #Ext.ux.form.SuperBoxSelect-displayField},
	 *            {@link #Ext.ux.form.SuperBoxSelect-valueField} and
	 *            {@link #Ext.ux.form.SuperBoxSelect-classField}
	 */
    addNewItem : function(newItemObject){
    	this.addItem(newItemObject,true);
    },
    /**
	 * Adds an item to the SuperBoxSelect component if the
	 * {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to
	 * true.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name addItem
	 * @param {Object}
	 *            newItemObject An object literal containing the property names
	 *            and values for an item. The property names must match those
	 *            specified in {@link #Ext.ux.form.SuperBoxSelect-displayField},
	 *            {@link #Ext.ux.form.SuperBoxSelect-valueField} and
	 *            {@link #Ext.ux.form.SuperBoxSelect-classField}
	 */
    addItem : function(newItemObject, /* hidden param */ forcedAdd){
        
        var val = newItemObject[this.valueField];

        if(this.disabled) {
            return false;
        }
        if(this.preventDuplicates && this.hasValue(val)){
            return;
        }
        
        // use existing record if found
        var record = this.findRecord(this.valueField, val);
        if (record) {
            this.addRecord(record);
            return;
        } else if (!this.allowAddNewData) { // else it's a new item
            return;
        }
        
        if(this.mode === 'remote'){
        	this.remoteLookup.push(newItemObject); 
        	this.doQuery(val,false,false,forcedAdd);
        	return;
        }
        
        var rec = this.createRecord(newItemObject);
        this.store.add(rec);
        this.addRecord(rec);
        
        return true;
    },
    addItemBox : function(itemVal,itemDisplay,itemCaption, itemClass, itemStyle) {
        var hConfig, parseStyle = function(s){
            var ret = '';
            switch(typeof s){
                case 'function' :
                    ret = s.call();
                    break;
                case 'object' :
                    for(var p in s){
                        ret+= p +':'+s[p]+';';
                    }
                    break;
                case 'string' :
                    ret = s + ';';
            }
            return ret;
        }, itemKey = Ext.id(null,'sbx-item'), box = new Ext.ux.form.SuperBoxSelectItem({
            owner: this,
            disabled: this.disabled,
            renderTo: this.wrapEl,
            cls: this.extraItemCls + ' ' + itemClass,
            style: parseStyle(this.extraItemStyle) + ' ' + itemStyle,
            caption: itemCaption,
            display: itemDisplay,
            value:  itemVal,
            key: itemKey,
            listeners: {
                'remove': function(item){
                    if(this.fireEvent('beforeremoveitem',this,item.value) === false){
                        return false;
                    }
                    this.items.removeKey(item.key);
                    if(this.removeValuesFromStore){
                        if(this.usedRecords.containsKey(item.value)){
                            this.store.add(this.usedRecords.get(item.value));
                            this.usedRecords.removeKey(item.value);
                            this.sortStore();
                            if(this.view){
                                this.view.render();
                            }
                        }
                    }
                    if(!this.preventMultipleRemoveEvents){
                    	this.fireEvent.defer(250,this,['removeitem',this,item.value, this.findInStore(item.value)]);
                    }
                },
                destroy: function(){
                    this.collapse();
                    this.autoSize().manageClearBtn().validateValue();
                },
                scope: this
            }
        });
        box.render();
        
        hConfig = {
            tag :'input', 
            type :'hidden', 
            value : itemVal,
            name : (this.hiddenName || this.name)
        };
        
        if(this.disabled){
        	Ext.apply(hConfig,{
        	   disabled : 'disabled'
        	})
        }
        box.hidden = this.el.insertSibling(hConfig,'before');

        this.items.add(itemKey,box);
        this.applyEmptyText().autoSize().manageClearBtn().validateValue();
    },
    manageClearBtn : function() {
        if (!this.renderFieldBtns || !this.rendered) {
            return this;
        }
        if (!this.hideClearButton) {
        var cls = 'x-superboxselect-btn-hide';
        if (this.items.getCount() === 0) {
            this.buttonClear.addClass(cls);
        } else {
            this.buttonClear.removeClass(cls);
        }
        }
        return this;
    },
    findInStore : function(val){
        var index = this.store.find(this.valueField, val);
        if(index > -1){
            return this.store.getAt(index);
        }
        return false;
    },
    /**
	 * Returns an array of records associated with the selected items.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name getSelectedRecords
	 * @return {Array} An array of records associated with the selected items.
	 */
    getSelectedRecords : function(){
    	var  ret =[];
    	if(this.removeValuesFromStore){
    		ret = this.usedRecords.getRange();
    	}else{
    		var vals = [];
	        this.items.each(function(item){
	            vals.push(item.value);
	        });
	        Ext.each(vals,function(val){
	        	ret.push(this.findInStore(val));
	        },this);
    	}
    	return ret;
    },
    /**
	 * Returns an item which contains the passed HTML Element.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name findSelectedItem
	 * @param {HTMLElement}
	 *            el The LI HTMLElement of a selected item in the list
	 */
    findSelectedItem : function(el){
        var ret;
        this.items.each(function(item){
            if(item.el.dom === el){
                ret = item;
                return false;
            }
        });
        return ret;
    },
    /**
	 * Returns a record associated with the item which contains the passed HTML
	 * Element.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name findSelectedRecord
	 * @param {HTMLElement}
	 *            el The LI HTMLElement of a selected item in the list
	 */
    findSelectedRecord : function(el){
        var ret, item = this.findSelectedItem(el);
        if(item){
        	ret = this.findSelectedRecordByValue(item.value)
        }
        
        return ret;
    },
    /**
	 * Returns a selected record associated with the passed value.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name findSelectedRecordByValue
	 * @param {Mixed}
	 *            val The value to lookup
	 * @return {Record} The matching Record.
	 */
    findSelectedRecordByValue : function(val){
    	var ret;
    	if(this.removeValuesFromStore){
    		this.usedRecords.each(function(rec){
	            if(rec.get(this.valueField) == val){
	                ret = rec;
	                return false;
	            }
	        },this);		
    	}else{
    		ret = this.findInStore(val);
    	}
    	return ret;
    },
    /**
	 * Returns a String value containing a concatenated list of item values. The
	 * list is concatenated with the
	 * {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter}.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name getValue
	 * @return {String} a String value containing a concatenated list of item
	 *         values.
	 */
    getValue : function() {
        var ret = [];
        this.items.each(function(item){
            ret.push(item.value);
        });
        return ret.join(this.valueDelimiter);
    },
    /**
	 * Returns the count of the selected items.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name getCount
	 * @return {Number} the number of selected items.
	 */
    getCount : function() {
        return this.items.getCount();
    },
    /**
	 * Returns an Array of item objects containing the
	 * {@link #Ext.ux.form.SuperBoxSelect-displayField},
	 * {@link #Ext.ux.form.SuperBoxSelect-valueField},
	 * {@link #Ext.ux.form.SuperBoxSelect-classField} and
	 * {@link #Ext.ux.form.SuperBoxSelect-styleField} properties.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name getValueEx
	 * @return {Array} an array of item objects.
	 */
    getValueEx : function() {
        var ret = [];
        this.items.each(function(item){
            var newItem = {};
            newItem[this.valueField] = item.value;
            newItem[this.displayField] = item.display;
            if(this.classField){
                newItem[this.classField] = item.cls || '';
            }
            if(this.styleField){
                newItem[this.styleField] = item.style || '';
            }
            ret.push(newItem);
        },this);
        return ret;
    },
    // private
    initValue : function(){
        if(Ext.isObject(this.value) || Ext.isArray(this.value)){
            this.setValueEx(this.value);
            this.originalValue = this.getValue();
        }else{
            Ext.ux.form.SuperBoxSelect.superclass.initValue.call(this);
        }
        if(this.mode === 'remote') {
        	this.setOriginal = true;
        }
    },
    /**
	 * Adds an existing value to the SuperBoxSelect component.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name setValue
	 * @param {String|Array}
	 *            value An array of item values, or a String value containing a
	 *            delimited list of item values. (The list should be delimited
	 *            with the {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter) 
	 */
    addValue : function(value){
        
        if(Ext.isEmpty(value)){
            return;
        }
        
        var values = value;
        if(!Ext.isArray(value)){
            value = '' + value;
            values = value.split(this.valueDelimiter); 
        }
        
        Ext.each(values,function(val){
            var record = this.findRecord(this.valueField, val);
            if(record){
                this.addRecord(record);
            }else if(this.mode === 'remote'){
                this.remoteLookup.push(val);                
            }
        },this);
        
        if(this.mode === 'remote'){
            var q = this.remoteLookup.join(this.queryValuesDelimiter); 
            this.doQuery(q,false, true); // 3rd param to specify a values
											// query
        }
    },
    /**
	 * Sets the value of the SuperBoxSelect component.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name setValue
	 * @param {String|Array}
	 *            value An array of item values, or a String value containing a
	 *            delimited list of item values. (The list should be delimited
	 *            with the {@link #Ext.ux.form.SuperBoxSelect-valueDelimiter) 
	 */
    setValue : function(value){
        if(!this.rendered){
            this.value = value;
            return;
        }
        this.removeAllItems().resetStore();
        this.remoteLookup = [];
        this.addValue(value);
                
    },
    /**
	 * Sets the value of the SuperBoxSelect component, adding new items that
	 * don't exist in the data store if the
	 * {@link #Ext.ux.form.SuperBoxSelect-allowAddNewData} config is set to
	 * true.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name setValue
	 * @param {Array}
	 *            data An Array of item objects containing the
	 *            {@link #Ext.ux.form.SuperBoxSelect-displayField},
	 *            {@link #Ext.ux.form.SuperBoxSelect-valueField} and
	 *            {@link #Ext.ux.form.SuperBoxSelect-classField} properties.
	 */
    setValueEx : function(data){
        if(!this.rendered){
            this.value = data;
            return;
        }
        this.removeAllItems().resetStore();
        
        if(!Ext.isArray(data)){
            data = [data];
        }
        this.remoteLookup = [];
        
        if(this.allowAddNewData && this.mode === 'remote'){ // no need to query
            Ext.each(data, function(d){
            	var r = this.findRecord(this.valueField, d[this.valueField]) || this.createRecord(d);
                this.addRecord(r);
            },this);
            return;
        }
        
        Ext.each(data,function(item){
            this.addItem(item);
        },this);
    },
    /**
	 * Returns true if the SuperBoxSelect component has a selected item with a
	 * value matching the 'val' parameter.
	 * 
	 * @methodOf Ext.ux.form.SuperBoxSelect
	 * @name hasValue
	 * @param {Mixed}
	 *            val The value to test.
	 * @return {Boolean} true if the component has the selected value, false
	 *         otherwise.
	 */
    hasValue: function(val){
        var has = false;
        this.items.each(function(item){
            if(item.value == val){
                has = true;
                return false;
            }
        },this);
        return has;
    },
    onSelect : function(record, index) {
    	if (this.fireEvent('beforeselect', this, record, index) !== false){
            var val = record.data[this.valueField];
            
            if(this.preventDuplicates && this.hasValue(val)){
                return;
            }
            
            this.setRawValue('');
            this.lastSelectionText = '';
            
            if(this.fireEvent('beforeadditem',this,val,record,this.filteredQueryData) !== false){
                this.addRecord(record);
            }
            if(this.store.getCount() === 0 || !this.multiSelectMode){
                this.collapse();
            }else{
                this.restrictHeight();
            }
    	}
    },
    onDestroy : function() {
        this.items.purgeListeners();
        this.killItems();
        if(this.allowQueryAll){
            Ext.destroy(this.buttonExpand);
        }
        if (this.renderFieldBtns) {
            Ext.destroy(
                this.buttonClear,
                this.buttonWrap
            );
        }

        Ext.destroy(
            this.inputEl,
            this.wrapEl,
            this.outerWrapEl
        );

        Ext.ux.form.SuperBoxSelect.superclass.onDestroy.call(this);
    },
    autoSize : function(){
        if(!this.rendered){
            return this;
        }
        if(!this.metrics){
            this.metrics = Ext.util.TextMetrics.createInstance(this.el);
        }
        var el = this.el,
            v = el.dom.value,
            d = document.createElement('div');

        if(v === "" && this.emptyText && this.items.getCount() < 1){
            v = this.emptyText;
        }
        d.appendChild(document.createTextNode(v));
        v = d.innerHTML;
        d = null;
        v += "&#160;";
        var w = Math.max(this.metrics.getWidth(v) +  24, 24);
        if(typeof this._width != 'undefined'){
            w = Math.min(this._width, w);
        }
        this.el.setWidth(w);
        
        if(Ext.isIE){
            this.el.dom.style.top='0';
        }
        this.fireEvent('autosize', this, w);
        return this;
    },
    shouldQuery : function(q){
        if(this.lastQuery){
            var m = q.match("^"+this.lastQuery);
            if(!m || this.store.getCount()){
                return true;
            }else{
                return (m[0] !== this.lastQuery);
            }
        }
        return true; 
    },
    doQuery : function(q, forceAll,valuesQuery, forcedAdd){
        q = Ext.isEmpty(q) ? '' : q;
        if(this.queryFilterRe){
            this.filteredQueryData = '';
            var m = q.match(this.queryFilterRe);
            if(m && m.length){
                this.filteredQueryData = m[0];
            }
            q = q.replace(this.queryFilterRe, '');
            if(!q && m){
                return;
            }
        }
        var qe = {
            query: q,
            forceAll: forceAll,
            combo: this,
            cancel:false
        };
        if(this.fireEvent('beforequery', qe)===false || qe.cancel){
            return false;
        }
        q = qe.query;
        forceAll = qe.forceAll;
        if(forceAll === true || (q.length >= this.minChars) || valuesQuery && !Ext.isEmpty(q)){
            if(forcedAdd || this.forceSameValueQuery || this.shouldQuery(q) ){
            	this.lastQuery = q;
                if(this.mode == 'local'){
                    this.selectedIndex = -1;
                    if(forceAll){
                        this.store.clearFilter();
                    }else{
                        this.store.filter(this.displayField, q);
                    }
                    this.onLoad();
                }else{
                	
                    this.store.baseParams[this.queryParam] = q;
                    this.store.baseParams[this.queryValuesIndicator] = valuesQuery;
                    this.store.load({
                        params: this.getParams(q)
                    });
                    if(!forcedAdd){
                        this.expand();
                    }
                }
            }else{
                this.selectedIndex = -1;
                this.onLoad();
            }
        }
    },
    onStoreLoad : function(store, records, options){
        // accomodating for bug in Ext 3.0.0 where options.params are empty
        var q = options.params[this.queryParam] || store.baseParams[this.queryParam] || "",
            isValuesQuery = options.params[this.queryValuesIndicator] || store.baseParams[this.queryValuesIndicator];
        
        if(this.removeValuesFromStore){
            this.store.each(function(record) {
                if(this.usedRecords.containsKey(record.get(this.valueField))){
                    this.store.remove(record);
                }
            }, this);
        }
        // queried values
        if(isValuesQuery){
           
            var params = q.split(this.queryValuesDelimiter);
            Ext.each(params,function(p){
                this.remoteLookup.remove(p);
                 var rec = this.findRecord(this.valueField,p);
                 if(rec){
                    this.addRecord(rec);
                 }
            },this);
            
            if(this.setOriginal){
                this.setOriginal = false;
                this.originalValue = this.getValue();
            }
        }

        // queried display (autocomplete) & addItem
        if(q !== '' && this.allowAddNewData){
            Ext.each(this.remoteLookup,function(r){
                if(typeof r === "object" && r[this.valueField] === q){
                    this.remoteLookup.remove(r);
                    if(records.length && records[0].get(this.valueField) === q) {
                        this.addRecord(records[0]);
                        return;
                    }
                    var rec = this.createRecord(r);
                    this.store.add(rec);
                    this.addRecord(rec);
                    this.addedRecords.push(rec); // keep track of records
													// added to store
                    (function(){
                        if(this.isExpanded()){
                            this.collapse();
                        }
                    }).defer(10,this);
                    return;
                }
            },this);
        }
        
        var toAdd = [];
        if(q === ''){
            Ext.each(this.addedRecords,function(rec){
                if(this.preventDuplicates && this.usedRecords.containsKey(rec.get(this.valueField))){
                    return;                 
                }
                toAdd.push(rec);
                
            },this);
            
        }else{
            var re = new RegExp(Ext.escapeRe(q) + '.*','i');
            Ext.each(this.addedRecords,function(rec){
                if(this.preventDuplicates && this.usedRecords.containsKey(rec.get(this.valueField))){
                    return;                 
                }
                if(re.test(rec.get(this.displayField))){
                    toAdd.push(rec);
                }
            },this);
        }
        this.store.add(toAdd);
        this.sortStore();
        
        if(this.store.getCount() === 0 && this.isExpanded()){
            this.collapse();
        }
        
    }
});
Ext.reg('superboxselect', Ext.ux.form.SuperBoxSelect);
/*
 * @private
 */
Ext.ux.form.SuperBoxSelectItem = function(config){
    Ext.apply(this,config);
    Ext.ux.form.SuperBoxSelectItem.superclass.constructor.call(this); 
};
/*
 * @private
 */
Ext.ux.form.SuperBoxSelectItem = Ext.extend(Ext.ux.form.SuperBoxSelectItem,Ext.Component, {
    initComponent : function(){
        Ext.ux.form.SuperBoxSelectItem.superclass.initComponent.call(this); 
    },
    onElClick : function(e){
        var o = this.owner;
        o.clearCurrentFocus().collapse();
        if(o.navigateItemsWithTab){
            this.focus();
        }else{
            o.el.dom.focus();
            var that = this;
            (function(){
                this.onLnkFocus();
                o.currentFocus = this;
            }).defer(10,this);
        }
    },
    
    onLnkClick : function(e){
        if(e) {
            e.stopEvent();
        }
        this.preDestroy();
        if(!this.owner.navigateItemsWithTab){
            this.owner.el.focus();
        }
    },
    onLnkFocus : function(){
        this.el.addClass("x-superboxselect-item-focus");
        this.owner.outerWrapEl.addClass("x-form-focus");
    },
    
    onLnkBlur : function(){
        this.el.removeClass("x-superboxselect-item-focus");
        this.owner.outerWrapEl.removeClass("x-form-focus");
    },
    
    enableElListeners : function() {
        this.el.on('click', this.onElClick, this, {stopEvent:true});
       
        this.el.addClassOnOver('x-superboxselect-item x-superboxselect-item-hover');
    },

    enableLnkListeners : function() {
        this.lnk.on({
            click: this.onLnkClick,
            focus: this.onLnkFocus,
            blur:  this.onLnkBlur,
            scope: this
        });
    },
    
    enableAllListeners : function() {
        this.enableElListeners();
        this.enableLnkListeners();
    },
    disableAllListeners : function() {
        this.el.removeAllListeners();
        this.lnk.un('click', this.onLnkClick, this);
        this.lnk.un('focus', this.onLnkFocus, this);
        this.lnk.un('blur', this.onLnkBlur, this);
    },
    onRender : function(ct, position){
        
        Ext.ux.form.SuperBoxSelectItem.superclass.onRender.call(this, ct, position);
        
        var el = this.el;
        if(el){
            el.remove();
        }
        
        this.el = el = ct.createChild({ tag: 'li' }, ct.last());
        el.addClass('x-superboxselect-item');
        
        var btnEl = this.owner.navigateItemsWithTab ? ( Ext.isSafari ? 'button' : 'a') : 'span';
        var itemKey = this.key;
        
        Ext.apply(el, {
            focus: function(){
                var c = this.down(btnEl +'.x-superboxselect-item-close');
                if(c){
                	c.focus();
                }
            },
            preDestroy: function(){
                this.preDestroy();
            }.createDelegate(this)
        });
        
        this.enableElListeners();

        el.update(this.caption);

        var cfg = {
            tag: btnEl,
            'class': 'x-superboxselect-item-close',
            tabIndex : this.owner.navigateItemsWithTab ? '0' : '-1'
        };
        if(btnEl === 'a'){
            cfg.href = '#';
        }
        this.lnk = el.createChild(cfg);
        
        
        if(!this.disabled) {
            this.enableLnkListeners();
        }else {
            this.disableAllListeners();
        }
        
        this.on({
            disable: this.disableAllListeners,
            enable: this.enableAllListeners,
            scope: this
        });

        this.setupKeyMap();
    },
    setupKeyMap : function(){
        this.keyMap = new Ext.KeyMap(this.lnk, [
            {
                key: [
                    Ext.EventObject.BACKSPACE, 
                    Ext.EventObject.DELETE, 
                    Ext.EventObject.SPACE
                ],
                fn: this.preDestroy,
                scope: this
            }, {
                key: [
                    Ext.EventObject.RIGHT,
                    Ext.EventObject.DOWN
                ],
                fn: function(){
                    this.moveFocus('right');
                },
                scope: this
            },
            {
                key: [Ext.EventObject.LEFT,Ext.EventObject.UP],
                fn: function(){
                    this.moveFocus('left');
                },
                scope: this
            },
            {
                key: [Ext.EventObject.HOME],
                fn: function(){
                    var l = this.owner.items.get(0).el.focus();
                    if(l){
                        l.el.focus();
                    }
                },
                scope: this
            },
            {
                key: [Ext.EventObject.END],
                fn: function(){
                    this.owner.el.focus();
                },
                scope: this
            },
            {
                key: Ext.EventObject.ENTER,
                fn: function(){
                }
            }
        ]);
        this.keyMap.stopEvent = true;
    },
    moveFocus : function(dir) {
        var el = this.el[dir == 'left' ? 'prev' : 'next']() || this.owner.el;
	    el.focus.defer(100,el);
    },

    preDestroy : function(supressEffect) {
    	if(this.fireEvent('remove', this) === false){
	    	return;
	    }	
    	var actionDestroy = function(){
            if(this.owner.navigateItemsWithTab){
                this.moveFocus('right');
            }
            this.hidden.remove();
            this.hidden = null;
            this.destroy();
        };
        
        if(supressEffect){
            actionDestroy.call(this);
        } else {
            this.el.hide({
                duration: 0.2,
                callback: actionDestroy,
                scope: this
            });
        }
        return this;
    },
    kill : function(){
    	this.hidden.remove();
        this.hidden = null;
        this.purgeListeners();
        this.destroy();
    },
    onDisable : function() {
    	if(this.hidden){
    	    this.hidden.dom.setAttribute('disabled', 'disabled');
    	}
    	this.keyMap.disable();
    	Ext.ux.form.SuperBoxSelectItem.superclass.onDisable.call(this);
    },
    onEnable : function() {
    	if(this.hidden){
    	    this.hidden.dom.removeAttribute('disabled');
    	}
    	this.keyMap.enable();
    	Ext.ux.form.SuperBoxSelectItem.superclass.onEnable.call(this);
    },
    onDestroy : function() {
        Ext.destroy(
            this.lnk,
            this.el
        );
        
        Ext.ux.form.SuperBoxSelectItem.superclass.onDestroy.call(this);
    }
});/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns('Ext.ux.form');

/**
 * @class Ext.ux.form.FileUploadField
 * @extends Ext.form.TextField
 * Creates a file upload field.
 * @xtype fileuploadfield
 */
Ext.ux.form.FileUploadField = Ext.extend(Ext.form.TextField,  {
    /**
     * @cfg {String} buttonText The button text to display on the upload button (defaults to
     * 'Browse...').  Note that if you supply a value for {@link #buttonCfg}, the buttonCfg.text
     * value will be used instead if available.
     */
    buttonText: 'Browse...',
    /**
     * @cfg {Boolean} buttonOnly True to display the file upload field as a button with no visible
     * text field (defaults to false).  If true, all inherited TextField members will still be available.
     */
    buttonOnly: false,
    /**
     * @cfg {Number} buttonOffset The number of pixels of space reserved between the button and the text field
     * (defaults to 3).  Note that this only applies if {@link #buttonOnly} = false.
     */
    buttonOffset: 3,
    /**
     * @cfg {Object} buttonCfg A standard {@link Ext.Button} config object.
     */

    // private
    readOnly: true,

    /**
     * @hide
     * @method autoSize
     */
    autoSize: Ext.emptyFn,

    // private
    initComponent: function(){
        Ext.ux.form.FileUploadField.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event fileselected
             * Fires when the underlying file input field's value has changed from the user
             * selecting a new file from the system file selection dialog.
             * @param {Ext.ux.form.FileUploadField} this
             * @param {String} value The file value returned by the underlying file input field
             */
            'fileselected'
        );
    },

    // private
    onRender : function(ct, position){
        Ext.ux.form.FileUploadField.superclass.onRender.call(this, ct, position);

        this.wrap = this.el.wrap({cls:'x-form-field-wrap x-form-file-wrap'});
        this.el.addClass('x-form-file-text');
        this.el.dom.removeAttribute('name');
        this.createFileInput();

        var btnCfg = Ext.applyIf(this.buttonCfg || {}, {
            text: this.buttonText
        });
        this.button = new Ext.Button(Ext.apply(btnCfg, {
            renderTo: this.wrap,
            cls: 'x-form-file-btn' + (btnCfg.iconCls ? ' x-btn-icon' : '')
        }));

        if(this.buttonOnly){
            this.el.hide();
            this.wrap.setWidth(this.button.getEl().getWidth());
        }

        this.bindListeners();
        this.resizeEl = this.positionEl = this.wrap;
    },
    
    bindListeners: function(){
        this.fileInput.on({
            scope: this,
            mouseenter: function() {
                this.button.addClass(['x-btn-over','x-btn-focus'])
            },
            mouseleave: function(){
                this.button.removeClass(['x-btn-over','x-btn-focus','x-btn-click'])
            },
            mousedown: function(){
                this.button.addClass('x-btn-click')
            },
            mouseup: function(){
                this.button.removeClass(['x-btn-over','x-btn-focus','x-btn-click'])
            },
            change: function(){
                var v = this.fileInput.dom.value;
                this.setValue(v);
                this.fireEvent('fileselected', this, v);    
            }
        }); 
    },
    
    createFileInput : function() {
        this.fileInput = this.wrap.createChild({
            id: this.getFileInputId(),
            name: this.name||this.getId(),
            cls: 'x-form-file',
            tag: 'input',
            type: 'file',
            size: 1
        });
    },
    
    reset : function(){
        if (this.rendered) {
            this.fileInput.remove();
            this.createFileInput();
            this.bindListeners();
        }
        Ext.ux.form.FileUploadField.superclass.reset.call(this);
    },

    // private
    getFileInputId: function(){
        return this.id + '-file';
    },

    // private
    onResize : function(w, h){
        Ext.ux.form.FileUploadField.superclass.onResize.call(this, w, h);

        this.wrap.setWidth(w);

        if(!this.buttonOnly){
            var w = this.wrap.getWidth() - this.button.getEl().getWidth() - this.buttonOffset;
            this.el.setWidth(w);
        }
    },

    // private
    onDestroy: function(){
        Ext.ux.form.FileUploadField.superclass.onDestroy.call(this);
        Ext.destroy(this.fileInput, this.button, this.wrap);
    },
    
    onDisable: function(){
        Ext.ux.form.FileUploadField.superclass.onDisable.call(this);
        this.doDisable(true);
    },
    
    onEnable: function(){
        Ext.ux.form.FileUploadField.superclass.onEnable.call(this);
        this.doDisable(false);

    },
    
    // private
    doDisable: function(disabled){
        this.fileInput.dom.disabled = disabled;
        this.button.setDisabled(disabled);
    },


    // private
    preFocus : Ext.emptyFn,

    // private
    alignErrorIcon : function(){
        this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
    }

});

Ext.reg('fileuploadfield', Ext.ux.form.FileUploadField);

// backwards compat
Ext.form.FileUploadField = Ext.ux.form.FileUploadField;/**
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
 * The class of the Card Grid Details Panel.
 * 
 * @class Genapp.CardGridDetailsPanel
 * @extends Ext.Panel
 * @constructor Create a new CardGridDetailsPanel
 * @param {Object} config The config object
 */
Genapp.CardGridDetailsPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Number} headerWidth
     * The tab header width. (Default to 60)
     */
    headerWidth:95,
    /**
     * @cfg {Boolean} closable
     * Panels themselves do not directly support being closed, but some Panel subclasses do (like
     * {@link Ext.Window}) or a Panel Class within an {@link Ext.TabPanel}.  Specify true
     * to enable closing in such situations. Defaults to true.
     */
    closable: true,
    /**
     * @cfg {Boolean} autoScroll
     * true to use overflow:'auto' on the panel's body element and show scroll bars automatically when
     * necessary, false to clip any overflowing content (defaults to true).
     */
    autoScroll:true,
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp-query-grid-details-panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-query-card-grid-details-panel',
    /**
     * @cfg {String} loadingMsg
     * The loading message (defaults to <tt>'Loading...'</tt>)
     */
    loadingMsg: 'Loading...',
    header: false,
    layout: 'card',
    /**
     * @cfg {String} gridDetailsPanelTitle
     * The grid Details Panel Title (default to 'Locations')
     */
    cardGridDetailsPanelTitle: 'Selection',
    activeItem: 0, // make sure the active item is set on the container config!


    // private
    initComponent : function() {
            this.itemId = this.initConf.id;

            this.title = '<div style="width:'+ this.headerWidth + 'px;">'
            + this.cardGridDetailsPanelTitle + ' ' + this.initConf.featuresInformationSearchNumber
            + '</div>';

            this.items = new Genapp.GridDetailsPanel({
                initConf:this.initConf
            });

        Genapp.CardGridDetailsPanel.superclass.initComponent.call(this);
    }
});/**
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
 * A CardPanel correspond to the panel containing the application pages.
 * 
 * @class Genapp.CardPanel
 * @extends Ext.Panel
 * @constructor Create a new Card Panel
 * @param {Object} config The config object
 * @xtype cardpanel
 */
Genapp.CardPanel = Ext.extend(Ext.TabPanel, {
    /**
     * @cfg {String/Object} layout
     * <p><b>*Important</b>: In order for child items to be correctly sized and
     * positioned, typically a layout manager <b>must</b> be specified through
     * the <code>layout</code> configuration option.</p>
     * <br><p>The sizing and positioning of child {@link items} is the responsibility of
     * the Container's layout manager which creates and manages the type of layout
     * you have in mind.
     * For complete
     * details regarding the valid config options for each layout type, see the
     * layout class corresponding to the <code>layout</code> specified.</p>
     * @hide
     */
    //layout:'card',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp_consultation_panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-card-panel',
    /**
     * @cfg {String/Number} activeItem
     * A string component id or the numeric index of the component that should be initially activated within the
     * container's layout on render.  For example, activeItem: 'item-1' or activeItem: 0 (index 0 = the first
     * item in the container's collection).  activeItem only applies to layout styles that can display
     * items one at a time (like {@link Ext.layout.AccordionLayout}, {@link Ext.layout.CardLayout} and
     * {@link Ext.layout.FitLayout}).  Related to {@link Ext.layout.ContainerLayout#activeItem}.
     * 0 : PredefinedRequestPanel
     * 1 : ConsultationPanel
     * 2 : DocSearchPage
     */
    activeItem: 1,
    /**
     * @cfg {Boolean} border
     * True to display the borders of the panel's body element, false to hide them (defaults to false).  By default,
     * the border is a 2px wide inset border, but this can be further altered by setting {@link #bodyBorder} to false.
     */
    border :false,
    /**
     * @cfg {Mixed} renderTo
     * Specify the id of the element, a DOM element or an existing Element that this component will be rendered into.
     * Notes :
     * When using this config, a call to render() is not required.
     * Do not use this option if the Component is to be a child item of
     * a {@link Ext.Container Container}. It is the responsibility of the
     * {@link Ext.Container Container}'s {@link Ext.Container#layout layout manager}
     * to render its child items (Default to 'page').
     *
     * See {@link #render} also.
     */
    renderTo:'page',
    /**
     * @cfg {String} widthToSubstract
     * The width to substract to the consultation panel (defaults to <tt>80</tt>)
     */
    widthToSubstract:80,
    /**
     * @cfg {String} heightToSubstract
     * The height to substract to the consultation panel (defaults to <tt>160</tt>)
     */
    heightToSubstract:160,
    /**
     * @cfg {Array} shownPages
     * An array containing the page (xtype) to display
     * Default to all the pages.
     * The available values are:
     * 'predefinedrequestpage'
     * 'consultationpage'
     * 'docsearchpage'
     * 'editionpage'
     */
    shownPages: ['predefinedrequestpage', 'consultationpage', 'docsearchpage'],

    // private
    initComponent : function() {
    var i,
        onActivateFct = function(panel) {
            Ext.History.add(this.id);
        };
    this.addEvents(
            /**
             * @event resizewrapper
             * Fires after the Panel has been resized to resize the container (div html) of this consultation panel if exist.
             * This event is not the same that the 'bodyresize' event.
             * @param {Ext.Panel} p the Panel which has been resized.
             * @param {Number} width The Panel's new width.
             * @param {Number} height The Panel's new height.
             */
            'resizewrapper'
        );

        this.height = Ext.getBody().getViewSize().height - this.heightToSubstract;
        this.width = Ext.getBody().getViewSize().width - this.widthToSubstract;

        Ext.EventManager.onWindowResize(
            function(w, h){
                var newSize = {
                        width:Ext.getBody().getViewSize().width - this.widthToSubstract,
                        height:Ext.getBody().getViewSize().height - this.heightToSubstract
                };
                this.setSize(newSize);
                this.fireEvent('resizewrapper', newSize.width, newSize.height);
            },
            this
        );
        if (!this.items && this.shownPages.length !== 0) {
            this.items = [];
            for(i=0; i<this.shownPages.length; i++){
                var pageCfg = {xtype:this.shownPages[i]};
                if (Genapp.config.historicActivated) {
                    pageCfg.listeners = {
                        'activate': onActivateFct
                    };
                }
                this.items.push(pageCfg);
            }
        }
        // Removes the tab if there are only one pages
        if(this.shownPages.length === 1 ){
            this.headerCfg = {
                style:'display:none;'
            };
            // defaults are applied to items, not the container
            this.defaults = {
                frame:false
            };
        }

        Genapp.CardPanel.superclass.initComponent.call(this);
    }
});/**
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
 * A ConsultationPanel correspond to the complete page for querying request
 * results.
 * 
 * @class Genapp.ConsultationPanel
 * @extends Ext.Panel
 * @constructor Create a new Consultation Panel
 * @param {Object}
 *            config The config object
 * @xtype consultationpanel
 */
Genapp.ConsultationPanel = Ext
		.extend(
				Ext.Panel,
				{
					/**
					 * @cfg {String} title The title text to be used as
					 *      innerHTML (html tags are accepted) to display in the
					 *      panel <code>{@link #header}</code> (defaults to
					 *      ''). When a <code>title</code> is specified the
					 *      <code>{@link #header}</code> element will
					 *      automatically be created and displayed unless
					 *      {@link #header} is explicitly set to
					 *      <code>false</code>. If you do not want to specify
					 *      a <code>title</code> at config time, but you may
					 *      want one later, you must either specify a non-empty
					 *      <code>title</code> (a blank space ' ' will do) or
					 *      <code>header:true</code> so that the container
					 *      element will get created. Default to 'Predefined
					 *      Request'.
					 */
					title : 'Consultation',
					/**
					 * @cfg {Boolean} frame <code>false</code> by default to
					 *      render with plain 1px square borders.
					 *      <code>true</code> to render with 9 elements,
					 *      complete with custom rounded corners (also see
					 *      {@link Ext.Element#boxWrap}).
					 * @hide
					 */
					frame : true,
					/**
					 * @cfg {String} region Note: this config is only used when
					 *      this BoxComponent is rendered by a Container which
					 *      has been configured to use the
					 *      {@link Ext.layout.BorderLayout BorderLayout} layout
					 *      manager (eg. specifying layout:'border'). See
					 *      {@link Ext.layout.BorderLayout} also. Set by default
					 *      to 'center'.
					 */
					region : 'center',
					/**
					 * @cfg {String/Object} layout Specify the layout manager
					 *      class for this container either as an Object or as a
					 *      String. See
					 *      {@link Ext.Container#layout layout manager} also.
					 *      Default to 'border'.
					 */
					layout : 'border',
					/**
					 * @cfg {String} cls An optional extra CSS class that will
					 *      be added to this component's Element (defaults to
					 *      'genapp_consultation_panel'). This can be useful for
					 *      adding customized styles to the component or any of
					 *      its children using standard CSS rules.
					 */
					cls : 'genapp_consultation_panel',
					/**
					 * @cfg {Boolean} border True to display the borders of the
					 *      panel's body element, false to hide them (defaults
					 *      to false). By default, the border is a 2px wide
					 *      inset border, but this can be further altered by
					 *      setting {@link #bodyBorder} to false.
					 */
					border : false,
					/**
					 * @cfg {String} id
					 *      <p>
					 *      The <b>unique</b> id of this component (defaults to
					 *      an {@link #getId auto-assigned id}). You should
					 *      assign an id if you need to be able to access the
					 *      component later and you do not have an object
					 *      reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).
					 *      </p>
					 *      <p>
					 *      Note that this id will also be used as the element
					 *      id for the containing HTML element that is rendered
					 *      to the page for this component. This allows you to
					 *      write id-based CSS rules to style the specific
					 *      instance of this component uniquely, and also to
					 *      select sub-elements using this component's id as the
					 *      parent.
					 *      </p>
					 *      <p>
					 *      <b>Note</b>: to avoid complications imposed by a
					 *      unique <tt>id</tt> also see
					 *      <code>{@link #itemId}</code> and
					 *      <code>{@link #ref}</code>.
					 *      </p>
					 *      <p>
					 *      <b>Note</b>: to access the container of an item see
					 *      <code>{@link #ownerCt}</code>.
					 *      </p>
					 */
					id : 'consultation_panel',
					/**
					 * @cfg {String} ref
					 *      <p>
					 *      A path specification, relative to the Component's
					 *      <code>{@link #ownerCt}</code> specifying into
					 *      which ancestor Container to place a named reference
					 *      to this Component.
					 *      </p>
					 *      <p>
					 *      The ancestor axis can be traversed by using '/'
					 *      characters in the path. For example, to put a
					 *      reference to a Toolbar Button into <i>the Panel
					 *      which owns the Toolbar</i>:
					 *      </p>
					 * 
					 * <pre><code>
					 * var myGrid = new Ext.grid.EditorGridPanel({
					 * 	title : 'My EditorGridPanel',
					 * 	store : myStore,
					 * 	colModel : myColModel,
					 * 	tbar : [ {
					 * 		text : 'Save',
					 * 		handler : saveChanges,
					 * 		disabled : true,
					 * 		ref : '../saveButton'
					 * 	} ],
					 * 	listeners : {
					 * 		afteredit : function() {
					 * 			//      The button reference is in the GridPanel
					 * 	myGrid.saveButton.enable();
					 * }
					 * }
					 * });
					 * </code></pre>
					 * 
					 * <p>
					 * In the code above, if the <code>ref</code> had been
					 * <code>'saveButton'</code> the reference would have been
					 * placed into the Toolbar. Each '/' in the <code>ref</code>
					 * moves up one level from the Component's
					 * <code>{@link #ownerCt}</code>.
					 * </p>
					 * <p>
					 * Also see the <code>{@link #added}</code> and
					 * <code>{@link #removed}</code> events.
					 * </p>
					 */
					ref : 'consultationPage',
					/**
					 * @cfg {Boolean} hideCsvExportAlert if true hide the csv
					 *      export alert for IE (defaults to true).
					 */
					hideCsvExportAlert : false,
					/**
					 * @cfg {Boolean} hideCsvExportButton if true hide the csv
					 *      export button (defaults to false).
					 */
					hideCsvExportButton : false,
					hideGridKmlExportMenuItem : false,
					hideGridGeoJSONExportMenuItem : false,
					/**
					 * @cfg {Boolean} hideCancelButton if true hide the cancel
					 *      button (defaults to false).
					 */
					hideCancelButton : false,
					/**
					 * @cfg {Boolean} hideResetButton if true hide the reset
					 *      button (defaults to false).
					 */
					hideResetButton : false,
					/**
					 * @cfg {Boolean} hidePrintMapButton if true hide the Print
					 *      Map Button (defaults to false).
					 */
					hidePrintMapButton : true,
					/**
					 * @cfg {Boolean} hideDetails if true hide the details
					 *      button in the result panel (defaults to false).
					 */
					hideDetails : false,
					/**
					 * @cfg {Boolean} hideMapDetails if true hide the details
					 *      button in map toolbar (defaults to true).
					 */
					hideMapDetails : true,
					/**
					 * @cfg {Boolean} hideUserManualLink if true hide the user
					 *      manual link (defaults to true).
					 */
					hideUserManualLink : true,
					/**
					 * @cfg {Boolean} hidePredefinedRequestSaveButton if true
					 *      hide the predefined request save button (defaults to
					 *      true).
					 */
					hidePredefinedRequestSaveButton : true,
					/**
					 * @cfg {Boolean} hideGridDataEditButton if true hide the
					 *      grid data edit button (defaults to true).
					 */
					hideGridDataEditButton : true,
					/**
					 * @cfg {String} userManualLinkHref The user Manual Link
					 *      Href (defaults to
					 *      <tt>'Genapp.base_url + 'pdf/User_Manual.pdf''</tt>)
					 */
					userManualLinkHref : Genapp.base_url + 'pdf/User_Manual.pdf',
					/**
					 * @cfg {String} userManualLinkText The user Manual LinkText
					 *      (defaults to <tt>'User Manual'</tt>)
					 */
					userManualLinkText : 'User Manual',
					/**
					 * @cfg {Boolean} hideDetailsVerticalLabel if true hide the
					 *      details vertical label (defaults to false).
					 */
					hideDetailsVerticalLabel : false,
					/**
					 * @cfg {Boolean} hideLayerSelector if true hide the layer
					 *      selector. The layer selector is required for the
					 *      following tools.
					 */
					hideLayerSelector : false,
					hideSnappingButton : true,
					hideGetFeatureButton : true,
					hideFeatureInfoButton : false,
					/**
					 * @cfg {Boolean} showGridOnSubmit if true activate the Grid
					 *      Panel on the form submit (defaults to false).
					 */
					showGridOnSubmit : false,
					/**
					 * @cfg {String} datasetComboBoxEmptyText The dataset Combo
					 *      Box Empty Text (defaults to
					 *      <tt>'Please select a dataset'</tt>)
					 */
					datasetComboBoxEmptyText : "Please select a dataset...",
					/**
					 * @cfg {String} datasetPanelTitle The dataset Panel Title
					 *      (defaults to <tt>'Dataset'</tt>)
					 */
					datasetPanelTitle : 'Dataset',
					/**
					 * @cfg {String} formsPanelTitle The forms Panel Title
					 *      (defaults to <tt>'Forms Panel'</tt>)
					 */
					formsPanelTitle : 'Forms Panel',
					/**
					 * @cfg {String} exportButtonText The csv Export Button Text
					 *      (defaults to <tt>'Export'</tt>)
					 */
					exportButtonText : 'Export',
					/**
					 * @cfg {String} csvExportMenuItemText The grid Csv Export
					 *      Menu Item Text (defaults to <tt>'Export CSV'</tt>)
					 */
					csvExportMenuItemText : 'Export CSV',
					kmlExportMenuItemText : 'Export KML',
					geojsonExportMenuItemText : 'Export GeoJSON',
					/**
					 * @cfg {String} printMapButtonText The print Map Button
					 *      Text (defaults to <tt>'Print map'</tt>)
					 */
					printMapButtonText : 'Print map',
					/**
					 * @cfg {String} gridViewEmptyText The grid View Empty Text
					 *      (defaults to <tt>'No result...'</tt>)
					 */
					gridViewEmptyText : 'No result...',
					/**
					 * @cfg {String} gridPanelTitle The grid Panel Title
					 *      (defaults to <tt>'Results'</tt>)
					 */
					gridPanelTitle : 'Results',
					/**
					 * @cfg {String} gridPanelTabTip The grid Panel Tab Tip
					 *      (defaults to <tt>'The request's results'</tt>)
					 */
					gridPanelTabTip : 'The request\'s results',
					/**
					 * @cfg {Number} gridPageSize The grid page size (defaults
					 *      to <tt>20</tt>)
					 */
					gridPageSize : 20,
					/**
					 * @cfg {String} centerPanelTitle The center Panel Title
					 *      (defaults to <tt>'Result Panel'</tt>)
					 */
					centerPanelTitle : 'Result Panel',
					/**
					 * @cfg {String} queryPanelTitle The query Panel Title
					 *      (defaults to <tt>'Query Panel'</tt>)
					 */
					queryPanelTitle : "Query Panel",
					/**
					 * @cfg {Integer} queryPanelWidth The query Panel Width
					 *      (defaults to <tt>370</tt>)
					 */
					queryPanelWidth : 370,
					
					searchButtonWidth : 70,
					searchButtonHeight : 16,
					
					/**
					 * @cfg {String} queryPanelPinToolQtip The query Panel Pin
					 *      Tool Qtip (defaults to <tt>'Pin the panel'</tt>)
					 */
					queryPanelPinToolQtip : 'Pin the panel',
					/**
					 * @cfg {String} queryPanelUnpinToolQtip The query Panel
					 *      Unpin Tool Qtip (defaults to
					 *      <tt>'Unpin the panel'</tt>)
					 */
					queryPanelUnpinToolQtip : 'Unpin the panel',
					/**
					 * @cfg {String} queryPanelCancelButtonText The query Panel
					 *      Cancel Button Text (defaults to <tt>'Cancel'</tt>)
					 */
					queryPanelCancelButtonText : "Cancel",
					/**
					 * @cfg {String} queryPanelPredefinedRequestSaveButtonText
					 *      The query Panel Predefined Request Save Button Text
					 *      (defaults to <tt>'Save the request'</tt>)
					 */
					queryPanelPredefinedRequestSaveButtonText : "Save the request",
					/**
					 * @cfg {String} queryPanelResetButtonText The query Panel
					 *      Reset Button Text (defaults to <tt>'Reset'</tt>)
					 */
					queryPanelResetButtonText : "Reset",
					/**
					 * @cfg {String} queryPanelSearchButtonText The query Panel
					 *      Search Button Text (defaults to <tt>'Search'</tt>)
					 */
					queryPanelSearchButtonText : "Search",
					/**
					 * @cfg {String} queryPanelCancelButtonTooltip The query
					 *      Panel Cancel Button Tooltip (defaults to
					 *      <tt>'Cancel the request'</tt>)
					 */
					queryPanelCancelButtonTooltip : "Cancel the request",
					/**
					 * @cfg {String}
					 *      queryPanelPredefinedRequestSaveButtonTooltip The
					 *      query Panel Predefined Request Save Button Tooltip
					 *      (defaults to
					 *      <tt>'Add the current request to the predefined requests'</tt>)
					 */
					queryPanelPredefinedRequestSaveButtonTooltip : "Add the current request to the predefined requests",
					/**
					 * @cfg {String} queryPanelResetButtonTooltip The query
					 *      Panel Reset Button Tooltip (defaults to
					 *      <tt>'Reset the request'</tt>)
					 */
					queryPanelResetButtonTooltip : "Reset the request",
					/**
					 * @cfg {String} queryPanelSearchButtonTooltip The query
					 *      Panel Search Button Tooltip (defaults to
					 *      <tt>'Launch the request'</tt>)
					 */
					queryPanelSearchButtonTooltip : "Launch the request",
					/**
					 * @cfg {Integer} datasetComboBoxWidth The dataset Width
					 *      (defaults to <tt>345</tt>)
					 */
					datasetComboBoxWidth : 345,
					/**
					 * @cfg {String} detailsPanelCtTitle The details PanelCt
					 *      Title (defaults to <tt>'Details'</tt>)
					 */
					detailsPanelCtTitle : 'Details',
					/**
					 * @cfg {String} detailsPanelCtPinToolQtip The details
					 *      PanelCt Pin Tool Qtip (defaults to
					 *      <tt>'Pin the panel'</tt>)
					 */
					detailsPanelCtPinToolQtip : 'Pin the panel',
					/**
					 * @cfg {String} detailsPanelCtUnpinToolQtip The details
					 *      PanelCt Unpin Tool Qtip (defaults to
					 *      <tt>'Unpin the panel'</tt>)
					 */
					detailsPanelCtUnpinToolQtip : 'Unpin the panel',
					/**
					 * @cfg {String} featuresInformationPanelCtTitle The
					 *      features Information PanelCt Title (defaults to
					 *      <tt>'Features Information'</tt>)
					 */
					featuresInformationPanelCtTitle : 'Features Information',
					/**
					 * @cfg {Number} featuresInformationPanelCtHeight The
					 *      features Information Panel Ct Height (defaults to
					 *      <tt>185 (3 rows)</tt>)
					 */
					featuresInformationPanelCtHeight : 185,
					/**
					 * @cfg {String} mapMaskMsg The map Mask Msg (defaults to
					 *      <tt>'Loading...'</tt>)
					 */
					mapMaskMsg : "Loading...",
					/**
					 * @cfg {String} alertErrorTitle The alert Error Title
					 *      (defaults to <tt>'Error :'</tt>)
					 */
					alertErrorTitle : 'Error :',
					/**
					 * @cfg {String} alertRequestFailedMsg The alert Request
					 *      Failed Msg (defaults to
					 *      <tt>'Sorry, the request failed...'</tt>)
					 */
					alertRequestFailedMsg : 'Sorry, the request failed...',

					/**
					 * @cfg {String} dateFormat The date format for the date
					 *      fields (defaults to <tt>'Y/m/d'</tt>)
					 */
					dateFormat : 'Y/m/d',
					/**
					 * @cfg {String} csvExportAlertTitle The export CSV alert
					 *      title (defaults to <tt>'CSV exportation on IE'</tt>)
					 */
					csvExportAlertTitle : 'CSV exportation on IE',
					/**
					 * @cfg {String} csvExportAlertMsg The export CSV alert
					 *      message (defaults to
					 *      <tt>'On IE you have to:<br> - Change the opening of a csv file.<br> - Change the security.'</tt>)
					 */
					csvExportAlertMsg : "<div><H2>For your comfort on Internet Explorer you can:</H2> \
        <H3>Disable confirmation for file downloads.</H3> \
        <ul> \
        <li>In IE, expand the 'Tools' menu</li> \
        <li>Click on 'Internet Options'</li> \
        <li>Click on the 'Security' tab</li> \
        <li>Click on 'Custom Level'</li> \
        <li>Scroll down to the 'Downloads' part</li> \
        <li>Enable the confirmation for file download </li> \
        </ul> \
        <H3>Disable the file opening in the current window.</H3> \
        <ul> \
        <li>Open the workstation</li> \
        <li>Expand the 'Tools' menu</li> \
        <li>Click on 'Folder Options ...'</li> \
        <li>Click on the 'File Types' tab</li> \
        <li>Select the XLS extension</li> \
        <li>Click on the 'Advanced' button</li> \
        <li>Uncheck 'Browse in same window'</li> \
        </ul></div>",
					/**
					 * @cfg {Ext.Button} csvExportButton The csv export button
					 */
					/**
					 * @cfg {Ext.Button} mapPrintButton The map print button
					 */
					/**
					 * @cfg {Boolean} autoZoomOnResultsFeatures True to zoom
					 *      automatically on the results features
					 */
					autoZoomOnResultsFeatures : false,
					/**
					 * @cfg {Boolean} launchRequestOnPredefinedRequestLoad True
					 *      to launch the request on a prefefined request load
					 *      (default to true)
					 */
					launchRequestOnPredefinedRequestLoad : true,
					/**
					 * @cfg {Boolean} collapseQueryPanelOnPredefinedRequestLoad
					 *      True to collapse the query panel on a prefefined
					 *      request load (default to true)
					 */
					collapseQueryPanelOnPredefinedRequestLoad : true,
					// private
					featuresInformationSearchNumber : 0,
					/**
					 * @cfg {Number} tipDefaultWidth The tip Default Width.
					 *      (Default to 300)
					 */
					tipDefaultWidth : 300,
	                /**
                     * @cfg {Number} tipImageDefaultWidth The tip Image Default Width.
                     *      (Default to 200)
                     */
                    tipImageDefaultWidth : 200,
					/**
					 * @cfg {String} openGridDetailsButtonTitle The open Grid
					 *      Details Button Title (defaults to
					 *      <tt>'See the details'</tt>)
					 */
					openGridDetailsButtonTitle : "See the details",
					/**
					 * @cfg {String} openGridDetailsButtonTip The open Grid
					 *      Details Button Tip (defaults to
					 *      <tt>'Display the row details into the details panel.'</tt>)
					 */
					openGridDetailsButtonTip : "Display the row details into the details panel.",
					/**
					 * @cfg {String} seeOnMapButtonTitle The see On Map Button
					 *      Title (defaults to <tt>'See on the map'</tt>)
					 */
					seeOnMapButtonTitle : "See on the map",
					/**
					 * @cfg {String} seeOnMapButtonTip The see On Map Button Tip
					 *      (defaults to
					 *      <tt>'Zoom and centre on the location on the map.'</tt>)
					 */
					seeOnMapButtonTip : "Zoom and centre on the location on the map.",
					/**
					 * @cfg {String} editDataButtonTitle The edit Data Button
					 *      Title (defaults to <tt>'Edit the data'</tt>)
					 */
					editDataButtonTitle : "Edit the data",
					/**
					 * @cfg {String} editDataButtonTip The edit Data Button Tip
					 *      (defaults to
					 *      <tt>'Go to the edition page to edit the page.'</tt>)
					 */
					editDataButtonTip : "Go to the edition page to edit the data.",
					/**
					 * @cfg {String} cannotEditTip
					 */
					cannotEditTip : "You don't have the rights to edit this data.",
					/**
					 * @cfg {Boolean} collapseQueryPanelOnPageLoad Collapse QueryPanel 
					 *      after the page loading (defaults to <tt>false</tt>)
					 */
					collapseQueryPanelOnPageLoad : false,
                    /**
                     * @cfg {Boolean} launchRequestOnPageLoad Launch the request 
                     *      after the page loading (defaults to <tt>false</tt>)
                     */
                    launchRequestOnPageLoad : false,
                    /**
                     * @cfg {Boolean} collapseQueryPanelOnDatasetChange Collapse QueryPanel 
                     *      on the dataset change (defaults to <tt>false</tt>)
                     */
                    collapseQueryPanelOnDatasetChange : false,
                    /**
                     * @cfg {Boolean} launchRequestOnDatasetChange Launch the request 
                     *      on the dataset change (defaults to <tt>false</tt>)
                     */
                    launchRequestOnDatasetChange : false,
                    /**
                     * @cfg {String} exportAsPdfButtonText The export as pdf button text
                     *      (defaults to <tt>'Export as pdf'</tt>)
                     */
                    exportAsPdfButtonText: "Export as pdf",
                    /**
                     * @cfg {Boolean} hideExportAsPdfButton If true hide the export as pdf button
                     *      (defaults to <tt>false</tt>)
                     */
                    hideExportAsPdfButton: false,

					// private
					initComponent : function() {
						/**
						 * The dataset Data Store.
						 * 
						 * @property datasetDS
						 * @type Ext.data.JsonStore
						 */
						this.datasetDS = new Ext.data.JsonStore({
							url : Genapp.ajax_query_url + 'ajaxgetdatasets',
							method : 'POST',
							autoLoad : true,
							listeners : {
								'load' : {
									fn : function(store, records, options) {
										for (i = 0; i < records.length; i++) {
											if (records[i].data.is_default === '1') {
												this.datasetComboBox.setValue(records[i].data.id);
												this.updateDatasetFormsPanel(records[i].data.id,{
												    collapseQueryPanel : this.collapseQueryPanelOnPageLoad,
						                            launchRequest : this.launchRequestOnPageLoad
												});
												this.updateDatasetPanelToolTip(records[i].data);
												break;
											}
										}
									},
									scope : this
								}
							}
						});

						/**
						 * The dataset ComboBox.
						 * 
						 * @property datasetComboBox
						 * @type Ext.form.ComboBox
						 */
						this.datasetComboBox = new Ext.form.ComboBox({
							name : 'datasetId',
							hiddenName : 'datasetId',
							hideLabel : true,
							store : this.datasetDS,
							editable : false,
							displayField : 'label',
							valueField : 'id',
							forceSelection : true,
							mode : 'local',
							typeAhead : true,
							width : this.datasetComboBoxWidth,
							maxHeight : 100,
							triggerAction : 'all',
							emptyText : this.datasetComboBoxEmptyText,
							selectOnFocus : true,
							disableKeyFilter : true,
							listeners : {
								'select' : {
									fn : function(combo, record, index) {
										this.updateDatasetFormsPanel(record.data.id,{
                                            collapseQueryPanel : this.collapseQueryPanelOnDatasetChange,
                                            launchRequest : this.launchRequestOnDatasetChange
                                        });
										this.updateDatasetPanelToolTip(record.data);
									},
									scope : this
								}
							}
						});

						/**
						 * The dataset Panel.
						 * 
						 * @property datasetPanel
						 * @type Ext.Panel
						 */
						this.datasetPanel = new Ext.Panel({
							region : 'north',
							layout : 'form',
							autoHeight : true,
							frame : true,
							margins : '10 0 5 0',
							cls : 'genapp_query_panel_dataset_panel',
							title : this.datasetPanelTitle,
							items : this.datasetComboBox,
						    tools:[{
						        id:'help',
						        scope:this 
						    }]
						});

						/**
						 * The forms panel containing the dynamic forms.
						 * 
						 * @property formsPanel
						 * @type Ext.form.FieldSet
						 */
						this.formsPanel = new Ext.form.FieldSet({
							layout : 'auto',
							region : 'center',
							autoScroll : true,
							cls : 'genapp_query_formspanel',
							frame : true,
							margins : '5 0 5 0',
							title : this.formsPanelTitle,
							keys : {
								key : Ext.EventObject.ENTER,
								fn : this.submitRequest,
								scope : this
							}
						});

						/**
						 * The grid data store array reader with a customized
						 * updateMetadata function.
						 * 
						 * @property gridDSReader
						 * @type Ext.data.ArrayReader
						 */
						this.gridDSReader = new Ext.data.ArrayReader();

						// Creates a reader metadata update function
						this.gridDSReader.updateMetadata = function(meta) {
							delete this.ef;
							this.meta = meta;
							this.recordType = Ext.data.Record.create(meta.fields);
							this.onMetaChange(meta, this.recordType, {
								metaData : meta
							});
						};

						/**
						 * The grid data store.
						 * 
						 * @property gridDS
						 * @type Ext.data.Store
						 */
						this.gridDS = new Ext.data.Store({
							// store configs
							autoDestroy : true,
							url : Genapp.ajax_query_url + 'ajaxgetresultrows',
							remoteSort : true,
							// reader configs
							reader : this.gridDSReader
						});

						/**
						 * The grid paging toolbar with a customized reset
						 * function.
						 * 
						 * @property pagingToolbar
						 * @type Ext.PagingToolbar
						 */
						this.pagingToolbar = new Ext.PagingToolbar({
							pageSize : this.gridPageSize,
							store : this.gridDS,
							displayInfo : true
						});

						// Creates a paging toolbar reset function
						this.pagingToolbar.reset = function() {
							if (!this.rendered) {
								return;
							}
							this.afterTextItem.setText(String.format(this.afterPageText, 1));
							this.inputItem.setValue(1);
							this.first.setDisabled(true);
							this.prev.setDisabled(true);
							this.next.setDisabled(true);
							this.last.setDisabled(true);
							this.refresh.enable();
							if (this.displayItem) {
								this.displayItem.setText(this.emptyMsg);
							}
							this.fireEvent('change', this, {
								total : 0,
								activePage : 1,
								pages : 1
							});
						};

						/**
						 * The grid view with a customized reset function.
						 * 
						 * @property gridView
						 * @type Ext.grid.GridView
						 */
						this.gridView = new Ext.grid.GridView({
							autoFill : true,
							emptyText : this.gridViewEmptyText,
							deferEmptyText : true
						});

						// Creates a grid view reset function
						this.gridView.reset = function() {
							this.mainBody.dom.innerHTML = '&#160;';
						};

						/**
						 * The grid panel displaying the request results.
						 * 
						 * @property gridPanel
						 * @type Ext.grid.GridPanel
						 */
						this.gridPanel = new Ext.grid.GridPanel({
							frame : true,
							tabTip : this.gridPanelTabTip,
							collapsible : true,
							titleCollapse : true,
							title : this.gridPanelTitle,
							header : false,
							layout : 'fit',
							autoScroll : true,
							loadMask : true,
							view : this.gridView,
							store : this.gridDS,
							trackMouseOver : false,
							sm : new Ext.grid.RowSelectionModel({
								singleSelect : true
							}),
							cm : new Ext.grid.ColumnModel({}),
							bbar : this.pagingToolbar,
							listeners : {
								'activate' : function(panel) {
									if (!this.hideCsvExportButton) {
										this.csvExportButton.show();
									}
									if (!this.hidePrintMapButton) {
										this.printMapButton.hide();
									}
								},
								scope : this
							}
						});

						/**
						 * The map panel.
						 * 
						 * @property geoPanel
						 * @type Genapp.GeoPanel
						 */
						this.geoPanel = new Genapp.GeoPanel({
							hideMapDetails : this.hideMapDetails,
							hideLayerSelector : this.hideLayerSelector,
							hideSnappingButton : this.hideSnappingButton,
							hideGetFeatureButton : this.hideGetFeatureButton,
							hideFeatureInfoButton : this.hideFeatureInfoButton,
							listeners : {
								'activate' : function(panel) {
									if (!this.hideCsvExportButton) {
										this.csvExportButton.hide();
									}
									if (!this.hidePrintMapButton) {
										this.printMapButton.show();
									}
								},
								'addgeomcriteria' : this.addgeomcriteria,
								scope : this
							}
						});

						/**
						 * The center panel containing the map and the grid
						 * panels.
						 * 
						 * @property centerPanel
						 * @type Ext.TabPanel
						 */
						this.centerPanel = new Ext.TabPanel({
							activeItem : 0,
							frame : true,
							plain : true,
							region : 'center',
							title : this.centerPanelTitle,
							items : [ this.geoPanel, this.gridPanel ]
						});

						this.centerPanel.on('render', function(tabPanel) {
							var tabEdgeDiv = tabPanel.getEl().query(".x-tab-edge");
							if (!this.hideUserManualLink) {
								var userManualLinkEl = Ext.DomHelper.insertBefore(tabEdgeDiv[0], {
									tag : 'li',
									children : [ {
										tag : 'a',
										target : '_blank',
										href : this.userManualLinkHref,
										children : [ {
											tag : 'span',
											cls : 'x-tab-strip-text genapp-query-center-panel-tab-strip-link',
											html : this.userManualLinkText
										} ]
									} ]
								}, true);
								// Stop the event propagation to avoid the
								// TabPanel error
								userManualLinkEl.on('mousedown', Ext.emptyFn, null, {
									stopPropagation : true
								});
							}
							function addTopButton(config) {
								var el = Ext.DomHelper.insertBefore(tabEdgeDiv[0], {
									tag : 'li',
									cls : 'genapp-query-center-panel-tab-strip-top-button'
								}, true);
								// Set the ul dom to the size of the TabPanel
								// instead of 5000px by default
								el.parent().setWidth('100%');
								// Stop the event propagation to avoid the
								// TabPanel error
								el.on('mousedown', Ext.emptyFn, null, {
									stopPropagation : true
								});
								return new Ext.ComponentMgr.create(Ext.apply({
									renderTo : el.id
								}, config));
							}

							this.mask = new Ext.LoadMask(this.getEl(), {
								msg : this.mapMaskMsg
							});

							this.centerPanel.doLayout();

							// add the export button
							var csvExportMenuItems = [];
							if (!this.hideGridCsvExportMenuItem) {
								csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
									text : this.csvExportMenuItemText,
									handler : this.exportCSV.createDelegate(this, [ 'csv-export' ]),
									iconCls : 'genapp-query-center-panel-grid-csv-export-menu-item-icon'
								}));
								if (!this.hideGridKmlExportMenuItem) {
									csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
										text : this.kmlExportMenuItemText,
										handler : this.exportCSV.createDelegate(this, [ 'kml-export' ]),
										iconCls : 'genapp-query-center-panel-grid-csv-export-menu-item-icon'
									}));
								}
								if (!this.hideGridGeoJSONExportMenuItem) {
									csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
										text : this.geojsonExportMenuItemText,
										handler : this.exportCSV.createDelegate(this, [ 'geojson-export' ]),
										iconCls : 'genapp-query-center-panel-grid-csv-export-menu-item-icon'
									}));
								}
							}
							// Hide the csv export button if there are no menu
							// items
							if (Ext.isEmpty(csvExportMenuItems)) {
								this.hideCsvExportButton = true;
							}
							if (!this.hideCsvExportButton) {
								this.csvExportButton = addTopButton({
									xtype : 'splitbutton',
									text : this.exportButtonText,
									disabled : true,
									handler : this.exportCSV.createDelegate(this, [ 'csv-export' ]),
									menu : this.csvExportButtonMenu = new Ext.menu.Menu({
										items : csvExportMenuItems
									})
								});
							}
							if (!this.hidePrintMapButton) {
								this.printMapButton = addTopButton({
									xtype : 'button',
									iconCls : 'genapp-query-center-panel-print-map-button-icon',
									text : this.printMapButtonText,
									handler : this.printMap,
									scope : this
								});
							}
						}, this, {
							single : true
						});

						this.queryPanelPinned = true;

						var tools = null;
						if (!Genapp.hidePinButton) {
							tools = [ {
								id : 'pin',
								qtip : this.queryPanelPinToolQtip,
								hidden : true,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-unpin').show();
									this.queryPanelPinned = true;
								},
								scope : this
							}, {
								id : 'unpin',
								qtip : this.queryPanelUnpinToolQtip,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-pin').show();
									this.queryPanelPinned = false;
								},
								scope : this
							} ];
						}

						// Cancel button
						var cancelButton = null;
						if (!this.hideCancelButton) {
							cancelButton = {
								xtype : 'tbbutton',
								text : this.queryPanelCancelButtonText,
								tooltipType : 'title',
								tooltip : this.queryPanelCancelButtonTooltip,
								cls : 'genapp_query_formspanel_cancel_button',
								scope : this,
								handler : this.cancelRequest
							};
						} else {
							cancelButton = {
								xtype : 'tbspacer'
							};
						}

						// Request button
						var resetButton = null;
						if (!this.hideResetButton) {
							resetButton = {
								xtype : 'tbbutton',
								text : this.queryPanelResetButtonText,
								tooltipType : 'title',
								tooltip : this.queryPanelResetButtonTooltip,
								cls : 'genapp_query_formspanel_reset_button',
								scope : this,
								handler : this.resetRequest
							};
						} else {
							resetButton = {
								xtype : 'tbfill'
							};
						}
						
						// Request button
						var searchButton = {
							xtype : 'tbbutton',
							width : this.searchButtonWidth,
							height : this.searchButtonHeight,
							text : this.queryPanelSearchButtonText,
							tooltipType : 'title',
							tooltip : this.queryPanelSearchButtonTooltip,
							cls : 'genapp_query_formspanel_search_button',
							scope : this,
							handler : this.submitRequest
						};

						var queryPanelConfig = {
							region : 'west',
							title : this.queryPanelTitle,
							collapsible : true,
							margins : '0 5 0 0',
							titleCollapse : true,
							width : this.queryPanelWidth,
							frame : true,
							layout : 'border',
							cls : 'genapp_query_panel',
							items : [ this.datasetPanel, this.formsPanel ],
							tools : tools,
							bbar : [ cancelButton, 
							         resetButton, 
							         searchButton 
							]
						};

						if (!this.hidePredefinedRequestSaveButton) {
							queryPanelConfig.tbar = {
								cls : 'genapp_query_panel_tbar',
								items : [ {
									xtype : 'tbbutton',
									text : this.queryPanelPredefinedRequestSaveButtonText,
									tooltipType : 'title',
									tooltip : this.queryPanelPredefinedRequestSaveButtonTooltip,
									iconCls : 'genapp-query-panel-predefined-request-save-button-icon',
									scope : this,
									handler : function(b, e) {
										// TODO
									}
								} ]
							};
						}

						/**
						 * The query form panel contains the dataset list and
						 * the corresponding forms.
						 * 
						 * @property queryPanel
						 * @type Ext.FormPanel
						 */
						this.queryPanel = new Ext.FormPanel(queryPanelConfig);

						// Add the layers and legends vertical label
						if (!this.hideRequestVerticalLabel) {
							this.addVerticalLabel(this.queryPanel, 'genapp-query-request-panel-ct-xcollapsed-vertical-label-div');
						}

						var detailsPanelConfig = {
                            frame : true,
                            plain : true,
                            enableTabScroll : true,
                            cls : 'genapp-query-details-panel',
                            scrollIncrement : 91,
                            scrollRepeatInterval : 100,
                            idDelimiter : '___', // Avoid a conflict with the
                            // Genapp id separator('__')
                            listeners : {
                                'render' : function(panel) {
                                    panel.items.on('remove', function(item) {
                                        if (this.items.getCount() === 0) {
                                            this.ownerCt.collapse();
                                        }
                                    }, panel);
                                }
                            }
                        };

						if(!this.hideExportAsPdfButton){
						    detailsPanelConfig.tbar = [{
                                text: this.exportAsPdfButtonText,
                                iconCls: 'genapp-query-details-panel-pdf-export',
                                handler: function(){
                                    var currentDP = this.detailsPanel.getActiveTab();
                                    currentDP.exportAsPDF();
                                },
                                scope: this
                            }];
						}

						/**
						 * The details panel.
						 * 
						 * @property detailsPanel
						 * @type Ext.TabPanel
						 */
						this.detailsPanel = new Ext.TabPanel(detailsPanelConfig);

						this.detailsPanelPinned = true;

						var tools = null;
						if (!Genapp.hidePinButton) {
							tools = [ {
								id : 'pin',
								qtip : this.detailsPanelCtPinToolQtip,
								hidden : true,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-unpin').show();
									this.detailsPanelPinned = true;
								},
								scope : this
							}, {
								id : 'unpin',
								qtip : this.detailsPanelCtUnpinToolQtip,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-pin').show();
									this.detailsPanelPinned = false;
								},
								scope : this
							} ];
						}

						/**
						 * The details panel container.
						 * 
						 * @property detailsPanelCt
						 * @type Ext.Panel
						 */
						this.detailsPanelCt = new Ext.Panel({
							region : 'east',
							title : this.detailsPanelCtTitle,
							frame : true,
							split : true,
							layout : 'fit',
							width : 344,
							minWidth : 200,
							collapsible : true,
							titleCollapse : true,
							collapsed : true,
							items : this.detailsPanel,
							tools : tools,
							listeners : {
								// Collapse the layersAndLegendsPanel on expand
								// event
								expand : function() {
									// The map panel must be rendered and
									// activated to resize correctly the map div
									if (this.centerPanel.getActiveTab() instanceof Genapp.GeoPanel) {
										this.geoPanel.layersAndLegendsPanel.collapse();
									} else {
										this.centerPanel.activate(this.geoPanel);
										this.geoPanel.layersAndLegendsPanel.collapse();
										this.centerPanel.activate(this.gridPanel);
									}
								},
								scope : this
							}
						});

						// Add the layers and legends vertical label
						if (!this.hideDetailsVerticalLabel) {
							this.addVerticalLabel(this.detailsPanelCt, 'genapp-query-details-panel-ct-xcollapsed-vertical-label-div');
						}

						/**
						 * The features Information panel.
						 * 
						 * @property featuresInformationPanel
						 * @type Ext.TabPanel
						 */
						this.featuresInformationPanel = new Ext.TabPanel({
							frame : true,
							plain : true,
							enableTabScroll : true,
							cls : 'genapp-query-locations-panel',
							scrollIncrement : 91,
							scrollRepeatInterval : 100,
							idDelimiter : '___', // Avoid a conflict with the
							// Genapp id separator('__')
							listeners : {
								'render' : function(panel) {
									panel.items.on('remove', function(item) {
										if (this.items.getCount() === 0) {
											this.ownerCt.collapse();
										}
									}, panel);
								}
							}
						});

						this.featuresInformationPanelPinned = true;

						var tools = null;
						if (!Genapp.hidePinButton) {
							tools = [ {
								id : 'pin',
								qtip : this.featuresInformationPanelCtPinToolQtip,
								hidden : true,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-unpin').show();
									this.featuresInformationPanelPinned = true;
								},
								scope : this
							}, {
								id : 'unpin',
								qtip : this.featuresInformationPanelCtUnpinToolQtip,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-pin').show();
									this.featuresInformationPanelPinned = false;
								},
								scope : this
							} ];
						}

						/**
						 * The features Information panel container.
						 * 
						 * @property featuresInformationPanelCt
						 * @type Ext.Panel
						 */
						this.featuresInformationPanelCt = new Ext.Panel({
							region : 'south',
							title : this.featuresInformationPanelCtTitle,
							frame : true,
							split : true,
							layout : 'fit',
							height : this.featuresInformationPanelCtHeight,
							collapsible : true,
							titleCollapse : true,
							collapsed : true,
							items : this.featuresInformationPanel,
							tools : tools
						});

						var centerPanelCtItems = [ this.centerPanel ];
						if (!this.hideDetails) {
							centerPanelCtItems.push(this.detailsPanelCt);
						}
						if (!this.hideMapDetails && Genapp.map.featureinfo_maxfeatures !== 1) {
							centerPanelCtItems.push(this.featuresInformationPanelCt);
						}
						this.centerPanelCt = new Ext.Panel({
							layout : 'border',
							region : 'center',
							items : centerPanelCtItems
						});

						if (!this.items) {
							this.items = [ this.queryPanel, this.centerPanelCt ];
						}

						// Add events listening
						Genapp.eventManager.on('getLocationInfo', this.getLocationInfo, this);

						Genapp.ConsultationPanel.superclass.initComponent.call(this);
					},

					/**
					 * Update the Forms Panel by adding the Panel corresponding
					 * to the selected dataset
					 * 
					 * @param {Object}
					 *            response The XMLHttpRequest object containing
					 *            the response data.
					 * @param {Object}
					 *            options The parameter to the request call.
					 * @param {Object}
					 *            apiParams The api parameters
					 * @param {Object}
					 *            criteriaValues The criteria values
					 * @hide
					 */
					updateWestPanels : function(response, opts, apiParams, criteriaValues) {
						var forms = Ext.decode(response.responseText), i;
						// Removes the loading message
						this.formsPanel.body.update();

						// Add each form
						for (i = 0; i < forms.data.length; i++) {
							if (!(Ext.isEmpty(forms.data[i].criteria) && Ext.isEmpty(forms.data[i].columns))) {
							    var formId = forms.data[i].id;
							    var criteria = forms.data[i].criteria;
								this.formsPanel.add(new Genapp.FieldForm({
									title : forms.data[i].label,
									id : formId,
									criteria : criteria,
									criteriaValues : criteriaValues,
									columns : forms.data[i].columns
								}));
	                            // Find the geom criteria and fill the geomCriteriaInfo param
	                            for (j = 0; j < criteria.length; j++) {
	                                if(criteria[j].type === 'GEOM'){
	                                    this.geomCriteriaInfo = {
	                                        'formId' : formId,
	                                        'id' : criteria[j].name
	                                    }
	                                }
	                            }
							}
						}
						this.formsPanel.doLayout();
						if (!Ext.isEmpty(apiParams)) {
							if (apiParams.collapseQueryPanel === true) {
								this.queryPanel.collapse();
							}
							if (apiParams.launchRequest === true) {
								this.submitRequest();
							}
						}
					},

					/**
					 * Renders for the left tools column cell
					 * 
					 * @param {Object}
					 *            value The data value for the cell.
					 * @param {Object}
					 *            metadata An object in which you may set the
					 *            following attributes: {String} css A CSS class
					 *            name to add to the cell's TD element. {String}
					 *            attr : An HTML attribute definition string to
					 *            apply to the data container element within the
					 *            table cell (e.g. 'style="color:red;"').
					 * @param {Ext.data.record}
					 *            record The {@link Ext.data.Record} from which
					 *            the data was extracted.
					 * @param {Number}
					 *            rowIndex Row index
					 * @param {Number}
					 *            colIndex Column index
					 * @param {Ext.data.Store}
					 *            store The {@link Ext.data.Store} object from
					 *            which the Record was extracted.
					 * @return {String} The html code for the column
					 * @hide
					 */
					renderLeftTools : function(value, metadata, record, rowIndex, colIndex, store) {

						var stringFormat = '';
						if (!this.hideDetails) {
							stringFormat = '<div class="genapp-query-grid-slip" '
									+ 'onclick="Genapp.cardPanel.consultationPage.openDetails(\'{0}\', \'ajaxgetdetails\');" ' + 'ext:qtitle="'
									+ this.openGridDetailsButtonTitle + '"' + 'ext:qwidth="' + this.tipDefaultWidth + '"' + 'ext:qtip="'
									+ this.openGridDetailsButtonTip + '"' + '></div>';
						}
						stringFormat += '<div class="genapp-query-grid-map" '
								+ 'onclick="Genapp.cardPanel.consultationPage.displayLocation(\'{0}\',\'{1}\');" ' + 'ext:qtitle="' + this.seeOnMapButtonTitle
								+ '"' + 'ext:qwidth="' + this.tipDefaultWidth + '"' + 'ext:qtip="' + this.seeOnMapButtonTip + '"' + '></div>';

						return String.format(stringFormat, record.data.id, record.data.location_centroid);
					},

					/**
					 * Renders for the right tools column cell
					 * 
					 * @param {Object}
					 *            value The data value for the cell.
					 * @param {Object}
					 *            metadata An object in which you may set the
					 *            following attributes: {String} css A CSS class
					 *            name to add to the cell's TD element. {String}
					 *            attr : An HTML attribute definition string to
					 *            apply to the data container element within the
					 *            table cell (e.g. 'style="color:red;"').
					 * @param {Ext.data.record}
					 *            record The {@link Ext.data.Record} from which
					 *            the data was extracted.
					 * @param {Number}
					 *            rowIndex Row index
					 * @param {Number}
					 *            colIndex Column index
					 * @param {Ext.data.Store}
					 *            store The {@link Ext.data.Store} object from
					 *            which the Record was extracted.
					 * @return {String} The html code for the column
					 * @hide
					 */
					renderRightTools : function(value, metadata, record, rowIndex, colIndex, store) {

						var stringFormat = '';

						// If we don't check data rights or if the data belongs
						// to the provider, we display the edit link
						if (!this.checkEditionRights || Genapp.userProviderId == record.data._provider_id) {
							stringFormat = '<div class="genapp-query-grid-edit genapp-query-grid-editUI" '
									+ 'onclick="window.location.href=Genapp.base_url + \'dataedition/show-edit-data/{0}\';"' + 'ext:qtitle="'
									+ this.editDataButtonTitle + '"' + 'ext:qwidth="' + this.tipDefaultWidth + '"' + 'ext:qtip="' + this.editDataButtonTip
									+ '"' + '></div>';
						} else {
							stringFormat = '<div ext:qtip="' + this.cannotEditTip + '">&nbsp;</div>';
						}
						return String.format(stringFormat, record.data.id);
					},

					/**
					 * Open the row details
					 * 
					 * @param {String}
					 *            id The details id
					 * @param {String}
					 *            url The url to get the details
					 */
					openDetails : function(id, url) {
						if (!Ext.isEmpty(id)) {
							var consultationPanel = Ext.getCmp('consultation_panel');
							consultationPanel.collapseQueryPanel();
							consultationPanel.detailsPanel.ownerCt.expand();
							var tab = consultationPanel.detailsPanel.get(id);
							if (Ext.isEmpty(tab)) {
								tab = consultationPanel.detailsPanel.add(new Genapp.DetailsPanel({
									rowId : id,
									dataUrl : url
								}));
							}
							consultationPanel.detailsPanel.activate(tab);
						}
					},

					/**
					 * Open a features information panel
					 * 
					 * @param {Object}
					 *            selection The selection information
					 */
					openFeaturesInformationSelection : function(selection) {
						this.featuresInformationSearchNumber++;
						selection.featuresInformationSearchNumber = this.featuresInformationSearchNumber;
						if (!Ext.isEmpty(selection.data)) {
							var consultationPanel = Ext.getCmp('consultation_panel');
							consultationPanel.featuresInformationPanel.ownerCt.expand();
							var tab = consultationPanel.featuresInformationPanel.get(selection.id);
							if (Ext.isEmpty(tab)) {
								tab = consultationPanel.featuresInformationPanel.add(new Genapp.CardGridDetailsPanel({
									initConf : selection
								}));
							}
							consultationPanel.featuresInformationPanel.activate(tab);
						}
					},

					/**
					 * Add a geom criteria and open its map
					 */
					addgeomcriteria : function() {
						if (!Ext.isEmpty(this.geomCriteriaInfo)) {
							var form = this.formsPanel.get(this.geomCriteriaInfo.formId);
							var criteria = form.addCriteria(this.geomCriteriaInfo.id);
							criteria.openMap();
						}
					},

					/**
					 * Switch the current gridDetailsPanel to the children
					 * gridDetailsPanel
					 * 
					 * @param {String}
					 *            cardPanelId The id of the card panel
					 *            containing the current gridDetailsPanel
					 * @param {String}
					 *            id The id of the selected row in the current
					 *            gridDetailsPanel
					 */
					getChildren : function(cardPanelId, id) {
						var cardPanel = Ext.getCmp(cardPanelId);
						var tab = cardPanel.get(id);
						if (Ext.isEmpty(tab)) {
							// We must get the id and not a reference to the
							// activeItem
							var parentItemId = cardPanel.getLayout().activeItem.getId();
	                        var tabMask = new Ext.LoadMask(Ext.getCmp(parentItemId).body, {msg: this.mapMaskMsg});
	                        tabMask.show();
							Ext.Ajax.request({
								url : Genapp.ajax_query_url + 'ajaxgetchildren',
								success : function(response, opts) {
									var obj = Ext.decode(response.responseText);
									obj.parentItemId = parentItemId;
									obj.ownerCt = cardPanel;
									tab = cardPanel.add(new Genapp.GridDetailsPanel({
										initConf : obj
									}));
									cardPanel.getLayout().setActiveItem(tab);
									tabMask.hide();
								},
								failure : function(response, opts) {
								    tabMask.hide();
								    console.log('server-side failure with status code ' + response.status);
								},
								params : {
									id : id
								}
							});
						} else {
							cardPanel.getLayout().setActiveItem(tab);
						}
					},

					/**
					 * Add a new CardGridDetailsPanel and display the children
					 * 
					 * @param {String}
					 *            id The id of the selected row in the current
					 *            detailsPanel
					 */
					displayChildren : function(id) {
						var consultationPanel = Ext.getCmp('consultation_panel');
						tab = consultationPanel.featuresInformationPanel.get(id);
						if (!Ext.isEmpty(tab)) {
							consultationPanel.featuresInformationPanel.activate(tab);
						} else {
							Ext.Ajax.request({
								url : Genapp.ajax_query_url + 'ajaxgetchildren',
								success : function(response, opts) {
									var obj = Ext.decode(response.responseText);
									var consultationPanel = Ext.getCmp('consultation_panel');
									consultationPanel.openFeaturesInformationSelection(obj);
								},
								failure : function(response, opts) {
									console.log('server-side failure with status code ' + response.status);
								},
								params : {
									id : id
								}
							});
						}
					},

					/**
					 * Switch the current gridDetailsPanel to the parent
					 * gridDetailsPanel
					 * 
					 * @param {String}
					 *            cardPanelId The id of the card panel
					 *            containing the current gridDetailsPanel
					 */
					getParent : function(cardPanelId) {
						var cardPanel = Ext.getCmp(cardPanelId);
						cardPanel.getLayout().setActiveItem(Ext.getCmp(cardPanel.getLayout().activeItem.parentItemId));
					},

					/**
					 * Displays the location on the map
					 * 
					 * @param {String}
					 *            id The location id
					 * @param {String}
					 *            wkt a point WKT to be displayed as a flag.
					 */
					displayLocation : function(id, wkt) {
						var consultationPanel = Ext.getCmp('consultation_panel');
						consultationPanel.centerPanel.activate(consultationPanel.geoPanel);
						consultationPanel.geoPanel.zoomToFeature(id, wkt);
					},

					/**
					 * Cancel the current ajax request (submit or load)
					 */
					cancelRequest : function() {
						if (this.requestConn && this.requestConn !== null) {
							this.requestConn.abort();
							this.gridPanel.loadMask.hide();
							this.mapMask.hide();
						}
					},

					/**
					 * Reset the current ajax request (submit or load)
					 */
					resetRequest : function() {
						this.updateDatasetFormsPanel(this.datasetComboBox.getValue());
					},

					/**
					 * Submit the request and get the description of the result
					 * columns
					 */
					submitRequest : function() {
						var i;
						if (!this.hideCsvExportButton) {
							this.csvExportButton.disable();
						}
						// Hide the aggregated layer and legend
						this.geoPanel.disableLayersAndLegends(this.geoPanel.layersActivation['request'], true, false, true);

						// Init the mapResultLayers
						if (!this.mapResultLayers) {
							var rla = this.geoPanel.layersActivation['request'];
							this.mapResultLayers = [];
							if (!Ext.isEmpty(rla)) {
								for (i = 0; i < rla.length; i++) {
									var layer = this.geoPanel.map.getLayersByName(rla[i])[0];
									// The layer visibility must be set to true
									// to handle the 'loadend' event
									layer.events.register("loadend", this, function(info) {
										this.mapResultLayersLoadEnd[info.object.name] = 1;
										// Hide the map mask if all the result
										// layers are loaded
										var count = 0;
										for (layer in this.mapResultLayersLoadEnd) {
											if (typeof this.mapResultLayersLoadEnd[layer] !== 'function') {
												count += this.mapResultLayersLoadEnd[layer];
											}
										}
										if (count === this.mapResultLayers.length) {
											this.mapMask.hide();
										}
									});
									this.mapResultLayers.push(layer);
								}
							}
						}
						// Init mapResultLayersLoadEnd
						this.mapResultLayersLoadEnd = {};
						for (i = 0; i < this.mapResultLayers.length; i++) {
							var layer = this.mapResultLayers[i];
							this.mapResultLayersLoadEnd[layer.name] = 0;
						}

						if (!this.mapMask) {
							this.mapMask = new Ext.LoadMask(this.geoPanel.getEl(), {
								msg : this.mapMaskMsg
							});
						}

						// The panel must be rendered and active to show the
						// mask correctly
						if (this.showGridOnSubmit) {
							this.centerPanel.activate(this.geoPanel);
							this.mapMask.show();
							this.centerPanel.activate(this.gridPanel);
							this.gridPanel.loadMask.show();
						} else {
							this.centerPanel.activate(this.gridPanel);
							this.gridPanel.loadMask.show();
							this.centerPanel.activate(this.geoPanel);
							this.mapMask.show();
						}
						for (i = 0; i < this.mapResultLayersLoadEnd.length; i++) {
							var layer = this.mapResultLayersLoadEnd[i];
							layer.display(false);
						}
						this.geoPanel.clean();
						this.clearGrid();

						Ext.Ajax.on('beforerequest', function(conn, options) {
							this.requestConn = conn;
						}, this, {
							single : true
						});

						this.formsPanel.findParentByType('form').getForm().submit({
							url : Genapp.ajax_query_url + 'ajaxgetresultcolumns',
							timeout : 480000,
							success : function(form, action) {
								this.requestConn = null;
								// Creation of the column model and the reader
								// metadata fields
								var columns = action.result.columns;
								var newCM = [ {
									dataIndex : 'leftTools',
									header : '',
									renderer : this.renderLeftTools.createDelegate(this),
									sortable : false,
									fixed : true,
									menuDisabled : true,
									align : 'center',
									width : 50
								} ];
								var newRF = [];
								var columnConf;
								var readerFieldsConf;
								for (i = 0; i < columns.length; i++) {
									columnConf = {
										header : Genapp.util.htmlStringFormat(columns[i].label),
										sortable : true,
										dataIndex : columns[i].name,
										width : 100,
										tooltip : Genapp.util.htmlStringFormat(columns[i].definition),
										hidden : columns[i].hidden
									};
									readerFieldsConf = {
										name : columns[i].name
									};
									switch (columns[i].type) {
									// TODO : BOOLEAN, CODE, COORDINATE, ARRAY,
									// TREE
									case 'STRING':
										columnConf.xtype = 'gridcolumn';
										readerFieldsConf.type = 'string';
										break;
									case 'INTEGER':
										columnConf.xtype = 'gridcolumn';
										break;
									case 'NUMERIC':
										columnConf.xtype = 'numbercolumn';
										if (columns[i].decimals !== null) {
											columnConf.format = this.numberPattern('.', columns[i].decimals);
										}
										break;
									case 'DATE':
										columnConf.xtype = 'datecolumn';
										columnConf.format = this.dateFormat;
										break;
									case 'IMAGE':
									    columnConf.header = '';
									    columnConf.width = 30;
										columnConf.sortable = false;
										columnConf.renderer = this.renderIcon.createDelegate(this, [Genapp.util.htmlStringFormat(columns[i].label)], true);
										break;
									default:
										columnConf.xtype = 'gridcolumn';
										readerFieldsConf.type = 'auto';
										break;
									}
									newCM.push(columnConf);
									newRF.push(readerFieldsConf);
								}

								if (!this.hideGridDataEditButton) {
									newCM.push({
										dataIndex : 'rightTools',
										header : '',
										renderer : this.renderRightTools.createDelegate(this),
										sortable : false,
										fixed : true,
										menuDisabled : true,
										align : 'center',
										width : 30
									});
								}

								// Updates of the store reader metadata
								this.gridDSReader.updateMetadata({
									root : 'rows',
									fields : newRF,
									totalProperty : 'total'
								});

								// The grid panel must be rendered and activated
								// to resize correctly
								// the grid's view in proportion of the columns
								// number
								if (this.centerPanel.getActiveTab() instanceof Genapp.GeoPanel) {
									this.centerPanel.activate(this.gridPanel);
									// Updates of the column model
									this.gridPanel.getColumnModel().setConfig(newCM);
									this.centerPanel.activate(this.geoPanel);
								} else {
									// Updates of the column model
									this.gridPanel.getColumnModel().setConfig(newCM);
								}

								this.gridPanel.getView().reset();

								// Updates the rows
								Ext.Ajax.on('beforerequest', function(conn, options) {
									this.requestConn = conn;
								}, this, {
									single : true
								});
								this.gridPanel.getStore().load({
									params : {
										start : 0,
										limit : this.gridPageSize
									},
									callback : function() {
										this.requestConn = null;

										this.getResultsBBox();
										if (this.autoZoomOnResultsFeatures !== true) {
											// Display the results layer
											this.geoPanel.enableLayersAndLegends(this.geoPanel.layersActivation['request'], true, true);
										}

										// Collapse the panel only if the form
										// is valid
										this.collapseQueryPanel();
										this.collapseDetailsPanel();

										// Enable the top buttons
										if (!this.hideCsvExportButton) {
											this.csvExportButton.enable();
										}
										this.gridPanel.syncSize(); // Bug in
										// Ext 3.2.1
										// (The grid
										// bottom
										// tool bar
										// disappear)
									},
									scope : this
								});
							},
							failure : function(form, action) {
								if (action.result && action.result.errorMessage) {
									Ext.Msg.alert(this.alertErrorTitle, action.result.errorMessage);
								} else {
									Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
								}
								this.gridPanel.loadMask.hide();
								this.mapMask.hide();
							},
							scope : this
						});
					},

					/**
					 * Render an Icon for the data grid.
					 */
					renderIcon : function(value, metadata, record, rowIndex, colIndex, store, columnLabel) {
						if (!Ext.isEmpty(value)) {
							return '<img src="' + Genapp.base_url + '/js/genapp/resources/images/picture.png"'
							+ 'ext:qtitle="' + columnLabel + ' :"'
							+ 'ext:qwidth="' + this.tipImageDefaultWidth + '"'
							+ 'ext:qtip="'
							+ Genapp.util.htmlStringFormat('<img width="' + (this.tipImageDefaultWidth - 12) 
							+ '" src="' + Genapp.base_url + '/img/photos/' + value 
							+'" />') 
							+ '">';
						}
					},

					/**
					 * Collapse the Query Form Panel if not pinned.
					 */
					collapseQueryPanel : function() {
						if (!this.queryPanelPinned) {
							this.queryPanel.collapse();
						}
					},

					/**
					 * Collapse the Details Panel if not pinned
					 */
					collapseDetailsPanel : function() {
						if (!this.detailsPanelPinned) {
							this.detailsPanel.ownerCt.collapse();
						}
					},

					/**
					 * Updates the FormsPanel body
					 * 
					 * @param {Object}
					 *            requestParams The parameters for the ajax
					 *            request
					 * @param {Object}
					 *            apiParams The api parameters
					 * @param {Object}
					 *            criteriaValues The criteria values
					 */
					updateFormsPanel : function(requestParams, apiParams, criteriaValues) {
						this.formsPanel.removeAll(true);
						this.formsPanel.getUpdater().showLoading();
						Ext.Ajax.request({
							url : Genapp.ajax_query_url + 'ajaxgetqueryform',
							success : this.updateWestPanels.createDelegate(this, [ apiParams, criteriaValues ], true),
							method : 'POST',
							params : requestParams,
							scope : this
						});
					},

					/**
					 * Update the forms panel for a predefined request
					 * 
					 * @param {String}
					 *            requestName The request name
					 * @param {Object}
					 *            criteriaValues The criteria values
					 */
					updatePredefinedRequestFormsPanel : function(requestName, criteriaValues) {
						this.updateFormsPanel({
							requestName : requestName
						}, {
							'launchRequest' : this.launchRequestOnPredefinedRequestLoad,
							'collapseQueryPanel' : this.collapseQueryPanelOnPredefinedRequestLoad
						}, criteriaValues);
					},

					/**
					 * Update the forms panel for a datasetId
					 * 
					 * @param {String}
					 *            datasetId The dataset ID
					 */
					updateDatasetFormsPanel : function(datasetId, apiParams) {
						this.updateFormsPanel({
							datasetId : datasetId
						},apiParams);
					},

					/**
					 * Update the dataset panel tooltip
					 * 
					 * @param {Object}
                     *            datasetRecordData The data of the selected dataset record
					 */
					updateDatasetPanelToolTip : function(datasetRecordData){
					    if(!Ext.isEmpty(this.datasetPanelToolTip)){
    					    this.datasetPanelToolTip.destroy();// Remove the old Dom
					    }
                        this.datasetPanelToolTip = new Ext.ToolTip({
                            anchor: 'left',
                            target: this.datasetPanel.getEl(),
                            title: datasetRecordData.label,
                            html:datasetRecordData.definition,
                            showDelay: Ext.QuickTips.getQuickTip().showDelay,
                            dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                        });
					},

					/**
					 * Load a predefined request into the request panel
					 * 
					 * @param {Object}
					 *            request A object containing the predefined
					 *            request data
					 */
					loadRequest : function(request) {
						this.datasetComboBox.setValue(request.datasetId);
						this.updatePredefinedRequestFormsPanel(request.name, request.fieldValues);
					},

					/**
					 * Clears the grid
					 */
					clearGrid : function() {
						var gridDs = this.gridPanel.getStore();
						if (gridDs.getCount() !== 0) {
							// Reset the paging toolbar
							this.gridPanel.getBottomToolbar().reset();
						}
						if (this.gridPanel.rendered) {
							// Remove the column headers
							this.gridPanel.getColumnModel().setConfig({});
							// Remove the horizontal scroll bar if present
							this.gridPanel.getView().updateAllColumnWidths();// Bug
							// Ext
							// 3.0
							// Remove the emptyText message
							this.gridPanel.getView().reset();
						}
					},

					/**
					 * Export the data as a CSV file
					 * 
					 * @param {String}
					 *            actionName The name of the action to call
					 */
					exportCSV : function(actionName) {
						var launchCsvExport = function(buttonId, text, opt) {
							this.showMask(true);
							window.location = Genapp.ajax_query_url + actionName;
						};
						if (Ext.isIE && !this.hideCsvExportAlert) {
							Ext.Msg.show({
								title : this.csvExportAlertTitle,
								msg : this.csvExportAlertMsg,
								cls : 'genapp-query-center-panel-csv-export-alert',
								buttons : Ext.Msg.OK,
								fn : launchCsvExport,
								animEl : this.csvExportButton.getEl(),
								icon : Ext.MessageBox.INFO,
								scope : this
							});
							// The message is displayed only one time
							this.hideCsvExportAlert = true;
						} else {
							launchCsvExport.call(this);
						}
					},

					/**
					 * Print the map
					 * 
					 * @param {Ext.Button}
					 *            button The print map button
					 * @param {EventObject}
					 *            event The click event
					 */
					printMap : function(button, event) {
						// Get the BBOX
						var center = this.geoPanel.map.center, zoom = this.geoPanel.map.zoom, i;

						// Get the layers
						var activatedLayers = this.geoPanel.map.getLayersBy('visibility', true);
						var activatedLayersNames = '';
						for (i = 0; i < activatedLayers.length; i++) {
							currentLayer = activatedLayers[i];
							if (currentLayer.printable !== false &&
								currentLayer.visibility == true &&
								currentLayer.inRange == true) {
								activatedLayersNames += activatedLayers[i].name + ',';
							}
						}
						activatedLayersNames = activatedLayersNames.substr(0, activatedLayersNames.length - 1);

						Genapp.util.post(Genapp.base_url + 'map/printmap', {
							center : center,
							zoom : zoom,
							layers : activatedLayersNames
						});
					},

					/**
					 * Show the consultation page mask
					 * 
					 * @param {Boolean}
					 *            hideOnFocus True to hide the mask on window
					 *            focus
					 */
					showMask : function(hideOnFocus) {
						this.mask.show();
						if (hideOnFocus) {
							window.onfocus = (function() {
								this.mask.hide();
								window.onfocus = Ext.emptyFn;
							}).createDelegate(this);
						}
					},

					/**
					 * Return the pattern used to format a number.
					 * 
					 * @param {String}
					 *            decimalSeparator the decimal separator
					 *            (default to',')
					 * @param {Integer}
					 *            decimalPrecision the decimal precision
					 * @param {String}
					 *            groupingSymbol the grouping separator (absent
					 *            by default)
					 */
					numberPattern : function(decimalSeparator, decimalPrecision, groupingSymbol) {
						// Building the number format pattern for use by ExtJS
						// Ext.util.Format.number
						var pattern = [], i;
						pattern.push('0');
						if (groupingSymbol) {
							pattern.push(groupingSymbol + '000');
						}
						if (decimalPrecision) {
							pattern.push(decimalSeparator);
							for (i = 0; i < decimalPrecision; i++) {
								pattern.push('0');
							}
						}
						return pattern.join('');
					},

					/**
					 * Hide the consultation page mask
					 */
					hideMask : function() {
						this.mask.hide();
					},

					/**
					 * Add a vertical label to the collapsed panel
					 * 
					 * @param {Object}
					 *            the Ext.Panel
					 * @param {String}
					 *            the css class
					 * @hide
					 */
					addVerticalLabel : function(panel, cls) {
						panel.on('collapse', function(panel) {
							Ext.get(panel.id + '-xcollapsed').createChild({
								tag : "div",
								cls : cls
							});
						}, this, {
							single : true
						});
					},

					/**
					 * Launch a ajax request to get the java service status
					 * 
					 * @param {String}
					 *            serviceName The service name
					 * @param {String}
					 *            callback A callback function to call when the
					 *            status is equal to 'OK'
					 * @return {String} The status
					 */
					getStatus : function(serviceName, callback) {
						Ext.Ajax.request({
							url : Genapp.base_url + serviceName + '/ajax-get-status',
							success : function(rpse, options) {
								var response = Ext.decode(rpse.responseText), msg;
								if (Ext.isEmpty(response.success) || response.success === false) {
									this.hideMask();
									msg = 'An error occured during the status request.';
									if (!Ext.isEmpty(response.errorMsg)) {
										msg += ' ' + response.errorMsg;
									}
									Ext.Msg.alert('Error...', msg);
								} else {
									if (response.status === 'RUNNING') {
										this.getStatus.defer(2000, this, [ serviceName, callback ]);
									} else if (response.status === 'OK') {
										this.hideMask();
										callback.call(this);
									} else { // The service is done or an
										// error occured
										this.hideMask();
										msg = 'An error occured during the status request.';
										if (!Ext.isEmpty(response.errorMsg)) {
											msg += ' ' + response.errorMsg;
										}
										Ext.Msg.alert('Error...', msg);
									}
								}
							},
							failure : function() {
								this.hideMask();
								var msg = 'An error occured during the status request.';
								Ext.Msg.alert('Error...', msg);
							},
							scope : this
						});
					},

					/**
					 * Display the detail panel for a location.
					 * 
					 * Called when a location info event is received.
					 */
					getLocationInfo : function(result, mapId) {
						if (this.geoPanel.map.id == mapId) {
							if (Genapp.map.featureinfo_maxfeatures === 1) {
								this.openDetails(result.data[0][0], 'ajaxgetdetails');
							} else {
								this.openFeaturesInformationSelection(result);
							}
						}
					},

					/**
					 * Launch a ajax request to get the bounding box of the
					 * result features.
					 */
					getResultsBBox : function() {
						Ext.Ajax.request({
							url : Genapp.ajax_query_url + 'ajaxgetresultsbbox',
							success : function(rpse, options) {
								try {
									var response = Ext.decode(rpse.responseText);
									if (Ext.isEmpty(response.success) || response.success === false) {
										if (!Ext.isEmpty(response.errorMsg)) {
											throw (response.errorMsg);
										}
										throw ('');
									} else {
										if (!Ext.isEmpty(response.resultsbbox)) {
											this.geoPanel.resultsBBox = response.resultsbbox;
										} else {
											this.geoPanel.resultsBBox = null;
										}
										if (this.autoZoomOnResultsFeatures === true) {
											if (this.geoPanel.resultsBBox !== null) {
												this.geoPanel.zoomOnBBox(this.geoPanel.resultsBBox);
											}
											// Display the results layer
											this.geoPanel.enableLayersAndLegends(this.geoPanel.layersActivation['request'], true, true);
										}
									}
								} catch (err) {
									var msg = 'An error occured during the bounding box request.';
									if (!Ext.isEmpty(err)) {
										msg += ' ' + err;
									}
									Ext.Msg.alert('Error...', msg);
								}
							},
							failure : function(response, options) {
								var msg = 'An error occured during the bounding box request. Status code : ' + response.status;
								Ext.Msg.alert('Error...', msg);
							},
							scope : this
						});
					}
				});
Ext.reg('consultationpage', Genapp.ConsultationPanel);/**
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
 * The class of the details panel.
 * This class is required because the panel class
 * can't be closed but the panel extended class can.
 * 
 * @class Genapp.DetailsPanel
 * @extends Ext.Panel
 * @constructor Create a new DetailsPanel
 * @param {Object} config The config object
 */
Genapp.DetailsPanel = Ext.extend(Ext.Panel, {

    /**
     * Internationalization.
     */ 
    editLinkButtonTitle : 'Edit this data',
    editLinkButtonTip : 'Edit this data in the edition page.',
    /**
     * @cfg {Number} headerWidth
     * The tab header width. (Default to 60)
     */
    headerWidth:60,
    /**
     * @cfg {Boolean} closable
     * Panels themselves do not directly support being closed, but some Panel subclasses do (like
     * {@link Ext.Window}) or a Panel Class within an {@link Ext.TabPanel}.  Specify true
     * to enable closing in such situations. Defaults to true.
     */
    closable: true,
    /**
     * @cfg {Boolean} autoScroll
     * true to use overflow:'auto' on the panel's body element and show scroll bars automatically when
     * necessary, false to clip any overflowing content (defaults to true).
     */
    autoScroll:true,
    /**
     * @cfg {String} dataUrl
     * The url to get the details.
     */
    dataUrl:null,
    /**
     * @cfg {String} pdfUrl
     * The url to get the pdf.
     */
    pdfUrl: 'pdfexport',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp-query-details-panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-query-details-panel',
    /**
     * @cfg {String} hideSeeChildrenButton
     * True to hide the see children button (defaults to <tt>false</tt>)
     */
    hideSeeChildrenButton: false,
    /**
     * @cfg {String} seeChildrenButtonTip
     * The see Children Button Tip (defaults to <tt>'Display the children of the data into the grid details panel.'</tt>)
     */
    seeChildrenButtonTip: 'Display the children of the data into the grid details panel.',
    /**
     * @cfg {String} seeChildrenButtonTitleSingular
     * The see Children Button Title Singular (defaults to <tt>'See the only child'</tt>)
     */
    seeChildrenButtonTitleSingular: 'See the only child',
    /**
     * @cfg {String} seeChildrenButtonTitlePlural
     * The see Children Button Title Plural (defaults to <tt>'See the children'</tt>)
     */
    seeChildrenButtonTitlePlural: 'See the children',
    /**
     * @cfg {Number} tipDefaultWidth
     * The tip Default Width. (Default to 300)
     */
    tipDefaultWidth: 300,
    /**
     * @cfg {Number} titleCharsMaxLength
     * The title Chars Max Length. (Default to 8)
     */
    titleCharsMaxLength : 8,
    /**
     * @cfg {String} loadingMsg
     * The loading message (defaults to <tt>'Loading...'</tt>)
     */
    loadingMsg: 'Loading...',

    // private
    initComponent : function() {
        this.title = '<div style="width:'+ this.headerWidth + 'px;">'+this.loadingMsg+'</div>';
        this.on('render', this.updateDetails, this);
        this.itemId = this.rowId;
        /**
         * @cfg {Ext.XTemplate} tpl
         * A {@link Ext.XTemplate} used to setup the details panel body.
         */
        

       
        this.tpl = new Ext.XTemplate(
            '<tpl style="display:block" for="maps1.urls">',
            	'<img style="display:block; position:absolute; left:1px; top:1px" title="title" src="{url}">',
            '</tpl>',
            '<tpl for="maps2.urls">',
            	'<img style="display:block; position:absolute; left:1px; top:311px" title="title" src="{url}">',
            '</tpl>',
			'<legends style="display:block; position:absolute; left:1px; top:621px">',
				'<tpl for="formats">',
					'<fieldset>',
						'<legend>',
							'<div class="genapp-query-details-panel-fieldset-title">{title}</div>',
							'<tpl if="!'+ this.hideSeeChildrenButton +' && children_count != 0">',
								'<div class="genapp-query-details-panel-see-children" ',
									'onclick="Genapp.cardPanel.consultationPage.displayChildren(\'{id}\');"',
									'ext:qtitle="{[(values.children_count == 1) ? "'+ this.seeChildrenButtonTitleSingular +'" : "'+this.seeChildrenButtonTitlePlural+' (" + values.children_count + ")"]}" ',
									'ext:qwidth="' + this.tipDefaultWidth + '" ',
									'ext:qtip="' + this.seeChildrenButtonTip + '">&nbsp;',
								'</div>',
							'</tpl>',
							'<tpl if="editURL">',
								'<div class="genapp-query-details-panel-edit-link" ',
									'onclick="window.location.href=\'' + Genapp.base_url + 'dataedition/show-edit-data/{editURL}\'"',
									'ext:qtitle="' + this.editLinkButtonTitle + '"',
									'ext:qwidth="' + this.tipDefaultWidth + '" ',
									'ext:qtip="' + this.editLinkButtonTip + '">&nbsp;',
								'</div>',
							'</tpl>',
						'</legend>',
						'<div class="genapp-query-details-panel-fieldset-body">',
							'<tpl for="fields">',
								'<tpl if="type != \'IMAGE\'">',
									'<p><b>{label} :</b> {[(Ext.isEmpty(values.value) || (Ext.isString(values.value) && Ext.isEmpty(values.value.trim()))) ? "-" : values.value]}</p>',
								'</tpl>',
								'<tpl if="type == \'IMAGE\'">', 
									'{[(Ext.isEmpty(values.value) || (Ext.isString(values.value) && Ext.isEmpty(values.value.trim()))) ? \'\' : \'<img class=\"genapp-query-details-image-field\" title=\"\' + values.label + \'\" src=\"' + Genapp.base_url + '/img/photos/\' + values.value + \'\">\']}',
								'</tpl>',
							'</tpl>',
						'</div>',
					'</fieldset>',
				'</tpl>',
            '</legends>',
            {
                compiled: true,      // compile immediately
                disableFormats: true // reduce apply time since no formatting
            }
        );

        Genapp.DetailsPanel.superclass.initComponent.call(this);
    },

    /**
     * Updates the Details panel body
     * 
     * @param {Ext.Panel} panel The details panel
     */
    
    updateDetails : function(panel) {
        this.getUpdater().showLoading();
        Ext.Ajax.request({
            url : Genapp.ajax_query_url + this.dataUrl,
            success :function(response, options){
                var details = Ext.decode(response.responseText);
                
                
                var title = details.title;
                if(details.title.length > this.titleCharsMaxLength){
                    title = details.title.substring(0,this.titleCharsMaxLength) + '...';
                }
                this.setTitle('<div style="width:'+ this.headerWidth + 'px;"'
                    +' ext:qtip="' + details.title + '"'
                    +'>'+title+'</div>');
                this.tpl.overwrite(this.body, details);
            },
            method: 'POST',
            params : {id : this.rowId},
            scope :this
        });
    },

    /**
     * Export the details panel as PDF
     */
    exportAsPDF : function(){
        document.location.href = Genapp.ajax_query_url + this.pdfUrl + '?id=' + this.rowId;
    }
});/**
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
 * A DocSearchPage.
 * 
 * @class Genapp.DocSearchPage
 * @extends Ext.Panel
 * @constructor Create a new DocSearchPage 
 * @param {Object} config The config object
 * @xtype docsearchpage
 */
Genapp.DocSearchPage = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} title
     * The title text to be used as innerHTML (html tags are accepted) to display in the panel
     * <code>{@link #header}</code> (defaults to ''). When a <code>title</code> is specified the
     * <code>{@link #header}</code> element will automatically be created and displayed unless
     * {@link #header} is explicitly set to <code>false</code>.  If you do not want to specify a
     * <code>title</code> at config time, but you may want one later, you must either specify a non-empty
     * <code>title</code> (a blank space ' ' will do) or <code>header:true</code> so that the container
     * element will get created.
     * Default to 'Predefined Request'.
     */
    title: 'Documents',
    /**
     * @cfg {Boolean} frame
     * <code>false</code> by default to render with plain 1px square borders. <code>true</code> to render with
     * 9 elements, complete with custom rounded corners (also see {@link Ext.Element#boxWrap}).
     * @hide
     */
    frame:true,
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'border'.
     */
    layout :'border',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp_consultation_panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-doc-search-page',
    /**
     * @cfg {Boolean} border
     * True to display the borders of the panel's body element, false to hide them (defaults to false).  By default,
     * the border is a 2px wide inset border, but this can be further altered by setting {@link #bodyBorder} to false.
     */
    border :false,
    /**
     * @cfg {String} id
     * <p>The <b>unique</b> id of this component (defaults to an {@link #getId auto-assigned id}).
     * You should assign an id if you need to be able to access the component later and you do
     * not have an object reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).</p>
     * <p>Note that this id will also be used as the element id for the containing HTML element
     * that is rendered to the page for this component. This allows you to write id-based CSS
     * rules to style the specific instance of this component uniquely, and also to select
     * sub-elements using this component's id as the parent.</p>
     * <p><b>Note</b>: to avoid complications imposed by a unique <tt>id</tt> also see
     * <code>{@link #itemId}</code> and <code>{@link #ref}</code>.</p>
     * <p><b>Note</b>: to access the container of an item see <code>{@link #ownerCt}</code>.</p>
     */
    id:'doc_search_page',
    /**
     * @cfg {String} ref
     * <p>A path specification, relative to the Component's <code>{@link #ownerCt}</code>
     * specifying into which ancestor Container to place a named reference to this Component.</p>
     * <p>The ancestor axis can be traversed by using '/' characters in the path.
     * For example, to put a reference to a Toolbar Button into <i>the Panel which owns the Toolbar</i>:</p><pre><code>
var myGrid = new Ext.grid.EditorGridPanel({
title: 'My EditorGridPanel',
store: myStore,
colModel: myColModel,
tbar: [{
    text: 'Save',
    handler: saveChanges,
    disabled: true,
    ref: '../saveButton'
}],
listeners: {
    afteredit: function() {
//      The button reference is in the GridPanel
        myGrid.saveButton.enable();
    }
}
});
</code></pre>
     * <p>In the code above, if the <code>ref</code> had been <code>'saveButton'</code>
     * the reference would have been placed into the Toolbar. Each '/' in the <code>ref</code>
     * moves up one level from the Component's <code>{@link #ownerCt}</code>.</p>
     * <p>Also see the <code>{@link #added}</code> and <code>{@link #removed}</code> events.</p>
     */
    ref:'docSearchPage',
    /**
     * @cfg {String} alertRequestFailedMsg The alert Request
     *      Failed Msg (defaults to
     *      <tt>'Sorry, the request failed...'</tt>)
     */
    alertRequestFailedMsg : 'Sorry, the request failed...',
    indexKey:'pdfIndex',
    centerPanelTitle: 'Document',

    // private
    initComponent : function() {

        // West Panel
        this.requestPanel = new Genapp.DocSearchRequestPanel({
            indexKey:this.indexKey,
            listeners:{
                'requestResponse':function(hits){
                    this.addResultPanel(hits);
                },
                scope: this
            }
        });

        this.westPanel = new Ext.Panel({
            region:'west',
            layout:'accordion',
            width:'400px',
            items:[
                this.requestPanel
            ]
        });

        // Center Panel
        this.pdf = new Genapp.PDFComponent({
            xtype: 'pdf',
            url: 'pdf'
        });

        this.centerPanel = new Ext.Panel({
            title: this.centerPanelTitle,
            region: 'center',
            frame: true,
            margins:{
                top: 0,
                right: 0,
                bottom: 0,
                left: 5
            },
            items: this.pdf
        });

        if (!this.items) {
            this.items = [this.westPanel, this.centerPanel];
        }

        Genapp.ConsultationPanel.superclass.initComponent.call(this);
    },

    addResultPanel: function(hits) {
        if(!Ext.isEmpty(this.resultPanel)){
            this.resultPanel.destroy();
        }
        this.resultPanel = new Genapp.DocSearchResultPanel({
            'hits': hits,
            'listeners':{
                'rowselect': function(data){
                    this.pdf.reset();
                },
                'pdfselect': function(data){
                    this.pdf.updateUrl(Genapp.base_url + data.url);
                },
                scope:this
            }
        });
        this.westPanel.add(this.resultPanel);
        this.westPanel.doLayout();
        this.resultPanel.expand();
    }
});
Ext.reg('docsearchpage', Genapp.DocSearchPage);/**
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
 * A DocSearchRequestPanel.
 * 
 * @class Genapp.DocSearchRequestPanel
 * @extends Ext.Panel
 * @constructor Create a new DocSearchRequestPanel 
 * @param {Object} config The config object
 * @xtype docsearchrequestpanel
 */
Genapp.DocSearchRequestPanel = Ext.extend(Ext.Panel, {

    title:'Filter(s)',
    frame:true,
    textFieldLabel: 'Text search in the document body',
    alertErrorTitle: 'An error occured',
    alertRequestFailedMsg : 'Sorry, the request failed...',
    resetButtonText: 'Reset the filters',
    filterButtonText: 'Filter',
    fieldLabels:{},

    // private
    initComponent : function() {

        this.getMetadataFields();

        if (!this.items) {
            this.items = [{
                xtype: 'form',
                ref:'formPanel',
                labelWidth: 130, // label settings here cascade unless overridden
                bodyStyle:'padding:5px 10px 0',
                defaults: {width: 230},
                defaultType: 'textfield',
                items:[{
                    xtype: 'textfield',
                    name: 'TEXT',
                    fieldLabel: this.textFieldLabel,
                    enableKeyEvents: true,
                    listeners:{
                        'keydown':function(cmp, event){
                            if(event.keyCode === event.ENTER){
                                this.launchFilteredRequest();
                            }
                        },
                        scope:this
                    }
                },{
                    xtype: 'hidden',
                    name: 'INDEX_KEY',
                    value: this.indexKey
                }],
                buttons:[{
                    xtype: 'button',
                    text: this.resetButtonText,
                    handler:function(){
                        this.formPanel.form.reset();
                    },
                    scope:this
                },{
                    xtype: 'button',
                    text: this.filterButtonText,
                    handler:this.launchFilteredRequest,
                    scope:this
                }]
            }];
        }

        Genapp.DocSearchRequestPanel.superclass.initComponent.call(this);
    },

    launchFilteredRequest: function(){
        this.formPanel.getForm().submit({
            url : Genapp.base_url + 'indexedfilequery/search',
            timeout : 480000,
            success : function(form, action) {
                this.fireEvent('requestResponse',action.result.hits);
            },
            failure : function(form, action) {
                if (action.result && action.result.success == false) {
                    // Two case possibles: errorMessage or errors (errors fields message(s))
                    if(action.result.errorMessage){
                        Ext.Msg.alert(this.alertErrorTitle, action.result.errorMessage);
                    }
                } else {
                    Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
                }
            },
            scope : this
        });
    },

    addMetadataFields: function(fields){
        var i, j, field, data;
        for(i = 0; i < fields.length; i++ ){
            field = fields[i];
            // Format the data of the fields for the reader
            data = [];
            for(j = 0; j < field.data.length; j++){
                data.push([field.data[j]]);
            }
            this.formPanel.insert(i, {
                xtype: 'combo',
                name: field.name,
                fieldLabel: this.getFieldLabel(field.label),
                mode: 'local',
                store: new Ext.data.ArrayStore({
                    id: 0,
                    fields: [
                        'code'
                    ],
                    data: data
                }),
                valueField: 'code',
                displayField: 'code',
                enableKeyEvents: true,
                listeners:{
                    'keydown':function(cmp, event){
                        if(event.keyCode === event.ENTER){
                            this.launchFilteredRequest();
                        }
                    },
                    scope:this
                }
            });
        }
        this.formPanel.doLayout();
    },

    // Request of the metadata information
    getMetadataFields: function(){
        Ext.Ajax.request({
            url: Genapp.base_url + 'indexedfilequery/getmetadatafields',
            // The method and the disableCaching are set to have a browser catching
            method: 'GET',
            disableCaching: false,
            params: { 'INDEX_KEY': this.indexKey },
            timeout: 480000,
            success: function(response, opts) {
                fields = Ext.decode(response.responseText);
                this.addMetadataFields(fields);
            },
            failure: function(response, opts) {
                    Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
            },
            scope: this
         });
    },

    getFieldLabel: function(meta){
        if(!Ext.isEmpty(this.fieldLabels[meta])){
            return this.fieldLabels[meta];
        }
        return meta;
    }
});
Ext.reg('docsearchrequestpanel', Genapp.DocSearchRequestPanel);/**
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
 * A DocSearchResultPanel.
 * 
 * @class Genapp.DocSearchResultPanel
 * @extends Ext.Panel
 * @constructor Create a new DocSearchResultPanel 
 * @param {Object} config The config object
 * @xtype docsearchresultpanel
 */
Genapp.DocSearchResultPanel = Ext.extend(Ext.Panel, {

    title:'Result(s)',
    columnLabels: {
        'id' : 'Identifier',
        'score' : 'Score',
        'url' : 'Url'
    },
    frame:true,
    layout:'border',
    docSlipPanelHeight:150,

    // private
    initComponent : function() {

        this.fields = [];
        this.columns = [];
        this.template = '<div class="doc-search-page-doc-slip-panel-div">';
        var meta;
        for (meta in this.hits[0]) {
            if (typeof this.hits[0][meta] !== 'function') {
                this.fields.push(meta);
                var colCfg = {'header': this.getColumnLabel(meta), 'dataIndex':meta};
                if(meta == 'id' || meta == 'score' || meta == 'url'){
                    colCfg['hidden'] = true;
                }
                this.columns.push(colCfg);
                if(meta != 'id' && meta != 'score' && meta != 'url'){
                    this.template += '<p><b>'+this.getColumnLabel(meta)+' :</b> {'+meta+'}</p>';
                }
            }
        }
        this.template += '</div>';

        this.store = new Ext.data.JsonStore({
            autoDestroy: true,
            autoLoad:true,
            fields: this.fields,
            data: this.hits
        });

        this.gridPanel = new Ext.grid.GridPanel({
            region:'center',
            store : this.store,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    width: 120,
                    sortable: true
                },
                columns: this.columns
            }),
            sm: new Ext.grid.RowSelectionModel({
                singleSelect:true,
                listeners:{
                    'rowselect':function(sm, rowIdx, r){
                        this.docSlipPanel.update(r.data);
                        this.fireEvent('rowselect',r.data);
                    },
                    scope:this
                }
            }),
            listeners:{
                'keydown':function(event){
                    if(event.keyCode === event.ENTER){
                        this.onEnter();
                    }
                },
                'rowdblclick':function(grid, rowIndex, event){
                    this.onEnter();
                },
                'viewready':function(grid){
                    grid.getSelectionModel().selectFirstRow();
                    grid.getView().focusRow(0);
                },
                scope:this
            }
        });

        this.docSlipPanel = new Ext.form.FieldSet({
            region:'south',
            height:this.docSlipPanelHeight,
            tpl:new Ext.Template(
                    this.template,
                {
                    compiled: true,      // compile immediately
                    disableFormats: true // See Notes below.
                }
            )
        });

        this.items = [
            this.gridPanel,
            this.docSlipPanel
        ];

        Genapp.DocSearchResultPanel.superclass.initComponent.call(this);
    },

    onEnter: function() {
        var sm = this.gridPanel.getSelectionModel();
        var sels = sm.getSelections();
        this.fireEvent('pdfselect',sels[0].data);
    },

    getColumnLabel: function(meta) {
        if(!Ext.isEmpty(this.columnLabels[meta])){
            return this.columnLabels[meta];
        }
        return meta;
    }
});
Ext.reg('docsearchresultpanel', Genapp.DocSearchResultPanel);/**
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



// Override the BasicForm to add a "setNotDirty" property
Ext.override(Ext.form.BasicForm, {
	
	// erase the original value with the new value to clean the state.
	setNotDirty: function() {		
		this.items.each(function(f) {
		   if(!this.disabled && this.rendered) {
			   f.originalValue = f.getValue();
		   }
	    });
    }
});



/**
 * An EditionPanel correspond to the complete page for editing/inserting a table
 * row.
 * 
 * @class Genapp.EditionPanel
 * @extends Ext.Panel
 * @constructor Create a new Edition Panel
 * @param {Object}
 *            config The config object
 * @xtype editionpanel
 */
Genapp.EditionPanel = Ext.extend(Ext.Panel, {

	/**
	 * Internationalization.
	 */
	geoMapWindowTitle : 'Draw the localisation',
	unsavedChangesMessage : 'You have unsaved changes',

	/**
	 * @cfg {String} title The title text to be used as innerHTML (html tags are
	 *      accepted) to display in the panel <code>{@link #header}</code>
	 *      (defaults to ''). When a <code>title</code> is specified the
	 *      <code>{@link #header}</code> element will automatically be created
	 *      and displayed unless {@link #header} is explicitly set to
	 *      <code>false</code>. If you do not want to specify a
	 *      <code>title</code> at config time, but you may want one later, you
	 *      must either specify a non-empty <code>title</code> (a blank space ' '
	 *      will do) or <code>header:true</code> so that the container element
	 *      will get created.
	 */
	title : 'Edition',

	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'genapp_edition_panel'). This can
	 *      be useful for adding customized styles to the component or any of
	 *      its children using standard CSS rules.
	 */
	cls : 'genapp_edition_panel',

	/**
	 * @cfg {String} id
	 *      <p>
	 *      The <b>unique</b> id of this component (defaults to an
	 *      {@link #getId auto-assigned id}). You should assign an id if you
	 *      need to be able to access the component later and you do not have an
	 *      object reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).
	 *      </p>
	 *      <p>
	 *      Note that this id will also be used as the element id for the
	 *      containing HTML element that is rendered to the page for this
	 *      component. This allows you to write id-based CSS rules to style the
	 *      specific instance of this component uniquely, and also to select
	 *      sub-elements using this component's id as the parent.
	 *      </p>
	 *      <p>
	 *      <b>Note</b>: to avoid complications imposed by a unique <tt>id</tt>
	 *      also see <code>{@link #itemId}</code> and
	 *      <code>{@link #ref}</code>.
	 *      </p>
	 *      <p>
	 *      <b>Note</b>: to access the container of an item see
	 *      <code>{@link #ownerCt}</code>.
	 *      </p>
	 */
	id : 'edition_panel',

	/**
	 * @cfg {String} dataId Unique identifier of the data being edited.
	 */
	dataId : '',

	/**
	 * @cfg {String} ref
	 *      <p>
	 *      A path specification, relative to the Component's
	 *      <code>{@link #ownerCt}</code> specifying into which ancestor
	 *      Container to place a named reference to this Component.
	 *      </p>
	 *      <p>
	 *      Also see the <code>{@link #added}</code> and
	 *      <code>{@link #removed}</code> events.
	 *      </p>
	 */
	ref : 'editionPage',
	padding : 20,
	autoScroll : true,
	
	fieldSetWidth : 700,
	fieldWidth : 450,

	/**
	 * @cfg {String} parentsFSTitle The parents FieldSet Title (defaults to
	 *      'Parents Summary').
	 */
	parentsFSTitle : 'Parents Summary',
	/**
	 * @cfg {String} dataEditFSDeleteButtonText The data Edit FieldSet Delete
	 *      Button Text (defaults to 'Delete').
	 */
	dataEditFSDeleteButtonText : 'Delete',
	/**
	 * @cfg {String} dataEditFSDeleteButtonTooltip The data Edit FieldSet Delete
	 *      Button Tooltip (defaults to 'Delete the data (Disabled if exist
	 *      children)').
	 */
	dataEditFSDeleteButtonTooltip : 'Delete the data',
	/**
	 * @cfg {String} dataEditFSDeleteButtonConfirm The data Edit FieldSet Delete
	 *      Button Confirmation message.
	 */
	dataEditFSDeleteButtonConfirm : 'Do you really want to delete this data ?',
	/**
	 * @cfg {String} dataEditFSDeleteButtonTooltip The data Edit FieldSet Delete
	 *      Button Tooltip (defaults to 'Delete the data (Disabled if exist
	 *      children)').
	 */
	dataEditFSDeleteButtonDisabledTooltip : 'Data cannot be deleted (children exit)',
	/**
	 * @cfg {String} dataEditFSValidateButtonText The data Edit FieldSet
	 *      Validate Button Text (defaults to 'Validate').
	 */
	dataEditFSValidateButtonText : 'Validate',
	/**
	 * @cfg {String} dataEditFSValidateButtonTooltip The data Edit FieldSet
	 *      Validate Button Tooltip (defaults to 'Save changes').
	 */
	dataEditFSValidateButtonTooltip : 'Save changes',
	/**
	 * @cfg {String} dataEditFSSavingMessage.
	 */
	dataEditFSSavingMessage : 'Saving...',
	/**
	 * @cfg {String} dataEditFSSavingMessage.
	 */
	dataEditFSLoadingMessage : 'Loading...',
	/**
	 * @cfg {String} dataEditFSValidateButtonDisabledTooltip The data Edit
	 *      FieldSet
	 */
	dataEditFSValidateButtonDisabledTooltip : 'Data cannot be edited (not enought rights)',
	/**
	 * @cfg {String} childrenFSTitle The children FieldSet Title (defaults to
	 *      'Children Summary').
	 */
	childrenFSTitle : 'Children Summary',
	/**
	 * @cfg {String} childrenFSAddNewChildButtonText The children FieldSet Add
	 *      New Child Button Text (defaults to 'New child').
	 */
	childrenFSAddNewChildButtonText : 'Add',
	/**
	 * @cfg {String} childrenFSAddNewChildButtonTooltip The children FieldSet
	 *      Add New Child Button Tooltip (defaults to 'Add a new child').
	 */
	childrenFSAddNewChildButtonTooltip : 'Add a new child',
	/**
	 * @cfg {String} contentTitleAddPrefix The content Title Add Prefix
	 *      (defaults to 'Add').
	 */
	contentTitleAddPrefix : 'Add',
	/**
	 * @cfg {String} contentTitleEditPrefix The content Title Edit Prefix
	 *      (defaults to 'Edit').
	 */
	contentTitleEditPrefix : 'Edit',
	/**
	 * @cfg {String} tooltipEditPrefix The tooltip Edit Prefix (defaults to
	 *      'Edit the').
	 */
	tipEditPrefix : 'Edit the',
	/**
	 * @cfg {Numeric} tipDefaultWidth The tip Default Width (defaults to '350').
	 */
	tipDefaultWidth : 350,
	/**
	 * @cfg {String} addMode The constant for the add mode (defaults to 'ADD').
	 */
	addMode : 'ADD',
	/**
	 * @cfg {String} editMode The constant for the edit mode (defaults to
	 *      'EDIT').
	 */
	editMode : 'EDIT',

	layout : 'column',

	/**
	 * @cfg {Ext.FormPanel} the form panel.
	 */
	dataEditForm : null,
	/**
	 * @cfg {Ext.form.FieldSet} the fieldset (that contains the form).
	 */
	dataEditFS : null,
	/**
	 * @cfg {Ext.Button} the delete button.
	 */
	deleteButton : null,
	/**
	 * @cfg {Ext.Button} the validate button.
	 */
	validateButton : null,

	/**
	 * @cfg {Ext.LoadMask} Loading mask
	 */
	loadMask : null,

	// private
	initComponent : function() {

		// Header
		var contentTitlePrefix = '';
		var getFormURL = '';
		switch (this.mode) {
		case this.addMode:
			contentTitlePrefix = this.contentTitleAddPrefix + '&nbsp';
			getFormURL = Genapp.base_url + 'dataedition/ajax-get-add-form/' + this.dataId;
			break;
		case this.editMode:
			contentTitlePrefix = this.contentTitleEditPrefix + '&nbsp';
			getFormURL = Genapp.base_url + 'dataedition/ajax-get-edit-form/' + this.dataId;
			break;
		}

		/**
		 * The form fields Data Store.
		 * 
		 * @property criteriaDS
		 * @type Ext.data.JsonStore
		 */
		this.formDS = new Ext.data.JsonStore({
			url : getFormURL,
			method : 'POST',
			root : 'data',
			autoLoad : true,
			fields : [ {
				name : 'name',
				mapping : 'name'
			}, {
				name : 'data',
				mapping : 'data'
			}, {
				name : 'format',
				mapping : 'format'
			}, {
				name : 'label',
				mapping : 'label'
			}, {
				name : 'inputType',
				mapping : 'inputType'
			}, {
				name : 'unit',
				mapping : 'unit'
			}, {
				name : 'type',
				mapping : 'type'
			}, {
				name : 'subtype',
				mapping : 'subtype'
			}, {
				name : 'definition',
				mapping : 'definition'
			}, {
				name : 'decimals',
				mapping : 'decimals'
			}, {
				name : 'value',
				mapping : 'value'
			}, // the current value
			{
				name : 'valueLabel',
				mapping : 'valueLabel'
			}, // the label of the current value
			{
				name : 'editable',
				mapping : 'editable'
			}, // is the field editable?
			{
				name : 'insertable',
				mapping : 'insertable'
			}, // is the field insertable?
			{
				name : 'required',
				mapping : 'required'
			}, // is the field required?
			{
				name : 'params',
				mapping : 'params'
			} // reserved for min/max or list of codes
			],
			idProperty : 'name',
			listeners : {
				'load' : this.buildFieldForm,
				scope : this
			},
			waitMsg : 'Loading...'
		});

		var centerPanelItems = [];

		this.headerPanel = new Ext.BoxComponent({
			html : '<h1>' + contentTitlePrefix + this.dataTitle.toLowerCase() + '<h1>'
		});
		centerPanelItems.push(this.headerPanel);

		// Message
		this.messagePanel = new Ext.BoxComponent({
			html : this.message,
			cls : 'message'
		});
		centerPanelItems.push(this.messagePanel);

		// Parents
		if (!Ext.isEmpty(this.parentsLinks)) {
			this.parentsFS = new Ext.form.FieldSet({
				// title : '&nbsp;' + this.parentsFSTitle + '&nbsp;',
				html : this.getEditLinks(this.parentsLinks)
			});
			centerPanelItems.push(this.parentsFS);
		}

		// Delete Button
		this.deleteButton = new Ext.Button({
			text : this.dataEditFSDeleteButtonText,
			disabled : this.disableDeleteButton,
			tooltip : this.dataEditFSDeleteButtonTooltip,
			handler : this.askDataDeletion,
			scope : this
		});
		if (this.disableDeleteButton) {
			this.deleteButton.tooltip = this.dataEditFSDeleteButtonDisabledTooltip;
		}

		// Validate Button
		this.validateButton = new Ext.Button({
			text : this.dataEditFSValidateButtonText,
			tooltip : this.dataEditFSValidateButtonTooltip,
			handler : this.editData,
			formBind : true, // The button is desactivated if the form is not
			// valid
			scope : this
		});

		if (this.mode == "EDIT") {
			var buttons = [ this.deleteButton, this.validateButton ];
		} else {
			var buttons = [ this.validateButton ];
		}

		// Data
		this.dataEditForm = new Ext.FormPanel({
			monitorValid : true,
			border : false,
			trackResetOnLoad : true,
			url : Genapp.base_url + 'dataedition/ajax-validate-edit-data',
			labelWidth : 200,
			defaults : {
				msgTarget : 'side',
				width : 250
			},
			buttonAlign : 'center',
			buttons : buttons
		});

		// Loading mask
		this.loadMask = new Ext.LoadMask(Ext.getBody(), {
			msg : this.dataEditFSLoadingMessage
		});
		this.loadMask.show();

		this.dataEditFS = new Ext.form.FieldSet({
			title : '&nbsp;' + this.dataTitle + '&nbsp;',
			items : this.dataEditForm
		});
		centerPanelItems.push(this.dataEditFS);

		// Children
		if (this.mode == "EDIT") {
			if (!Ext.isEmpty(this.childrenConfigOptions)) {
				var childrenItems = [];
				for ( var i in this.childrenConfigOptions) {
					if (typeof this.childrenConfigOptions[i] !== 'function') {
						var cCO = this.childrenConfigOptions[i];
						// title
						cCO['title'] = '&nbsp;' + cCO['title'] + '&nbsp;';

						// html
						if (Ext.isEmpty(cCO['html'])) {
							cCO['html'] = this.getEditLinks(cCO['childrenLinks']);
							delete cCO['childrenLinks'];
						}

						// buttons
						cCO['buttons'] = [];
						cCO['buttons'][0] = {
							text : this.childrenFSAddNewChildButtonText,
							tooltip : this.childrenFSAddNewChildButtonTooltip,
							handler : (function(location) {
								document.location = location;
							}).createCallback(cCO['AddChildURL']),
							scope : this
						};
						childrenItems.push(new Ext.form.FieldSet(cCO));
					}
				}
				this.childrenFS = new Ext.form.FieldSet({
					// title : '&nbsp;' + this.childrenFSTitle + '&nbsp;',
					items : childrenItems,
					cls : 'columnLabelColor'
				});
				centerPanelItems.push(this.childrenFS);
			}
		}

		this.items = [ {
			xtype : 'box',
			html : '&nbsp;',
			columnWidth : 0.5,
			border : false
		}, {
			items : centerPanelItems,
			width : this.fieldSetWidth,
			border : false,
			defaults : {
				width : this.fieldSetWidth
			}
		}, {
			xtype : 'box',
			html : '&nbsp;',
			columnWidth : 0.5,
			border : false
		} ];
		
		
		// Detect the closing of the form and check is dirty
	    Ext.EventManager.addListener(window, 'beforeunload', this.onBeforeUnload, this, {
            normalized:false //we need this for firefox
        });    
    

		Genapp.EditionPanel.superclass.initComponent.call(this);
	},

	/**
	 * Add the form items to the field form.
	 * 
	 * @param {Ext.data.Record}
	 *            records The records
	 */
	buildFieldForm : function(store, records) {

		var dataProvider = '';

		// Transform the JSON to an array of Form Field objects
		var formItems = [];
		for ( var i = 0; i < records.length; i++) {
			var item = this.getFieldConfig(records[i].data, true);
			formItems.push(item);

			if (item.name.indexOf('PROVIDER_ID') !== -1) { // detect the
				// provider id
				dataProvider = item.value;
			}
		}

		// Add a hidden field for the mode (ADD or EDIT)
		modeItem = {
			xtype : 'hidden',
			name : 'MODE',
			hiddenName : 'MODE',
			value : this.mode
		};
		formItems.push(modeItem);

		// Add the fields to the Form Panel
		this.dataEditForm.add(formItems);

		// Check the rights on the data for the validate button
		if (this.checkEditionRights) {

			// Look for the provider of the data
			if (Genapp.userProviderId !== dataProvider) {
				this.validateButton.disable();
				this.validateButton.setTooltip(this.dataEditFSValidateButtonDisabledTooltip);
			}
		}

		this.loadMask.hide();

		// Redo the layout
		this.dataEditForm.doLayout();
	},

	/**
	 * Construct a FieldForm from the record
	 * 
	 * @param {Ext.data.Record}
	 *            record The criteria combobox record to add
	 * @param {Boolean}
	 *            hideBin True to hide the bin
	 * @return a Form Field
	 * @hide
	 */
	getFieldConfig : function(record, hideBin) {
		var field = {};
		field.name = record.name;

		if ((this.mode == "EDIT" && !Ext.isEmpty(record.editable) && record.editable !== "1")
				|| (this.mode == "ADD" && !Ext.isEmpty(record.insertable) && record.insertable !== "1")) {
			field.xtype = 'hidden';
		} else {

			// Set the CSS for the field
			field.itemCls = 'trigger-field columnLabelColor';

			// Creates the ext field config
			switch (record.inputType) {
			case 'SELECT':
				// The input type SELECT correspond to a data type CODE or ARRAY

				if (record.type == 'ARRAY') {
					field.xtype = 'superboxselect';
					field.stackItems = true;
					field.hiddenName = field.name + '[]';
					field.allowAddNewData = true;
					field.forceFormValue = false;
					field.hideClearButton = true;
					field.removeValuesFromStore = false; // pb de perf avec
					// les communes
				} else {
					field.xtype = 'combo';
					field.hiddenName = field.name;
				}

				field.triggerAction = 'all';
				field.typeAhead = true;
				field.displayField = 'label';
				field.valueField = 'code';
				field.emptyText = Genapp.FieldForm.prototype.criteriaPanelTbarComboEmptyText;
				field.mode = 'remote';

				// Fill the list of codes / labels for default values
				var codes = [];
				if (record.type == 'ARRAY') {
					if (record.valueLabel) { // to avoid null pointer
						for ( var i = 0; i < record.valueLabel.length; i++) {
							codes.push({
								code : record.value[i],
								label : record.valueLabel[i]
							});
						}
					}
				} else {
					// case of CODE (single value)
					codes.push({
						code : record.value,
						label : record.valueLabel
					});
				}

				var storeFields = [ {
					name : 'code',
					mapping : 'code'
				}, {
					name : 'label',
					mapping : 'label'
				} ];

				if (record.subtype === 'DYNAMIC') {
					// Case of a DYNAMODE unit list of codes
					field.store = new Ext.data.JsonStore({
						root : 'codes',
						idProperty : 'code',
						fields : storeFields,
						url : Genapp.base_url + '/query/ajaxgetdynamiccodes',
						baseParams : {
							'unit' : record.unit
						},
						data : {
							codes : codes
						}
					});
				} else {
					// Case of a MODE unit list of codes (other cases are not
					// handled)
					field.store = new Ext.data.JsonStore({
						root : 'codes',
						idProperty : 'code',
						fields : storeFields,
						url : Genapp.base_url + '/query/ajaxgetcodes',
						baseParams : {
							'unit' : record.unit
						},
						data : {
							codes : codes
						}
					});
				}
				break;
			case 'DATE': // The input type DATE correspond generally to a
				// data
				// type DATE
				field.xtype = 'datefield';
				field.format = Genapp.FieldForm.prototype.dateFormat;
				break;
			case 'NUMERIC': // The input type NUMERIC correspond generally to a
				// data
				// type NUMERIC or RANGE
				field.xtype = 'numberfield';
				// If RANGE we set the min and max values
				if (record.subtype === 'RANGE') {
					field.decimalPrecision = (record.params.decimals == null) ? 20 : record.params.decimals;
				}
				// IF INTEGER we remove the decimals
				if (record.subtype === 'INTEGER') {
					field.allowDecimals = false;
					field.decimalPrecision = 0;
				}
				break;
			case 'CHECKBOX':
				field.xtype = 'switch_checkbox';
				field.ctCls = 'improvedCheckbox';
				switch (record.value) {
				case 1:
				case '1':
				case true:
				case 'true':
					field.inputValue = '1';
					break;
				default:
					field.inputValue = '0';
					break;
				}
				// field.boxLabel = record.label;
				break;
			case 'RADIO':
			case 'TEXT':
				switch (record.subtype) {
				// TODO : BOOLEAN, COORDINATE
				case 'INTEGER':
					field.xtype = 'numberfield';
					field.allowDecimals = false;
					break;
				case 'NUMERIC':
					field.xtype = 'numberfield';
					break;
				default: // STRING
					field.xtype = 'textfield';
					break;
				}
				break;
			case 'GEOM':
				field.xtype = 'geometryfield';
				field.hideSearchButton = true;
				field.zoomToFeatureOnInit = true;
				field.mapWindowTitle = this.geoMapWindowTitle;
				break;
			case 'TREE':
				field.xtype = 'treefield';
				field.valueLabel = record.valueLabel;
				if (record.type == 'ARRAY') {
					field.multiple = true;
					field.name = field.name + '[]';
				}
				field.unit = record.unit;
				break;
			case 'TAXREF':
				field.xtype = 'taxreffield';
				field.valueLabel = record.valueLabel;
				field.unit = record.unit;
				break;
			case 'IMAGE':
				field.xtype = 'imagefield';
				field.id = this.dataId + "/" + record.name;
				field.hiddenName = field.name;
				break;
			default:
				field.xtype = 'field';
				break;
			}

		}

		// Set the default value
		if (!Ext.isEmpty(record.value)) {
			if (record.value instanceof Array) {
				field.value = record.value.join(",");
			} else {
				field.value = record.value;
			}
		}

		// Check if the field is mandatory
		field.allowBlank = (record.required != true);

		// Add a tooltip
		if (!Ext.isEmpty(record.definition)) {
			field.listeners = {
				'render' : function(cmp) {
					if (cmp.inputType != 'hidden') {
						var binCt = Ext.get('x-form-el-' + cmp.id).parent();
						var labelDiv = binCt.child('.x-form-item-label');
						Ext.QuickTips.register({
							target : labelDiv,
							title : record.label,
							text : record.definition,
							width : 200
						});
					}
				},
				scope : this
			};
		}

		// Set the label
		field.fieldLabel = record.label;
		
		// Set the width
		field.width = this.fieldWidth;

		return field;
	},

	/**
	 * Submit the form to save the edited data
	 */
	editData : function() {
		this.dataEditForm.getForm().submit({
			url : Genapp.base_url + 'dataedition/ajax-validate-edit-data',
			timeout : 480000,
			success : this.editSuccess,
			failure : this.editFailure,
			scope : this,
			waitMsg : this.dataEditFSSavingMessage
		});
	},

	/**
	 * Ask for deletion of the data
	 */
	askDataDeletion : function() {
		Ext.Msg.confirm('Confirm Deletion', this.dataEditFSDeleteButtonConfirm, function(btn, text) {
			if (btn == 'yes') {
				this.deleteData(this.dataId);
			}
		}, this);
	},

	/**
	 * Delete the data
	 */
	deleteData : function(dataId) {
		Ext.Ajax.request({
			url : Genapp.base_url + 'dataedition/ajax-delete-data/' + dataId,
			success : this.deleteSuccess,
			failure : this.deleteFailure,
			scope : this
		});
	},

	/**
	 * Ajax Edit success.
	 * 
	 * @param {Ext.form.BasicForm}
	 *            form
	 * @param {Ext.form.Action}
	 *            action
	 */
	editSuccess : function(form, action) {

		// We set the current mode to EDIT
		this.mode = "EDIT";

		var obj = Ext.util.JSON.decode(action.response.responseText);

		// Set to NOT DIRTY to avoid a warning when leaving the page
		this.dataEditForm.getForm().setNotDirty();  		
		
		// We display the update message
		if (!Ext.isEmpty(obj.message)) {
			this.messagePanel.update(obj.message);
			this.messagePanel.getEl().setStyle('color', '#00ff00');
		}

		// We redirect
		if (!Ext.isEmpty(obj.redirectLink)) {		
			window.location = obj.redirectLink;
		}

		if (!Ext.isEmpty(obj.errorMessage)) {
			this.messagePanel.update(obj.errorMessage);
			this.messagePanel.getEl().setStyle('color', '#ff0000');
			console.log('Server-side failure with status code : ' + action.response.status);
			console.log('errorMessage : ' + action.response.errorMessage);
		}
	},

	/**
	 * Ajax Edit failure.
	 * 
	 * @param {Ext.form.BasicForm}
	 *            form
	 * @param {Ext.form.Action}
	 *            action
	 */
	editFailure : function(form, action) {
		var obj = Ext.util.JSON.decode(action.response.responseText);
		if (!Ext.isEmpty(obj.errorMessage)) {
			this.messagePanel.update(obj.errorMessage);
			this.messagePanel.getEl().setStyle('color', '#ff0000');
		}
		console.log('Server-side failure with status code : ' + action.response.status);
		console.log('errorMessage : ' + action.response.errorMessage);
	},

	/**
	 * Ajax success common function
	 */
	deleteSuccess : function(response, opts) {

		// Display a confirmation of the deletion
		var obj = Ext.decode(response.responseText);
		if (!Ext.isEmpty(obj.message)) {
			this.messagePanel.update(obj.message);
			this.messagePanel.getEl().setStyle('color', '#00ff00');
		}
		
		// Set to NOT DIRTY to avoid a warning when leaving the page
		this.dataEditForm.getForm().setNotDirty();  		

		// Return to the index page
		if (!Ext.isEmpty(obj.redirectLink)) {
			window.location = obj.redirectLink;
		}

		if (!Ext.isEmpty(obj.errorMessage)) {
			this.messagePanel.update(obj.errorMessage);
			this.messagePanel.getEl().setStyle('color', '#ff0000');
			console.log('Server-side failure with status code : ' + response.status);
			console.log('errorMessage : ' + response.errorMessage);
		}
	},

	/**
	 * Ajax failure common function
	 */
	deleteFailure : function(response, opts) {
		console.log(response);
		var obj = Ext.decode(response.responseText);
		if (!Ext.isEmpty(obj.errorMessage)) {
			this.messagePanel.update(obj.errorMessage);
			this.messagePanel.getEl().setStyle('color', '#ff0000');
		}
		console.log('Server-side failure with status code : ' + response.status);
		console.log('errorMessage : ' + response.errorMessage);
	},

	/**
	 * Generate the html links
	 * 
	 * @param {Object}
	 *            links A links object
	 * @return {String} The html links
	 */
	getEditLinks : function(links) {
		var html = '', tipContent;
		for ( var i in links) {
			if (typeof links[i] !== 'function') {
				var tipTitle = this.tipEditPrefix + '&nbsp' + links[i].text.toLowerCase() + ' :';
				tipContent = '';
				for ( var data in links[i].fields) {
					var value = links[i].fields[data];
					if (typeof value !== 'function') {
						value = Ext.isEmpty(value) ? ' -' : value;
						tipContent += '<b>' + data + ' : </b>' + value + '</br>';
					}
				}
				html += '<a href="' + links[i].url + '" ' + 'ext:qtitle="<u>' + tipTitle + '</u>" ' + 'ext:qwidth="' + this.tipDefaultWidth + '" '
						+ 'ext:qtip="' + tipContent + '" ' + '>' + links[i].text + '</a><br/>';
			}
		}
		return html;
	},
	
	
	
    /**
	 * Check if the form is dirty before to close the page and launch an alert.
	 */
	onBeforeUnload: function(e){ 

        var showMessage = false;
        var MESSAGE = this.unsavedChangesMessage;

        if (this.dataEditForm.getForm().isDirty()) {
        	showMessage = true;
        };

        if (showMessage === true) {
            if (e) {
            	e.returnValue = MESSAGE;
            }
            if (window.event) {
            	window.event.returnValue = MESSAGE;
            }
            return MESSAGE;
        }
	}
	
	
});

Ext.reg('editionpage', Genapp.EditionPanel);/**
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
 * Show one field form.
 * 
 * The following parameters are expected : title : The title of the form id :
 * The identifier of the form
 * 
 * @class Genapp.FieldForm
 * @extends Ext.Panel
 * @constructor Create a new FieldForm
 * @param {Object}
 *            config The config object
 */
Genapp.FieldForm = Ext.extend(Ext.Panel, {
	/**
	 * @cfg {Boolean} frame See {@link Ext.Panel#frame}. Default to true.
	 */
	frame : true,
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'genapp-query-field-form-panel').
	 *      This can be useful for adding customized styles to the component or
	 *      any of its children using standard CSS rules.
	 */
	cls : 'genapp-query-field-form-panel',
	/**
	 * @cfg {String} criteriaPanelTbarLabel The criteria Panel Tbar Label
	 *      (defaults to <tt>'Criteria'</tt>)
	 */
	criteriaPanelTbarLabel : 'Criteria',
	/**
	 * @cfg {String} criteriaPanelTbarComboLoadingText The criteria Panel Tbar
	 *      Combo Loading Text (defaults to <tt>'searching...'</tt>)
	 */
	criteriaPanelTbarComboLoadingText : 'Searching...',
	/**
	 * @cfg {String} columnsPanelTbarLabel The columns Panel Tbar Label
	 *      (defaults to <tt>'Columns'</tt>)
	 */
	columnsPanelTbarLabel : 'Columns',
	/**
	 * @cfg {String} columnsPanelTbarComboEmptyText The columns Panel Tbar Combo
	 *      Empty Text (defaults to <tt>'Select...'</tt>)
	 */
	columnsPanelTbarComboEmptyText : 'Select...',
	/**
	 * @cfg {String} columnsPanelTbarComboLoadingText The columns Panel Tbar
	 *      Combo Loading Text (defaults to <tt>'searching...'</tt>)
	 */
	columnsPanelTbarComboLoadingText : 'Searching...',
	/**
	 * @cfg {String} columnsPanelTbarAddAllButtonTooltip The columns Panel Tbar
	 *      Add All Button Tooltip (defaults to <tt>'Add all the columns'</tt>)
	 */
	columnsPanelTbarAddAllButtonTooltip : 'Add all the columns',
	/**
	 * @cfg {String} columnsPanelTbarRemoveAllButtonTooltip The columns Panel
	 *      Tbar Remove All Button Tooltip (defaults to
	 *      <tt>'Remove all the columns'</tt>)
	 */
	columnsPanelTbarRemoveAllButtonTooltip : 'Remove all the columns',
	/**
	 * @cfg {Integer} criteriaLabelWidth The criteria Label Width (defaults to
	 *      <tt>120</tt>)
	 */
	criteriaLabelWidth : 120,

	// private
	initComponent : function() {
		/**
		 * The criteria Data Store.
		 * 
		 * @property criteriaDS
		 * @type Ext.data.JsonStore
		 */
		this.criteriaDS = new Ext.data.JsonStore({
			idProperty : 'name',
			fields : [ {
				name : 'name',
				mapping : 'name'
			}, {
				name : 'label',
				mapping : 'label'
			}, {
				name : 'inputType',
				mapping : 'inputType'
			}, {
				name : 'unit',
				mapping : 'unit'
			}, {
				name : 'type',
				mapping : 'type'
			}, {
				name : 'subtype',
				mapping : 'subtype'
			}, {
				name : 'definition',
				mapping : 'definition'
			}, {
				name : 'is_default',
				mapping : 'is_default'
			}, {
				name : 'default_value',
				mapping : 'default_value'
			}, {
				name : 'decimals',
				mapping : 'decimals'
			}, {
				name : 'params',
				mapping : 'params'
			} // reserved for min/max or list of codes
			],
			data : this.criteria
		});

		/**
		 * The columns Data Store.
		 * 
		 * @property columnsDS
		 * @type Ext.data.JsonStore
		 */
		this.columnsDS = new Ext.data.JsonStore({
			idProperty : 'name',
			fields : [ {
				name : 'name',
				mapping : 'name'
			}, {
				name : 'label',
				mapping : 'label'
			}, {
				name : 'definition',
				mapping : 'definition'
			}, {
				name : 'is_default',
				mapping : 'is_default'
			}, {
				name : 'decimals',
				mapping : 'decimals'
			}, {
				name : 'params',
				mapping : 'params'
			} // reserved for min/max or list of codes
			],
			data : this.columns
		});

		/**
		 * The panel used to show the criteria.
		 * 
		 * @property criteriaPanel
		 * @type Ext.Panel
		 */
		this.criteriaPanel = new Ext.Panel({
			layout : 'form',
			hidden : Ext.isEmpty(this.criteria) ? true : false,
			hideMode : 'offsets',
			labelWidth : this.criteriaLabelWidth,
			cls : 'genapp-query-criteria-panel',
			defaults : {
				labelStyle : 'padding: 0; margin-top:3px',
				width : 180
			},
			listeners : {
				'add' : function(container, cmp, index) {
					var subName = cmp.name, i = 0, foundComponents, tmpName = '', criteriaPanel = cmp.ownerCt, className = 'first-child';
					if (container.defaultType === 'panel') { // The add event
						// is not only
						// called for
						// the items
						// Add a class to the first child for IE7 layout
						if (index === 0) {
							if (cmp.rendered) {
								cmp.getEl().addClass(className);
							} else {
								if (cmp.itemCls) {
									cmp.itemCls += ' ' + className;
								} else {
									cmp.itemCls = className;
								}
							}
						}
						// Setup the name of the field
						do {
							tmpName = subName + '[' + i++ + ']';
						} while (criteriaPanel.items.findIndex('name', tmpName) !== -1);
						cmp.name = cmp.hiddenName = tmpName;
					}
				},
				scope : this
			},
			items : Ext.isEmpty(this.criteriaValues) ? this.getDefaultCriteriaConfig() : this.getFilledCriteriaConfig(),
			tbar : [ {
				// Filler
				xtype : 'tbfill'
			},
			// The label
			new Ext.Toolbar.TextItem(this.criteriaPanelTbarLabel), {
				// A spacer
				xtype : 'tbspacer'
			}, {
				// The combobox with the list of available criterias
				xtype : 'combo',
				hiddenName : 'Criteria',
				store : this.criteriaDS,
				editable : false,
				displayField : 'label',
				valueField : 'name',
				mode : 'local',
				width : 220,
				maxHeight : 100,
				triggerAction : 'all',
				emptyText : this.criteriaPanelTbarComboEmptyText,
				loadingText : this.criteriaPanelTbarComboLoadingText,
				listeners : {
					scope : this,
					'select' : {
						fn : this.addSelectedCriteria,
						scope : this
					}
				}
			}, {
				// A spacer
				xtype : 'tbspacer'
			} ]
		});

		/**
		 * The panel used to show the columns.
		 * 
		 * @property columnsPanel
		 * @type Ext.Panel
		 */
		this.columnsPanel = new Ext.Panel({
			layout : 'form',
			hidden : Ext.isEmpty(this.columns) ? true : false,
			hideMode : 'offsets',
			cls : 'genapp-query-columns-panel',
			items : this.getDefaultColumnsConfig(),
			tbar : [ {
				// The add all button
				xtype : 'tbbutton',
				tooltip : this.columnsPanelTbarAddAllButtonTooltip,
				ctCls : 'genapp-tb-btn',
				iconCls : 'genapp-tb-btn-add',
				handler : this.addAllColumns,
				scope : this
			}, {
				// The remove all button
				xtype : 'tbbutton',
				tooltip : this.columnsPanelTbarRemoveAllButtonTooltip,
				ctCls : 'genapp-tb-btn',
				iconCls : 'genapp-tb-btn-remove',
				handler : this.removeAllColumns,
				scope : this
			}, {
				// Filler
				xtype : 'tbfill'
			},
			// The label
			new Ext.Toolbar.TextItem(this.columnsPanelTbarLabel), {
				// A space
				xtype : 'tbspacer'
			}, {
				// The combobox with the list of available columns
				xtype : 'combo',
				fieldLabel : 'Columns',
				hiddenName : 'Columns',
				store : this.columnsDS,
				editable : false,
				displayField : 'label',
				valueField : 'name',
				mode : 'local',
				width : 220,
				maxHeight : 100,
				triggerAction : 'all',
				emptyText : this.columnsPanelTbarComboEmptyText,
				loadingText : this.columnsPanelTbarComboLoadingText,
				listeners : {
					scope : this,
					'select' : {
						fn : this.addColumn,
						scope : this
					}
				}
			}, {
				xtype : 'tbspacer'
			} ]
		});

		if (!this.items) {
			this.items = [ this.criteriaPanel, this.columnsPanel ];
		}
		this.collapsible = true;
		this.titleCollapse = true;
		Genapp.FieldForm.superclass.initComponent.call(this);

		this.doLayout();

	},

	/**
	 * Add the selected criteria to the list of criteria.
	 * 
	 * @param {Ext.form.ComboBox}
	 *            combo The criteria combobox
	 * @param {Ext.data.Record}
	 *            record The criteria combobox record to add
	 * @param {Number}
	 *            index The criteria combobox record index
	 * @hide
	 */
	addSelectedCriteria : function(combo, record, index) {
		if (combo !== null) {
			combo.clearValue();
			combo.collapse();
		}
		// Add the field
		this.criteriaPanel.add(this.getCriteriaConfig(record.data, false));
		this.criteriaPanel.doLayout();
	},

	/**
	 * Add the criteria to the list of criteria.
	 * 
	 * @param {String}
	 *            criteriaId The criteria id
	 * @param {String}
	 *            value The criteria value
	 * @return {Object} The criteria object
	 */
	addCriteria : function(criteriaId, value) {
		// Setup the field
		var record = this.criteriaDS.getById(criteriaId);
		record.data.default_value = value;
		// Add the field
		var criteria = this.criteriaPanel.add(this.getCriteriaConfig(record.data, false));
		this.criteriaPanel.doLayout();
		return criteria;
	},

	/**
	 * Construct the default criteria
	 * 
	 * @return {Array} An array of the default criteria config
	 */
	getDefaultCriteriaConfig : function() {
		var items = [];
		this.criteriaDS.each(function(record) {
			if (record.data.is_default) {
				// if the field have multiple default values, duplicate the
				// criteria
				var defaultValue = record.data.default_value;
				if (!Ext.isEmpty(defaultValue)) {
					var defaultValues = defaultValue.split(';'), i;
					for (i = 0; i < defaultValues.length; i++) {
						// clone the object
						var newRecord = record.copy();
						newRecord.data.default_value = defaultValues[i];
						this.items.push(this.form.getCriteriaConfig(newRecord.data, false));
					}
				} else {
					this.items.push(this.form.getCriteriaConfig(record.data));
				}
			}
		}, {
			form : this,
			items : items
		});
		return items;
	},

	/**
	 * Construct the filled criteria
	 * 
	 * @return {Array} An array of the filled criteria config
	 */
	getFilledCriteriaConfig : function() {
		var items = [];
		this.criteriaDS.each(function(record) {
			var fieldValues, newRecord, i;
			// Check if there are some criteriaValues from the predefined
			// request page
			if (!Ext.isEmpty(this.form.criteriaValues)) {
				fieldValues = this.form.criteriaValues['criteria__' + record.data.name];
				// Check if there are some criteriaValues for this criteria
				if (!Ext.isEmpty(fieldValues)) {
					// Transform fieldValues in array if needed
					if (!Ext.isArray(fieldValues)) {
						fieldValues = [ fieldValues ];
					}
					// Duplicate the criteria if the field have multiple values
					for (i = 0; i < fieldValues.length; i++) {
						newRecord = record.copy();
						newRecord.data.default_value = fieldValues[i];
						this.items.push(this.form.getCriteriaConfig(newRecord.data, false));
					}
				}
			}
		}, {
			form : this,
			items : items
		});
		return items;
	},

	/**
	 * Add the selected column to the column list.
	 * 
	 * @param {Ext.form.ComboBox}
	 *            combo The column combobox
	 * @param {Ext.data.Record}
	 *            record The column combobox record to add
	 * @param {Number}
	 *            index The column combobox record index
	 * @hide
	 */
	addColumn : function(combo, record, index) {
		if (combo !== null) {
			combo.clearValue();
			combo.collapse();
		}
		if (this.columnsPanel.find('name', 'column__' + record.data.name).length === 0) {
			// Add the field
			this.columnsPanel.add(this.getColumnConfig(record.data));
			this.columnsPanel.doLayout();
		}
	},

	/**
	 * Construct a column for the record
	 * 
	 * @param {Ext.data.Record}
	 *            record The column combobox record to add
	 * @hide
	 */
	getColumnConfig : function(record) {
		var field = {
			xtype : 'container',
			autoEl : 'div',
			cls : 'genapp-query-column-item',
			width : '100%',
			items : [ {
				xtype : 'box',
				autoEl : {
					tag : 'div',
					cls : 'columnLabelBin columnLabelBinColor',
					html : '&nbsp;&nbsp;&nbsp;&nbsp;'
				},
				listeners : {
					'render' : function(cmp) {
						cmp.getEl().on('click', function(event, el, options) {
							this.columnsPanel.remove(cmp.ownerCt);
						}, this, {
							single : true
						});
					},
					scope : this
				}
			}, {
				xtype : 'box',
				autoEl : {
					tag : 'span',
					cls : 'columnLabel columnLabelColor',
					'ext:qtitle' : Genapp.util.htmlStringFormat(record.label),
					'ext:qwidth' : 200,
					'ext:qtip' : Genapp.util.htmlStringFormat(record.definition),
					html : record.label
				}
			}, {
				xtype : 'hidden',
				name : 'column__' + record.name,
				value : '1'
			} ]
		};
		return field;
	},

	/**
	 * Construct the default columns
	 * 
	 * @return {Array} An array of the default columns config
	 */
	getDefaultColumnsConfig : function() {
		var items = [];
		this.columnsDS.each(function(record) {
			if (record.data.is_default) {
				this.items.push(this.form.getColumnConfig(record.data));
			}
		}, {
			form : this,
			items : items
		});
		return items;
	},

	/**
	 * Adds all the columns of a column panel
	 */
	addAllColumns : function() {
		this.columnsDS.each(function(record) {
			this.addColumn(null, record);
		}, this);
	},

	/**
	 * Adds all the columns of a column panel
	 */
	removeAllColumns : function() {
		this.columnsPanel.removeAll();
	}

});

Ext.apply(Genapp.FieldForm.prototype, {
	/**
	 * @cfg {String} criteriaPanelTbarComboEmptyText The criteria Panel Tbar
	 *      Combo Empty Text (defaults to <tt>'Select...'</tt>)
	 */
	criteriaPanelTbarComboEmptyText : 'Select...',

	/**
	 * @cfg {String} dateFormat The date format for the date fields (defaults to
	 *      <tt>'Y/m/d'</tt>)
	 */
	dateFormat : 'Y/m/d',

	/**
	 * Construct a criteria from the record
	 * 
	 * @param {Ext.data.Record}
	 *            record The criteria combobox record to add. A serialized
	 *            FormField object.
	 * @param {Boolean}
	 *            hideBin True to hide the bin
	 * @hide
	 */
	getCriteriaConfig : function(record, hideBin) {
		// If the field have multiple default values, duplicate the criteria
		if (!Ext.isEmpty(record.default_value) && Ext.isString(record.default_value) && record.default_value.indexOf(';') !== -1) {
			var fields = [];
			var defaultValues = record.default_value.split(';'), i;
			for (i = 0; i < defaultValues.length; i++) {
				record.default_value = defaultValues[i];
				fields.push(Genapp.FieldForm.prototype.getCriteriaConfig(record, hideBin));
			}
			return fields;
		}
		var field = {};
		field.name = 'criteria__' + record.name;

		// Creates the ext field config
		switch (record.inputType) {
		case 'SELECT': // The input type SELECT correspond generally to a data
			// type CODE
			field.xtype = 'combo';
			field.itemCls = 'trigger-field'; // For IE7 layout
			field.hiddenName = field.name;
			field.triggerAction = 'all';
			field.typeAhead = true;
			field.displayField = 'label';
			field.valueField = 'code';
			field.emptyText = Genapp.FieldForm.prototype.criteriaPanelTbarComboEmptyText;
			if (record.subtype === 'DYNAMIC') {
				field.mode = 'remote';
				field.store = new Ext.data.JsonStore({
					autoDestroy : true,
					autoLoad : true,
					root : 'codes',
					idProperty : 'code',
					fields : [ {
						name : 'code',
						mapping : 'code'
					}, {
						name : 'label',
						mapping : 'label'
					} ],
					url : Genapp.base_url + 'query/ajaxgetdynamiccodes',
					baseParams : {
						'unit' : record.unit
					}
				});
			} else {
				// Subtype == CODE (other possibilities are not available)
				field.mode = 'remote';
				field.store = new Ext.data.JsonStore({
					autoDestroy : true,
					autoLoad : true,
					root : 'codes',
					idProperty : 'code',
					fields : [ {
						name : 'code',
						mapping : 'code'
					}, {
						name : 'label',
						mapping : 'label'
					} ],
					url : Genapp.base_url + 'query/ajaxgetcodes',
					baseParams : {
						'unit' : record.unit
					}
				});
			}
			break;
		case 'DATE': // The input type DATE correspond generally to a data
			// type DATE
			field.xtype = 'daterangefield';
			field.itemCls = 'trigger-field'; // For IE7 layout
			field.format = Genapp.FieldForm.prototype.dateFormat;
			break;
		case 'NUMERIC': // The input type NUMERIC correspond generally to a data
			// type NUMERIC or RANGE
			field.xtype = 'numberrangefield';
			field.itemCls = 'trigger-field'; // For IE7 layout
			// If RANGE we set the min and max values
			if (record.subtype === 'RANGE') {
				field.minValue = record.params.min;
				field.maxValue = record.params.max;
				field.decimalPrecision = (record.params.decimals === null) ? 20 : record.params.decimals;
			}
			// IF INTEGER we remove the decimals
			if (record.subtype === 'INTEGER') {
				field.allowDecimals = false;
				field.decimalPrecision = 0;
			}
			break;
		case 'CHECKBOX':
			field.xtype = 'switch_checkbox';
			field.ctCls = 'improvedCheckbox';
			switch (record.default_value) {
			case 1:
			case '1':
			case true:
			case 'true':
				field.inputValue = '1';
				break;
			default:
				field.inputValue = '0';
				break;
			}
			// field.boxLabel = record.label;
			break;
		case 'RADIO':
		case 'TEXT':
			switch (record.subtype) {
			// TODO : BOOLEAN, COORDINATE
			case 'INTEGER':
				field.xtype = 'numberfield';
				field.allowDecimals = false;
				break;
			case 'NUMERIC':
				field.xtype = 'numberfield';
				break;
			default: // STRING
				field.xtype = 'textfield';
				break;
			}
			break;
		case 'GEOM':
			field.xtype = 'geometryfield';
			field.itemCls = 'trigger-field'; // For IE7 layout
			field.hideDrawPointButton = true;
			field.hideDrawLineButton = true;
			break;
		case 'TREE':
			field.xtype = 'treefield';
			field.valueLabel = record.valueLabel;
			field.unit = record.unit;
			break;
		case 'TAXREF':
			field.xtype = 'taxreffield';
			field.valueLabel = record.valueLabel;
			field.unit = record.unit;
			break;
		default:
			field.xtype = 'field';
			break;
		}
		if (!Ext.isEmpty(record.default_value)) {
			field.value = record.default_value;
		}
		if (!Ext.isEmpty(record.fixed)) {
			field.disabled = record.fixed;
		}
		field.fieldLabel = record.label;

		if (Ext.isEmpty(field.listeners)) {
			field.listeners = {
				scope : this
			};
		}
		field.listeners.render = function(cmp) {
			if (cmp.xtype != 'hidden') {

				// Add the tooltip
				var binCt = Ext.get('x-form-el-' + cmp.id).parent();
				var labelDiv = binCt.child('.x-form-item-label');
				Ext.QuickTips.register({
					target : labelDiv,
					title : record.label,
					text : record.definition,
					width : 200
				});

				// Add the bin
				if (!hideBin) {
					labelDiv.addClass('columnLabelColor');
					labelDiv.addClass('labelNextBin');
					var binDiv = binCt.createChild({
						tag : "div",
						cls : "filterBin"
					}, labelDiv);
					binDiv.insertHtml('afterBegin', '&nbsp;&nbsp;&nbsp;');
					binDiv.on('click', function(event, el, options) {
						cmp.ownerCt.remove(cmp);
					}, this, {
						single : true
					});
				}

				// Refresh the field value after the store load
				// Check if the field is a 'combo' and with a mode set to
				// 'remote'
				if (cmp.xtype === 'combo' && !Ext.isEmpty(cmp.getStore().proxy)) {
					cmp.getStore().on('load', function(store, records, options) {
						this.reset();
					}, cmp)
				}
			}

		};

		return field;
	}
});/**
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
 * Panel containing the dynamic map.
 * <p>
 * Contains : <br>
 * a GeoExt mapPanel for the map.<br>
 * a GeoExt widgets.LayerTree for the legend.<br>
 * <br>
 * 
 * @class Genapp.GeoPanel
 * @extends Ext.Panel
 * @constructor Create a new GeoPanel
 * @param {Object}
 *            config The config object
 */
Genapp.GeoPanel = Ext
		.extend(
				Ext.Panel,
				{

					/**
					 * Internationalization.
					 */
					title : 'Map',
					popupTitle : 'Feature information',
					tabTip : 'The map with the request\'s results\'s location',
					layerPanelTitle : "Layers",
					layerPanelTabTip : "The layers's tree",
					legendPanelTitle : "Legends",
					legendPanelTabTip : "The layers's legends",
					panZoomBarControlTitle : "Zoom",
					navigationControlTitle : "Drag the map",
					invalidWKTMsg : "The feature cannot be displayed",
					zoomToFeaturesControlTitle : "Zoom to the features",
					zoomToResultControlTitle : "Zoom to the results",
					drawPointControlTitle : "Draw a point",
					drawLineControlTitle : "Draw a line",
					drawFeatureControlTitle : "Draw a polygon",
					modifyFeatureControlTitle : "Update the feature",
					tbarDeleteFeatureButtonTooltip : "Delete the feature",
					tbarPreviousButtonTooltip : "Previous Position",
					tbarNextButtonTooltip : "Next Position",
					zoomBoxInControlTitle : "Zoom in",
					zoomBoxOutControlTitle : "Zoom out",
					zoomToMaxExtentControlTitle : "Zoom to max extend",
					locationInfoControlTitle : "Get information about the result location",
					selectFeatureControlTitle : "Select a feature from the selected layer",
					featureInfoControlTitle : "Get information about the selected layer",
					legalMentionsLinkText : "Legal Mentions",
					addGeomCriteriaButtonText : "Select an area",

					/**
					 * @cfg {Boolean} frame See {@link Ext.Panel#frame}.
					 *      Default to true.
					 */
					frame : true,
					/**
					 * @cfg {Boolean} collapsible True to make the panel
					 *      collapsible and have the expand/collapse toggle
					 *      button automatically rendered into the header tool
					 *      button area, false to keep the panel statically
					 *      sized with no button (defaults to true).
					 */
					collapsible : true,
					/**
					 * @cfg {Boolean} titleCollapse true to allow expanding and
					 *      collapsing the panel (when {@link #collapsible} =
					 *      true) by clicking anywhere in the header bar, false)
					 *      to allow it only by clicking to tool button
					 *      (defaults to true)). If this panel is a child item
					 *      of a border layout also see the
					 *      {@link Ext.layout.BorderLayout.Region BorderLayout.Region}
					 *      {@link Ext.layout.BorderLayout.Region#floatable floatable}
					 *      config option.
					 */
					titleCollapse : true,

					/**
					 * @cfg {Boolean} header true to create the Panel's header
					 *      element explicitly, false to skip creating it. If a
					 *      {@link #title} is set the header will be created
					 *      automatically, otherwise it will not. If a
					 *      {@link #title} is set but header is explicitly set
					 *      to false, the header will not be rendered.
					 */
					header : false,
					/**
					 * @cfg {String/Object} layout Specify the layout manager
					 *      class for this container either as an Object or as a
					 *      String. See
					 *      {@link Ext.Container#layout layout manager} also.
					 *      Default to 'border'.
					 */
					layout : 'border',
					/**
					 * @cfg {Boolean} isDrawingMap true to display the drawing
					 *      tools on the toolbar. (Default to false)
					 */
					isDrawingMap : false,
					/**
					 * @cfg {String} featureWKT A wkt feature to draw on the
					 *      map. (Default to null)
					 */
					featureWKT : null,

					/**
					 * @cfg {Boolean} hideLayersAndLegendVerticalLabel if true
					 *      hide the layers and legends vertical label (defaults
					 *      to false).
					 */
					hideLayersAndLegendVerticalLabel : false,
					/**
					 * @cfg {Boolean} rightPanelCollapsed True to start with the
					 *      right panel collapsed (defaults to false)
					 */
					rightPanelCollapsed : false,
					/**
					 * @cfg {Number} rightPanelWidth The rigth panel default
					 *      width (defaults to 170)
					 */
					rightPanelWidth : 170,

					/**
					 * @cfg {Boolean} hideDrawPointButton Hide the "Draw Point"
					 *      button
					 */
					hideDrawPointButton : false,
					/**
					 * @cfg {Boolean} hideLegalMentions if true hide the legal
					 *      mentions link.
					 */
					hideLegalMentions : true,
					/**
					 * @cfg {Boolean} hideLayerSelector if true hide the layer
					 *      selector. The layer selector is required for the
					 *      following tools.
					 */
					hideLayerSelector : true,
					hideSnappingButton : true,
					hideGetFeatureButton : true,
					hideFeatureInfoButton : true,
					hideGeomCriteriaToolbarButton : true,

					/**
					 * @cfg {Boolean} zoom to features extend on init.
					 */
					zoomToFeatureOnInit : false,
					/**
					 * @cfg {String} legalMentionsLinkHref The user Manual Link
					 *      Href (defaults to
					 *      <tt>'Genapp.base_url + 'map/show-legal-mentions''</tt>)
					 */
					legalMentionsLinkHref : Genapp.base_url + 'map/show-legal-mentions',
					/**
					 * @cfg {Integer} minZoomLevel The min zoom level for the
					 *      map (defaults to <tt>0</tt>)
					 */
					minZoomLevel : 0,
					/**
					 * @cfg {String} resultsBBox The results bounding box
					 *      (defaults to <tt>null</tt>)
					 */
					resultsBBox : null,
					/**
					 * @cfg {Object} layersActivation A object containing few
					 *      arrays of layers ordered by activation type
					 *      (defaults to <tt>{}</tt>) {
					 *      'request':[resultLayer, resultLayer0, resultLayer1]
					 */
					layersActivation : {},

					/**
					 * @cfg Array[OpenLayer.Layer] The list of available layers.
					 */
					layersList : [],

					/**
					 * The vector layer.
					 * 
					 * @type {OpenLayers.Layer.Vector}
					 * @property vectorLayer
					 */
					vectorLayer : null,
					info : new OpenLayers.Control.WMSGetFeatureInfo(),
					/**
					 * The WFS layer.
					 * 
					 * @type {OpenLayers.Layer.Vector}
					 * @property wfsLayer
					 */
					wfsLayer : null,

					/**
					 * The base layer.
					 * 
					 * @type {OpenLayers.Layer}
					 * @property baseLayer
					 */
					baseLayer : null,

					/**
					 * The wkt format.
					 * 
					 * @type {OpenLayers.Format.WKT}
					 * @property wktFormat
					 */
					wktFormat : new OpenLayers.Format.WKT(),

					/**
					 * The map panel.
					 * 
					 * @type GeoExt.MapPanel
					 * @property mapPanel
					 */
					mapPanel : null,

					/**
					 * The map object (linked to the map panel).
					 * 
					 * @type {OpenLayers.Map}
					 * @property map
					 */
					map : null,

					/**
					 * The map panel top toolbar.
					 * 
					 * @type {Ext.Toolbar}
					 * @property mapToolbar
					 */
					mapToolbar : null,

					/**
					 * The container of the layers and the legends panels.
					 * 
					 * @property layersAndLegendsPanel
					 * @type Ext.TabPanel
					 */
					layersAndLegendsPanel : null,

					/**
					 * The layers panel.
					 * 
					 * @property layerPanel
					 * @type Ext.Panel
					 */
					layerPanel : null,

					/**
					 * The layer tree object (linked to the layer panel).
					 * 
					 * @type {Genapp.tree.LayerTreePanel}
					 * @property layerTree
					 */
					layerTree : null,

					/**
					 * The legends panel.
					 * 
					 * @property legendPanel
					 * @type Ext.Panel
					 */
					legendPanel : null,

					/**
					 * The vector layer selector.
					 * 
					 * @property layerSelector
					 * @type Genapp.map.LayerSelector
					 */
					layerSelector : null,

					/**
					 * @cfg {String} projectionLabel The projection to be
					 *      displayed next to the mouse position (defaults to
					 *      <tt> m (L2e)</tt>)
					 */
					projectionLabel : " m (L2e)",

					/**
					 * @cfg {OpenLayers.Control.ZoomToFeatures} zoom to vector
					 *      feature Control
					 */
					zoomToFeatureControl : null,

					/**
					 * @cfg { OpenLayers.Control.Snapping } snapping control
					 */
					snappingControl : null,

					/**
					 * @cfg { OpenLayers.Control.FeatureInfoControl } feature
					 *      info control
					 */
					featureInfoControl : null,

					/**
					 * Initialisation of the component.
					 */
					initComponent : function() {
						/**
						 * Used in the openMap function of the GeometryField
						 * object.
						 * 
						 * @event afterinit Fires after the geo panel is
						 *        rendered and after all the initializations
						 *        (map, tree, toolbar).
						 * @param {Genapp.MapPanel}
						 *            this
						 */

						this.addEvents('afterinit');

						// Create a zoom slider
						var zSlider = new GeoExt.ZoomSlider({
							vertical : true,
							height : 150,
							x : 18,
							y : 85,
							plugins : new GeoExt.ZoomSliderTip({
								template : '<div><b>{zoom}</b></div>'
							})
						});

						// Create the layer panel
						this.layerPanel = new Ext.Panel({
							layout : 'fit',
							cls : 'genapp-query-layer-tree-panel',
							title : this.layerPanelTitle,
							tabTip : this.layerPanelTabTip,
							frame : true,
							layoutConfig : {
								animate : true
							}
						});

						// Create the legend panel
						this.legendPanel = new Ext.Panel({
							cls : 'genapp-query-legend-panel',
							title : this.legendPanelTitle,
							tabTip : this.legendPanelTabTip,
							frame : true,
							autoScroll : true,
							layoutConfig : {
								animate : true
							}
						});

						// Create the layer and legend panel
						this.layersAndLegendsPanel = new Ext.TabPanel({
							region : 'east',
							width : this.rightPanelWidth,
							collapsed : this.rightPanelCollapsed,
							collapsible : true,
							titleCollapse : false,
							cls : 'genapp-query-map-right-panel',
							activeItem : 0,
							split : true,
							items : [ this.layerPanel, this.legendPanel ]
						});

						// Add the layers and legends vertical label
						if (!this.hideLayersAndLegendVerticalLabel) {
							this.layersAndLegendsPanel.on('collapse', function(panel) {
								Ext.get(panel.id + '-xcollapsed').createChild({
									tag : "div",
									cls : 'genapp-query-map-right-panel-xcollapsed-vertical-label-div'
								});
							}, this, {
								single : true
							});
						}

						// Create the Toolbar
						this.mapToolbar = new Ext.Toolbar();

						// Creates the map Object (OpenLayers)
						this.map = this.initMap();

						// Create the map panel
						this.mapPanel = new GeoExt.MapPanel({
							region : 'center',
							cls : 'genapp_query_mappanel',
							frame : true,
							layout : 'anchor',
							tbar : this.mapToolbar,
							items : [ zSlider ],
							map : this.map
						});
						
						// Add the panel to the items
						this.items = [ this.mapPanel, this.layersAndLegendsPanel ];

						// Show the legal mentions on the map
						if (!this.hideLegalMentions) {
							this.mapPanel.addListener('render', this.addLegalMentions, this);
						}

						// Init the toolbar
						this.initToolbar();

						// Add the layers and the layers tree
						Ext.Ajax.request({
							url : Genapp.base_url + 'map/ajaxgetlayers',
							scope : this,
							success : this.addLayersAndLayersTree
						});

						// Auto-Zoom to the selected feature
					    if (this.isDrawingMap) {
							this.on('treerendered', function() { // Don't use the 'afterlayout' event because it's called more that one time
							    if (this.zoomToFeatureOnInit && this.vectorLayer.features && this.vectorLayer.features.length > 0) {
									this.zoomToFeatureControl.activate();
									this.zoomToFeatureControl.trigger();
								}
							});
						}

						Genapp.GeoPanel.superclass.initComponent.call(this);
					},

					/**
					 * Add the legal mentions to the map
					 */
					addLegalMentions : function(cmp) {
						// Create the link
						cmp.el.createChild({
							tag : 'div',
							cls : 'genapp-map-panel-legal-mentions',
							children : [ {
								tag : 'a',
								target : '_blank',
								href : this.legalMentionsLinkHref,
								html : this.legalMentionsLinkText
							} ]
						}, cmp.el.child('.olMapViewport', true)).on('click', Ext.emptyFn, null, {
							// stop the event propagation to avoid conflicts
							// with the underlying map
							stopPropagation : true
						});
					},

					/**
					 * Build the layers from a JSON response and add it to the
					 * map. Get the layers tree from the server and build the
					 * layers tree.
					 */
					addLayersAndLayersTree : function(response) {
						
						// Reset the arrays
						this.layersList = [];
						this.layersActivation = {};
						var layersObject = Ext.decode(response.responseText), i;

						// Rebuild the list of available layers
						for (j = 0; j < layersObject.layers.length; j++) {
							// Get the JSON description of the layer
							var layerObject = layersObject.layers[j];

							// Get the JSON view service name
							var viewServiceName=layerObject.viewServiceName;
							var viewServiceNameStr = 'layersObject.view_services.'+viewServiceName.toString();
							var viewServiceObject=eval('('+viewServiceNameStr+')');
							
							// Build the new OpenLayers layer object and add it
							// to the list
							var newLayer = this.buildLayer(layerObject,viewServiceObject);
							this.layersList.push(newLayer);
							
							// Fill the list of active layers
							var activateType = layerObject.params.activateType.toLowerCase();
							if (Ext.isEmpty(this.layersActivation[activateType])) {
								this.layersActivation[activateType] = [ layerObject.name ];
							} else {
								this.layersActivation[activateType].push(layerObject.name);
							}

							// Create the legends
							if (layerObject.legendServiceName != '') {

								// Get the JSON legend service name
								var legendServiceName=layerObject.legendServiceName;
								var legendServiceNameStr = 'layersObject.legend_services.'+legendServiceName.toString();
								var legendServiceObject=eval('('+legendServiceNameStr+')');
								
								this.buildLegend(layerObject,legendServiceObject);
							}
						}
						
						// Define the WFS layer, used as a grid for snapping
						if (!this.hideLayerSelector) {
							
							// Openlayers have to pass through a proxy to request external 
							// server
							OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
							
							// Set the style
							var styleMap = new OpenLayers.StyleMap(OpenLayers.Util.applyDefaults({
								fillOpacity : 0,
								strokeColor : "green",
								strokeWidth : 3,
								strokeOpacity : 1
							}, OpenLayers.Feature.Vector.style["default"]));
							this.wfsLayer = new OpenLayers.Layer.Vector("WFS Layer", 
								{
									strategies:[new OpenLayers.Strategy.BBOX()],
									protocol: new OpenLayers.Protocol.HTTP({
										url: null,
										params:
										{
											typename: null,
											service: "WFS",
											format: "WFS",
											version: "1.0.0",
											request: "GetFeature",
											srs: Genapp.map.projection
										}, 
										format: new OpenLayers.Format.GML({extractAttributes: true})
									})									
								});
							this.wfsLayer.printable = false;
							this.wfsLayer.displayInLayerSwitcher = false;
							this.wfsLayer.extractAttributes = false;
							this.wfsLayer.styleMap = styleMap;
							this.wfsLayer.visibility = false;
							
						}
						this.setMapLayers(this.map);
												
						// Gets the layer tree model to initialise the Layer
						// Tree
						Ext.Ajax.request({
							url : Genapp.base_url + 'map/ajaxgettreelayers',
							success : this.initLayerTree,
							scope : this
						});
					},
					
					/**
					 * Build one OpenLayer Layer from a JSON object.
					 * 
					 * @return OpenLayers.Layer
					 */
					buildLayer : function(layerObject,serviceObject) {
						
						var url = serviceObject.urls;
							//Merges the service parameters and the layer parameters
							var paramsObj = {};
						    for (var attrname in layerObject.params) { paramsObj[attrname] = layerObject.params[attrname]; }
						    for (var attrname in serviceObject.params) { paramsObj[attrname] = serviceObject.params[attrname]; }
						    if (serviceObject.params.SERVICE=="WMTS") {
						    	//creation and merging of wmts parameters
						    	var layer=paramsObj.layers[0];
						    	var tileOrigin = new OpenLayers.LonLat(-20037508,20037508); //coordinates of top left corner of the matrixSet : usual value of geoportal, google maps 
						    	var serverResolutions = [156543.033928,78271.516964,39135.758482,19567.879241,9783.939621,4891.969810,2445.984905,1222.992453,611.496226,305.748113,152.874057,76.437028,38.218514,19.109257,9.554629,4.777302,2.388657,1.194329,0.597164,0.298582,0.149291,0.074646]; 
						    	// the usual 22 values of resolutions accepted by wmts servers geoportal
						    	
						    	var obj={options:layerObject.options,name:layerObject.name,url:url.toString(),layer:layer,tileOrigin:tileOrigin,serverResolutions:serverResolutions,opacity:layerObject.options.opacity,visibility:layerObject.options.visibility,isBaseLayer:layerObject.options.isBaseLayer};
						    	var objMergeParams= {};
						    	for (var attrname in obj) { objMergeParams[attrname] = obj[attrname]; }
						    	for (var attrname in paramsObj) { objMergeParams[attrname] = paramsObj[attrname]; }
						    	newLayer = new OpenLayers.Layer.WMTS(objMergeParams);

						    } else if (serviceObject.params.SERVICE=="WMS"){
						    	newLayer = new OpenLayers.Layer.WMS(layerObject.name , url , paramsObj , layerObject.options);
						    } else {
						    	Ext.Msg.alert("Please provide the \"" + layerObject.servicename + "\" service type.");
						    }
						newLayer.displayInLayerSwitcher = false;

						return newLayer;
					},

					/**
					 * Build a Legend Object from a JSON object.
					 * 
					 * @return OpenLayers.Layer
					 */
					buildLegend : function(layerObject,serviceObject) {
						var legend = this.legendPanel
								.add(new Ext.BoxComponent(
										{
											id : this.id + layerObject.name,
											autoEl : {
												tag : 'div',
												children : [
														{
															tag : 'span',
															html : layerObject.options.label,
															cls : 'x-form-item x-form-item-label'
														},
														{
															tag : 'img',
															src : serviceObject.urls.toString()
																	+ 'LAYER='+ layerObject.params.layers
																	+ '&SERVICE=' + serviceObject.params.SERVICE+ '&VERSION=' + serviceObject.params.VERSION + '&REQUEST=' + serviceObject.params.REQUEST
																	+ '&Format=image/png&WIDTH=160&HASSLD=' + (layerObject.params.hasSLD ? 'true' : 'false')
														} ]
											}
										}));
						if (layerObject.params.isDisabled || layerObject.params.isHidden || !layerObject.params.isChecked) {
							legend.on('render', function(cmp) {
								cmp.hide();
							});
							legend.on('show', (function(cmp, params) {
								if (cmp.rendered) {
									cmp.getEl().child('img').dom.src = serviceObject.urls.toString()
									+ 'LAYER='+ layerObject.params.layers
									+ '&SERVICE=' + serviceObject.params.SERVICE+ '&VERSION=' + serviceObject.params.VERSION + '&REQUEST=' + serviceObject.params.REQUEST
									+ '&Format=image/png&WIDTH=160&HASSLD=' + (layerObject.params.hasSLD ? 'true' : 'false')
								}
							}).createCallback(legend, layerObject.params));
						}
					},

					/**
					 * Set the layers of the map
					 */
					setMapLayers : function(map) {

						// Add the base layer (always first)
						map.addLayer(this.baseLayer);

						// Add the available layers
						for ( var i = 0; i < this.layersList.length; i++) {
							map.addLayer(this.layersList[i]);
						}

						// Add the WFS layer
						if (!this.hideLayerSelector && this.wfsLayer !== null) {
							map.addLayer(this.wfsLayer);
							this.snappingControl.addTargetLayer(this.wfsLayer);
						}

						// Add the vector layer
						map.addLayer(this.vectorLayer);

					},

					/**
					 * Initialize the map
					 * 
					 * @param {String}
					 *            consultationMapDivId The consultation map div
					 *            id
					 * @hide
					 */
					initMap : function() {

						// Create the map config resolution array
						var resolutions = [];
						for ( var i = this.minZoomLevel; i < Genapp.map.resolutions.length; i++) {
							resolutions.push(Genapp.map.resolutions[i]);
						}
						

						// Create the map object
						var map = new OpenLayers.Map({
							'controls' : [],
							'resolutions' : resolutions,
							'numZoomLevels' : Genapp.map.numZoomLevels,
							'projection' : Genapp.map.projection,
							'units' : 'm',
							'tileSize' : new OpenLayers.Size(Genapp.map.tilesize, Genapp.map.tilesize),
							'maxExtent' : new OpenLayers.Bounds(Genapp.map.x_min, Genapp.map.y_min, Genapp.map.x_max, Genapp.map.y_max),
							'eventListeners' : {// Hide the legend if needed
								"changelayer" : function(o) {
									if (o.property === 'visibility') {
										this.toggleLayersAndLegendsForZoom(o.layer);
									}
								},
								scope : this
							}
						});
						
						// Define the vector layer, used to draw polygons
						this.vectorLayer = new OpenLayers.Layer.Vector("Vector Layer", {
							printable : false, // This layers is never printed
							displayInLayerSwitcher : false
						});

						// Define the base layer of the map
						this.baseLayer = new OpenLayers.Layer("Empty baselayer", {
							isBaseLayer : true,
							printable : false, // This layers is never printed
							displayInLayerSwitcher : false
						});

						//
						// Set the minimum mandatory layer for the map
						// 
						this.setMapLayers(map);

						//
						// Add the controls
						//
						map.addControl(new OpenLayers.Control.Navigation());

						// Mouse position
						map.addControl(new OpenLayers.Control.MousePosition({
							prefix : 'X: ',
							separator : ' - Y: ',
							suffix : this.projectionLabel,
							numDigits : 0,
							title : 'MousePosition'
						}));

						// Scale
						map.addControl(new OpenLayers.Control.Scale());
						map.addControl(new OpenLayers.Control.ScaleLine({
							title : 'ScaleLine',
							bottomOutUnits : '',
							bottomInUnits : ''
						}));
						

						// Zoom the map to the user country level
						map.setCenter(new OpenLayers.LonLat(Genapp.map.x_center, Genapp.map.y_center), Genapp.map.defaultzoom);

						// For the GEOM criteria
						// TODO : Split this in another file
						if (this.isDrawingMap) {
							if (!Ext.isEmpty(this.maxFeatures)) {
								this.vectorLayer.preFeatureInsert = function(feature) {
									if (this.features.length > this.maxFeatures) {
										// remove first drawn feature:
										this.removeFeatures([ this.features[0] ]);
									}
								};
							}

							var sfDraw = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
								multiple : false,
								clickout : true,
								toggle : true,
								title : this.selectFeatureControlTitle
							});
							map.addControl(sfDraw);
							sfDraw.activate();

							if (this.featureWKT) {
								// display it with WKT format reader.
								var feature = this.wktFormat.read(this.featureWKT);
								if (feature) {
									this.vectorLayer.addFeatures([ feature ]);
								} else {
									alert(this.invalidWKTMsg);
								}
							}
						} else {
							// Add a control that display a tooltip on the
							// features
							var selectControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
								hover : true
							});
							map.addControl(selectControl);
							selectControl.activate();
						}

						return map;
					},

					/**
					 * Initialize the layer tree.
					 */
					initLayerTree : function(response) {

						// Decode the JSON
						var responseJSON = Ext.decode(response.responseText);

						// Add a Tree Panel
						this.layerTree = new Genapp.tree.LayerTreePanel({
							"rootChildren" : responseJSON,
							map : this.map
						});
						// Toggle layers and legends for zoom
						this.layerTree.on('afterrender', function(treePanel) {

							this.layerTree.eachLayerChild(function(child) {
								if (child.attributes.disabled === true) {
									child.forceDisable = true;
								} else {
									child.forceDisable = false;
								}
							});
							for ( var i = 0; i < this.map.layers.length; i++) {
;								this.toggleLayersAndLegendsForZoom(this.map.layers[i]);
							}
						}, this);

						this.layerPanel.add(this.layerTree);
						this.layerPanel.doLayout();

						this.fireEvent('treerendered', this);

					},

					/**
					 * Initialize the map toolbar
					 * 
					 * @hide
					 */
					initToolbar : function() {

						// Link the toolbar to the map
						this.mapToolbar.map = this.map;

						//
						// Drawing tools
						//
						if (this.isDrawingMap) {
							// Zoom to features button
							this.zoomToFeatureControl = new OpenLayers.Control.ZoomToFeatures(this.vectorLayer, {
								map : this.map,
								maxZoomLevel : 9,
								ratio : 1.05,
								autoActivate : false
							// otherwise will
							// desactivate after
							// first init
							});
							var zoomToFeatureButton = new GeoExt.Action({
								control : this.zoomToFeatureControl,
								iconCls : 'zoomstations',
								tooltip : this.zoomToFeaturesControlTitle
							});
							this.mapToolbar.add(zoomToFeatureButton);

							// Draw point button
							if (!this.hideDrawPointButton) {
								var drawPointControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Point);

								var drawPointButton = new GeoExt.Action({
									control : drawPointControl,
									map : this.map,
									tooltip : this.drawPointControlTitle,
									toggleGroup : "editing",
									group : "drawControl",
									checked : false,
									iconCls : 'drawpoint'
								});
								this.mapToolbar.add(drawPointButton);
							}

							// Draw line button
							if (!this.hideDrawLineButton) {
								var drawLineControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Path);

								var drawLineButton = new GeoExt.Action({
									control : drawLineControl,
									map : this.map,
									tooltip : this.drawLineControlTitle,
									toggleGroup : "editing",
									group : "drawControl",
									checked : false,
									iconCls : 'drawline'
								});
								this.mapToolbar.add(drawLineButton);
							}

							// Draw polygon button
							var drawPolygonControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Polygon);

							var drawPolygonButton = new GeoExt.Action({
								control : drawPolygonControl,
								map : this.map,
								tooltip : this.drawFeatureControlTitle,
								toggleGroup : "drawControl",
								toggleGroup : "editing",
								checked : false,
								iconCls : 'drawpolygon'
							});
							this.mapToolbar.add(drawPolygonButton);

							// Modify feature
							var modifyFeatureControl = new OpenLayers.Control.ModifyFeature(this.vectorLayer, {
								mode : OpenLayers.Control.ModifyFeature.RESHAPE
							});

							var modifyFeatureButton = new GeoExt.Action({
								control : modifyFeatureControl,
								map : this.map,
								tooltip : this.modifyFeatureControlTitle,
								toggleGroup : "editing",
								group : "drawControl",
								checked : false,
								iconCls : 'modifyfeature'
							});
							this.mapToolbar.add(modifyFeatureButton);

							// Delete feature
							var deleteFeatureControl = new OpenLayers.Control.SelectFeature(this.vectorLayer, {
								displayClass : 'olControlModifyFeature',
								onSelect : function(feature) {
									this.vectorLayer.destroyFeatures([ feature ]);
								},
								scope : this,
								type : OpenLayers.Control.TYPE_TOOL
							});

							var deleteFeatureButton = new GeoExt.Action({
								control : deleteFeatureControl,
								map : this.map,
								tooltip : this.tbarDeleteFeatureButtonTooltip,
								toggleGroup : "editing",
								group : "drawControl",
								checked : false,
								iconCls : 'deletefeature'
							});
							this.mapToolbar.add(deleteFeatureButton);

							// Separator
							this.mapToolbar.addSeparator();

						} else {
							if (!this.hideGeomCriteriaToolbarButton) {
	    						// Add geom criteria tool
	    						var addGeomCriteriaButton = new Ext.Button({
	                                text : this.addGeomCriteriaButtonText,
	                                iconCls : 'addgeomcriteria',
	                                handler : function(){
	                                    this.fireEvent('addgeomcriteria');
	                                },
	                                scope:this
	                            });
	                            this.mapToolbar.add(addGeomCriteriaButton);
							}
						}

						this.mapToolbar.addFill();

						//
						// Layer Based Tools
						//
						if (!this.hideLayerSelector) {

							// Layer selector
							this.layerSelector = {
								xtype : 'layerselector',
								geoPanelId : this.id
							};

							// Snapping tool
							this.snappingControl = new OpenLayers.Control.Snapping({
								layer : this.vectorLayer,
								targets : [ this.vectorLayer ],
								greedy : false
							});
							var snappingButton = new GeoExt.Action({
								control : this.snappingControl,
								map : this.map,
								tooltip : 'Snapping',
								toggleGroup : "snapping",  // his own independant group
								group : "LayerTools",
								checked : false,
								iconCls : 'snapping'
							});
							
							// Listen for the layer selector events
							Genapp.eventManager.on('selectLayer', this.layerSelected, this);
							// Get Feature tool
							this.getFeatureControl = new OpenLayers.Control.GetFeatureControl({
								map : this.map
							});
							var getFeatureButton = new GeoExt.Action({
								control : this.getFeatureControl,
								map : this.map,
								tooltip : this.selectFeatureControlTitle,
								toggleGroup : "editing",
								group : "LayerTools",
								checked : false,
								iconCls : 'selectFeature'
							});

							// Listen the get feature tool events
							Genapp.eventManager.on('getFeature', this.getFeature, this);
							// Feature Info Tool
							this.featureInfoControl = new OpenLayers.Control.FeatureInfoControl({
								layerName : this.vectorLayer.name,
								map : this.map
							});

							var featureInfoButton = new GeoExt.Action({
								control : this.featureInfoControl,
								map : this.map,
								toggleGroup : "editing",
								group : "LayerTools",
								checked : false,
								tooltip : this.featureInfoControlTitle,
								iconCls : 'feature-info'
							});
							if (!this.hideSnappingButton) {
								this.mapToolbar.add(snappingButton);
							}
							if (!this.hideGetFeatureButton) {
								this.mapToolbar.add(getFeatureButton);
							}
							if (!this.hideFeatureInfoButton) {
								this.mapToolbar.add(featureInfoButton);
							}
							this.mapToolbar.add(this.layerSelector);

							// Separator
							this.mapToolbar.addSeparator();
						}

						//
						// Navigation history : back and next
						//
						var historyControl = new OpenLayers.Control.NavigationHistory({});
						this.map.addControl(historyControl);
						historyControl.activate();

						var buttonPrevious = new Ext.Toolbar.Button({
							iconCls : 'back',
							tooltip : this.tbarPreviousButtonTooltip,
							disabled : true,
							handler : historyControl.previous.trigger
						});

						var buttonNext = new Ext.Toolbar.Button({
							iconCls : 'next',
							tooltip : this.tbarNextButtonTooltip,
							disabled : true,
							handler : historyControl.next.trigger
						});

						this.mapToolbar.add(buttonPrevious);
						this.mapToolbar.add(buttonNext);

						historyControl.previous.events.register("activate", buttonPrevious, function() {
							this.setDisabled(false);
						});

						historyControl.previous.events.register("deactivate", buttonPrevious, function() {
							this.setDisabled(true);
						});

						historyControl.next.events.register("activate", buttonNext, function() {
							this.setDisabled(false);
						});

						historyControl.next.events.register("deactivate", buttonNext, function() {
							this.setDisabled(true);
						});

						//
						// Get info on the feature
						//

						var locationInfoControl = new OpenLayers.Control.LocationInfoControl({
							layerName : Genapp.map.featureinfo_typename,
							geoPanelId : this.id
						});

						var locationInfoButton = new GeoExt.Action({
							control : locationInfoControl,
							map : this.map,
							toggleGroup : "editing",
							group : "navControl",
							checked : false,
							tooltip : this.locationInfoControlTitle,
							iconCls : 'feature-info'
						});
						this.mapToolbar.add(locationInfoButton);

						//
						// Navigation controls
						//

						// Zoom In
						var zoomInControl = new OpenLayers.Control.ZoomBox({
							title : this.zoomBoxInControlTitle
						});

						var zoomInButton = new GeoExt.Action({
							control : zoomInControl,
							map : this.map,
							tooltip : this.zoomBoxInControlTitle,
							toggleGroup : "editing",
							group : "navControl",
							checked : false,
							iconCls : 'zoomin'
						});
						this.mapToolbar.add(zoomInButton);

						// Zoom Out
						var zoomOutControl = new OpenLayers.Control.ZoomBox({
							out : true,
							title : this.zoomBoxOutControlTitle
						});

						var zoomOutButton = new GeoExt.Action({
							control : zoomOutControl,
							map : this.map,
							tooltip : this.zoomBoxOutControlTitle,
							toggleGroup : "editing",
							group : "navControl",
							checked : false,
							iconCls : 'zoomout'
						});

						this.mapToolbar.add(zoomOutButton);

						// Navigation
						var navigationControl = new OpenLayers.Control.Navigation({
							isDefault : true,
							mouseWheelOptions : {
								interval : 100
							}
						});

						var navigationButton = new GeoExt.Action({
							control : navigationControl,
							map : this.map,
							tooltip : this.navigationControlTitle,
							toggleGroup : "editing",
							group : "navControl",
							checked : true,
							iconCls : 'pan'
						});

						this.mapToolbar.add(navigationButton);

						// Séparateur
						this.mapToolbar.addSeparator();

						// Zoom to the Results
						var zoomToResultButton = new GeoExt.Action({
							handler : this.zoomOnResultsBBox,
							scope : this,
							map : this.map,
							tooltip : this.zoomToResultControlTitle,
							checked : false,
							iconCls : 'zoomstations'
						});

						this.mapToolbar.add(zoomToResultButton);

						// Zoom to max extend
						var zoomToMaxControl = new OpenLayers.Control.ZoomToMaxExtent({
							map : this.map,
							active : false
						});

						var zoomToMaxButton = new GeoExt.Action({
							control : zoomToMaxControl,
							map : this.map,
							tooltip : this.zoomToMaxExtentControlTitle,
							checked : false,
							iconCls : 'zoomfull'
						});

						this.mapToolbar.add(zoomToMaxButton);

					},

					/**
					 * Clean the map panel
					 */
					clean : function() {
						// Remove previous features
						this.vectorLayer.destroyFeatures(this.vectorLayer.features);
					},

					/**
					 * Zoom to the passed feature on the map
					 * 
					 * @param {String}
					 *            id The plot id
					 * @param {String}
					 *            wkt The wkt feature
					 */
					zoomToFeature : function(id, wkt) {

						// Parse the feature location and create a Feature
						// Object
						var feature = this.wktFormat.read(wkt);

						// Add the plot id as an attribute of the object
						feature.attributes.id = id.substring(id.lastIndexOf('__') + 2);

						// Remove previous features
						this.vectorLayer.destroyFeatures(this.vectorLayer.features);

						// Move the vector layer above all others
						this.map.setLayerIndex(this.vectorLayer, 100);
						if (feature) {
							// Add the feature
							this.vectorLayer.addFeatures([ feature ]);
						} else {
							alert(this.invalidWKTMsg);
						}

						// Center on the feature
						this.map.setCenter(new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y), 7);
					},

					/**
					 * Zoom on the provided bounding box
					 * 
					 * {String} wkt The wkt of the bounding box
					 */
					zoomOnBBox : function(wkt) {

						if (!Ext.isEmpty(wkt)) {

							// The ratio by which features' bounding box should
							// be scaled
							var ratio = 1;

							// The maximum zoom level to zoom to
							var maxZoomLevel = this.map.numZoomLevels - 1;

							// Parse the feature location and create a Feature
							// Object
							var feature = this.wktFormat.read(wkt);

							var bounds = feature.geometry.getBounds();

							bounds = bounds.scale(ratio);

							var zoom = 0;
							if ((bounds.getWidth() === 0) && (bounds.getHeight() === 0)) {
								zoom = maxZoomLevel;
							} else {
								var desiredZoom = this.map.getZoomForExtent(bounds);
								zoom = (desiredZoom > maxZoomLevel) ? maxZoomLevel : desiredZoom;
							}
							this.map.setCenter(bounds.getCenterLonLat(), zoom);
						}
					},

					/**
					 * Zoom on the results bounding box
					 */
					zoomOnResultsBBox : function() {
						this.zoomOnBBox(this.resultsBBox);
					},

					/**
					 * Toggle the layer(s) and legend(s)
					 * 
					 * @param {Object}
					 *            layerNames An object like : { 'layerName1' :
					 *            'checked', 'layerName2' : 'unchecked',
					 *            'layerName3' : 'disable', 'layerName4' :
					 *            'hide', ... } Four values are possible for
					 *            each layer: checked: enable and show the
					 *            layer, check the tree node, display the legend
					 *            unchecked: enable but hide the layer, uncheck
					 *            the tree node, display the legend disable:
					 *            disable the layer, uncheck the tree node,
					 *            disable the legend hide: disable and hide the
					 *            layer, uncheck the tree node, hide the legend
					 * 
					 */
					toggleLayersAndLegends : function(layerNames) {

						var layersAndLegendsToEnableChecked = [], layersAndLegendsToEnableUnchecked = [], layersAndLegendsToDisable = [], layersAndLegendsToHide = [], layerName;
						for (layerName in layerNames) {
							if (layerNames.hasOwnProperty(layerName)) {
								switch (layerNames[layerName]) {
								case 'checked':
									layersAndLegendsToEnableChecked.push(layerName);
									break;
								case 'unchecked':
									layersAndLegendsToEnableUnchecked.push(layerName);
									break;
								case 'disable':
									layersAndLegendsToDisable.push(layerName);
									break;
								case 'hide':
									layersAndLegendsToHide.push(layerName);
									break;
								default:
									break;
								}
							}
						}
						this.enableLayersAndLegends(layersAndLegendsToEnableChecked, true, true);
						this.enableLayersAndLegends(layersAndLegendsToEnableUnchecked, false, true);
						this.disableLayersAndLegends(layersAndLegendsToDisable, true, false, true);
						this.disableLayersAndLegends(layersAndLegendsToHide, true, true, true);
					},

					/**
					 * Enable and show the layer(s) node and show the legend(s)
					 * 
					 * @param {Array}
					 *            layerNames The layer names
					 * @param {Boolean}
					 *            check True to check the layerTree node
					 *            checkbox (default to false)
					 * @param {Boolean}
					 *            setForceDisable Set the layerTree node
					 *            forceDisable parameter (default to true) The
					 *            forceDisable is used by the
					 *            'toggleLayersAndLegendsForZoom' function to
					 *            avoid to enable, a node disabled for another
					 *            cause that the zoom range.
					 */
					enableLayersAndLegends : function(layerNames, check, setForceDisable) {
						if (!Ext.isEmpty(layerNames)) {
							// The tabPanels must be activated before to show a
							// child component
							var isLayerPanelVisible = this.layerPanel.isVisible(), i;

							this.layersAndLegendsPanel.activate(this.layerPanel);
							for (i = 0; i < layerNames.length; i++) {
								var node = this.layerTree.getNodeByLayerName(layerNames[i]);
								if (!Ext.isEmpty(node)) {
									var nodeId = node.id;
									if (setForceDisable !== false) {
										this.layerTree.getNodeById(nodeId).forceDisable = false;
									}
									if (this.layerTree.getNodeById(nodeId).zoomDisable !== true) {
										this.layerTree.getNodeById(nodeId).enable();
									}
									this.layerTree.getNodeById(nodeId).getUI().show();

									if (check === true) {
										// Note: the redraw must be done before
										// to
										// check the node
										// to avoid to redisplay the old layer
										// images before the new one
										var layers = this.map.getLayersByName(layerNames[i]);
										layers[0].redraw(true);
										this.layerTree.toggleNodeCheckbox(nodeId, true);
									}
								}
							}

							this.layersAndLegendsPanel.activate(this.legendPanel);
							this.setLegendsVisible(layerNames, true);

							// Keep the current activated panel activated
							if (isLayerPanelVisible) {
								this.layersAndLegendsPanel.activate(this.layerPanel);
							}
						} else {
							console.warn('EnableLayersAndLegends : layerNames parameter is empty.');
						}
					},

					/**
					 * Disable (and hide if asked) the layer(s) And hide the
					 * legend(s)
					 * 
					 * @param {Array}
					 *            layerNames The layer names
					 * @param {Boolean}
					 *            uncheck True to uncheck the layerTree node
					 *            checkbox (default to false)
					 * @param {Boolean}
					 *            hide True to hide the layer(s) and legend(s)
					 *            (default to false)
					 * @param {Boolean}
					 *            setForceDisable Set the layerTree node
					 *            forceDisable parameter (default to true) The
					 *            forceDisable is used by the
					 *            'toggleLayersAndLegendsForZoom' function to
					 *            avoid to enable, a node disable for another
					 *            cause that the zoom range.
					 */
					disableLayersAndLegends : function(layerNames, uncheck, hide, setForceDisable) {
						var i;
						if (!Ext.isEmpty(layerNames) && (this.layerTree !== null)) {
							for (i = 0; i < layerNames.length; i++) {
								var node = this.layerTree.getNodeByLayerName(layerNames[i]);
								if (!Ext.isEmpty(node)) {
									var nodeId = node.id;
									if (uncheck === true) {
										this.layerTree.toggleNodeCheckbox(nodeId, false);
									}
									var node = this.layerTree.getNodeById(nodeId);
									if (hide === true) {
										node.getUI().hide();
									}
									node.disable();
									if (setForceDisable !== false) {
										node.forceDisable = true;
									}
								}
								this.setLegendsVisible([ layerNames[i] ], false);
							}
						}
					},

					/**
					 * Toggle the layer node and legend in function of the zoom
					 * range
					 * 
					 * @param {OpenLayers.Layer}
					 *            layer The layer to check
					 */
					toggleLayersAndLegendsForZoom : function(layer) {
						if (!Ext.isEmpty(this.layerTree)) {
							var node = this.layerTree.getNodeByLayerName(layer.name);
							
							if (!Ext.isEmpty(node) && !node.hidden) {
								if (!layer.calculateInRange()) {
									node.zoomDisable = true;
									this.disableLayersAndLegends([ layer.name ], false, false, false);
								} else {
									node.zoomDisable = false;
									if (node.forceDisable !== true) {
										this.enableLayersAndLegends([ layer.name ], false, false);
									}
								}
							}
						}
					},

					/**
					 * Convenience function to hide or show a legend by boolean.
					 * 
					 * @param {Array}
					 *            layerNames The layers name
					 * @param {Boolean}
					 *            visible True to show, false to hide
					 */
					setLegendsVisible : function(layerNames, visible) {
						var i;
						for (i = 0; i < layerNames.length; i++) {
							var legendCmp = this.legendPanel.findById(this.id + layerNames[i]);
							if (!Ext.isEmpty(legendCmp)) {
								if (visible === true) {
									var layers = this.map.getLayersByName(layerNames[i]);
									if (layers[0].calculateInRange() && layers[0].getVisibility()) {
										legendCmp.show();
									} else {
										legendCmp.hide();
									}
								} else {
									legendCmp.hide();
								}
							}
						}
					},

					/**
					 * A layer has been selected in the layer selector
					 */
					layerSelected : function(value, geoPanelId) {
						if (this.info) {
							this.info.destroy();
						}
						if (geoPanelId == this.id) {
							if (value.data.code !== null) {
								var layerName = value.data.code;
								var url = value.data.url;
								var popupTitle = this.popupTitle;
								
								// Change the WFS layer typename
								this.wfsLayer.protocol.featureType = layerName;
								this.wfsLayer.protocol.options.featureType = layerName;
								this.wfsLayer.protocol.format.featureType = layerName;
								this.wfsLayer.protocol.params.typename = layerName;
								this.wfsLayer.protocol.options.url = url;

								// Remove all current features
								this.wfsLayer.destroyFeatures();

								// Copy the visibility range from the original
								// layer
								originalLayers = this.map.getLayersByName(layerName);
								if (originalLayers != null) {
									originalLayer = originalLayers[0];
									this.wfsLayer.maxResolution = originalLayer.maxResolution;
									this.wfsLayer.maxScale = originalLayer.maxScale;
									this.wfsLayer.minResolution = originalLayer.minResolution;
									this.wfsLayer.minScale = originalLayer.minScale;
									this.wfsLayer.alwaysInRange = false;
									this.wfsLayer.calculateInRange();
								}

								// Make it visible
								this.wfsLayer.setVisibility(true);

								// Force a refresh (rebuild the WFS URL)
								this.wfsLayer.moveTo(null, true, false);
								
								// Set the getfeature control
								if (this.getFeatureControl !== null) {
									this.getFeatureControl.protocol = new OpenLayers.Protocol.WFS({
										url : this.wfsLayer.protocol.url,
										featureType : this.wfsLayer.protocol.featureType
									});

								}
								// Set the layer name in other tools
								if (this.featureInfoControl !== null) {
									this.featureInfoControl.layerName = layerName;
								}
								if (this.getFeatureControl !== null) {
									this.getFeatureControl.layerName = layerName;
								}
								
								this.wfsLayer.refresh();
								this.wfsLayer.strategies[0].update({force:true});

							} else {
								// Hide the layer
								this.wfsLayer.setVisibility(false);
							}
							
							for (var i = 0 ; i < this.layersList.length ; i++) {
							if (this.layersList[i].name == layerName) {
							this.info = new OpenLayers.Control.WMSGetFeatureInfo({
								//title: 'Identify features by clicking',
								queryVisible: true,
								infoFormat : 'application/vnd.ogc.gml', // format utilisé pour la récupération des infos de la feature interrogée sur la couche WMS
								maxFeatures:1,
								multiple: false,
								layers: [this.layersList[i]],
								eventListeners: {
									getfeatureinfo: function(event) {
										if (window.DOMParser) {
											parser = new DOMParser();
											xmlDoc = parser.parseFromString(event.text,"text/xml");
										} else {// Internet Explorer
											xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
											xmlDoc.async=false;
											xmlDoc.loadXML(event.text);
										}

										var html = '<ul>';


										if (typeof(xmlDoc.children[0].children[0].children[0]) != 'undefined') {
										countXmlDoc = xmlDoc.children[0].children[0].children[0].children.length;
										for (var i = 1 ; i < countXmlDoc ; i++){
												html += '<li>';
												html += xmlDoc.children[0].children[0].children[0].children[i].localName + ': '+ xmlDoc.children[0].children[0].children[0].children[i].childNodes[0].nodeValue;
												html += '</li>';
											}
										}
										html += '</ul>';
										popup = new GeoExt.Popup({
											title : popupTitle,
											location : this.map.getLonLatFromPixel(event.xy),
											width : 200,
											map : this.map,
											html : html,
											maximizable : false,
											collapsible : false,
											unpinnable : false
										});
										popup.show();
									}
								}
							});
							this.map.addControl(this.info);
							this.info.activate();
							break;
							}
						}
						}
						
					},
					

					/**
					 * A feature has been selected using the GetFeatureControl
					 * tool.
					 */
					getFeature : function(feature, mapId) {
						if (mapId == this.map.id) {
							// Add the feature to the vector layer
							if (this.vectorLayer !== null) {
								this.vectorLayer.addFeatures(feature);
							}
						}

					},

					/**
					 * Destroy this component.
					 */
					destroy : function() {
						this.baseLayer = null;
						this.wktFormat = null;
						this.layersActivation = null;
						this.layersList = null;
						this.featureInfoControl = null;

						if (this.map) {
							this.map.destroy();
							this.map = null;
						}
						if (this.selectorButton) {
							this.selectorButton.destroy();
							this.selectorButton = null;
						}
						if (this.vectorLayer) {
							this.vectorLayer.destroy();
							this.vectorLayer = null;
						}
						if (this.wfsLayer) {
							this.wfsLayer.destroy();
							this.wfsLayer = null;
						}
						if (this.mapPanel) {
							this.mapPanel.destroy();
							this.mapPanel = null;
						}
						if (this.mapToolbar) {
							this.mapToolbar.destroy();
							this.mapToolbar = null;
						}
						if (this.layersAndLegendsPanel) {
							this.layersAndLegendsPanel.destroy();
							this.layersAndLegendsPanel = null;
						}
						if (this.layerPanel) {
							this.layerPanel.destroy();
							this.layerPanel = null;
						}
						if (this.layerTree) {
							this.layerTree.destroy();
							this.layerTree = null;
						}
						if (this.legendPanel) {
							this.legendPanel.destroy();
							this.legendPanel = null;
						}
						Genapp.GeoPanel.superclass.destroy.call(this);

					}
				});/**
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
 * The class of the Grid Details Panel.
 * 
 * @class Genapp.GridDetailsPanel
 * @extends Ext.GridPanel
 * @constructor Create a new GridDetailsPanel
 * @param {Object} config The config object
 */
Genapp.GridDetailsPanel = Ext.extend(Ext.grid.GridPanel, {
    /**
     * @cfg {Number} headerWidth
     * The tab header width. (Default to 60)
     */
    headerWidth:95,
    /**
     * @cfg {Boolean} closable
     * Panels themselves do not directly support being closed, but some Panel subclasses do (like
     * {@link Ext.Window}) or a Panel Class within an {@link Ext.TabPanel}.  Specify true
     * to enable closing in such situations. Defaults to true.
     */
    closable: true,
    /**
     * @cfg {Boolean} autoScroll
     * true to use overflow:'auto' on the panel's body element and show scroll bars automatically when
     * necessary, false to clip any overflowing content (defaults to true).
     */
    autoScroll:true,
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp-query-grid-details-panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-query-grid-details-panel',
    /**
     * @cfg {String} loadingMsg
     * The loading message (defaults to <tt>'Loading...'</tt>)
     */
    loadingMsg: 'Loading...',
    layout: 'fit',
    /**
     * @cfg {String} openDetailsButtonTitle
     * The open Details Button Title (defaults to <tt>'See the details'</tt>)
     */
    openDetailsButtonTitle: 'See the details',
    /**
     * @cfg {String} openDetailsButtonTip
     * The open Details Button Tip (defaults to <tt>'Display the row details into the details panel.'</tt>)
     */
    openDetailsButtonTip: 'Display the row details into the details panel.',
    /**
     * @cfg {String} getChildrenButtonTitle
     * The get Children Button Title (defaults to <tt>'Switch to the children'</tt>)
     */
    getChildrenButtonTitle: 'Switch to the children',
    /**
     * @cfg {String} getChildrenButtonTip
     * The get Children Button Tip (defaults to <tt>'Display the children of the data.'</tt>)
     */
    getChildrenButtonTip: 'Display the children of the data.',
    /**
     * @cfg {String} getParentButtonTitle
     * The get Parent Button Title (defaults to <tt>'Return to the parent'</tt>)
     */
    getParentButtonTitle: 'Return to the parent',
    /**
     * @cfg {String} getParentButtonTip
     * The get Parent Button Tip (defaults to <tt>'Display the parent of the data.'</tt>)
     */
    getParentButtonTip: 'Display the parent of the data.',
    /**
     * @cfg {Number} tipDefaultWidth
     * The tip Default Width. (Default to 300)
     */
    tipDefaultWidth: 300,
    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
    /**
     * @cfg {String} dateFormat The date format for the date
     *      fields (defaults to <tt>'Y/m/d'</tt>)
     */
    // TODO: Merge this param with the dateFormat param of the consultation panel
    dateFormat : 'Y/m/d',
    /**
     * @cfg {Number} tipImageDefaultWidth The tip Image Default Width.
     *      (Default to 200)
     */
    // TODO: Merge this param with the tipImageDefaultWidth param of the consultation panel
    tipImageDefaultWidth : 200,

    /**
     * Renders for the left tools column cell
     * 
     * @param {Object}
     *            value The data value for the cell.
     * @param {Object}
     *            metadata An object in which you may set the
     *            following attributes: {String} css A CSS class
     *            name to add to the cell's TD element. {String}
     *            attr : An HTML attribute definition string to
     *            apply to the data container element within the
     *            table cell (e.g. 'style="color:red;"').
     * @param {Ext.data.record}
     *            record The {@link Ext.data.Record} from which
     *            the data was extracted.
     * @param {Number}
     *            rowIndex Row index
     * @param {Number}
     *            colIndex Column index
     * @param {Ext.data.Store}
     *            store The {@link Ext.data.Store} object from
     *            which the Record was extracted.
     * @return {String} The html code for the column
     * @hide
     */
    renderLeftTools : function(value, metadata, record,
            rowIndex, colIndex, store) {

        var stringFormat = '';
        if (!this.hideDetails) {
            stringFormat = '<div class="genapp-query-grid-details-panel-slip" '
                +'onclick="Genapp.cardPanel.consultationPage.openDetails(\'{0}\', \'ajaxgetdetails\');"'
                +'ext:qtitle="' + this.openDetailsButtonTitle + '"'
                +'ext:qwidth="' + this.tipDefaultWidth + '"'
                +'ext:qtip="' + this.openDetailsButtonTip + '"'
            +'></div>';
        }
        if(this.hasChild) {
            stringFormat += '<div class="genapp-query-grid-details-panel-get-children" '
                +'onclick="Genapp.cardPanel.consultationPage.getChildren(\'{1}\',\'{0}\');"'
                +'ext:qtitle="' + this.getChildrenButtonTitle + '"'
                +'ext:qwidth="' + this.tipDefaultWidth + '"'
                +'ext:qtip="' + this.getChildrenButtonTip + '"'
            +'></div>';
        }
        return String.format(stringFormat, record.data.id, this.ownerCt.getId(),record.data.LOCATION_COMPL_DATA__SIT_NO_CLASS);
    },

    /**
     * Return the pattern used to format a number.
     * 
     * @param {String}
     *            decimalSeparator the decimal separator
     *            (default to',')
     * @param {Integer}
     *            decimalPrecision the decimal precision
     * @param {String}
     *            groupingSymbol the grouping separator (absent
     *            by default)
     */
    // TODO: Merge this function with the numberPattern fct of the consultation panel
    numberPattern : function(decimalSeparator, decimalPrecision, groupingSymbol) {
        // Building the number format pattern for use by ExtJS
        // Ext.util.Format.number
        var pattern = [], i;
        pattern.push('0');
        if (groupingSymbol) {
            pattern.push(groupingSymbol + '000');
        }
        if (decimalPrecision) {
            pattern.push(decimalSeparator);
            for (i = 0; i < decimalPrecision; i++) {
                pattern.push('0');
            }
        }
        return pattern.join('');
    },

    /**
     * Render an Icon for the data grid.
     */
     // TODO: Merge this function with the renderIcon fct of the consultation panel
    renderIcon : function(value, metadata, record, rowIndex, colIndex, store, columnLabel) {
        if (!Ext.isEmpty(value)) {
            return '<img src="' + Genapp.base_url + '/js/genapp/resources/images/picture.png"'
            + 'ext:qtitle="' + columnLabel + ' :"'
            + 'ext:qwidth="' + this.tipImageDefaultWidth + '"'
            + 'ext:qtip="'
            + Genapp.util.htmlStringFormat('<img width="' + (this.tipImageDefaultWidth - 12) 
            + '" src="' + Genapp.base_url + '/img/photos/' + value 
            +'" />') 
            + '">';
        }
    },

    // private
    initComponent : function() {
            this.itemId = this.initConf.id;
            this.hasChild = this.initConf.hasChild;
            this.title = this.initConf.title;
            this.parentItemId = this.initConf.parentItemId;
            // We need of the ownerCt here (before it's set automatically when this Component is added to a Container)
            this.ownerCt = this.initConf.ownerCt;

            this.store = new Ext.data.ArrayStore({
                // store configs
                autoDestroy: true,
                // reader configs
                idIndex: 0,
                fields: this.initConf.fields,
                data: this.initConf.data
            });

            // setup the columns
            var i;
            var columns = this.initConf.columns;
            for(i = 0; i<columns.length; i++){
                columns[i].header =  Genapp.util.htmlStringFormat(columns[i].header);
                columns[i].tooltip =  Genapp.util.htmlStringFormat(columns[i].tooltip);
                // TODO: Merge this part with the same part of the consultation panel
                switch (columns[i].type) {
                // TODO : BOOLEAN, CODE, COORDINATE, ARRAY,
                // TREE
                case 'STRING':
                case 'INTEGER':
                    columns[i].xtype = 'gridcolumn';
                    break;
                case 'NUMERIC':
                    columns[i].xtype = 'numbercolumn';
                    if (!Ext.isEmpty(columns[i].decimals)) {
                        columns[i].format = this.numberPattern('.', columns[i].decimals);
                    }
                    break;
                case 'DATE':
                    columns[i].xtype = 'datecolumn';
                    columns[i].format = this.dateFormat;
                    break;
                case 'IMAGE':
                    columns[i].header = '';
                    columns[i].width = 30;
                    columns[i].sortable = false;
                    columns[i].renderer = this.renderIcon.createDelegate(this, [Genapp.util.htmlStringFormat(columns[i].tooltip)], true);
                    break;
                default:
                    columns[i].xtype = 'gridcolumn';
                    break;
                }
            }
            var leftToolsHeader = '';
            if (!Ext.isEmpty(this.parentItemId)) {
                leftToolsHeader = '<div class="genapp-query-grid-details-panel-get-parent" '
                    +'onclick="Genapp.cardPanel.consultationPage.getParent(\'' + this.ownerCt.getId() +'\');"'
                    +'ext:qtitle="' + this.getParentButtonTitle + '"'
                    +'ext:qwidth="' + this.tipDefaultWidth + '"'
                    +'ext:qtip="' + this.getParentButtonTip + '"'
                    +'></div>';
            }
            this.initConf.columns.unshift({
                dataIndex:'leftTools',
                header:leftToolsHeader,
                renderer:this.renderLeftTools.createDelegate(this),
                sortable:false,
                fixed:true,
                menuDisabled:true,
                align:'center',
                width:50// 70 for three buttons
            });
            this.colModel = new Ext.grid.ColumnModel({
                defaults: {
                    width: 100,
                    sortable: true
                },
                columns: columns
            });
        Genapp.GridDetailsPanel.superclass.initComponent.call(this);
    }
});/**
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
 * A PDFComponent is a tag object of type 'application/pdf'
 * 
 * @class Genapp.PDFComponent
 * @extends Ext.BoxComponent
 * @constructor Create a new PDF component
 * @param {Object} config The config object
 * @xtype pdf
 */
Genapp.PDFComponent = Ext.extend(Ext.BoxComponent, {

    /**
     * @cfg {String} mimeType
     * The mimeType of the object. Defaults to 'application/pdf'.
     * @hide
     */
    mimeType: 'application/pdf',
    /**
     * @cfg {String} url
     * The pdf url. Defaults to null.
     */
    url: null,
    defaultMessage: 'Please select a document...',
    defaultHtml: '<h4>Content on this page requires Adobe Acrobat Reader.</h4> \
        <p>You must have the free Adobe Reader program installed on your computer \
        to view the documents marked &quot;(PDF).&quot; \
        <p>Download the <a href="http://www.adobe.com/products/acrobat/readstep2.html"> \
        free Adobe Reader program</a>.</p> \
        <p><a href="http://www.adobe.com/products/acrobat/readstep2.html">\
        <img src="http://www.adobe.com/images/shared/download_buttons/get_adobe_reader.gif" \
        width="88" height="31" border="0" alt="Get Adobe Reader." />',

    // Please don't remove this comment !
    // This two methods don't work on IE (the object tag can't be move?)
    /*onRender : function(ct, position){
        this.autoEl = {
            tag:'object',
            data:this.url,
            type:this.mimeType,
            width:'100%',
            height:'100%',
            html:'alt : <a href="'+this.url+'">'+this.url+'</a>'
        }
        Ext.ux.PDFComponent.superclass.onRender.call(this, ct, position);
    }
    onRender : function(ct, position){
        var obj = document.createElement("object");
        obj.setAttribute("data", this.url);
        obj.setAttribute("type", this.mimeType);
        obj.setAttribute("width", '100%');
        obj.setAttribute("height", '100%');
        obj.appendChild(document.createTextNode('alt : <a href="'+this.url+'">'+this.url+'</a>'));
        this.el = Ext.get(obj);
    }*/

    //private
    initComponent : function(){
        Ext.Panel.superclass.initComponent.call(this);

        this.on('render',function(cmp){
            if(Ext.isEmpty(this.url)){
                this.updateElement();
            } else{
                this.el = Ext.get(Ext.DomHelper.overwrite(this.ownerCt.body.dom, {
                    tag:'span',
                    html:this.defaultMessage
                }));
            }
        },this);
    },
    
    /**
     * Update the pdf url.
     * @param {String} url The pdf url
     */
    updateUrl : function(url){
        this.url = url;
        this.updateElement();
    },

    /**
     * Update the component element
     * 
     * @hide
     * @private
     */
    updateElement : function(){
        // Please don't remove this comment !
        // This methods does't work on IE (the object can't be updated?)
        //this.el.set({"data": url}); 
        this.el = Ext.get(Ext.DomHelper.overwrite(this.ownerCt.body.dom, {
            tag:'object',
            data:this.url,
            type:this.mimeType,
            width:'100%',
            height:'100%',
            html:this.defaultHtml
        }));
    },

    /**
     * Reset the component body
     */
    reset : function(){
        if(this.url !== null){
            this.el = Ext.get(Ext.DomHelper.overwrite(this.ownerCt.body.dom, {
                tag:'span',
                html:this.defaultMessage
            }));
            this.url = null;
        }
    }
});
Ext.reg('pdf', Genapp.PDFComponent);/**
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
 * A PredefinedRequestPanel correspond to the complete page for selecting the predefined request.
 * 
 * @class Genapp.PredefinedRequestPanel
 * @extends Ext.Panel
 * @constructor Create a new Predefined Request Panel
 * @param {Object} config The config object
 * @xtype predefinedrequestpanel
 */
Genapp.PredefinedRequestPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} id
     * <p>The <b>unique</b> id of this component (defaults to an {@link #getId auto-assigned id}).
     * You should assign an id if you need to be able to access the component later and you do
     * not have an object reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).</p>
     * <p>Note that this id will also be used as the element id for the containing HTML element
     * that is rendered to the page for this component. This allows you to write id-based CSS
     * rules to style the specific instance of this component uniquely, and also to select
     * sub-elements using this component's id as the parent.</p>
     * <p><b>Note</b>: to avoid complications imposed by a unique <tt>id</tt> also see
     * <code>{@link #itemId}</code> and <code>{@link #ref}</code>.</p>
     * <p><b>Note</b>: to access the container of an item see <code>{@link #ownerCt}</code>.</p>
     */
    id:'predefined_request',
    /**
     * @cfg {String} ref
     * <p>A path specification, relative to the Component's <code>{@link #ownerCt}</code>
     * specifying into which ancestor Container to place a named reference to this Component.</p>
     * <p>The ancestor axis can be traversed by using '/' characters in the path.
     * For example, to put a reference to a Toolbar Button into <i>the Panel which owns the Toolbar</i>:</p><pre><code>
var myGrid = new Ext.grid.EditorGridPanel({
title: 'My EditorGridPanel',
store: myStore,
colModel: myColModel,
tbar: [{
    text: 'Save',
    handler: saveChanges,
    disabled: true,
    ref: '../saveButton'
}],
listeners: {
    afteredit: function() {
//      The button reference is in the GridPanel
        myGrid.saveButton.enable();
    }
}
});
</code></pre>
     * <p>In the code above, if the <code>ref</code> had been <code>'saveButton'</code>
     * the reference would have been placed into the Toolbar. Each '/' in the <code>ref</code>
     * moves up one level from the Component's <code>{@link #ownerCt}</code>.</p>
     * <p>Also see the <code>{@link #added}</code> and <code>{@link #removed}</code> events.</p>
     */
    ref:'predefinedRequestPage',
    /**
     * @cfg {Boolean} frame
     * <code>false</code> by default to render with plain 1px square borders. <code>true</code> to render with
     * 9 elements, complete with custom rounded corners (also see {@link Ext.Element#boxWrap}).
     * @hide
     */
    frame: true,
    /**
     * @cfg {String} title
     * The title text to be used as innerHTML (html tags are accepted) to display in the panel
     * <code>{@link #header}</code> (defaults to ''). When a <code>title</code> is specified the
     * <code>{@link #header}</code> element will automatically be created and displayed unless
     * {@link #header} is explicitly set to <code>false</code>.  If you do not want to specify a
     * <code>title</code> at config time, but you may want one later, you must either specify a non-empty
     * <code>title</code> (a blank space ' ' will do) or <code>header:true</code> so that the container
     * element will get created.
     * Default to 'Predefined Request'.
     */
    title: 'Predefined Request',
    /**
     * @cfg {String/Object} layout
     * <p><b>*Important</b>: In order for child items to be correctly sized and
     * positioned, typically a layout manager <b>must</b> be specified through
     * the <code>layout</code> configuration option.</p>
     * <br><p>The sizing and positioning of child {@link items} is the responsibility of
     * the Container's layout manager which creates and manages the type of layout
     * you have in mind.
     * For complete
     * details regarding the valid config options for each layout type, see the
     * layout class corresponding to the <code>layout</code> specified.</p>
     * @hide
     */
    layout: 'border',
    /**
     * @cfg {String} consultationButtonText
     * The consultation Button Text (defaults to <tt>'Consultation'</tt>)
     */
    consultationButtonText: "Consultation",
    /**
     * @cfg {String} consultationButtonTooltip
     * The consultation Button Tooltip (defaults to <tt>'Go to the consultation page'</tt>)
     */
    consultationButtonTooltip:"Go to the consultation page",
    /**
     * @cfg {String} descriptionTitle
     * The description Title (defaults to <tt>''</tt>)
     */
    descriptionTitle:"",
    /**
     * @cfg {String} nameColumnHeader
     * The name Column Header (defaults to <tt>'Name'</tt>)
     */
    nameColumnHeader: "Name",
    /**
     * @cfg {String} labelColumnHeader
     * The label Column Header (defaults to <tt>'Label'</tt>)
     */
    labelColumnHeader: "Label",
    /**
     * @cfg {String} descriptionColumnHeader
     * The description Column Header (defaults to <tt>'Description'</tt>)
     */
    descriptionColumnHeader: "Description",
    /**
     * @cfg {String} dateColumnHeader
     * The date Column Header (defaults to <tt>'Date'</tt>)
     */
    dateColumnHeader: "Date",
    /**
     * @cfg {String} clickColumnHeader
     * The click Column Header (defaults to <tt>'Click(s)'</tt>)
     */
    clickColumnHeader: "Click(s)",
    /**
     * @cfg {String} positionColumnHeader
     * The position Column Header (defaults to <tt>'Rank'</tt>)
     */
    positionColumnHeader: "Rank",
    /**
     * @cfg {String} groupNameColumnHeader
     * The group Name Column Header (defaults to <tt>'Group name'</tt>)
     */
    groupNameColumnHeader: "Group name",
    /**
     * @cfg {String} groupLabelColumnHeader
     * The group Label Column Header (defaults to <tt>'Group label'</tt>)
     */
    groupLabelColumnHeader: "Group label",
    /**
     * @cfg {String} groupPositionColumnHeader
     * The group Position Column Header (defaults to <tt>'Group Rank'</tt>)
     */
    groupPositionColumnHeader: "Group Rank",
    /**
     * @cfg {String} groupTextTpl
     * The group Text Tpl (defaults to <tt>'{group} ({[values.rs.length]})'</tt>)
     */
    groupTextTpl:"{group} ({[values.rs.length]})",
    /**
     * @cfg {String} resetButtonText
     * The reset Button Text (defaults to <tt>'Reset'</tt>)
     */
    resetButtonText:"Reset",
    /**
     * @cfg {String} resetButtonTooltip
     * The reset Button Tooltip (defaults to <tt>'Reset the form with the default values'</tt>)
     */
    resetButtonTooltip:"Reset the form with the default values",
    /**
     * @cfg {String} launchRequestButtonText
     * The launch Request Button Text (defaults to <tt>'Launch the request'</tt>)
     */
    launchRequestButtonText:"Launch the request",
    /**
     * @cfg {String} launchRequestButtonTooltip
     * The launch Request Button Tooltip (defaults to <tt>'Launch the request in the consultation page'</tt>)
     */
    launchRequestButtonTooltip:"Launch the request in the consultation page",
    /**
     * @cfg {String} loadingText
     * The loading Text (defaults to <tt>'Loading...'</tt>)
     */
    loadingText:"Loading...",
    /**
     * @cfg {String} defaultCardPanelText
     * The default Card Panel Text (defaults to <tt>'Please select a request...'</tt>)
     */
    defaultCardPanelText:"Please select a request...",
    /**
     * @cfg {String} defaultErrorCardPanelText
     * The default Error Card Panel Text (defaults to <tt>'Sorry, the loading failed...'</tt>)
     */
    defaultErrorCardPanelText:"Sorry, the loading failed...",
    /**
     * @cfg {String} criteriaPanelTitle
     * The criteria Panel Title (defaults to <tt>'Request criteria'</tt>)
     */
    criteriaPanelTitle:"Request criteria",

    // private
    initComponent : function() {

        /**
         * The grid reader
         */
        var gridReader = new Ext.data.ArrayReader({
            root:'rows',
            totalProperty:'total'
            }, [
           {name: 'request_name', type: 'string'},
           {name: 'label', type: 'string'},
           {name: 'definition', type: 'string'},
           {name: 'click', type: 'int'},
           {name: 'date', type: 'date', dateFormat: 'Y-m-d'},
           {name: 'criteria_hint', type: 'string'},
           {name: 'position', type: 'int'},
           {name: 'group_name', type: 'string'},
           {name: 'group_label', type: 'string'},
           {name: 'group_position', type: 'int'},
           {name: 'dataset_id', type: 'string'}
        ]);

        /**
         * The grid store
         */
        var gridStore = new Ext.data.GroupingStore({
            reader: gridReader,
            autoDestroy: true,
            url: Genapp.ajax_query_url + 'ajaxgetpredefinedrequestlist',
            remoteSort: false,
            sortInfo:{field: 'position', direction: "ASC"},
            groupField:'group_position' // Note: This field is used to group the rows and to sort the groups too
        });

        /**
         * Setup the grid row expander template
         */
        var gridRowExpanderTemplate = [];
        if(!Ext.isEmpty(this.descriptionTitle)){
            gridRowExpanderTemplate.push('<h4 class="genapp-predefined-request-grid-panel-description-title">' + this.descriptionTitle + ':</h4>');
        }
        gridRowExpanderTemplate.push('<p class="genapp-predefined-request-grid-panel-description-text">{definition}</p>');

        /**
         * The grid row expander
         */
        var gridRowExpander = new Ext.ux.grid.RowExpander({
            tpl : new Ext.Template(gridRowExpanderTemplate)
        });

        /**
         * Function used to format the grouping field value for display in the group
         * 
         * @param {Object} v The new value of the group field.
         * @param {undefined} unused Unused parameter.
         * @param {Ext.data.Record} r The Record providing the data for the row which caused group change.
         * @param {Number} rowIndex The row index of the Record which caused group change.
         * @param {Number} colIndex The column index of the group field.
         * @param {Ext.data.Store} ds The Store which is providing the data Model.
         * @param {String} dataName The dataName to display
         * @returns {String} A string to display.
         */
        var groupRendererFct = function(v, unused, r, rowIndex, colIndex, ds, dataName) {
            return r.data[dataName];
        };

        /**
         * The grid column model
         */
        var colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true
            },
            columns:[
                //gridRowExpander, // Show a expand/collapse tools for each row
                {id: 'request_name', header: this.nameColumnHeader, dataIndex: 'request_name', width:30, groupable :false, hidden: true},
                {header: this.labelColumnHeader, dataIndex: 'label', groupable :false},
                {header: this.descriptionColumnHeader, dataIndex: 'definition', groupable :false, hidden: true},
                {header: this.dateColumnHeader, dataIndex: 'date', format: 'Y/m/d', xtype:'datecolumn', width:20, groupable :false, hidden: true},
                {header: this.clickColumnHeader, dataIndex: 'click', width:10, groupable :false, hidden: true},
                {header: this.positionColumnHeader, dataIndex: 'position', width:10, groupable :false, hidden: true},
                {header: this.groupNameColumnHeader, dataIndex: 'group_name', hidden: true, 
                    groupRenderer: groupRendererFct.createDelegate(this, ['group_label'], true)
                },
                {header: this.groupLabelColumnHeader, dataIndex: 'group_label', hidden: true},
                {header: this.groupPositionColumnHeader, dataIndex: 'group_position', width:10, hidden: true,
                    groupRenderer: groupRendererFct.createDelegate(this, ['group_label'], true)
                }
            ]
        });

        /**
         * @cfg {Ext.grid.GridPanel} grid
         * The grid
         */
        this.grid = new Ext.grid.GridPanel({
            region:'center',
            /*margins:{
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            },*/
            autoExpandColumn: 1,
            border: true,
            plugins: gridRowExpander,
            ds: gridStore,
            cm: colModel,
            view: new Ext.grid.GroupingView({
                forceFit:true,
                groupTextTpl: this.groupTextTpl
            }),
            sm: new Ext.grid.RowSelectionModel({
                singleSelect: true,
                listeners: {
                    'rowselect': this.onGridRowSelect,
                    scope:this
                }
            })
        });

        /**
         * @cfg {Ext.form.FieldSet} requestCriteriaCardPanel
         * The request Criteria Card Panel
         */
        this.requestCriteriaCardPanel = new Ext.form.FieldSet({
            cls: 'genapp-predefined-request-criteria-card-panel',
            layout: 'card',
            autoScroll: true,
            activeItem: 2,
            labelWidth: 90,
            title:' ', // Without space the title div is not rendered, so it's not possible to change it later
            defaults: {width: 140, border:false},
            width: 350, // Bug ext: The size must be specified to have a good render when the panel is not activated
            border: true,
            fbar: this.requestCriteriaCardPanelFooterTBar = new Ext.Toolbar({
                hidden: true,
                cls: 'genapp-predefined-request-criteria-panel-footerTBar',
                items: [
                    this.resetButton = new Ext.Button({
                        text:this.resetButtonText,
                        listeners:{
                            'render':function(cmp){
                                new Ext.ToolTip({
                                    anchor: 'left',
                                    target: cmp.getEl(),
                                    html:this.resetButtonTooltip,
                                    showDelay: Ext.QuickTips.getQuickTip().showDelay,
                                    dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                                });
                            },
                            scope:this
                        },
                        handler:function(b,e){
                            var selectedRequest = this.grid.getSelectionModel().getSelected();
                            this.requestCriteriaCardPanel.getComponent(selectedRequest.data.request_name).getForm().reset();
                        },
                        scope:this
                    }),
                    this.launchRequestButton = new Ext.Button({
                        text: this.launchRequestButtonText,
                        listeners:{
                            'render':function(cmp){
                                new Ext.ToolTip({
                                    anchor: 'left',
                                    target: cmp.getEl(),
                                    html:this.launchRequestButtonTooltip,
                                    showDelay: Ext.QuickTips.getQuickTip().showDelay,
                                    dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                                });
                            },
                            scope:this
                        },
                        handler:function(b,e){
                            // Get the selected request and the new criteria values
                            var selectedRequestData = this.grid.getSelectionModel().getSelected().data;
                            var fieldValues = this.requestCriteriaCardPanel.getComponent(selectedRequestData.request_name).getForm().getValues(); // getFieldValues() doesn't work like expected with the checkbox
                            // Load and launch the request
                            var consultationPanel = Ext.getCmp('consultation_panel');
                            consultationPanel.loadRequest({
                                datasetId:selectedRequestData.dataset_id,
                                name:selectedRequestData.request_name,
                                fieldValues:fieldValues
                            });
                            //Genapp.cardPanel.getLayout().setActiveItem('consultation_panel');
                            Genapp.cardPanel.activate('consultation_panel');
                        },
                        scope:this
                    })
                ]
            }),
            items: [{// We can't use the default loading indicator for IE7
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'loading-indicator',
                    html: this.loadingText
                }
            },{
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'genapp-predefined-request-criteria-panel-error-msg',
                    html: this.defaultErrorCardPanelText
                }
            },{
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'genapp-predefined-request-criteria-panel-intro',
                    html: this.defaultCardPanelText
                }
            }]
        });

        /**
         * @cfg {Ext.Panel} eastPanel
         * The east Panel containing the requestCriteriaCardPanel
         */
        this.eastPanel = new Ext.Panel({
            region: 'east',
            width: '350px',
            cls:'genapp-predefined-request-east-panel',
            margins:{
                top: 0,
                right: 0,
                bottom: 0,
                left: 5
            },
            items: this.requestCriteriaCardPanel
        });

        this.items = [this.grid,this.eastPanel];
        this.listeners = {
            'activate': function(){
                var selectedRecord = this.grid.getSelectionModel().getSelected();
                this.grid.getStore().reload({
                    callback: function(records, options, success) {
                        if (success) {
                            if (!Ext.isEmpty(selectedRecord)) {
                                var indexToSelect = this.grid.getStore().findExact('request_name',selectedRecord.data.request_name);
                                this.grid.getSelectionModel().selectRow(indexToSelect);
                                this.grid.plugins.expandRow(indexToSelect);
                            }
                        } else {
                            console.log('Request failure: ');
                            console.log('records:', records, 'options:', options);
                            this.requestCriteriaCardPanel.getLayout().setActiveItem(1);
                        }
                    },
                    scope: this
                });
            },
            scope: this
        };

        Genapp.PredefinedRequestPanel.superclass.initComponent.call(this);
    },

    /**
     * Show a criteria panel when a row is selected.
     * 
     * @param {SelectionModel} sm the grid selection model
     * @param {Number} row The selected index
     * @param {Ext.data.Record} rec The selected record
     */
    onGridRowSelect : function(sm, row, rec) {
        this.requestCriteriaCardPanel.setTitle('');
        this.requestCriteriaCardPanelFooterTBar.hide();
        this.requestCriteriaCardPanel.getLayout().setActiveItem(0); // display "loading ..."
        if(Ext.isEmpty(this.requestCriteriaCardPanel.getComponent(rec.data.request_name))){
            Ext.Ajax.request({
                url: Genapp.ajax_query_url + 'ajaxgetpredefinedrequestcriteria',
                success: function(response, opts) {
                    var i;
                    var myReader = new Ext.data.JsonReader({
                        root:'criteria',
                        idProperty:'name',
                        fields:[
                                {name:'name',mapping:'name'},
                                {name:'label',mapping:'label'},
                                {name:'inputType',mapping:'inputType'},  
                                {name:'unit',mapping:'unit'},
                                {name:'type',mapping:'type'},
                                {name:'subtype',mapping:'subtype'},
                                {name:'definition',mapping:'definition'},
                                {name:'is_default',mapping:'is_default'},
                                {name:'default_value',mapping:'default_value'},
                                {name:'decimals',mapping:'decimals'},
                                {name:'params',mapping:'params'}
                            ]
                    });
                    var result = myReader.readRecords(Ext.decode(response.responseText));
                    var requestCriteriaPanel = new Ext.form.FormPanel({
                        itemId: rec.data.request_name,
                        labelWidth: 130,
                        autoHeight: true, // Necessary for IE7
                        defaults: {
                            labelStyle: 'padding: 0; margin-top:3px', 
                            width: 180
                        },
                        items: {
                            xtype: 'box',
                            autoEl: {
                                tag: 'div',
                                cls: 'genapp-predefined-request-criteria-panel-criteria-hint',
                                style: 'width:200px;',
                                html: rec.data.criteria_hint
                            }
                        }
                    });
                    for (i = 0; i < result.records.length; i++) {
                        // Add the field
                        requestCriteriaPanel.add(Genapp.FieldForm.prototype.getCriteriaConfig(result.records[i].data, true));
                    }
                    this.requestCriteriaCardPanel.add(requestCriteriaPanel);
                    this.showCriteriaPanel(rec.data.request_name);
                    this.requestCriteriaCardPanel.doLayout();
                },
                failure: function(response, opts) {
                    console.log('Request failure: ' + response.statusText);
                    console.log('Response:', response, 'Options:', opts);
                    this.requestCriteriaCardPanel.getLayout().setActiveItem(1); 
                },
                params: { request_name: rec.data.request_name },
                scope:this
             });
        }else{
            this.showCriteriaPanel(rec.data.request_name);
        }
    },

    /**
     * Show a criteria panel
     * 
     * @param {String} requestName The request name
     */
    showCriteriaPanel : function(requestName){
        this.requestCriteriaCardPanel.setTitle(this.criteriaPanelTitle);
        this.requestCriteriaCardPanelFooterTBar.show();
        this.requestCriteriaCardPanel.getLayout().setActiveItem(requestName);
    }
});
Ext.reg('predefinedrequestpage', Genapp.PredefinedRequestPanel);/**
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
 * 
 * A menu containing a {@link Genapp.form.picker.DateRangePicker} Component.
 * 
 * @class Genapp.form.menu.DateRangeMenu
 * @extends Ext.menu.DateMenu
 * @constructor Create a new DateRangeMenu
 * @param {Object}
 *            config
 * @xtype daterangemenu
 */

Ext.namespace('Genapp.form.menu');

Genapp.form.menu.DateRangeMenu = Ext.extend(Ext.menu.DateMenu, {

	/**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to
	 *      'table'.
	 */
	layout : 'table',

	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-date-range-menu'). This can be
	 *      useful for adding customized styles to the component or any of its
	 *      children using standard CSS rules.
	 */
	cls : 'x-date-range-menu',

	/**
	 * The {@link Genapp.form.picker.DateRangePicker} instance for this
	 * DateRangeMenu
	 * 
	 * @property rangePicker
	 * @type Genapp.form.picker.DateRangePicker
	 */
	rangePicker : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Plug the event 'beforeshow'
		this.on('beforeshow', this.onBeforeShow, this);

		// Initialise the range picker
		this.rangePicker = new Genapp.form.picker.DateRangePicker(this.initialConfig);

		Ext.apply(this, {
			plain : true,
			showSeparator : false,
			items : [ this.rangePicker ]
		});
		this.rangePicker.purgeListeners();
		Ext.menu.DateMenu.superclass.initComponent.call(this);

		this.relayEvents(this.rangePicker, [ "select" ]);
	},

	// private
	onBeforeShow : function() {
		if (this.rangePicker) {
			this.rangePicker.startDatePicker.hideMonthPicker(true);
			this.rangePicker.endDatePicker.hideMonthPicker(true);
		}
	}
});
Ext.reg('daterangemenu', Genapp.form.menu.DateRangeMenu);/**
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
 * A menu containing a {@link Genapp.form.picker.NumberRangePicker} Component.
 * 
 * @class Genapp.form.menu.NumberRangeMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new NumberRangeMenu
 * @param {Object}
 *            config
 * @xtype numberrangemenu
 */

Ext.namespace('Genapp.form.menu');

Genapp.form.menu.NumberRangeMenu = Ext.extend(Ext.menu.Menu, {
	/**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to 'auto'.
	 *      Note: The layout 'menu' doesn't work on FF3.5, the rangePicker items
	 *      are not rendered because the rangePicker is hidden... But it's
	 *      working on IE ???
	 */
	layout : 'auto',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-number-range-menu'). This can be
	 *      useful for adding customized styles to the component or any of its
	 *      children using standard CSS rules.
	 */
	cls : 'x-number-range-menu',

	/**
	 * The {@link Genapp.form.picker.NumberRangePicker} instance for this
	 * NumberRangeMenu
	 * 
	 * @property rangePicker
	 * @type Genapp.form.picker.NumberRangePicker
	 */
	rangePicker : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Initialise the range picker
		this.rangePicker = new Genapp.form.picker.NumberRangePicker(this.initialConfig);

		Ext.apply(this, {
			plain : true,
			showSeparator : false,
			items : [ this.rangePicker ]
		});
		Genapp.form.menu.NumberRangeMenu.superclass.initComponent.call(this);
		this.relayEvents(this.rangePicker, [ "select" ]);
	}
});
Ext.reg('numberrangemenu', Genapp.form.menu.NumberRangeMenu);/**
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
 * A menu containing a {@link Genapp.form.picker.TreePicker} Component.
 * 
 * @class Genapp.form.menu.TreeMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new TreeMenu
 * @param {Object}
 *            config
 * @xtype treemenu
 */

Ext.namespace('Genapp.form.menu');

Genapp.form.menu.TreeMenu = Ext.extend(Ext.menu.Menu, {
	/**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to 'auto'.
	 *      Note: The layout 'menu' doesn't work on FF3.5, the rangePicker items
	 *      are not rendered because the rangePicker is hidden... But it's
	 *      working on IE ???
	 */
	layout : 'auto',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-number-range-menu'). This can be
	 *      useful for adding customized styles to the component or any of its
	 *      children using standard CSS rules.
	 */
	cls : 'x-tree-menu',

	/**
	 * The {@link Genapp.form.picker.TreePicker} instance for this TreeMenu
	 * 
	 * @property treePicker
	 * @type Genapp.form.picker.TreePicker
	 */
	treePicker : null,

	// private
	initComponent : function() {

		// Initialise the Tree picker
		this.treePicker = new Genapp.form.picker.TreePicker(this.initialConfig);

		Ext.apply(this, {
			plain : true,
			showSeparator : false,
			items : [ this.treePicker ]
		});
		Genapp.form.menu.TreeMenu.superclass.initComponent.call(this);
		this.relayEvents(this.treePicker, [ "select" ]);
	}
});
Ext.reg('treemenu', Genapp.form.menu.TreeMenu);/**
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
 * A menu containing a {@link Genapp.form.picker.TaxrefPicker} Component.
 * 
 * @class Genapp.form.menu.TaxrefMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new TaxrefMenu
 * @param {Object}
 *            config
 * @xtype taxrefmenu
 */

Ext.namespace('Genapp.form.menu');

Genapp.form.menu.TaxrefMenu = Ext.extend(Ext.menu.Menu, {
	
	/**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to 'auto'.
	 *      Note: The layout 'menu' doesn't work on FF3.5, the rangePicker items
	 *      are not rendered because the rangePicker is hidden... But it's
	 *      working on IE ???
	 */
	layout : 'auto',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-number-range-menu'). This can be
	 *      useful for adding customized styles to the component or any of its
	 *      children using standard CSS rules.
	 */
	cls : 'x-tree-menu',

	/**
	 * The {@link Genapp.form.picker.TaxrefPicker} instance for this TaxrefMenu.
	 * 
	 * @property taxrefPicker
	 * @type Genapp.form.picker.TaxrefPicker
	 */
	taxrefPicker : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Initialise the picker linked to this menu
		this.taxrefPicker = new Genapp.form.picker.TaxrefPicker(this.initialConfig);

		Ext.apply(this, {
			plain : true,
			showSeparator : false,
			items : [ this.taxrefPicker ]
		});
		Genapp.form.menu.TaxrefMenu.superclass.initComponent.call(this);
		this.relayEvents(this.taxrefPicker, [ "select" ]);
	}
});
Ext.reg('taxrefmenu', Genapp.form.menu.TaxrefMenu);/**
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
 * Simple date range picker class.
 * 
 * @class Genapp.DateRangePicker
 * @extends Ext.Panel
 * @constructor Create a new DateRangePicker
 * @param {Object}
 *            config The config object
 * @xtype daterangepicker
 */

Ext.namespace('Genapp.form.picker');

Genapp.form.picker.DateRangePicker = Ext.extend(Ext.Panel, {

	/**
	 * Internationalization.
	 */ 
	tbarStartDateButtonText : 'Start Date ...',
	tbarRangeDateButtonText : 'Range Date',
	tbarEndDateButtonText : '... End Date',
	fbarOkButtonText : 'ok',

	/**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to
	 *      'column'.
	 */
	layout : 'column',

	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-menu-date-range-item'). This can
	 *      be useful for adding customized styles to the component or any of
	 *      its children using standard CSS rules.
	 */
	cls : 'x-menu-date-range-item',
	/**
	 * @cfg {String} buttonAlign The alignment of any {@link #buttons} added to
	 *      this panel. Valid values are 'right', 'left' and 'center' (defaults
	 *      to 'center').
	 */
	buttonAlign : 'center',
	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to false).
	 */
	hideValidationButton : false,

	/**
	 * The selected dates (Default to '{startDate:null, endDate:null}').
	 * Read-only.
	 * 
	 * @type Object
	 * @property selectedDate
	 */
	selectedDate : {
		startDate : null,
		endDate : null
	},

	/**
	 * The start date picker (The left picker).
	 * 
	 * @property startDatePicker
	 * @type Ext.DatePicker
	 */
	startDatePicker : null,

	/**
	 * The end date picker (The right picker).
	 * 
	 * @property endDatePicker
	 * @type Ext.DatePicker
	 */
	endDatePicker : null,

	/**
	 * The top toolbar.
	 * 
	 * @property tbar
	 * @type Ext.Toolbar
	 */
	tbar : null,

	/**
	 * Start button.
	 * 
	 * @type Ext.Button
	 */
	startDateButton : null,

	/**
	 * Range button.
	 * 
	 * @type Ext.Button
	 */
	rangeDateButton : null,

	/**
	 * End button.
	 * 
	 * @type Ext.Button
	 */
	endDateButton : null,

	/**
	 * The bottom toolbar.
	 * 
	 * @property fbar
	 * @type Ext.Toolbar
	 */
	fbar : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Initialise the start picker
		this.startDatePicker = new Ext.DatePicker(Ext.apply({
			internalRender : this.strict || !Ext.isIE,
			ctCls : 'x-menu-date-item',
			columnWidth : 0.5
		}, this.initialConfig));

		// Initialise the end picker
		this.endDatePicker = new Ext.DatePicker(Ext.apply({
			internalRender : this.strict || !Ext.isIE,
			ctCls : 'x-menu-date-item',
			columnWidth : 0.5
		}, this.initialConfig));

		// List the items
		this.items = [ this.startDatePicker, {
			xtype : 'spacer',
			width : 5,
			html : '&nbsp;' // For FF and IE8
		}, this.endDatePicker ];

		// Plug events
		this.startDatePicker.on('select', this.startDateSelect, this);
		this.endDatePicker.on('select', this.endDateSelect, this);

		// Initialise the buttons
		this.startDateButton = new Ext.Button({
			text : this.tbarStartDateButtonText,
			cls : 'x-menu-date-range-item-start-date-button',
			enableToggle : true,
			allowDepress : false,
			toggleGroup : 'DateButtonsGroup',
			toggleHandler : this.onStartDatePress.createDelegate(this)
		});

		this.rangeDateButton = new Ext.Button({
			text : this.tbarRangeDateButtonText,
			cls : 'x-menu-date-range-item-range-date-button',
			pressed : true,
			enableToggle : true,
			allowDepress : false,
			toggleGroup : 'DateButtonsGroup',
			toggleHandler : this.onRangeDatePress.createDelegate(this)
		});

		this.endDateButton = new Ext.Button({
			text : this.tbarEndDateButtonText,
			cls : 'x-menu-date-range-item-end-date-button',
			enableToggle : true,
			allowDepress : false,
			toggleGroup : 'DateButtonsGroup',
			toggleHandler : this.onEndDatePress.createDelegate(this)
		});

		// Initialise the toolbar
		this.tbar = new Ext.Toolbar({
			items : [ this.startDateButton, this.rangeDateButton, '->', this.endDateButton ]
		});

		if (!this.hideValidationButton) {
			this.fbar = new Ext.Toolbar({
				cls : 'x-date-bottom',
				items : [ {
					xtype : 'button',
					text : this.fbarOkButtonText,
					width : 'auto',
					handler : this.onOkButtonPress.createDelegate(this)
				} ]
			});
		}

		Genapp.form.picker.DateRangePicker.superclass.initComponent.call(this);
	},

	// private
	onRangeDatePress : function(button, state) {
		if (state) {
			this.startDatePicker.enable();
			this.endDatePicker.enable();
			this.resetDates();
		}
	},

	// private
	onStartDatePress : function(button, state) {
		if (state) {
			this.startDatePicker.enable();
			this.endDatePicker.disable();
			this.resetDates();
		}
	},

	// private
	onEndDatePress : function(button, state) {
		if (state) {
			this.startDatePicker.disable();
			this.endDatePicker.enable();
			this.resetDates();
		}
	},

	// private
	startDateSelect : function(startDatePicker, date) {
		this.selectedDate.startDate = date;
		if (this.startDateButton.pressed) {
			this.returnSelectedDate();
		} else { // rangeDateButton is pressed
			if (this.selectedDate.endDate !== null) {
				this.returnSelectedDate();
			}
		}
	},

	// private
	endDateSelect : function(endDatePicker, date) {
		this.selectedDate.endDate = date;
		if (this.endDateButton.pressed) {
			this.returnSelectedDate();
		} else { // rangeDateButton is pressed
			if (this.selectedDate.startDate !== null) {
				this.returnSelectedDate();
			}
		}
	},

	// private
	resetselectedDate : function() {
		this.selectedDate = {
			startDate : null,
			endDate : null
		};
	},

	/**
	 * Reset the dates
	 */
	resetDates : function() {
		this.resetselectedDate();
		this.startDatePicker.setValue(this.startDatePicker.defaultValue);
		this.endDatePicker.setValue(this.endDatePicker.defaultValue);
	},

	// private
	returnSelectedDate : function() {
		this.fireEvent('select', this, this.selectedDate);
		this.resetselectedDate();
	},

	/**
	 * Checks if the date is in the interval [minDate,maxDate] of the picker
	 */
	isEnabledDate : function(picker) {
		if ((picker.activeDate.getTime() - picker.minDate.getTime() >= 0) && (picker.maxDate.getTime() - picker.activeDate.getTime() >= 0)) {
			return true;
		} else {
			return false;
		}
	},

	// private
	onOkButtonPress : function(button, state) {
		if (state) {
			if (this.startDateButton.pressed) {
				if (this.isEnabledDate(this.startDatePicker)) {
					this.selectedDate = {
						startDate : this.startDatePicker.activeDate,
						endDate : null
					};
					this.returnSelectedDate();
				}
			} else if (this.endDateButton.pressed) {
				if (this.isEnabledDate(this.endDatePicker)) {
					this.selectedDate = {
						startDate : null,
						endDate : this.endDatePicker.activeDate
					};
					this.returnSelectedDate();
				}
			} else {
				if (this.isEnabledDate(this.startDatePicker) && this.isEnabledDate(this.endDatePicker)) {
					this.selectedDate = {
						startDate : this.startDatePicker.activeDate,
						endDate : this.endDatePicker.activeDate
					};
					this.returnSelectedDate();
				}
			}
		}
	}
});
Ext.reg('daterangepicker', Genapp.form.picker.DateRangePicker);/**
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
 * Simple number range picker class.
 * 
 * @class Genapp.form.picker.NumberRangePicker
 * @extends Ext.Panel
 * @constructor Create a new NumberRangePicker
 * @param {Object}
 *            config The config object
 * @xtype numberrangepicker
 */
Ext.namespace('Genapp.form.picker');

Genapp.form.picker.NumberRangePicker = Ext.extend(Ext.Panel, {

	/**
	 * Internationalization.
	 */
	minFieldLabel : "Min",
	maxFieldLabel : "Max",
	okButtonText : "ok",

	/**
	 * @cfg {String/Object} layout Specify the layout manager class for this
	 *      container either as an Object or as a String. See
	 *      {@link Ext.Container#layout layout manager} also. Default to 'form'.
	 */
	layout : 'form',
	/**
	 * @cfg {Number} height The height of this component in pixels (defaults to
	 *      59).
	 */
	height : 59,
	/**
	 * @cfg {Number} width The width of this component in pixels (defaults to
	 *      194).
	 */
	width : 194,
	/**
	 * @cfg {Number} labelWidth The width of labels in pixels. This property
	 *      cascades to child containers and can be overridden on any child
	 *      container (e.g., a fieldset can specify a different labelWidth for
	 *      its fields) (defaults to 30). See
	 *      {@link Ext.form.FormPanel#labelWidth} also.
	 */
	labelWidth : 30,
	/**
	 * @cfg {String} buttonAlign The alignment of any {@link #buttons} added to
	 *      this panel. Valid values are 'right', 'left' and 'center' (defaults
	 *      to 'center').
	 */
	buttonAlign : 'center',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-menu-number-range-item'). This
	 *      can be useful for adding customized styles to the component or any
	 *      of its children using standard CSS rules.
	 */
	cls : 'x-menu-number-range-item',

	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : true,

	/**
	 * The min field.
	 * 
	 * @property minField
	 * @type Genapp.form.TwinNumberField
	 */
	minField : null,

	/**
	 * The max field.
	 * 
	 * @property maxField
	 * @type Genapp.form.TwinNumberField
	 */
	maxField : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Initialise the fields
		this.minField = new Genapp.form.TwinNumberField({
			fieldLabel : this.minFieldLabel
		});
		this.maxField = new Genapp.form.TwinNumberField({
			fieldLabel : this.maxFieldLabel
		});

		Ext.apply(this, {
			items : [ this.minField, this.maxField ],
			keys : [ {
				key : Ext.EventObject.ENTER,
				fn : this.onOkButtonPress.createDelegate(this, [ null, true ])
			}, {
				key : Ext.EventObject.TAB,
				fn : this.onTabButtonPress,
				scope : this
			} ]
		});
		if (!this.hideValidationButton) {
			this.buttons = [ {
				xtype : 'button',
				text : this.okButtonText,
				width : 'auto',
				handler : this.onOkButtonPress.createDelegate(this)
			} ];
			this.height = this.height + 28;
		}

		Genapp.form.picker.NumberRangePicker.superclass.initComponent.call(this);
	},

	// private
	onOkButtonPress : function(button, state) {
		if (state) {
			this.fireEvent('select', this, {
				minValue : this.minField.getValue(),
				maxValue : this.maxField.getValue()
			});
		}
	},

	// private
	onTabButtonPress : function(keyCode, event) {
		var index = this.items.findIndex('id', event.target.id) + 1;
		if (index >= this.items.getCount()) {
			index = 0;
		}
		this.items.get(index).focus(true);
	}
});
Ext.reg('numberrangepicker', Genapp.form.picker.NumberRangePicker);/**
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
 * Simple tree picker class.
 * 
 * @class Genapp.form.picker.TreePicker
 * @extends Ext.TreePanel
 * @constructor Create a new TreePicker
 * @param {Object}
 *            config The config object
 * @xtype treepicker
 */
Ext.namespace('Genapp.form.picker');

Genapp.form.picker.TreePicker = Ext.extend(Ext.tree.TreePanel, {

	/**
	 * Internationalization.
	 */
	okButtonText : "ok",

	/**
	 * @cfg {Number} height The height of this component in pixels (defaults to
	 *      300).
	 */
	height : 300,
	/**
	 * @cfg {Number} width The width of this component in pixels (defaults to
	 *      500).
	 */
	width : 500,
	/**
	 * @cfg {String} buttonAlign The alignment of any {@link #buttons} added to
	 *      this panel. Valid values are 'right', 'left' and 'center' (defaults
	 *      to 'center').
	 */
	buttonAlign : 'center',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-menu-number-range-item'). This
	 *      can be useful for adding customized styles to the component or any
	 *      of its children using standard CSS rules.
	 */
	cls : 'x-menu-tree-item',

	/**
	 * Manage multiple values,
	 */
	multiple : false,

	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : true,

	/**
	 * Validation button
	 * 
	 * @type Ext.Button
	 */
	validationButton : null,

	padding : 5,
	enableDD : false,
	animate : true,
	border : false,
	rootVisible : false,
	useArrows : true,
	autoScroll : true,
	containerScroll : true,
	frame : false,
	baseAttr : {
		singleClickExpand : true
	},
	listeners : {
		'dblclick' : {// Select the node on double click
			fn : function(node, event) {
				this.fireEvent('select', node);
			}
		}
	},

	/**
	 * Initialise the component.
	 */
	initComponent : function() {
		/*
		 * The root must be instancied here and not in the static part of the
		 * class to avoid a conflict between the instance of the class
		 */
		this.root = new Ext.tree.AsyncTreeNode({
			draggable : false,
			id : '*'
		}); // root is always '*'

		this.validationButton = {
			xtype : 'button',
			text : this.okButtonText,
			width : 'auto',
			handler : this.onOkButtonPress.createDelegate(this)
		};

		// Add the validation button
		if (!this.hideValidationButton) {
			this.buttons = [ this.validationButton ];
			this.height = this.height + 28;
		}

		// Allow multiple selection in the picker
		if (this.multiple) {
			this.selModel = new Ext.tree.MultiSelectionModel();
		}

		Genapp.form.picker.TreePicker.superclass.initComponent.call(this);
	},

	/**
	 * Launched when the OK button is pressed.
	 */
	onOkButtonPress : function(button, state) {
		if (state) {
			if (this.multiple) {
				var selectedNodes = this.getSelectionModel().getSelectedNodes();
				this.fireEvent('select', selectedNodes === null ? null : selectedNodes);
			} else {
				var selectedNode = this.getSelectionModel().getSelectedNode();
				this.fireEvent('select', selectedNode === null ? null : selectedNode);

			}
		}
	}
});
Ext.reg('treepicker', Genapp.form.picker.TreePicker);/**
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
 * Simple taxref picker class.
 * 
 * @class Genapp.form.picker.TaxrefPicker
 * @extends Ext.tree.TreePanel
 * @constructor Create a new TaxrefPicker
 * @param {Object}
 *            config The config object
 * @xtype taxrefpicker
 */
Ext.namespace('Genapp.form.picker');

Genapp.form.picker.TaxrefPicker = Ext.extend(Ext.tree.TreePanel, {

	/**
	 * Internationalization.
	 */
	okButtonText : "ok",

	/**
	 * @cfg {Number} height The height of this component in pixels (defaults to
	 *      300).
	 */
	height : 300,
	/**
	 * @cfg {Number} width The width of this component in pixels (defaults to
	 *      300).
	 */
	width : 500,
	/**
	 * @cfg {String} buttonAlign The alignment of any {@link #buttons} added to
	 *      this panel. Valid values are 'right', 'left' and 'center' (defaults
	 *      to 'center').
	 */
	buttonAlign : 'center',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-menu-number-range-item'). This
	 *      can be useful for adding customized styles to the component or any
	 *      of its children using standard CSS rules.
	 */
	cls : 'x-menu-tree-item',

	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : true,

	/**
	 * Validation button
	 * 
	 * @type Ext.Button
	 */
	validationButton : null,

	padding : 5,
	enableDD : false,
	animate : true,
	border : false,
	rootVisible : false,
	useArrows : true,
	autoScroll : true,
	containerScroll : true,
	frame : false,
	
	baseAttr : {
		singleClickExpand : true
	},
	listeners : {
		'dblclick' : {// Select the node on double click
			fn : function(node, event) {
				this.fireEvent('select', node);
			}
		}
	},

	/**
	 * Initialise the component.
	 */
	initComponent : function() {
		/*
		 * The root must be instancied here and not in the static part of the
		 * class to avoid a conflict between the instance of the class
		 */
		this.root = new Ext.tree.AsyncTreeNode({
			draggable : false,
			id : '*'
		}); // root is always '*'

		this.validationButton = {
			xtype : 'button',
			text : this.okButtonText,
			width : 'auto',
			handler : this.onOkButtonPress.createDelegate(this)
		};
		
		// Custom treeloader
		this.loader = new Genapp.form.picker.TaxrefNodeLoader({url: this.dataUrl});

		// Add the validation button
		if (!this.hideValidationButton) {
			this.buttons = [ this.validationButton ];
			this.height = this.height + 28;
		}

		Genapp.form.picker.TaxrefPicker.superclass.initComponent.call(this);
	},

	/**
	 * Launched when the OK button is pressed.
	 */
	onOkButtonPress : function(button, state) {
		if (state) {
			var selectedNode = this.getSelectionModel().getSelectedNode();
			this.fireEvent('select', selectedNode === null ? null : selectedNode);
		}
	}
});
Ext.reg('taxrefpicker', Genapp.form.picker.TaxrefPicker);
Ext.namespace("Genapp.form.picker");

/** 
 * Surcharge le loader pour customiser l'apparence des nodes.
 * 
 * Inspiré de GeoExt.LayerParamLoader.
 */
Genapp.form.picker.TaxrefNodeLoader = function(config) {
    Ext.apply(this, config);
    this.addEvents(
        "beforeload",
        "load"
    );

    Genapp.form.picker.TaxrefNodeLoader.superclass.constructor.call(this);
};

Ext.extend(Genapp.form.picker.TaxrefNodeLoader, Ext.tree.TreeLoader, {
    
    /** 
     * Surcharge la création d'un Node.
     */
    createNode: function(attr) {
    	
    	 if (this.baseAttrs) {
             Ext.applyIf(attr, this.baseAttrs);
         }
    	 
         if (this.applyLoader !== false && !attr.loader) {
             attr.loader = this;
         }
         
         // Si un UIprovider est spécifié dans le JSON on l'applique
         if (Ext.isString(attr.uiProvider)) {
            attr.uiProvider = this.uiProviders[attr.uiProvider] || eval(attr.uiProvider);
         }
         
         if (attr.nodeType) {
        	 // Si le nodeType est présent dans le JSON on l'applique
             return new Ext.tree.TreePanel.nodeTypes[attr.nodeType](attr);
         } else {
        	 
             var node;
             
             if (attr.leaf) {
            	 // Une feuille
            	 attr.iconCls = "x-tree-node-icon-feuille";
            	 node = new Ext.tree.TreeNode(attr);
            	 
            	 if (attr.isReference == '1') {
            		 node.text = "<b>" + node.text +" </b>";
            	 } else {
            		 node.text = "<i>" + node.text +" </i>";
            	 }
            	 
            	 if (attr.vernacularName != null) {
             	 	node.text = node.text + " ("+attr.vernacularName+")";
              	 }
            	 node.text = node.text + " ("+attr.id+")";
            	 
            	 return node;
             } else {
            	 // Une branche 
            	 attr.iconCls = "x-tree-node-icon-branche";
            	 node = new Ext.tree.AsyncTreeNode(attr);
            	 
            	 if (attr.vernacularName != null) {
            	 	node.text = node.text + " ("+attr.vernacularName+")";
             	 }
            	 node.text = node.text + " ("+attr.id+")";
            	 
            	 return node;
             }           
            
         }         
                 
    }
});
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
 * Provides a date range input field with a {@link Genapp.form.picker.DateRangePicker} dropdown and automatic date validation.
 *  
 * @class Genapp.form.DateRangeField
 * @extends Ext.form.DateField
 * @constructor Create a new DateRangeField
 * @param {Object} config
 * @xtype daterangefield
 */

Ext.namespace('Genapp.form');

Genapp.form.DateRangeField = Ext.extend(Ext.form.DateField, {
	
	/**
	 * Internationalization.
	 */ 
    minText: "The dates in this field must be equal to or after {0}",
    maxText: "The dates in this field must be equal to or before {0}",
    reverseText: "The end date must be posterior to the start date",
    notEqualText: "The end date can't be equal to the start date",
    dateSeparator: ' - ',
    endDatePrefix: '<= ',
    startDatePrefix: '>= ',
    
    /**
     * @cfg {Boolean} usePrefix if true, endDatePrefix and startDatePrefix are used (defaults to true).
     * Otherwise minValue and maxValue are used.
     */
    usePrefix: true,
    /**
     * @cfg {Boolean} hideValidationButton if true, hide the menu validation button (defaults to false).
     */
    hideValidationButton : false,
    /**
     * @cfg {Boolean} authorizeEqualValues if true, a unique value 
     * can be entered for the min and the max values.
     * If false, the min and max values can't be equal (defaults to true).
     */
    authorizeEqualValues : true,
    /**
     * @cfg {Boolean} mergeEqualValues if true and if the max and min values
     * are equal, an unique value will be displayed instead of the min and max values.
     * (authorizeEqualValues must be set to true)
     * If false, the min and max values are displayed normally even if they are equals (defaults to true).
     */
    mergeEqualValues : true,
    /**
     * @cfg {Boolean} autoReverse if true, reverse the min and max values if max < min (defaults to true).
     */
    autoReverse : true,
    /**
     * @cfg {Date/String} minValue
     * The minimum allowed date. Can be either a Javascript date object or a string date in a
     * valid format (defaults to 'new Date(0)').
     */
    minValue : new Date(0),
    /**
     * @cfg {Date/String} maxValue
     * The maximum allowed date. Can be either a Javascript date object or a string date in a
     * valid format (defaults to 'new Date(2999,11,31)').
     */
    maxValue : new Date(2999,11,31),
    /**
     * @cfg {Date/String} minDefaultValue
     * The minimum default date. Can be either a Javascript date object or a string date in a
     * valid format (defaults to 'new Date()').
     */
    minDefaultValue : new Date(),
    /**
     * @cfg {Date/String} maxDefaultValue
     * The maximum default date. Can be either a Javascript date object or a string date in a
     * valid format (defaults to 'new Date()').
     */
    maxDefaultValue : new Date(),

    /**
     * Replaces any existing disabled dates with new values and refreshes the DateRangePicker.
     * @param {Array} disabledDates An array of date strings (see the <tt>{@link #disabledDates}</tt> config
     * for details on supported values) used to disable a pattern of dates.
     */
    setDisabledDates : function(dd){
        this.disabledDates = dd;
        this.initDisabledDays();
        if(this.menu){
            this.menu.rangePicker.startDatePicker.setDisabledDates(this.disabledDatesRE);
            this.menu.rangePicker.endDatePicker.setDisabledDates(this.disabledDatesRE);
        }
    },

    /**
     * Replaces any existing disabled days (by index, 0-6) with new values and refreshes the DateRangePicker.
     * @param {Array} disabledDays An array of disabled day indexes. See the <tt>{@link #disabledDays}</tt>
     * config for details on supported values.
     */
    setDisabledDays : function(dd){
        this.disabledDays = dd;
        if(this.menu){
            this.menu.rangePicker.startDatePicker.setDisabledDays(dd);
            this.menu.rangePicker.endDatePicker.setDisabledDays(dd);
        }
    },

    /**
     * Replaces any existing <tt>{@link #minValue}</tt> with the new value and refreshes the DateRangePicker.
     * @param {Date} value The minimum date that can be selected
     */
    setMinValue : function(dt){
        this.minValue = (typeof dt === "string" ? this.parseDate(dt) : dt);
        if(this.menu){
            this.menu.rangePicker.startDatePicker.setMinDate(this.minValue);
            this.menu.rangePicker.endDatePicker.setMinDate(this.minValue);
        }
    },

    /**
     * Replaces any existing <tt>{@link #maxValue}</tt> with the new value and refreshes the DateRangePicker.
     * @param {Date} value The maximum date that can be selected
     */
    setMaxValue : function(dt){
        this.maxValue = (typeof dt === "string" ? this.parseDate(dt) : dt);
        if(this.menu){
            this.menu.rangePicker.startDatePicker.setMaxDate(this.maxValue);
            this.menu.rangePicker.endDatePicker.setMaxDate(this.maxValue);
        }
    },

    /**
     * Runs all of NumberFields validations and returns an array of any errors. Note that this first
     * runs TextField's validations, so the returned array is an amalgamation of all field errors.
     * The additional validation checks are testing that the date format is valid, that the chosen
     * date is within the min and max date constraints set, that the date chosen is not in the disabledDates
     * regex and that the day chosed is not one of the disabledDays.
     * @param {Mixed} value The value to get errors for (defaults to the current field value)
     * @return {Array} All validation errors for this field
     */
    getErrors: function(value) {
        var errors = Ext.form.DateField.superclass.getErrors.apply(this, arguments);
        
        value = this.formatDate(value || this.processValue(this.getRawValue()));
        
        if (value.length < 1){ // if it's blank and textfield didn't flag it then it's valid
             return errors;
        }
        var values = value.split(this.dateSeparator);
        if (values.length !== 1 && values.length !== 2){
            errors.push(String.format(this.invalidText, value, this.format+this.dateSeparator+this.format));
            return errors;
        }
        var rangeDate = this.parseRangeDate(value);
        if(values.length === 1){
            if (!rangeDate){
                errors.push(String.format(this.invalidText, value, this.format));
                return errors;
            }
            var scErrors = Ext.form.DateField.superclass.getErrors.call(this, value);
            if (!Ext.isEmpty(scErrors)){
                errors.push(String.format(this.invalidText, value, this.format));
                return errors;
            }
        }else if(values.length === 2){
            if (!rangeDate){
                errors.push(String.format(this.invalidText, value, this.format+this.dateSeparator+this.format));
                return errors;
            }
            var scErrors = Ext.form.DateField.superclass.getErrors.call(this, value);
            if (!Ext.isEmpty(scErrors)){
                errors.push(String.format(this.invalidText, value, this.format+this.dateSeparator+this.format));
                return errors;
            }
            if (rangeDate.endDate.getTime() - rangeDate.startDate.getTime() < 0){
                errors.push(this.reverseText);
                return errors;
            }
            if (!this.authorizeEqualValues && rangeDate.endDate.getElapsed(rangeDate.startDate) === 0){
                errors.push(this.notEqualText);
                return errors;
            }
        }
        //Checks if the start date is in the interval [minDate,maxDate]
        if (rangeDate.startDate !== null){
            if (rangeDate.startDate.getTime() - this.minValue.getTime() < 0){
                errors.push(String.format(this.minText, this.formatDate(this.minValue)));
                return errors;
            }
            if (this.maxValue.getTime() - rangeDate.startDate.getTime() < 0){
                errors.push(String.format(this.maxText, this.formatDate(this.maxValue)));
                return errors;
            }
        }
        //Checks if the end date is in the interval [minDate,maxDate]
        if (rangeDate.endDate !== null){
            if (rangeDate.endDate.getTime() - this.minValue.getTime() < 0){
                errors.push(String.format(this.minText, this.formatDate(this.minValue)));
                return errors;
            }
            if (this.maxValue.getTime() - rangeDate.endDate.getTime() < 0){
                errors.push(String.format(this.maxText, this.formatDate(this.maxValue)));
                return errors;
            }
        }
        return errors;
    },

    // private
    // return a range date object or null for failed parse operations
    parseRangeDate : function(value){
        if(!value){
            return null;
        }
        if(this.isRangeDate(value)){
            return value;
        }
        if(Ext.isDate(value)){
            return {startDate:value, endDate:value};
        }
        var values = value.split(this.dateSeparator);
        if(values.length === 1){
            var sdpIndex = value.indexOf(this.startDatePrefix,0);
            var edpIndex = value.indexOf(this.endDatePrefix,0);
            if(sdpIndex !== -1){
            // Case ">= YYYY/MM/DD"
                var startDate = this.parseDate.call(this, value.substring(sdpIndex + this.startDatePrefix.length));
                if(startDate){
                    return {startDate:startDate, endDate:null};
                }else{
                    return null;
                }
            }else if(edpIndex !== -1){
            // Case "<= YYYY/MM/DD"
                var endDate = this.parseDate.call(this, value.substring(edpIndex + this.endDatePrefix.length));
                if(endDate){
                    return {startDate:null, endDate:endDate};
                }else{
                    return null;
                }
            }else{
            // Case "YYYY/MM/DD"
                var date = this.parseDate.call(this, value);
                if(date){
                    return {startDate:date, endDate:date};
                }else{
                    return null;
                }
            }
        }else if(values.length === 2){
            // Case "YYYY/MM/DD - YYYY/MM/DD"
            var sv = Date.parseDate(values[0], this.format);
            var ev = Date.parseDate(values[1], this.format);
            if((!sv || !ev) && this.altFormats){
                if(!this.altFormatsArray){
                    this.altFormatsArray = this.altFormats.split("|");
                }
                var i,len;
                if(!sv){
                    for(i = 0, len = this.altFormatsArray.length; i < len && !sv; i++){
                        sv = Date.parseDate(values[0], this.altFormatsArray[i]);
                    }
                }
                if(!ev){
                    for(i = 0, len = this.altFormatsArray.length; i < len && !ev; i++){
                        ev = Date.parseDate(values[1], this.altFormatsArray[i]);
                    }
                }
            }
            if(!sv || !ev){
                return null;
            }else{
                return {startDate:sv, endDate:ev};
            }
        }else{
            return null;
        }
    },

    // private
    formatDate : function(date){
        if(Ext.isDate(date)){
            return Genapp.form.DateRangeField.superclass.formatDate.call(this, date);
        }
        if(this.isRangeDate(date)){
            if(date.startDate === null && date.endDate !== null){
                if(this.usePrefix){
                    return this.endDatePrefix + date.endDate.format(this.format);
                }else{
                    return this.minValue.format(this.format) + this.dateSeparator + date.endDate.format(this.format);
                }
            }else if(date.startDate !== null && date.endDate === null){
                if(this.usePrefix){
                    return this.startDatePrefix + date.startDate.format(this.format);
                }else{
                    return date.startDate.format(this.format) + this.dateSeparator + this.maxValue.format(this.format);
                }
            }else if(date.startDate !== null && date.endDate !== null){
                if(this.mergeEqualValues && date.endDate.getElapsed(date.startDate) === 0){
                    return date.startDate.format(this.format);
                }else if(this.autoReverse && date.endDate.getTime() - date.startDate.getTime() < 0){
                    return date.endDate.format(this.format) + this.dateSeparator + date.startDate.format(this.format);
                }else{
                    return date.startDate.format(this.format) + this.dateSeparator + date.endDate.format(this.format);
                }
            }else{
                return '';
            }
        }else{
            return date;
        }
    },

    /**
     * The function that handle the trigger's click event.
     * Implements the default empty TriggerField.onTriggerClick function to display the DateRangePicker
     * @method onTriggerClick
     * @hide
     */
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }
        if(!this.menu){
            /**
             * The field menu (displayed on a trigger click).
             * @property menu
             * @type Genapp.form.menu.DateRangeMenu
             */
            this.menu = new Genapp.form.menu.DateRangeMenu({
                hideOnClick: false,
                hideValidationButton: this.hideValidationButton,
                showToday: this.showToday
            });
        }
        this.onFocus();
        if(typeof this.minDefaultValue === 'string'){
            this.minDefaultValue = new Date(this.minDefaultValue);
        }
        if(typeof this.maxDefaultValue === 'string'){
            this.maxDefaultValue = new Date(this.maxDefaultValue);
        }
        Ext.apply(this.menu.rangePicker.startDatePicker,  {
            minDate : this.minValue,
            maxDate : this.maxValue,
            defaultValue : this.minDefaultValue,
            disabledDatesRE : this.disabledDatesRE,
            disabledDatesText : this.disabledDatesText,
            disabledDays : this.disabledDays,
            disabledDaysText : this.disabledDaysText,
            format : this.format,
            showToday : this.showToday,
            minText : String.format(this.minText, this.formatDate(this.minValue)),
            maxText : String.format(this.maxText, this.formatDate(this.maxValue))
        });
        Ext.apply(this.menu.rangePicker.endDatePicker,  {
            minDate : this.minValue,
            maxDate : this.maxValue,
            defaultValue : this.maxDefaultValue,
            disabledDatesRE : this.disabledDatesRE,
            disabledDatesText : this.disabledDatesText,
            disabledDays : this.disabledDays,
            disabledDaysText : this.disabledDaysText,
            format : this.format,
            showToday : this.showToday,
            minText : String.format(this.minText, this.formatDate(this.minValue)),
            maxText : String.format(this.maxText, this.formatDate(this.maxValue))
        });

        var values = this.getValue();
        var minv = this.minDefaultValue;
        var maxv = this.maxDefaultValue;
        if(Ext.isDate(values)){
            minv = values;
            maxv = values;
        }else if(this.isRangeDate(values)){
            if(values.startDate !== null){
                minv = values.startDate;
            }
            if(values.endDate !== null){
                maxv = values.endDate;
            }
        }

        this.menu.rangePicker.startDatePicker.setValue(minv);
        this.menu.rangePicker.endDatePicker.setValue(maxv);

        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
    },

    /**
     * Checks if the object is a correct range date
     * @param {Object} rangeDate The rangeDate to check. <br/>
     * An object containing the following properties:<br/>
     *      <ul><li><b>startDate</b> : Date <br/>the start date</li>
     *      <li><b>endDate</b> : Date <br/>the end date</li></ul>
     * @return {Boolean} true if the object is a range date
     */
    isRangeDate : function(rangeDate){
        return (Ext.isObject(rangeDate) && (Ext.isDate(rangeDate.startDate) || rangeDate.startDate === null) && (Ext.isDate(rangeDate.endDate) || rangeDate.endDate === null));
    },
    
    /**
     * Returns the current date value of the date field.
     * @return {Date} The date value
     */
    getValue : function(){
        return this.parseRangeDate(Ext.form.DateField.superclass.getValue.call(this)) || "";
    },
    
    /**
     * Sets the value of the date field.  You can pass a date object or any string that can be
     * parsed into a valid date, using <tt>{@link #format}</tt> as the date format, according
     * to the same rules as {@link Date#parseDate} (the default format used is <tt>"m/d/Y"</tt>).
     * <br />Usage:
     * <pre><code>
//All of these calls set the same date value (May 4, 2006)

//Pass a date object:
var dt = new Date('5/4/2006');
dateField.setValue(dt);

//Pass a date string (default format):
dateField.setValue('05/04/2006');

//Pass a date string (custom format):
dateField.format = 'Y-m-d';
dateField.setValue('2006-05-04');
</code></pre>
     * @param {String/Date} date The date or valid date string
     * @return {Ext.form.Field} this
     */
    setValue : function(date){
        return Ext.form.DateField.superclass.setValue.call(this, this.formatDate(this.parseRangeDate(date)));
    },
    
    // private
    beforeBlur : function(){
        var v = this.parseRangeDate(this.getRawValue());
        if(v){
            this.setValue(v);
        }
    }
});
Ext.reg('daterangefield', Genapp.form.DateRangeField);/**
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
 * Provides a Geometry input field.
 * 
 * @class Genapp.form.GeometryField
 * @extends Ext.form.TriggerField
 * @constructor Create a new GeometryField
 * @param {Object}
 *            config
 * @xtype geometryfield
 */

Ext.namespace('Genapp.form');

Genapp.form.GeometryField = Ext.extend(Ext.form.TriggerField, {

	/**
	 * Internationalization.
	 */
	fieldLabel : 'Location',
	mapWindowTitle : 'Draw the search zone on the map :',
	mapWindowValidateButtonText : 'Validate',
	mapWindowValidateAndSearchButtonText : 'Validate and search',
	mapWindowCancelButtonText : 'Cancel',
	
	/**
	 * @cfg {Boolean} hideWKT if true hide the WKT value.
	 */
	hideWKT : false,
	
	/**
	 * @cfg {String} triggerClass An additional CSS class used to style the
	 *      trigger button. The trigger will always get the class
	 *      'x-form-trigger' by default and triggerClass will be appended if
	 *      specified. (Default to 'x-form-map-trigger')
	 */
	triggerClass : 'x-form-map-trigger',
	/**
	 * @cfg {Boolean} editable false to prevent the user from typing text
	 *      directly into the field, the field will only respond to a click on
	 *      the trigger to set the value. (defaults to false).
	 */
	editable : false,
	/**
	 * @cfg {Boolean} hideMapDetails if true hide the details button in map
	 *      toolbar (defaults to false).
	 */
	hideMapDetails : true,
	/**
	 * @cfg {Boolean} hideSearchButton if true hide the "Validate and Search"
	 *      button.
	 */
	hideSearchButton : false,
	/**
	 * @cfg {Boolean} hideDrawPointButton Hide the "Draw Point" button
	 */
	hideDrawPointButton : false,
	/**
	 * @cfg {Boolean} hideDrawLineButton Hide the "Draw Line" button
	 */
	hideDrawLineButton : false,
   /**
     * @cfg {Boolean} hideLayerSelector Hide the layer selector
     */
    hideLayerSelector : false,
    /**
     * @cfg {Boolean} hideSnappingButton Hide the "Snapping" button
     */
    hideSnappingButton : false,
    /**
     * @cfg {Boolean} hideGetFeatureButton Hide the "Get Feature" button
     */
    hideGetFeatureButton : false,
    /**
     * @cfg {Boolean} hideFeatureInfoButton Hide the "Feature Info" button
     */
    hideFeatureInfoButton : false,
	/**
	 * @cfg {Boolean} maximizable True to display the 'maximize' tool button and
	 *      allow the user to maximize the window, false to hide the button and
	 *      disallow maximizing the window (defaults to true). Note that when a
	 *      window is maximized, the tool button will automatically change to a
	 *      'restore' button with the appropriate behavior already built-in that
	 *      will restore the window to its previous size.
	 */
	mapWindowMaximizable : true,
	/**
	 * @cfg {Boolean} maximized True to initially display the window in a
	 *      maximized state. (Defaults to false).
	 */
	mapWindowMaximized : false,
	/**
	 * @cfg {Number} height The height of the map window in pixels (defaults to
	 *      500). Note to express this dimension as a percentage or offset see
	 *      {@link Ext.Component#anchor}.
	 */
	mapWindowHeight : 500,
	/**
	 * @cfg {Number} width The width of the map window in pixels (defaults to
	 *      850). Note to express this dimension as a percentage or offset see
	 *      {@link Ext.Component#anchor}.
	 */
	mapWindowWidth : 850,
	/**
	 * @cfg {Integer} mapWindowMinZoomLevel The min zoom level for the map
	 *      (defaults to <tt>0</tt>)
	 */
	mapWindowMinZoomLevel : 0,
	/**
	 * @cfg {Boolean} zoomToFeatureOnInit zoom to features extend on init.
	 */
	zoomToFeatureOnInit : false,
    /**
     * @cfg {Boolean} enableResultLayers enable the result layers.
     */
	enableResultLayers : true,
    /**
     * @cfg {Boolean} setZoomAndCenter set the zoom and the center.
     */
	setZoomAndCenter : false,

	/**
	 * The map panel.
	 * 
	 * @property mapPanel
	 * @type Genapp.GeoPanel
	 */
	mapPanel : null,

	/**
	 * The map window.
	 * 
	 * @property mapWindow
	 * @type Ext.Window
	 */
	mapWindow : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {
		Genapp.form.GeometryField.superclass.initComponent.call(this);

		if (!this.hideTrigger) {
			this.onTriggerClick = function() {
				if (this.disabled) {
					return;
				}
				if (!(this.mapWindow instanceof Ext.Window)) {
					this.openMap(this);
				} else {
					this.mapWindow.show();
				}
			};
		}		
	},

	/**
	 * Open the map
	 */
	openMap : function() {
		if (!this.mapWindow) {

			// Define the GeoPanel
			this.mapPanel = new Genapp.GeoPanel({
				title : '',
				isDrawingMap : true,
				featureWKT : this.getRawValue(),
				hideMapDetails : this.hideMapDetails,
				hideDrawPointButton : this.hideDrawPointButton,
				hideDrawLineButton : this.hideDrawLineButton,
				hideLayerSelector : this.hideLayerSelector,
				hideSnappingButton : this.hideSnappingButton,
				hideGetFeatureButton : this.hideGetFeatureButton,
				hideFeatureInfoButton : this.hideFeatureInfoButton,
				minZoomLevel : this.mapWindowMinZoomLevel,
				zoomToFeatureOnInit : this.zoomToFeatureOnInit
			});

			// Define the buttons
			var buttons = [ {
				text : this.mapWindowCancelButtonText,
				handler : function() {
					this.mapWindow.destroy();
				},
				scope : this
			}, {
				text : this.mapWindowValidateButtonText,
				handler : this.onWindowValidate,
				scope : this
			} ];

			// Add the "Validate and Search" button
			if (!this.hideSearchButton) {
				buttons.push({
					text : this.mapWindowValidateAndSearchButtonText,
					handler : this.onWindowValidate.createDelegate(this, [ true ])
				});
			}

			// Define the Window
			this.mapWindow = new Ext.Window({
				layout : 'fit',
				maximizable : this.mapWindowMaximizable,
				maximized : this.mapWindowMaximized,
				title : this.mapWindowTitle,
				width : this.mapWindowWidth,
				height : this.mapWindowHeight,
				closeAction : 'destroy',
				draggable : true,
				resizable : true,
				modal : true,
				scope : true,
				items : this.mapPanel,
				buttons : buttons
			});

			// because Ext does not clean everything (mapWindow still instanceof
			// Ext.Window):
			this.mapWindow.on('destroy', function() {
			    delete this.mapPanel;
				delete this.mapWindow;
				if (this.submitRequest === true) {
					Ext.getCmp('consultation_panel').submitRequest();
					this.submitRequest = false;
				}
			}, this);

			// TODO : Remove dependency on consultationPanel
			// Set the zoom and the center
			if(this.setZoomAndCenter){
    			this.mapPanel.on('treerendered', function(mapPanel) {
    				var consultationPanel = Ext.getCmp('consultation_panel');
    				mapPanel.map.setCenter(consultationPanel.geoPanel.map.getCenter());
    				mapPanel.map.zoomTo(consultationPanel.geoPanel.map.getZoom() - this.mapWindowMinZoomLevel);
    				if(this.enableResultLayers){
    				    mapPanel.enableLayersAndLegends(mapPanel.layersActivation['request'], true, true);
    				}
    			}, this);
			}

			// Enable the result layers
			if(this.enableResultLayers && !this.setZoomAndCenter){
			    this.mapPanel.on('treerendered', function(mapPanel) {
			        mapPanel.enableLayersAndLegends(mapPanel.layersActivation['request'], true, true);
			    });
			}

		}
		this.mapWindow.show();
	},

	/**
	 * Function called when the window validate button is pressed
	 * 
	 * @param {Boolean}
	 *            search True to submit the request
	 */
	onWindowValidate : function(search) {
		var value = this.mapPanel.vectorLayer.features.length ? this.mapPanel.wktFormat.write(this.mapPanel.vectorLayer.features[0]) : '';
		this.setValue(value);
		if (search === true) {
			this.submitRequest = true;
		}
		this.mapWindow.destroy();
		if (this.hideWKT) {
			this.el.setStyle('visibility', 'hidden');
		} else {
			this.el.highlight();
		}
	}
});
Ext.reg('geometryfield', Genapp.form.GeometryField);/**
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
 * Provides a number range input field with a {@link Genapp.NumberRangePicker} dropdown and automatic number validation.
 *
 * @class Genapp.form.NumberRangeField
 * @extends Ext.form.TriggerField
 * @constructor Create a new NumberRangeField
 * @param {Object} config
 * @xtype numberrangefield
 */

Ext.namespace('Genapp.form');

Genapp.form.NumberRangeField = Ext.extend(Ext.form.TriggerField,  {
   
	/**
	 * Internationalization.
	 */ 
    numberSeparator: ' - ',
    decimalSeparator : ".",
    maxNumberPrefix: '<= ',
    minNumberPrefix: '>= ',
    minText : "The minimum value for this field is {0}",
    maxText : "The maximum value for this field is {0}",
    reverseText : "The max number must be superior to the min number",
    formatText : "The correct formats are",
    nanText : "'{0}' is not a valid number",
    
    /**
     * @cfg {Boolean} usePrefix if true, maxNumberPrefix and minNumberPrefix are used (defaults to true).
     * Otherwise minValue and maxValue are used.
     */
    usePrefix: true,
       
    /**
     * @cfg {Boolean} allowDecimals False to disallow decimal values (defaults to true)
     */
    allowDecimals : true,
    /**
     * @cfg {Number} decimalPrecision The maximum precision to display after the decimal separator (defaults to 2)
     */
    decimalPrecision : 2,
    /**
     * @cfg {Boolean} allowNegative False to prevent entering a negative sign (defaults to true)
     */
    allowNegative : true,
    /**
     * @cfg {Number} minValue The minimum allowed value (defaults to -Number.MAX_VALUE)
     */
    minValue : -Number.MAX_VALUE,
    /**
     * @cfg {Number} maxValue The maximum allowed value (defaults to Number.MAX_VALUE)
     */
    maxValue : Number.MAX_VALUE,
    /**
     * @cfg {String} baseChars The base set of characters to evaluate as valid (defaults to '0123456789<>= ').
     */
    baseChars : "0123456789<>= ",
    /**
     * @cfg {Boolean} hideValidationButton if true hide the menu validation button (defaults to true).
     */
    hideValidationButton : false,
    /**
     * @cfg {Boolean} setEmptyText if true set emptyText of the fields with the min and the max values (defaults to false).
     */
    setEmptyText : false,

    /**
     * Initialise the events management.
     */
    initEvents : function(){
        var allowed = '';
        allowed += this.baseChars; // ! this.baseChars can be null
        if (this.allowDecimals) {
            allowed += this.decimalSeparator;
        }
        if (this.allowNegative) {
            allowed += '-';
        }
        this.maskRe = new RegExp('[' + Ext.escapeRe(allowed) + ']');
        Genapp.form.NumberRangeField.superclass.initEvents.call(this);
    },

    /**
     * Initialise the component.
     */
    initComponent : function(){
        var i;
        Genapp.form.NumberRangeField.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event select
             * Fires when a date is selected via the date picker.
             * @param {Ext.form.DateField} this
             * @param {Date} date The date that was selected
             */
            'select'
        );
        if (this.setEmptyText){
            this.emptyText = this.minValue + this.numberSeparator + this.maxValue;
        }
        // Formating of the formatText string
        var format = 0;
        if (this.decimalPrecision > 0) {
            format = format+ this.decimalSeparator;
            for (i = 0; i < this.decimalPrecision; i++) {
                format = format + "0";
            }
        }
        this.formatText = this.formatText + " '{0}', '"+this.maxNumberPrefix+" {0}', '"+this.minNumberPrefix+" {0}', '{0} "+this.numberSeparator+" {0}'.";
        this.formatText = String.format(this.formatText, format);
    },

    /**
     * Validate the value.
     * 
     * @param {Number} value The value to check
     */
    validateValue : function(value){
        if (!Genapp.form.NumberRangeField.superclass.validateValue.call(this, value)){
            return false;
        }
        if (value.length < 1){ // if it's blank and textfield didn't flag it then it's valid
             return true;
        }
        var values = this.splitValue(value);
        if (values === null){
            this.markInvalid(this.formatText);
            return false;
        } else {
            var minv = values.minValue;
            var maxv = values.maxValue;
            if (minv !== null){
                minv = this.getNumber(minv);
                if (minv === null){
                    this.markInvalid(String.format(this.nanText, values.minValue));
                    return false;
                }
                if (minv < this.minValue){
                    this.markInvalid(String.format(this.minText, this.minValue));
                    return false;
                }
            }
            if (maxv !== null){
                maxv = this.getNumber(maxv);
                if (maxv === null){
                    this.markInvalid(String.format(this.nanText, values.maxValue));
                    return false;
                }
                if (maxv > this.maxValue){
                    this.markInvalid(String.format(this.maxText, this.maxValue));
                    return false;
                }
            }
            if (minv !== null && maxv !== null && (maxv - minv) < 0){
                this.markInvalid(this.reverseText);
                return false;
            }
            return true;
        }
    },

    /**
     * Returns the normalized data value (undefined or emptyText will be returned as '').
     * To return the raw value see {@link #getRawValue}.
     * @return {Mixed} value The field value
     */
    getValue : function(){
        var value = Genapp.form.NumberRangeField.superclass.getValue.call(this);
        value = this.formatNumberValue(value);
        return value === null ? '' : value;
    },

    /**
     * Returns the values.
     * 
     * @return {Object} The field values
     */
    getValues : function(){
        var value = Genapp.form.NumberRangeField.superclass.getValue.call(this);
        return this.getNumbersObject(this.splitValue(value));
    },

    /**
     * Sets a data value into the field and validates it.
     * To set the value directly without validation see {@link #setRawValue}.
     * @param {Mixed} value The value to set
     * @return {Ext.form.Field} this
     */
    setValue : function(v){
        v = this.formatNumberValue(v);
        return Genapp.form.NumberRangeField.superclass.setValue.call(this, v);
    },
    
    /**
     * Format the field.
     * 
     * @param {Mixed} value The value to set
     * @return {String} The formated string value
     */
    formatNumberValue : function(v){
        var minv, maxv, mins, maxs;
        if (!Ext.isObject(v)){
            v = this.splitValue(v);
        }
        v = this.getNumbersObject(v);

        if (v !== null){
            minv = v.minValue;
            maxv = v.maxValue;
            mins = isNaN(minv) ? '' : String(this.fixPrecision(minv)).replace(".", this.decimalSeparator);
            maxs = isNaN(maxv) ? '' : String(this.fixPrecision(maxv)).replace(".", this.decimalSeparator);

            if (this.usePrefix === true){
                if (minv === null && maxv !== null){
                    v = this.maxNumberPrefix + maxv;
                } else if (minv !== null && maxv === null){
                    v = this.minNumberPrefix + minv;
                } else if (minv !== null && maxv !== null){
                    if (minv === maxv){
                        v = mins;
                    } else {
                        v = mins + this.numberSeparator + maxs;
                    }
                } else {
                    v = '';
                }
            } else {
                if (minv === null && maxv !== null){
                    v = this.minValue + this.numberSeparator + maxs;
                } else if (minv !== null && maxv === null){
                    v = mins + this.numberSeparator + this.maxValue;
                } else if (minv !== null && maxv !== null){
                    if (minv === maxv){
                        v = mins;
                    } else {
                        v = mins + this.numberSeparator + maxs;
                    }
                } else {
                    v = '';
                }
            }
        }
        return v;
    },

    /**
     * Round the value to the specified number of decimals.
     * 
     * @param {Number} value The value to round
     */
    fixPrecision : function(value){
        var nan = isNaN(value);
        if (!this.allowDecimals || this.decimalPrecision === -1 || nan || !value){
           return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalPrecision));
    },

    // private
    getNumber : function(value){
        return Ext.num(String(value).replace(this.decimalSeparator, "."), null);
    },

    // private
    getNumbersObject : function(obj){
        if (!obj || !Ext.isObject(obj)){
            return null;
        }
        var minv = this.getNumber(obj.minValue);
        var maxv = this.getNumber(obj.maxValue);
        if (minv !== null || maxv !== null){
            return {minValue:minv, maxValue:maxv};
        } else {
            return null;
        }
    },

    /**
     * Return an object with the numbers found in the string
     * 
     * @param {String} value The string value to parse
     * @return {object}/null an object with min and max values or null for failed match operations
     * @hide
     */
    splitValue : function(value){
        var minv, maxv, minnpIndex, maxnpIndex;
        if (!value || !Ext.isString(value)){
            return null;
        }
        var values = value.split(this.numberSeparator);
        if (values.length === 1){
            minnpIndex = value.indexOf(this.minNumberPrefix,0);
            maxnpIndex = value.indexOf(this.maxNumberPrefix,0);
            if (minnpIndex !== -1){
            // Case ">= 00.00"
                minv = value.substring(minnpIndex + this.minNumberPrefix.length);
                return {minValue:minv, maxValue:null};
            }else if (maxnpIndex !== -1){
            // Case "<= 00.00"
                maxv = value.substring(maxnpIndex + this.maxNumberPrefix.length);
                return {minValue:null, maxValue:maxv};
            }else{
            // Case "00.00"
                return {minValue:value, maxValue:value};
            }
        }else if (values.length === 2){
            // Case "00.00 - 00.00"
                return {minValue:values[0], maxValue:values[1]};
        }else{
            return null;
        }
    },

    /**
     * The function that handle the trigger's click event.
     * Implements the default empty TriggerField.onTriggerClick function to display the NumberRangePicker
     * @method onTriggerClick
     * @hide
     */
    onTriggerClick : function(){
        if (this.disabled){
            return;
        }
        if (!this.menu){
            /**
             * The field menu (displayed on a trigger click).
             * @property menu
             * @type Genapp.form.menu.NumberRangeMenu
             */
            this.menu = new Genapp.form.menu.NumberRangeMenu({
                hideOnClick: false,
                hideValidationButton: this.hideValidationButton
            });
            
            Ext.apply(this.menu.rangePicker.minField,  {
                emptyText: this.setEmptyText ? this.minValue : null,
                allowDecimals : this.allowDecimals,
                decimalSeparator : this.decimalSeparator,
                decimalPrecision : this.decimalPrecision,
                allowNegative : this.allowNegative,
                minValue : this.minValue,
                maxValue : this.maxValue,
                baseChars : this.baseChars
            });
            Ext.apply(this.menu.rangePicker.maxField,  {
                emptyText : this.setEmptyText ? this.maxValue : null,
                allowDecimals : this.allowDecimals,
                decimalSeparator : this.decimalSeparator,
                decimalPrecision : this.decimalPrecision,
                allowNegative : this.allowNegative,
                minValue : this.minValue,
                maxValue : this.maxValue,
                baseChars : this.baseChars
            });
        }
        this.onFocus();

        var values = this.getValues();
        if (values !== null){
            this.menu.rangePicker.minField.setValue(values.minValue);
            this.menu.rangePicker.maxField.setValue(values.maxValue);
        } else {
            if (this.getRawValue() !== ''){
                return;
            }
        }

        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
        this.menu.rangePicker.minField.focus(true, 60);
    },

    //private
    menuEvents: function(method){
        this.menu[method]('select', this.onSelect, this);
        this.menu[method]('hide', this.onMenuHide, this);
        this.menu[method]('show', this.onFocus, this);
    },

    //private
    onSelect: function(m, d){
        this.menu.hide();
        this.setValue(d);
        
    },

    //private
    onMenuHide: function(){
        this.focus(false, 60);
        this.menuEvents('un');
        this.setValue({
            minValue: this.menu.rangePicker.minField.getValue(),
            maxValue: this.menu.rangePicker.maxField.getValue()
        });
    },

    // private
    // Provides logic to override the default TriggerField.validateBlur which just returns true
    validateBlur : function(){
        return !this.menu || !this.menu.isVisible();
    },

    // private
    onDestroy : function(){
        Ext.destroy(this.menu, this.wrap);
        Genapp.form.NumberRangeField.superclass.onDestroy.call(this);
    }
});
Ext.reg('numberrangefield', Genapp.form.NumberRangeField);/**
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

Ext.namespace('Genapp.form');
Ext.namespace('Ext.ux.form');

/**
 * Provides a image upload field
 * 
 * @class Genapp.form.ImageField
 * @extends Ext.ux.form.FileUploadField
 * @constructor Create a new ImageField
 * @param {Object}
 *            config
 * @xtype imagefield
 */

Genapp.form.ImageField = Ext.extend(Ext.ux.form.FileUploadField, {

	/**
	 * Internationalization.
	 */
	emptyImageUploadFieldTest : 'Select an image',

	/**
	 * A hidden form used to submit the file
	 */
	imageForm : null,

	/**
	 * Window used to display the uplad form
	 */
	uploadWindow : null,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Default configuration
		var config = {
			emptyText : this.emptyImageUploadFieldTest,
			buttonText : '',
			buttonCfg : {
				iconCls : 'upload-icon'
			}
		}

		// apply config
		Ext.apply(this, Ext.apply(this.initialConfig, config));

		// call parent init component
		Genapp.form.ImageField.superclass.initComponent.apply(this, arguments);

		// Upload the file as soon as it is selected
		this.on('fileselected', this.selectFile, this);

	},

	/**
	 * Select the file
	 */
	selectFile : function() {

		// Lazy initialisation of a form used to submit the image
		if (this.imageForm == null) {

			// Create a hidden form for the image field
			this.imageForm = new Ext.FormPanel({
				method : 'POST',
				fileUpload : true,
				frame : true,
				encoding : 'multipart/data',
				layout : 'fit',
				defaults : {
					anchor : '95%',
					allowBlank : false,
					msgTarget : 'side'
				},
				items : [ {
					xtype : 'hidden',
					name : 'type',
					value : 'image'
				}, {
					xtype : 'hidden',
					name : 'id',
					value : this.id
				}, this // ugly but works OK
				// {
				// xtype : 'fileuploadfield',
				// name : 'file',
				// value : this.value
				// }
				]
			});

			// Automatically launch the upload after render
			this.imageForm.on('afterrender', this.uploadFile, this);

			// Display the form in a window
			this.uploadWindow = new Ext.Window({
				closeAction : 'hide',
				title : 'Upload',
				items : [ this.imageForm ]
			});
		}

		this.uploadWindow.show();

	},

	/**
	 * Upload the file
	 */
	uploadFile : function() {
		// Submit the image
		if (this.imageForm.getForm().isValid()) {
			this.imageForm.getForm().submit({
				url : Genapp.base_url + 'dataedition/ajaximageupload',
				method : 'POST',
				enctype : 'multipart/form-data',
				waitTitle : 'Connexion au serveur ...',
				waitMsg : 'Upload en cours ...',
				success : this.onUploadSuccess,
				failure : this.onUploadFailure,
				scope : this
			});
		}

		// Set the value as a hidden field ???
		// alert("value : " + this.value);

	},

	/**
	 * Upload success
	 */
	onUploadSuccess : function() {
		// this.uploadWindow.close();
		console.log('success');
	},

	/**
	 * Upload failure
	 */
	onUploadFailure : function() {
		// this.uploadWindow.close();
		console.log('failure');
	},

	/**
	 * Destroy the component
	 */
	onDestroy : function() {
		console.log('destroy');
		Ext.destroy(this.imageForm);
		Genapp.form.ImageField.superclass.onDestroy.call(this);
	}

});
Ext.reg('imagefield', Genapp.form.ImageField);/**
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
 * Provides a tree field
 * 
 * @class Genapp.form.TreeField
 * @extends Ext.form.TriggerField
 * @constructor Create a new TreeField
 * @param {Object}
 *            config
 * @xtype treefield
 */

Ext.namespace('Genapp.form');

Genapp.form.TreeField = Ext.extend(Ext.form.ComboBox, {
	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : false,

	/**
	 * The datastore
	 */
	store : {
		xtype : 'jsonstore',
		autoDestroy : true,
		remoteSort : true,
		root : 'rows',
		idProperty : 'code',
		totalProperty : 'results',
		fields : [ {
			name : 'code', // Must be equal to this.valueField
			mapping : 'code'
		}, {
			name : 'label', // Must be equal to this.displayField
			mapping : 'label'
		} ],
		url : Genapp.base_url + 'query/ajaxgettreecodes'
	},

	/**
	 * Value field in the store
	 */
	valueField : 'code',

	/**
	 * Display field in the store,
	 */
	displayField : 'label',

	/**
	 * @cfg {String} emptyText The default text to place into an empty field
	 *      (defaults to 'Select...').
	 */
	emptyText : 'Select...',

	/**
	 * Manage multiple values,
	 */
	multiple : false,

	/**
	 * The field menu (displayed on a trigger click).
	 * 
	 * @property menu
	 * @type Genapp.form.menu.TreeMenu
	 */
	menu : null,

	pageSize : 10,
	listWidth : 300,
	selectOnFocus : true,

	/**
	 * @cfg {String} baseNodeUrl The URL from which to request a Json string which
	 *      specifies an array of node definition objects representing the child
	 *      nodes to be loaded. 
	 */
	baseNodeUrl : Genapp.base_url + 'query/ajaxgettreenodes/',

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Set the submit name of the field
		this.hiddenName = this.name;

		Genapp.form.TreeField.superclass.initComponent.call(this);

		// TODO change depth depending on level
		this.nodeUrl = this.baseNodeUrl;
		if (!Ext.isEmpty(this.unit)) {
			this.nodeUrl += 'unit/' + this.unit + '/';
		}
		this.nodeUrl += 'depth/1';

		this.store.setBaseParam('unit', this.unit);

		// Add the default value to the store
		var rc = {};
		rc[this.valueField] = this.value;
		rc[this.displayField] = this.valueLabel;
		this.getStore().add(new Ext.data.Record(rc));

		// Set the current value to the default value
		this.setValue(this.value);
	},

	/**
	 * The function that handle the trigger's click event. Implements the
	 * default empty TriggerField.onTriggerClick function to display the
	 * TreePicker
	 * 
	 * @method onTriggerClick
	 * @hide
	 */
	onTriggerClick : function() {
		if (this.disabled) {
			return;
		}
		if (!this.menu) {
			this.menu = new Genapp.form.menu.TreeMenu({
				hideOnClick : false,
				hideValidationButton : this.hideValidationButton,
				dataUrl : this.nodeUrl,
				multiple : this.multiple
			});
		}
		this.onFocus();

		this.menu.show(this.el, "tl-bl?");
		this.menuEvents('on');
	},

	// private
	menuEvents : function(method) {
		this.menu[method]('select', this.onSelect, this);
		this.menu[method]('hide', this.onMenuHide, this);
		this.menu[method]('show', this.onFocus, this);
	},

	// private
	onSelect : function(record, index) {
		if (this.fireEvent('beforeselect', this, record, index) !== false) {
			if (!Ext.isEmpty(record)) {
				// Case of an array
				if (record instanceof Array) {
					this.onArraySelect(record, index);
				}
				// Case where the selection is done in the tree
				else if (record instanceof Ext.tree.AsyncTreeNode || record instanceof Ext.tree.TreeNode) {
					if (Ext.isEmpty(this.getStore().getById(record.attributes.id))) {
						var rc = {};
						rc[this.valueField] = record.attributes.id;
						rc[this.displayField] = record.attributes.text;
						this.getStore().add([ new Ext.data.Record(rc) ]);
					}
					this.setValue(record.attributes.id);
				}
				// Case where the selection is done in the list
				else if (record instanceof Ext.data.Record) {
					this.setValue(record.data[this.valueField || this.displayField]);
				} else {
					alert("Type inconnu");
				}
				
			}
			
			if (this.menu) {
				this.menu.hide();
			}			
			this.collapse();			
		}
	},

	// private
	onArraySelect : function(record, index) {
		// Case where the selection is done in the tree
		if (record[0] instanceof Ext.tree.AsyncTreeNode || record[0] instanceof Ext.tree.TreeNode) {
			if (this.menu) {
				this.menu.hide();
			}
			var valueFields = [];
			var displayFields = [];
			for ( var i = 0; i < record.length; i++) {
				var attributes = record[i].attributes;
				valueFields.push(attributes.id);
				displayFields.push(attributes.text);
			}
			this.addArrayToStore(valueFields, displayFields);
			this.setValue(valueFields.toString());
			this.fireEvent('select', this, record, index);
		}
		// Case where the selection is done in the list
		// Not possible for now. Wait for EXTJS4
		else if (record[0] instanceof Ext.data.Record) {
			var valueFields = [];
			var displayFields = [];
			for ( var i = 0; i < record.length; i++) {
				var data = record[i].data;
				valueFields.push(data[this.valueField]);
				displayFields.push(data[this.displayField]);
			}
			this.addArrayToStore(valueFields, displayFields);
			this.setValue(valueFields.toString());
			this.setValue(values);
			this.fireEvent('select', this, record, index);
		}
		
		this.collapse();
		
	},

	// private
	addArrayToStore : function(valueFields, displayFields) {
		if (Ext.isEmpty(this.getStore().getById(valueFields.toString()))) {
			var rc = {};
			rc[this.valueField] = valueFields.toString();
			rc[this.displayField] = displayFields.toString();
			this.getStore().add([ new Ext.data.Record(rc) ]);
		}
	},

	// private
	onMenuHide : function() {
		this.focus(false, 60);
		this.menuEvents('un');
	},

	onDestroy : function() {
		Ext.destroy(this.menu, this.wrap);
		Genapp.form.TreeField.superclass.onDestroy.call(this);
	}

});
Ext.reg('treefield', Genapp.form.TreeField);/**
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
 * Provides a taxref field.
 * 
 * A taxref is a specialiced kind of tree used for taxonony.
 * 
 * @class Genapp.form.TaxrefField
 * @extends Ext.form.ComboBox
 * @constructor Create a new TaxrefField
 * @param {Object}
 *            config
 * @xtype taxreffield
 */

Ext.namespace('Genapp.form');

Genapp.form.TaxrefField = Ext.extend(Ext.form.ComboBox, {
	
	// Custom rendering template
	tpl :  '<tpl for="."><div class="x-combo-list-item">' + 
			'<tpl if="!Ext.isEmpty(values.isReference) && values.isReference == 0">'+ '<i>{label}</i>' + '</tpl>'+
			'<tpl if="!Ext.isEmpty(values.isReference) && values.isReference == 1">'+ '<b>{label}</b>' + '</tpl>'+
			'<br/>' +
			'<tpl if="!Ext.isEmpty(values.vernacularName) && values.vernacularName != null">'+ '({vernacularName})' + '</tpl>'+
			'<br/>' +
			'<tpl if="!Ext.isEmpty(values.code) && values.code != null">'+ '({code})' + '</tpl>'+
		'</div></tpl>', 
	
	/**
	 * Value field in the store
	 */
	valueField : 'code',

	/**
	 * Display field in the store,
	 */
	displayField : 'label',

	/**
	 * @cfg {String} emptyText The default text to place into an empty field
	 *      (defaults to 'Select...').
	 */
	emptyText : 'Select...',

	/**
	 * The field menu (displayed on a trigger click).
	 * 
	 * @property menu
	 * @type Genapp.form.menu.TreeMenu
	 */
	menu : null,

	pageSize : 10,
	listWidth : 300,
	selectOnFocus : true,
	
	
    // Data store
    store: {
        xtype: 'jsonstore',
        autoDestroy : true,
        remoteSort : true,
        root : 'rows',
        idProperty : 'code',
        totalProperty: 'results',
        fields : [ {
            name : 'code',
            mapping : 'code'
        }, {
            name : 'label',
            mapping : 'label'
        }, {
            name : 'vernacularName',
            mapping : 'vernacularName'
        }, {
            name : 'isReference',
            mapping : 'isReference'
        }
        ],
        url : Genapp.base_url  + 'query/ajaxgettaxrefcodes'
    },

    baseNodeUrl : Genapp.base_url + 'query/ajaxgettaxrefnodes/',
    
    
    /**
	 * Initialise the component.
	 */
	initComponent : function() {
		
		// Set the submit name of the field
		this.hiddenName = this.name;
		
		Genapp.form.TaxrefField.superclass.initComponent.call(this);
		
		// TODO change depth depending on level
		this.nodeUrl = this.baseNodeUrl;
		if (!Ext.isEmpty(this.unit)) {
			this.nodeUrl += 'unit/' + this.unit + '/';
		}
		this.nodeUrl += 'depth/1';

		this.store.setBaseParam('unit', this.unit);

		// Add the default value to the store
		var rc = {};
		rc[this.valueField] = this.value;
		rc[this.displayField] = this.valueLabel;
		this.getStore().add(new Ext.data.Record(rc));

		// Set the current value to the default value
		this.setValue(this.value);
		
		this.on('select', this.onSelect, this);
	},


    /**
     * The function that handle the trigger's click event. Implements the
     * default empty TriggerField.onTriggerClick function to display the
     * TaxrefPicker
     * 
     * @method onTriggerClick
     * @hide
     */
    onTriggerClick : function() {
        if (this.disabled) {
            return;
        }
        if (!this.menu) {
            /**
             * The field menu (displayed on a trigger click).
             * 
             * @property menu
             * @type Genapp.form.menu.TaxrefMenu
             */
            this.menu = new Genapp.form.menu.TaxrefMenu({
                hideOnClick : false,
                hideValidationButton : this.hideValidationButton,
                dataUrl : this.nodeUrl
            });
        }
        this.onFocus();

        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');        
    },
	
	
	// private
	menuEvents : function(method) {
		this.menu[method]('select', this.onSelect, this);
		this.menu[method]('hide', this.onMenuHide, this);
		this.menu[method]('show', this.onFocus, this);
	},

	// private
	onSelect : function(record, index) {
		if (this.fireEvent('beforeselect', this, record, index) !== false) {
			
			if (!Ext.isEmpty(record)) {
				// Case where the selection is done in the tree
				if (record instanceof Ext.tree.AsyncTreeNode || record instanceof Ext.tree.TreeNode) {
					if (Ext.isEmpty(this.getStore().getById(record.attributes.id))) {
						var rc = {};
						rc[this.valueField] = record.attributes.id;
						rc[this.displayField] = record.attributes.text;
						this.getStore().add([ new Ext.data.Record(rc) ]);
					}
					this.setValue(record.attributes.id);			
				}
				// Case where the selection is done in the list
				else if (record instanceof Ext.data.Record) {
					this.setValue(record.data[this.valueField]);
				} else {
					alert("Type inconnu");
				}
			}
			
			this.collapse();
			if (this.menu) {
				this.menu.hide();
			}			
		}
	},

	
	// private
	onMenuHide : function() {
		this.focus(false, 60);
		this.menuEvents('un');
	},

	onDestroy : function() {
		Ext.destroy(this.menu, this.wrap);
		Genapp.form.TaxrefField.superclass.onDestroy.call(this);
	}
	
});
Ext.reg('taxreffield', Genapp.form.TaxrefField);
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
 * 
 * A twin number field.
 * 
 * @class Genapp.form.TwinNumberField
 * @extends Ext.form.TwinTriggerField
 * @constructor Create a new TwinNumberField
 * @param {Object}
 *            config
 * @xtype twinnumberfield
 */

Ext.namespace('Genapp.form');

Genapp.form.TwinNumberField = Ext.extend(Ext.form.TwinTriggerField, {

	/**
	 * Internationalization.
	 */
	decimalSeparator : ".",
	minText : "The minimum value for this field is {0}",
	maxText : "The maximum value for this field is {0}",
	nanText : "{0} is not a valid number",

	/**
	 * @cfg {String} fieldClass The default CSS class for the field (defaults to
	 *      "x-form-field x-form-num-field")
	 */
	fieldClass : "x-form-field x-form-num-field",
	/**
	 * @cfg {Boolean} allowDecimals False to disallow decimal values (defaults
	 *      to true)
	 */
	allowDecimals : true,
	/**
	 * @cfg {Number} decimalPrecision The maximum precision to display after the
	 *      decimal separator (defaults to 2)
	 */
	decimalPrecision : 2,
	/**
	 * @cfg {Boolean} allowNegative False to prevent entering a negative sign
	 *      (defaults to true)
	 */
	allowNegative : true,
	/**
	 * @cfg {Number} minValue The minimum allowed value (defaults to
	 *      Number.NEGATIVE_INFINITY)
	 */
	minValue : -Number.MAX_VALUE,
	/**
	 * @cfg {Number} maxValue The maximum allowed value (defaults to
	 *      Number.MAX_VALUE)
	 */
	maxValue : Number.MAX_VALUE,
	/**
	 * @cfg {String} baseChars The base set of characters to evaluate as valid
	 *      numbers (defaults to '0123456789').
	 */
	baseChars : "0123456789",
	/**
	 * @cfg {String} trigger1Class An additional CSS class used to style the
	 *      trigger button. The trigger will always get the class
	 *      'x-form-clear-trigger' by default and triggerClass will be appended
	 *      if specified.
	 */
	trigger1Class : 'x-form-clear-trigger',
	/**
	 * @cfg {Boolean} hideTrigger1 true to hide the first trigger. (Default to
	 *      true) See Ext.form.TwinTriggerField#initTrigger also.
	 */
	hideTrigger1 : true,
	/**
	 * @cfg {Boolean} hideTrigger2 true to hide the second trigger. (Default to
	 *      true) See Ext.form.TwinTriggerField#initTrigger also.
	 */
	hideTrigger2 : true,

	/**
     * Initialise the component.
     */
	initComponent : function() {
		this.on('change', this.onChange, this);
		Genapp.form.TwinNumberField.superclass.initComponent.call(this);
	},

	/**
	 * The function that handle the trigger's click event. See
	 * {@link Ext.form.TriggerField#onTriggerClick} for additional information.
	 * 
	 * @method
	 * @param {EventObject}
	 *            e
	 * @hide
	 */
	onTrigger1Click : function() {
		this.reset();
		this.triggers[0].hide();
	},

	// private
	onChange : function(field) {
		var v = this.getValue();
		if (v !== '' && v !== null) {
			this.triggers[0].show();
		} else {
			this.triggers[0].hide();
		}
	},

	// private
	initEvents : function() {
		var allowed = this.baseChars + '';
		if (this.allowDecimals) {
			allowed += this.decimalSeparator;
		}
		if (this.allowNegative) {
			allowed += '-';
		}
		this.maskRe = new RegExp('[' + Ext.escapeRe(allowed) + ']');
		Ext.form.NumberField.superclass.initEvents.call(this);
	},

	// private
	validateValue : function(value) {
		if (!Ext.form.NumberField.superclass.validateValue.call(this, value)) {
			return false;
		}
		if (value.length < 1) { // if it's blank and textfield didn't flag it
								// then it's valid
			return true;
		}
		value = String(value).replace(this.decimalSeparator, ".");
		if (isNaN(value)) {
			this.markInvalid(String.format(this.nanText, value));
			return false;
		}
		var num = this.parseValue(value);
		if (num < this.minValue) {
			this.markInvalid(String.format(this.minText, this.minValue));
			return false;
		}
		if (num > this.maxValue) {
			this.markInvalid(String.format(this.maxText, this.maxValue));
			return false;
		}
		return true;
	},

	/**
	 * Returns the normalized data value (undefined or emptyText will be
	 * returned as ''). To return the raw value see {@link #getRawValue}.
	 * 
	 * @return {Mixed} value The field value
	 */
	getValue : function() {
		return this.fixPrecision(this.parseValue(Ext.form.NumberField.superclass.getValue.call(this)));
	},

	/**
	 * Sets a data value into the field and validates it. To set the value
	 * directly without validation see {@link #setRawValue}.
	 * 
	 * @param {Mixed}
	 *            value The value to set
	 * @return {Ext.form.Field} this
	 */
	setValue : function(v) {
		v = typeof v === 'number' ? v : parseFloat(String(v).replace(this.decimalSeparator, "."));
		v = isNaN(v) ? '' : String(v).replace(".", this.decimalSeparator);
		if (this.triggers) {
			if (v !== '' && v !== null && v !== this.minValue && v !== this.maxValue) {
				this.triggers[0].show();
			} else {
				this.triggers[0].hide();
			}
		}
		return Ext.form.NumberField.superclass.setValue.call(this, v);
	},

	// private
	parseValue : function(value) {
		value = parseFloat(String(value).replace(this.decimalSeparator, "."));
		return isNaN(value) ? '' : value;
	},

	// private
	fixPrecision : function(value) {
		var nan = isNaN(value);
		if (!this.allowDecimals || this.decimalPrecision === -1 || nan || !value) {
			return nan ? '' : value;
		}
		return parseFloat(parseFloat(value).toFixed(this.decimalPrecision));
	},

	// private
	beforeBlur : function() {
		var v = this.parseValue(this.getRawValue());
		if (v !== '' && v !== null) {
			this.setValue(this.fixPrecision(v));
		}
	}
});
Ext.reg('twinnumberfield', Genapp.form.TwinNumberField);/**
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
 * 
 * LayerTreePanel Class
 * 
 * @class Genapp.tree.LayerTreePanel
 * @extends Ext.tree.TreePanel
 * @constructor Create a new LayerTreePanel
 * @param {Object}
 *            config
 * @xtype Ext.tree.TreePanel
 */

Ext.namespace('Genapp.tree');

Genapp.tree.LayerTreePanel = Ext.extend(Ext.tree.TreePanel, {

	autoScroll : true,
	rootVisible : false,
	enableDD : true,
	title : '',
	border : false,
	
	/**
	 * Internationalization.
	 */
	alertInvalidLayerMove : "Déplacement non autorisé",

	/**
	 * Read-only. An object containing the node id for each layer name.
	 * {layerName: nodeId, ...} Note: Must stay in the initComponent to avoid
	 * conflicts between the instances of this class
	 * 
	 * @type Object
	 */
	layerNodeIds : null,

	/**
	 * @cfg {OpenLayers.map} map The map linked to this layer Tree.
	 */
	map : null,

	store : null,

	// private
	initComponent : function() {

		this.store = new GeoExt.data.LayerStore({
			map : this.map,
			initDir : GeoExt.data.LayerStore.MAP_TO_STORE
		});

		this.layerNodeIds = [];

		// Add a loader to the root children node config if needed
		for ( var i = 0; i < this.rootChildren.length; i++) {
			this.addLoaderToNodeConfig(this.rootChildren[i]);
		}
		// Create the tree root node
		this.root = new Ext.tree.AsyncTreeNode({
			children : this.rootChildren,
			leaf : false,
			expanded : true
		});

		// add plugins
		this.plugins = this.plugins || [];
		this.plugins.push({
			ptype : "gx_treenodecomponent"
		});

		// Context menu with opacity slider, added by Lucia:
		this.plugins.push(new Genapp.tree.ContextMenuPlugin({
			sliderOptions : {
				aggressive : true,
				plugins : new GeoExt.LayerOpacitySliderTip()
			}
		}));

		// Register "checkchange" event
		//Toggle the children on the parent node 'checkchange' event
		this.on('checkchange', this.toggleChildrenOnParentToggle, this);
		
		Genapp.tree.LayerTreePanel.superclass.initComponent.call(this);
	},

	/**
	 * Filter the layers to be loaded.
	 * 
	 * Layers that are loaded are the ones with the good nodeGroup.
	 * 
	 * @param record
	 *            a record corresponding to a layer
	 * @param nodeGroup
	 *            the name of the group we want to load
	 */
	filterGroup : function(record, nodeGroup) {
		var layerNodeGroup = record.getLayer().options.nodeGroup;
		if (!Ext.isEmpty(layerNodeGroup) && layerNodeGroup.indexOf(nodeGroup) !== -1) {
			return true;
		}
		return false;
	},
	
	/**
	 * Reorganize the layers indexes and Z layers indexes when moving a layer.
	 */
	setLayerIdx : function(layer, idxDepart,idxArrivee) {
        if (idxArrivee < 0) {
            idxArrivee = 0;
        } else if (idxArrivee > this.map.layers.length) {
            idxArrivee = this.map.layers.length;
        }
        if (idxDepart != idxArrivee) {
        	
        	this.map.layers.splice(idxDepart,1);
        	this.map.layers.splice(idxArrivee, 0, layer);
            for (var i=0, len=this.map.layers.length; i<len; i++) {
            	this.map.layers[i].setZIndex(i);
            }
        }
        
},

	/**
	 * Add a loader to the node config if needed
	 * 
	 * @param {Ext.tree.TreeNode}
	 *            nodeCfg The node config
	 * @hide
	 */
	addLoaderToNodeConfig : function(nodeCfg) {
		if (!Ext.isEmpty(nodeCfg.nodeGroup)) {

			nodeCfg.loader = new GeoExt.tree.LayerLoader({

				store : this.store,

				// Add the filter
				"filter" : this.filterGroup.createDelegate(this, nodeCfg.nodeGroup, true),

				// Override the default addLayerNode function to add the layer
				// options
				"addLayerNode" : function(node, layerRecord, index) {
					index = index || 0;
					if (this.filter(layerRecord) === true) {
						var child = this.createNode({
							nodeType : 'gx_layer',
							layer : layerRecord.getLayer(),
							layerStore : this.store,
							// New params
							checkedGroup : layerRecord.getLayer().options.checkedGroup,
							text : layerRecord.getLayer().options.label
						});
						
						// TODO : Sortir ces 2 fonctions (dans le bon scope ...)
						
						var indexVariation;
						// Sauvegarde de l'ancien index du noeud
						child.addListener('beforemove', function (tree, thisNode, oldParent, newParent, index) {
							   thisNode.oldIndex = oldParent.indexOf(thisNode);
						});
				
						
						// Déplacement du layer
						// @thanks to Francois Valiquette : http://www.mail-archive.com/users@geoext.org/msg02579.html
						child.addListener('move', function (tree, thisNode, oldParent, newParent, index, refNode) {
							// On ne fait le déplacement que si le parent est le même
							
							if (oldParent == newParent) {
							   // On calcule le déplacement du node
							   indexVariation = thisNode.oldIndex - oldParent.indexOf(thisNode);
							   idxDepart = tree.map.getLayerIndex(thisNode.layer);
							   if (refNode) { //if not out of the list of layers
								   idxArrivee = tree.map.getLayerIndex(refNode.layer);
							   }
							   else { //if moving after the last layer of the list
								   idxArrivee = 0;
							   }
							   
							   /* call the function to place the layer at the good Z in the map
							    and to assign the good index for the tree panel
							    */
							   tree.setLayerIdx(thisNode.layer,idxDepart,idxArrivee);
							   
							} else if (typeof thisNode.recursiveCall === "undefined" || thisNode.recursiveCall == false) {
								//to avoid an infinite loop
								thisNode.recursiveCall = true; 		
								
								// Sinon on remet le node à sa place
								Ext.MessageBox.alert('Error', Genapp.tree.LayerTreePanel.prototype.alertInvalidLayerMove, function reverseChange(btn, texte, opt) {
									oldParent.insertBefore(thisNode, oldParent.item(thisNode.oldIndex));
									thisNode.recursiveCall = false;									
								});
								
							}
							
						});					
						// On interdit le drag des noeuds parents 
						node.draggable = false;

						var sibling = node.item(index);
						if (sibling) {
							node.insertBefore(child, sibling);
						} else {
							node.appendChild(child);
						}
						
					}
				},
				// Set the layersNodeIds object when the node order has changed
				listeners : {
					"load" : this.setLayerNodeIds,
					scope : this				
				},
				scope : this
			});
		}
	},

	/**
	 * Toggle the children checkbox on the parent checkbox change
	 * 
	 * @param {Ext.tree.TreeNode}
	 *            node The parent node
	 * @param {Boolean}
	 *            checked The checked status
	 * @hide
	 */
	toggleChildrenOnParentToggle : function(node, checked) {

		if (node.firstChild == null) {
			return; // The node has no child
		}

		// Check that the event have been launched on this instance
		if (this.map.id == node.firstChild.layerStore.map.id) {
			if (checked === true) {
				for ( var i = 0; i < node.childNodes.length; i++) {
					var child = node.childNodes[i];
					if (!child.ui.isChecked()) {
						child.ui.toggleCheck(true);
					}
				}
			} else {
				for ( var i = 0; i < node.childNodes.length; i++) {
					var child = node.childNodes[i];
					if (child.ui.isChecked()) {
						child.ui.toggleCheck(false);
					}
				}
			}
		}
	},

	/**
	 * Set the layerNodeIds array
	 * 
	 * @hide
	 */
	setLayerNodeIds : function() {
		this.eachLayerChild(function(child) {
			this.layerNodeIds[child.layer.name] = child.id;
		}, this);
	},

	/**
	 * Call the callback function for each layer child
	 * 
	 * @param {Function}
	 *            fn The callback
	 * @param {Object}
	 *            scope The scope for the callback
	 * @param {Array}
	 *            args The arguments for the callback
	 * @param {Ext.tree.TreeNode}
	 *            node The child parent node
	 */
	eachLayerChild : function(fn, scope, args, node) {
		node = Ext.isEmpty(node) ? this.root : node;
		if (!Ext.isEmpty(node) && !Ext.isEmpty(node.childNodes)) {
			for ( var i = 0; i < node.childNodes.length; i++) {
				var child = node.childNodes[i];
				if (!Ext.isEmpty(child.layer)) {
					if (fn.apply(scope || child, args || [ child ]) === false) {
						break;
					}
				} else if (!child.isLeaf()) {
					this.eachLayerChild(fn, scope, args, child);
				}
			}
		}
	},

	/**
	 * Return the node for the passed layer name
	 * 
	 * @param {Ext.tree.TreeNode}
	 *            layerName The layer name
	 */
	getNodeByLayerName : function(layerName) {
		var nodeId = this.layerNodeIds[layerName];
		if (Ext.isEmpty(nodeId)) {
			this.setLayerNodeIds();
		}
		return this.getNodeById(nodeId);
	},

	/**
	 * Toggle the node checkbox
	 * 
	 * @param {Integer}
	 *            nodeId The node id
	 * @param {Boolean}
	 *            toggleCheck True to check, false to uncheck the box. If no
	 *            value was passed, toggles the checkbox
	 */
	toggleNodeCheckbox : function(nodeId, toggleCheck) {
		var node = this.getNodeById(nodeId);
		node.ui.toggleCheck(toggleCheck);
	}
	
	
});
Ext.reg('layertreepanel', Genapp.tree.LayerTreePanel);/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license. 
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text of the license.
 */

// A supprimer quand sera intégré dans GeoExt
Ext.namespace("Genapp.tree");

Genapp.tree.ContextMenuPlugin = Ext.extend(Ext.util.Observable, {

	/* begin i18n */
	/** api: config[deleteLayerText] ``String`` i18n */
	deleteLayerText : "Delete layer",

	/** api: config[deleteLayerConfirmationText] ``String`` i18n */
	deleteLayerConfirmationText : "Are you sure you wish to remove this layer ?",

	/** api: config[changeOpacityText] ``String`` i18n */
	changeOpacityText : "Change opacity",

	/* end i18n */

	sliderOptions : {},

	defaultSliderOptions : {
		width : 200
	},

	menu : null,

	constructor : function(config) {
		Ext.apply(this.initialConfig, Ext.apply({}, config));
		Ext.apply(this, config);
		Ext.applyIf(this.sliderOptions, this.defaultSliderOptions);
		this.addEvents("contextmenu");
		Genapp.tree.ContextMenuPlugin.superclass.constructor.apply(this, arguments);
	},

	init : function(tree) {
		tree.on({
			"contextmenu" : this.onContextMenu,
			scope : this
		});
	},

	onContextMenu : function(node, e) {
		// if the node clicked has no layer, there is nothing to do.
		if (!node.layer) {
			return;
		}

		var sliderOptions, contextMenuItems = [], a;

		e.stopEvent();

		a = node.attributes;

		if (this.menu) {
			this.menu.destroy();
		}

		sliderOptions = Ext.applyIf({
			layer : node.layer
		}, this.sliderOptions);

		// OpacitySlider
		contextMenuItems.push({
			text : this.changeOpacityText,
			menu : {
				plain : true,
				items : [ new GeoExt.LayerOpacitySlider(sliderOptions) ]
			}
		});

		// DeleteLayer
		if (a.allowDelete) {
			contextMenuItems.push({
				text : this.deleteLayerText,
				handler : function() {
					Ext.MessageBox.confirm(this.deleteLayerText, this.deleteLayerConfirmationText + node.layer.name, function(btn) {
						if (btn == 'yes') {
							var store = this.layerStore;
							var nRecords = store.getCount();

							var layers = [];
							for ( var i = 0; i < nRecords; i++) {
								layers.push(store.getAt(i).get('layer'));
							}

							var layerIdx = OpenLayers.Util.indexOf(layers, this.layer);

							if (layerIdx != -1) {
								store.remove(store.getAt(layerIdx));
							}
						}
					}, node);
				},
				scope : this
			});
		}

		// ContextMenu
		this.menu = new Ext.menu.Menu({
			ignoreParentClick : true,
			defaults : {
				scope : node.getOwnerTree()
			},
			items : contextMenuItems
		});

		this.menu.showAt(e.getXY());
	}

});

Ext.preg && Ext.preg("gx_tree_contextmenuplugin", Genapp.tree.ContextMenuPlugin);/**
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

Ext.namespace('Genapp.map');
/**
 * Display the list of available Vector Layers.
 * 
 * @class Genapp.map.FieldForm
 * @extends Ext.menu.Item
 */

Genapp.map.LayerSelector = Ext.extend(Ext.Button, {

	/**
	 * Internationalization.
	 */
	layerSelectorButtonLabel : 'Select layer',

	/**
	 * @cfg {Ext.form.ComboBox} The selection Box
	 */
	selectorBox : null,

	/**
	 * @cfg {String} The identifier of the geopanel. Used to filter the events
	 *      listening.
	 */
	geoPanelId : null,

	/**
	 * The currently selected vector layer.
	 * 
	 * @property selectedVectorLayer
	 * @type String
	 */
	selectedVectorLayer : null,

	/**
	 * Initialize the component
	 */
	initComponent : function() {

		// Register event used to link the combobox to the button
		Genapp.eventManager.addEvents('selectLayer');

		// Create a selection combobox
		this.selectorBox = {

			xtype : 'combo',
			mode : 'remote',
			triggerAction : 'all',
			store : new Ext.data.JsonStore({
				autoLoad : true,
				root : 'layerNames',
				fields : [ {
					name : 'code',
					mapping : 'code',
				}, {
					name : 'label',
					mapping : 'label'
				}, {
					name : 'url',
					mapping : 'url'
				}, {
					name : 'url_wms',
					mapping : 'url_wms'
				}],
				url : Genapp.base_url + '/map/ajaxgetvectorlayers'
			}),
			listeners : {
				select : function(combo, value) {
					// Forward the event to the button
					Genapp.eventManager.fireEvent('selectLayer', value, this.geoPanelId);
				},
				scope : this
			},

			valueField : 'code',
			displayField : 'label'
		};

		// The config for the menu item
		var config = {
			text : this.layerSelectorButtonLabel,
			menu : [ this.selectorBox ]
		};

		// apply config
		Ext.apply(this, Ext.apply(this.initialConfig, config));

		// Add events listening
		Genapp.eventManager.on('selectLayer', this.layerSelected, this);

		// call parent init component
		Genapp.map.LayerSelector.superclass.initComponent.apply(this, arguments);
	},

	/**
	 * A layer has been selected
	 */
	layerSelected : function(value, geoPanelId) {

		if (geoPanelId == this.geoPanelId) {
			// Store the selected value
			this.selectedVectorLayer = value.data.code;

			// Change the button title
			this.setText(value.data.label);
			
			// Another listerner of this event is in "geopanel"
		}

	},

	/**
	 * Destroy the component
	 */
	onDestroy : function() {
		Ext.destroy(this.selectorBox);
		Genapp.map.LayerSelector.superclass.onDestroy.call(this);
	}
});

// Register the item
Ext.reg('layerselector', Genapp.map.LayerSelector);/**
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

// Declare the Genapp namespaces
Ext.namespace('Genapp.util'); // Contains few common useful functions
Ext.namespace('Genapp.globalVars'); // ??
Ext.namespace('Genapp.config'); // Contains the static config parameters used to
// initialize the application
Ext.namespace('Genapp.form');
Ext.namespace('Genapp.form.menu');
Ext.namespace('Genapp.form.picker');
Ext.namespace('Genapp.map');
Ext.namespace('Genapp.tree');

// Set the defaults config values
Genapp.config.historicActivated = true;
Genapp.config.localCls = 'en';

/**
 * Build the genapp application
 * 
 * @param {object}
 *            config a config object
 */
Genapp.buildApplication = function(config) {

	// Add the local class to the body
	Ext.getBody().addClass(Genapp.config.localCls);

	// Activate the tooltips system
	// Init the singleton. Any tag-based quick tips will start working.
	Ext.QuickTips.init();

	// Apply a set of config properties to the singleton
	Ext.apply(Ext.QuickTips.getQuickTip(), {
		showDelay : 250,
		dismissDelay : 0,
		trackMouse : true
	});

	// Turn on validation errors beside the field globally
	Ext.form.Field.prototype.msgTarget = 'qtip'; // The side option poses
	// problems rendering in IE7

	// Set the form label separator
	Ext.layout.FormLayout.prototype.labelSeparator = ' :';

	// Set the blank image to a local one
	Ext.BLANK_IMAGE_URL = Genapp.base_url + "img/s.gif";

	// Set the default timeout for AJAX calls
	// The JS timeout must be inferior or equal to the PHP execution time to
	// avoid the not catchable php timeout fatal error
	Ext.Ajax.timeout = 30000;

	// Define an applicative event manager
	Genapp.eventManager = new Ext.util.Observable();
	// Know events :
	// selectLayer : when a layer is selected in the LayerSelector combobox
	// getFeature : when a feature is selected using GetFeatureControl
	// getLocationInfo : when a location information is received using LocationInfoControl

	Genapp.cardPanel = new Genapp.CardPanel(config);

	Genapp.hidePinButton = false;

	if (Genapp.config.historicActivated) {
		// The only requirement for this to work is that you must have a hidden
		// field and
		// an iframe available in the page with ids corresponding to
		// Ext.History.fieldId
		// and Ext.History.iframeId. See history.html for an example.
		Ext.History.init();

		Ext.History.on('change', function(token) {
			if (token) {
				// Genapp.cardPanel.getLayout().setActiveItem(token);
				Genapp.cardPanel.activate(token);
			} else {
				// This is the initial default state. Necessary if you navigate
				// starting from the
				// page without any existing history token params and go back to
				// the start state.
			}
		});
	}
};

/**
 * Format the string in html
 * 
 * @param {String}
 *            value The string to format
 * @return {String} The formated string
 */
Genapp.util.htmlStringFormat = function(value) {
	if (!Ext.isEmpty(value) && Ext.isString(value)) {
		value = value.replace(new RegExp("'", "g"), "&#39;");
		value = value.replace(new RegExp("\"", "g"), "&#34;");
		return value;
	} else {
		return '';
	}
};

/**
 * Create and submit a form
 * 
 * @param {String}
 *            url The form url
 * @param {object}
 *            params The form params
 */
Genapp.util.post = function(url, params) {
	var temp = document.createElement("form"), x;
	temp.action = url;
	temp.method = "POST";
	temp.style.display = "none";
	for (x in params) {
		var opt = document.createElement("textarea");
		opt.name = x;
		opt.value = params[x];
		temp.appendChild(opt);
	}
	document.body.appendChild(temp);
	temp.submit();
	return temp;
}; // The last semicolon is important, otherwise YUICompressor will fail



/**
 * Override default ExtJS 3.0 Form Layout to add a star to mandatory fields.
 */
Ext.override(Ext.layout.FormLayout, {
    getTemplateArgs: function(field) {
        var noLabelSep = !field.fieldLabel || field.hideLabel;
        var labelSep = (typeof field.labelSeparator == 'undefined' ? this.labelSeparator : field.labelSeparator);
        if (!field.allowBlank) {
            labelSep = '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>' + labelSep;
        }
        return {
            id: field.id,
            label: field.fieldLabel,
            labelStyle: field.labelStyle||this.labelStyle||'',
            elementStyle: this.elementStyle||'',
            labelSeparator: noLabelSep ? '' : labelSep,
            itemCls: (field.itemCls||this.container.itemCls||'') + (field.hideLabel ? ' x-hide-label' : ''),
            clearCls: field.clearCls || 'x-form-clear-left'
        };
    }
});