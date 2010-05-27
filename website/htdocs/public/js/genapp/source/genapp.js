Genapp.buildApplication = function(config){

    // Activate the tooltips system
    Ext.QuickTips.init();

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