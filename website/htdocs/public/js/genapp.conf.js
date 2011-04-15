// Default parameters
if(Genapp.ConsultationPanel){
    Ext.apply(Genapp.ConsultationPanel.prototype, {
        hideDetails : false, 
        hideMapDetails : false,  
        hideCsvExportButton : false, 
        hideAggregationCsvExportMenuItem : true,
        hideAggregationButton : true,
        hideInterpolationButton : true,
        hidePrintMapButton: false,
        hidePredefinedRequestSaveButton : true
    });
}
if(Genapp.CardPanel){
    Ext.apply(Genapp.CardPanel.prototype, {
        shownPages : ['predefinedrequestpage','consultationpage'],
        activeItem : 1,
        widthToSubstract:120,
        heightToSubstract:210
    });
}