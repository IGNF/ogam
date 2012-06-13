Genapp.config.localCls = 'en';
if (Genapp.form.TreeField) {
    Ext.apply(Genapp.form.TreeField.prototype, {
        emptyText : "Select..."
    });
}
if (Genapp.form.DateRangeField) {
    Ext.apply(Genapp.form.DateRangeField.prototype, {
        minText: "The dates in this field must be equal to or after {0}",
        maxText: "The dates in this field must be equal to or before {0}",
        reverseText: "The end date must be posterior to the start date",
        notEqualText: "The end date can't be equal to the start date"
    });
}
if (Genapp.form.GeometryField) {
    Ext.apply(Genapp.form.GeometryField.prototype, {
        fieldLabel : 'Location',
        mapWindowTitle : 'Draw the search zone on the map :',
        mapWindowValidateButtonText : 'Validate',
        mapWindowValidateAndSearchButtonText : 'Validate and search',
        mapWindowCancelButtonText : 'Cancel'
    });
}
if (Genapp.form.NumberRangeField) {
    Ext.apply(Genapp.form.NumberRangeField.prototype, {
        minText : "The minimum value for this field is {0}",
        maxText : "The maximum value for this field is {0}",
        reverseText : "The max number must be superior to the min number",
        formatText : "The correct formats are",
        nanText : "'{0}' is not a valid number"
    });
}
if (Genapp.form.TwinNumberField) {
    Ext.apply(Genapp.form.TwinNumberField.prototype, {
        minText : "The minimum value for this field is {0}",
        maxText : "The maximum value for this field is {0}",
        nanText : "{0} is not a valid number"
    });
}
if (Genapp.ConsultationPanel) {
    Ext
            .apply(
                    Genapp.ConsultationPanel.prototype,
                    {
                        title : 'Consultation',
                        userManualLinkText : 'User Manual',
                        datasetComboBoxEmptyText : "Please select a dataset...",
                        datasetPanelTitle : "Dataset",
                        formsPanelTitle : "Forms Panel'",
                        exportButtonText : "Export",
                        csvExportMenuItemText : "Export CSV",
                        kmlExportMenuItemText : "Export KML",
                        printMapButtonText : "Print map",
                        gridViewEmptyText : "No result...",
                        gridPanelTitle : "Results",
                        gridPanelTabTip : "The request\'s results",
                        centerPanelTitle : "Result Panel",
                        queryPanelTitle : "Query Panel",
                        queryPanelPinToolQtip : "Pin the panel",
                        queryPanelUnpinToolQtip : "Unpin the panel",
                        queryPanelCancelButtonText : "Cancel",
                        queryPanelPredefinedRequestSaveButtonText : "Save the request",
                        queryPanelResetButtonText : "Reset",
                        queryPanelSearchButtonText : "Search",
                        queryPanelCancelButtonTooltip : "Cancel the request",
                        queryPanelPredefinedRequestSaveButtonTooltip : "Add the current request to the predefined requests",
                        queryPanelResetButtonTooltip : "Reset the request",
                        queryPanelSearchButtonTooltip : "Launch the request",
                        detailsPanelCtTitle : "Details",
                        detailsPanelCtPinToolQtip : "Pin the panel",
                        detailsPanelCtUnpinToolQtip : "Unpin the panel",
                        featuresInformationPanelCtTitle : "Features Information",
                        mapMaskMsg : "Loading...",
                        alertErrorTitle : "Error :",
                        alertRequestFailedMsg : "Sorry, the request failed...",
                        csvExportAlertTitle : "CSV exportation on IE",
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
                        openGridDetailsButtonTitle : "See the details",
                        openGridDetailsButtonTip : "Display the row details into the details panel.",
                        seeOnMapButtonTitle : "See on the map",
                        seeOnMapButtonTip : "Zoom and centre on the location on the map.",
                        editDataButtonTitle : "Edit the data",
                        editDataButtonTip : "Go to the edition page to edit the data.",
                        cannotEditTip : "You don't have the rights to edit this data."
                    });
}
if (Genapp.form.picker.DateRangePicker) {
    Ext.apply(Genapp.form.picker.DateRangePicker.prototype, {
        tbarStartDateButtonText : 'Start Date ...',
        tbarRangeDateButtonText : 'Range Date',
        tbarEndDateButtonText : '... End Date',
        fbarOkButtonText : 'ok'
    });
}
if (Genapp.DetailsPanel) {
    Ext.apply(Genapp.DetailsPanel.prototype, {
        loadingMsg : "Cgmt...",
        seeChildrenButtonTitleSingular : 'See the only child',
        seeChildrenButtonTitlePlural : 'See the children',
        seeChildrenButtonTip : 'Display the children of the data into the grid details panel.',
        editLinkButtonTitle : 'Edit this data',
        editLinkButtonTip : 'Edit this data in the edition page.'
    });
}
if (Genapp.CardGridDetailsPanel) {
    Ext.apply(Genapp.CardGridDetailsPanel.prototype, {
        loadingMsg : "Loading...",
        cardGridDetailsPanelTitle : "Selection"
    });
}
if (Genapp.GridDetailsPanel) {
    Ext.apply(Genapp.GridDetailsPanel.prototype, {
        loadingMsg : "Loading...",
        openDetailsButtonTitle : 'See the details',
        openDetailsButtonTip : 'Display the row details into the details panel.',
        getChildrenButtonTitle : 'Switch to the children',
        getChildrenButtonTip : 'Display the children of the data.',
        getParentButtonTitle : 'Return to the parent',
        getParentButtonTip : 'Display the parent of the data.'
    });
}
if (Genapp.FieldForm) {
    Ext.apply(Genapp.FieldForm.prototype, {
        criteriaPanelTbarLabel : "Criteria",
        criteriaPanelTbarComboEmptyText : "Select...",
        criteriaPanelTbarComboLoadingText : "Searching...",
        columnsPanelTbarLabel : "Columns",
        columnsPanelTbarComboEmptyText : "Select...",
        columnsPanelTbarComboLoadingText : "Searching...",
        columnsPanelTbarAddAllButtonTooltip : "Add all the columns",
        columnsPanelTbarRemoveAllButtonTooltip : "Remove all the columns"
    });
}
if (Genapp.GeoPanel) {
    Ext.apply(Genapp.GeoPanel.prototype, {
        title : "Map",
        tabTip : "The map with the request\'s results\'s location",
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
        legalMentionsLinkText : 'Legal Mentions'
    });
}
if (Genapp.tree.ContextMenuPlugin) {
    Ext.apply(Genapp.tree.ContextMenuPlugin.prototype, {
        deleteLayerText : 'Delete layer',
        deleteLayerConfirmationText : 'Are you sure you wish to remove this layer ?',
        changeOpacityText : 'Change opacity'
    });
}
if (Genapp.form.picker.NumberRangePicker) {
    Ext.apply(Genapp.form.picker.NumberRangePicker.prototype, {
        minFieldLabel : "Min",
        maxFieldLabel : "Max",
        okButtonText : "ok"
    });
}
if (typeof (OpenLayers) !== "undefined") {
    if (OpenLayers.Control.FeatureInfoControl.prototype) {
        Ext.apply(OpenLayers.Control.FeatureInfoControl.prototype, {
            popupTitle : "Feature information"
        });
    }
    if (OpenLayers.Handler.FeatureInfo.prototype) {
        Ext.apply(OpenLayers.Handler.FeatureInfo.prototype, {
            alertErrorTitle : "Error :",
            alertRequestFailedMsg : "Sorry, the feature info request failed..."
        });
    }
    if (OpenLayers.Handler.GetFeature.prototype) {
        Ext.apply(OpenLayers.Handler.GetFeature.prototype, {
            alertErrorTitle : "Error :",
            alertRequestFailedMsg : "Sorry, the feature info request failed..."
        });
    }
    if (OpenLayers.Handler.LocationInfo.prototype) {
        Ext.apply(OpenLayers.Handler.LocationInfo.prototype, {
            alertErrorTitle : "Error :",
            alertRequestFailedMsg : "Sorry, the feature info request failed..."
        });
    }
}
if (Genapp.PredefinedRequestPanel) {
    Ext.apply(Genapp.PredefinedRequestPanel.prototype, {
        title : "Predefined Request",
        consultationButtonText : "Consultation",
        consultationButtonTooltip : "Go to the consultation page",
        descriptionTitle : "",
        nameColumnHeader : "Name",
        labelColumnHeader : "Label",
        descriptionColumnHeader : "Description",
        dateColumnHeader : "Date",
        clickColumnHeader : "Click(s)",
        positionColumnHeader : "Rank",
        groupNameColumnHeader : "Group name",
        groupLabelColumnHeader : "Group label",
        groupPositionColumnHeader : "Group Rank",
        resetButtonText : "Reset",
        resetButtonTooltip : "Reset the form with the default values",
        launchRequestButtonText : "Launch the request",
        launchRequestButtonTooltip : "Launch the request in the consultation page",
        loadingText : "Loading...",
        defaultCardPanelText : "Please select a request...",
        defaultErrorCardPanelText : "Sorry, the loading failed...",
        criteriaPanelTitle : "Request criteria"
    });
}
if (Genapp.form.picker.TreePicker) {
    Ext.apply(Genapp.form.picker.TreePicker.prototype, {
        okButtonText : "ok"
    });
}
if (Genapp.EditionPanel) {
    Ext.apply(Genapp.EditionPanel.prototype, {
        title : 'Edition',
        parentsFSTitle : 'Parents Summary',
        dataEditFSDeleteButtonText : 'Delete',
        dataEditFSDeleteButtonTooltip : 'Delete the data',
        dataEditFSDeleteButtonConfirm : 'Do you really want to delete this data ?',
        dataEditFSDeleteButtonDisabledTooltip : 'Data cannot be deleted (children exit)',
        dataEditFSValidateButtonText : 'Validate',
        dataEditFSValidateButtonTooltip : 'Save changes',
        dataEditFSSavingMessage : 'Saving...',
        dataEditFSLoadingMessage : 'Loading...',
        dataEditFSValidateButtonDisabledTooltip : 'Data cannot be edited (not enought rights)',
        childrenFSTitle : 'Children Summary',
        childrenFSAddNewChildButtonText : 'Add',
        childrenFSAddNewChildButtonTooltip : 'Add a new child',
        contentTitleAddPrefix : 'Add',
        contentTitleEditPrefix : 'Edit',
        tipEditPrefix : 'Edit the',
        geoMapWindowTitle : 'Draw the localisation'
    });
}
if (Genapp.form.ImageField) {
    Ext.apply(Genapp.form.ImageField.prototype, {
        emptyImageUploadFieldTest : 'Select an image'
    });
}
if (Genapp.map.LayerSelector) {
    Ext.apply(Genapp.map.LayerSelector.prototype, {
        layerSelectorButtonLabel : 'Select layer',
    });
}
if (Genapp.DocSearchPage) {
    Ext.apply(Genapp.DocSearchPage.prototype, {
        title : 'Documents',
        centerPanelTitle : 'Document'
    });
}
if (Genapp.DocSearchRequestPanel) {
    Ext.apply(Genapp.DocSearchRequestPanel.prototype, {
        title : 'Filter(s)',
        textFieldLabel: 'Text search in the document body',
        alertErrorTitle: 'An error occured',
        alertRequestFailedMsg : 'Sorry, the request failed...',
        resetButtonText: 'Reset the filters',
        filterButtonText: 'Filter',
        fieldLabels: {
            'Title' : 'Title',
            'Author' : 'Author',
            'Subject' : 'Subject',
            'Parution' : 'Publication',
            'Publication' : 'Publishing',
            'SmallFileName' : 'Reference'
        }
    });
}
if (Genapp.DocSearchResultPanel) {
    Ext.apply(Genapp.DocSearchResultPanel.prototype, {
        title : 'Result(s)',
        columnLabels: {
            'id' : 'Identifier',
            'score' : 'Score',
            'url' : 'Url',
            'Title' : 'Title',
            'Author' : 'Author',
            'Subject' : 'Subject',
            'Parution' : 'Publication',
            'Publication' : 'Publishing',
            'SmallFileName' : 'Reference'
        }
    });
}
if (Genapp.PDFComponent) {
    Ext.apply(Genapp.PDFComponent.prototype, {
        defaultMessage : 'Please select a document...',
        defaultHtml: '<h4>Content on this page requires Adobe Acrobat Reader.</h4> \
            <p>You must have the free Adobe Reader program installed on your computer \
            to view the documents marked &quot;(PDF).&quot; \
            <p>Download the <a href="http://www.adobe.com/products/acrobat/readstep2.html"> \
            free Adobe Reader program</a>.</p> \
            <p><a href="http://www.adobe.com/products/acrobat/readstep2.html">\
            <img src="http://www.adobe.com/images/shared/download_buttons/get_adobe_reader.gif" \
            width="88" height="31" border="0" alt="Get Adobe Reader." />'
    });
}
