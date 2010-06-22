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
    Ext.form.Field.prototype.msgTarget = 'side';

    // Set the form label separator
    Ext.layout.FormLayout.prototype.labelSeparator = ' :';

    // Set the blank image to a local one
    Ext.BLANK_IMAGE_URL = Genapp.base_url + "/img/s.gif";
    
    // Set the default timeout for AJAX calls
    Ext.Ajax.timeout = 480000;    

    Genapp.consultationPanel = new Genapp.ConsultationPanel(config);
};