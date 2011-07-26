// Default parameters
Genapp.configure = function() {
	if (Genapp.ConsultationPanel) {
		Ext.apply(Genapp.ConsultationPanel.prototype, {
			hideDetails : false,
			hideMapDetails : false,
			hideCsvExportButton : false,
			hidePrintMapButton : false,
			hidePredefinedRequestSaveButton : true
		});
	}
	if (Genapp.CardPanel) {
		Ext.apply(Genapp.CardPanel.prototype, {
			shownPages : [ 'predefinedrequestpage', 'consultationpage' ],
			activeItem : 1,
			widthToSubstract : 80, // 2*40 of margin
			heightToSubstract : 150
		// 120 of header + 30 of footer
		});
	}
	if (Genapp.DetailsPanel) {
		Ext.apply(Genapp.DetailsPanel.prototype, {
			hideSeeChildrenButton : true
		});
	}
}
// ogam
