// Default parameters
if(Genapp.ConsultationPanel){
    Ext.apply(Genapp.ConsultationPanel.prototype, {
        hideDetails : false, // Display the link result to details
        hideMapDetails : false,  // Display the link map to details
        hideCsvExportButton : Genapp.grid.hideExportCSV, // Set the property to the value of Genapp.grid.hideExportCSV
        hideAggregationCsvExportMenuItem : Genapp.grid.hideAggregationCsvExportMenuItem,
        hideAggregationButton : Genapp.grid.hideAggregationButton,
        hideInterpolationButton : Genapp.grid.hideInterpolationMenuItem,
        // Reduction of the application size in function of the web site margins
        widthToSubstract:120,
        heightToSubstract:210,
        datasetPanelTitle:'JRC request'
    });
}
if(Genapp.DetailsPanel){
    Ext.apply(Genapp.DetailsPanel.prototype, {
        headerWidth : 90
    });
}