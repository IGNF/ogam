// Declare the Genapp namespace
Ext.namespace('Genapp.util'); // Contains few common useful functions
Ext.namespace('Genapp.globalVars'); // ??
Ext.namespace('Genapp.config'); // Contains the static config parameters used to initialize the application

// Set the defaults config values
Genapp.config.historicActivated = true; // TODO: create a config.js file ?
Genapp.config.localCls = 'en';

/**
 * Build the genapp application
 * @param {object} config a config object
 */
Genapp.buildApplication = function(config){

    // Add the local class to the body
    Ext.getBody().addClass(Genapp.config.localCls);

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

    if(Genapp.config.historicActivated){
        // The only requirement for this to work is that you must have a hidden field and
        // an iframe available in the page with ids corresponding to Ext.History.fieldId
        // and Ext.History.iframeId.  See history.html for an example.
        Ext.History.init();

        Ext.History.on('change', function(token){
            if(token){
                //Genapp.cardPanel.getLayout().setActiveItem(token);
                Genapp.cardPanel.activate(token);
            }else{
                // This is the initial default state.  Necessary if you navigate starting from the
                // page without any existing history token params and go back to the start state.
            }
        });
    }
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

/**
 * Create and submit a form
 * @param {String} url The form url
 * @param {object} params The form params
 */
Genapp.util.post = function(url, params) {
    var temp=document.createElement("form");
    temp.action=url;
    temp.method="POST";
    temp.style.display="none";
    for (var x in params) {
        var opt=document.createElement("textarea");
        opt.name=x;
        opt.value=params[x];
        temp.appendChild(opt);
    }
    document.body.appendChild(temp);
    temp.submit();
    return temp;
};

/**
 * Resize the wrapper accordingly to the windows size
 */
Genapp.util.resizeWrapper = function ()
{
    var viewHeight = Ext.lib.Dom.getViewHeight() - 66;
    var wrapper = window.document.getElementById('wrapper');
    var inside = window.document.getElementById('inside');
    if(inside.offsetHeight < viewHeight){
        wrapper.style.height = viewHeight +'px';
    }else{
        wrapper.style.height = inside.offsetHeight +'px';
    }
}; // The last semicolon is important, otherwise YUICompressor will fail