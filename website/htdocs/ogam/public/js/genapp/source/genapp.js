// Declare the Genapp namespaces
Ext.namespace('Genapp.util'); // Contains few common useful functions
Ext.namespace('Genapp.globalVars'); // ??
Ext.namespace('Genapp.config'); // Contains the static config parameters used to
// initialize the application

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
        if (!field.allowBlank) labelSep = '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>' + labelSep;
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