Genapp.buildApplication = function(config){

    // Activate the tooltips system
    // Init the singleton.  Any tag-based quick tips will start working.
    Ext.QuickTips.init();

    // Apply a set of config properties to the singleton
    Ext.apply(Ext.QuickTips.getQuickTip(), {
        showDelay: 250,
        dismissDelay: 0,
        trackMouse: true
    });

    // Turn on validation errors beside the field globally
    Ext.form.Field.prototype.msgTarget = 'qtip'; // The side option poses problems rendering in IE7

    // Set the form label separator
    Ext.layout.FormLayout.prototype.labelSeparator = ' :';

    // Set the blank image to a local one
    Ext.BLANK_IMAGE_URL = Genapp.base_url + "/img/s.gif";
    
    // Set the default timeout for AJAX calls
    // The JS timeout must be inferior or equal to the PHP execution time to avoid the not catchable php timeout fatal error
    Ext.Ajax.timeout = 30000;

    Genapp.cardPanel = new Genapp.CardPanel(config);
};
/**
 * Format the string in html
 * @param {String} value The string to format
 * @return {String} The formated string
 */
Genapp.util.htmlStringFormat = function(value){
    value = value.replace(new  RegExp("'", "g"),"&#39;");
    value = value.replace(new  RegExp("\"", "g"),"&#34;");
    return value;
};