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
        hidePredefinedRequestSaveButton : true,
        widthToSubstract:120,
        heightToSubstract:210
    });
}
if(Genapp.CardPanel){
    Ext.apply(Genapp.CardPanel.prototype, {
        shownPages : ['predefinedrequestpage','consultationpage'],
        activeItem : 1
    });
}