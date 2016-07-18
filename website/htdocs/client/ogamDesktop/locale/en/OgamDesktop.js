Ext.define("OgamDesktop.locale.en.Application", {
    override: "OgamDesktop.Application",
	toastTitle_401: 'Error 401 : unauthenticated user.',
	toastHtml_401: 'Please log in again <a href="/user" target="_blank">here</a>.',
	toastTitle_404: 'Error 404 : page not found.',
	toastHtml_404: 'The resource was not found.',
	toastTitle_500: 'Error 500 : server error.',
	toastHtml_500: 'An internal server error does not allow to  meet the demand.',
	toastTitle_default: 'Error',
	toastHtml_default: 'See the <a href="http://www.w3schools.com/tags/ref_httpmessages.asp" target="_blank">status codes list</a> for more information.',
});
Ext.define("OgamDesktop.locale.en.view.main.Main", {
    override: "OgamDesktop.view.main.Main",
	homeButtonText: 'Homepage',
	homeButtonTooltip: "Return to the homepage"
});
Ext.define("OgamDesktop.locale.en.ux.request.AdvancedRequestFieldSet", {
    override: "OgamDesktop.ux.request.AdvancedRequestFieldSet",
	criteriaPanelTbarLabel : "Criterias",
	criteriaPanelTbarComboEmptyText : "Select...",
	criteriaPanelTbarComboLoadingText : "Searching...",
	columnsPanelTbarLabel : "Results",
	columnsPanelTbarComboEmptyText : "Select...",
	columnsPanelTbarComboLoadingText : "Searching...",
	columnsPanelTbarAddAllButtonTooltip : "Add all",
	columnsPanelTbarRemoveAllButtonTooltip : "Remove all"
});

Ext.define("OgamDesktop.locale.en.ux.picker.Tree", {
	override: "OgamDesktop.ux.picker.Tree",
	okButtonText : "ok"
});

Ext.define("OgamDesktop.locale.en.ux.picker.NumberRange", {
		override: "OgamDesktop.ux.picker.NumberRange",
		minFieldLabel : "Min",
		maxFieldLabel : "Max",
		okButtonText : "ok"
});

Ext.define("OgamDesktop.loacle.en.ux.picker.TimeRange", {
	override: "OgamDesktop.ux.picker.TimeRange",
	minFieldLabel : "Min",
	maxFieldLabel : "Max",
	okButtonText : "ok"
});

Ext.define("OgamDesktop.locale.en.ux.picker.DateRange", {
	override: "OgamDesktop.ux.picker.DateRange",
	tbarStartDateButtonText : "Start date...",
	tbarRangeDateButtonText : "Interval",
	tbarEndDateButtonText : "... End date",
	fbarOkButtonText : "ok"
});

Ext.define("OgamDesktop.locale.en.ux.form.field.DateRangeField", {
	override: "OgamDesktop.ux.form.field.DateRangeField",
	minText : "The dates in this field must be superior or equal to {0}",
	maxText : "The dates in this field must be inferior or equal to {0}",
	reverseText : "The end date must be after the start date",
	notEqualText : "End date and start date must not be equal",
    dateSeparator: ' - ',
    endDatePrefix: '<= ',
    startDatePrefix: '>= '
});

Ext.define("OgamDesktop.locale.en.ux.form.field.TwinNumberField", {
	override: "OgamDesktop.ux.form.field.TwinNumberField",
	decimalSeparator : ".",
	minText : "The min value for this field is {0}",
	maxText : "The max value for this field is {0}",
	nanText : "'{0}' is not a valid number"
});

Ext.define("OgamDesktop.locale.en.ux.form.field.Tree", {
	override: "OgamDesktop.ux.form.field.Tree"
});

Ext.define("OgamDesktop.locale.en.ux.form.field.NumberRangeField", {
	override: "OgamDesktop.ux.form.field.NumberRangeField",
	numberSeparator: ' - ',
	decimalSeparator : ".",
	maxNumberPrefix: '<= ',
	minNumberPrefix: '>= ',
	minText : "The min value for this field is {0}",
	maxText : "The max value for this field is {0}",
	reverseText : "The max value must be highter than the min value",
	formatText : "The correct formats are ",
	nanText : "'{0}' is not a valid number"
});

Ext.define("OgamDesktop.locale.en.ux.form.field.GeometryField", {
	override: "OgamDesktop.ux.form.field.GeometryField",
	fieldLabel : "Localisation",
	mapWindowTitle : "Draw the search area on the map :",
	mapWindowValidateButtonText : "Validate",
	mapWindowValidateAndSearchButtonText : "Validate and Search",
	mapWindowCancelButtonText : "Cancel"
});

Ext.define("OgamDesktop.loacle.en.ux.form.field.TimeRangeField", {
	override: "OgamDesktop.ux.form.field.TimeRangeField",
	formatText: 'Expected time format: HH:MM',
    minText: "The times in this field must be equal to or after {0}",
    maxText: "The times in this field must be equal to or before {0}",
    reverseText: "The end time must be posterior to the start time",
    notEqualText: "The end time can't be equal to the start time",
    dateSeparator: ' - ',
    maxFieldPrefix: '<= ',
    minFieldPrefix: '>= '
});

Ext.define("OgamDesktop.locale.en.ux.grid.column.Factory", {
	override: "OgamDesktop.ux.grid.column.Factory",
	gridColumnTrueText : 'Yes',
	gridColumnFalseText : 'No',
	gridColumnUndefinedText : '&#160;'
});

/*
 * view
 */

/*
 * view edition
 */
Ext.define('OgamDesktop.locale.en.view.edition.Panel',{
	override:'OgamDesktop.view.edition.Panel',
	geoMapWindowTitle :'Draw the localisation',
	unsavedChangesMessage :'You have unsaved changes',
	config:{
		title : 'Edition'
	},
	parentsFSTitle : 'Parents',
	dataEditFSDeleteButtonText :'Delete',
	dataEditFSDeleteButtonTooltip : 'Delete the data',
	dataEditFSDeleteButtonConfirm :'Do you really want to delete this data ?',
	dataEditFSDeleteButtonDisabledTooltip : 'This data cannot be deleted (some children exist)',
	dataEditFSValidateButtonText :  'Validate',
	dataEditFSValidateButtonTooltip :  'Save changes',
	dataEditFSSavingMessage : 'Saving...',
	dataEditFSLoadingMessage : 'Loading...',
	dataEditFSValidateButtonDisabledTooltip :  'The data cannot be edited (missing rights)',
	childrenFSTitle :  'Children',
	childrenFSAddNewChildButtonText : 'Add',
	childrenFSAddNewChildButtonTooltip : 'Add a new child',
	contentTitleAddPrefix : 'Add a',
	contentTitleEditPrefix : 'Edit a',
	tipEditPrefix :'Edit'
});

/*
 * view result
 */
Ext.define("OgamDesktop.locale.en.view.result.MainWin", {
	override: 'OgamDesktop.view.result.MainWin',
	config: {
		title : 'Results'
	},
	locales: {
		buttons: {
			exportSplit: {
				text : 'Export',
				tooltip: 'Export data (CSV by default)'
			}
		}
	},
	csvExportMenuItemText: 'Export CSV',
	kmlExportMenuItemText: 'Export KML',
	geojsonExportMenuItemText: 'Export GeoJSON',
	csvExportAlertTitle : "Export a a CSV file",
	csvExportAlertMsg : "<div>For your confort, use Chrome or FireFox</div>",
	maskMsg : "Loading..."
});

Ext.define("OgamDesktop.locale.en.view.result.GridTab", {
	override: 'OgamDesktop.view.result.GridTab',
	emptyText : "No result...",
	openNavigationButtonTitle : "Display details",
	openNavigationButtonTip : "Display detailed information about the plot in the detail view.",
	seeOnMapButtonTitle : "Display on map",
	seeOnMapButtonTip :  "Display the map and zoom on the localisation.",
	editDataButtonTitle : "Edit data",
	//	dateFormat : 'Y/m/d',
	editDataButtonTip : "Open the data edition page."
});

/*
 * view request
 */
Ext.define("OgamDesktop.locale.en.view.request.MainWin", {
	override: 'OgamDesktop.view.request.MainWin',
	config: {
		title : 'Request'
	}
});

Ext.define("OgamDesktop.locale.en.view.request.AdvancedRequest", {
	override:'OgamDesktop.view.request.AdvancedRequest',
	requestSelectTitle:'<b>Datasets</b>',
	processPanelTitle:'Data types',
	processCBEmptyText:'Select a dataset...'
}, function(overriddenClass){

	var bbar = overriddenClass.prototype.bbar;

	// Cancel button
	Ext.apply(bbar[0], {
		text : 'Cancel',
		tooltip : 'Cancel the search'
	});
	// Reset button
	Ext.apply(bbar[2], {
		text : 'Reset',
		tooltip : 'Reset the default values of the form'
	});
	// Submit button
	Ext.apply(bbar[4], {
		text : 'Search',
		tooltip : 'Launch the search request'
	});
});

Ext.define('OgamDesktop.locale.en.view.request.AdvancedRequestController', {
	override:'OgamDesktop.view.request.AdvancedRequestController',
	toastHtml_noColumn: 'Please select a column.',
	toastTitle_noColumn: 'Error : no column found.'
});

Ext.define('OgamDesktop.locale.en.view.request.PredefinedRequest', {
	override:'OgamDesktop.view.request.PredefinedRequest',
	config:{
		title: 'Predefined requests'
	},
	labelColumnHeader : "Label",
	resetButtonText:"Cancel",
	resetButtonTooltip: "Reset the form with default values",
	launchRequestButtonText:"OK",
	launchRequestButtonTooltip:"Launch the search request",
	loadingText:"Loading...",
	defaultErrorCardPanelText:"Sorry, the search request failed...",
	criteriaPanelTitle:"Your choice:",
	groupTextTpl:"{name} ({children.length:plural('Requete')})"
});

Ext.define('OgamDesktop.locale.en.view.request.PredefinedRequestSelector', {
	override:'OgamDesktop.view.request.PredefinedRequestSelector',
	defaultCardPanelText : 'Please select a request...'
});

/*
 * view map
 */
Ext.define('OgamDesktop.locale.en.view.map.MainWin', {//TODO fix override warning
	override: 'OgamDesktop.view.map.MainWin',
	config: {
		title : 'Map'
	}
});

Ext.define('OgamDesktop.locale.en.view.map.MapToolbar', {
	override: 'OgamDesktop.view.map.MapToolbar',
	zoomToDrawingFeaturesButtonTooltip: "Zoom on selection",
	modifyfeatureButtonTooltip:"Edit geometry",
	selectButtonTooltip:"Select a geometry",
	drawPointButtonTooltip:"Draw a plot",
	drawLineButtonTooltip:"Draw a line",
	drawPolygonButtonTooltip: "Draw a polygon",
	deleteFeatureButtonTooltip:"Remove geometry",
	validateEditionButtonTooltip:"Validate changes",
	cancelEditionButtonTooltip:"Cancel changes",
	resultFeatureInfoButtonTooltip: "Display plot data",
	zoomInButtonTooltip:'Zoom',
	zoomToResultFeaturesButtonTooltip:"Zoom on result",
	zoomToMaxExtentButtonTooltip: "Zoom to max extend",
	printMapButtonTooltip:'Print map'
});

Ext.define('OgamDesktop.locale.en.view.map.toolbar.LayerFeatureInfoButton', {
	override:'OgamDesktop.view.map.toolbar.LayerFeatureInfoButton',
	tooltip: 'Display data about the selected layer',
	popupTitleText: 'Layer information'
});

Ext.define('OgamDesktop.locale.en.view.map.toolbar.SnappingButton', {
	override:'OgamDesktop.view.map.toolbar.SnappingButton',
	tooltip: 'Snapping'
});

Ext.define('OgamDesktop.locale.en.view.map.toolbar.SelectWFSFeatureButton', {
	override:'OgamDesktop.view.map.toolbar.SelectWFSFeatureButton',
	tooltip: "Import a geometry from the selected layer"
});

Ext.define('OgamDesktop.locale.en.view.map.MapAddonsPanel', {
	override: 'OgamDesktop.view.map.MapAddonsPanel',
	config: {
		title: 'Layers & Legends'
	}
});

Ext.define('OgamDesktop.locale.en.view.map.LegendsPanel', {
	override: 'OgamDesktop.view.map.LegendsPanel',
	config: {
		title:'Legends'
	}
});

Ext.define('OgamDesktop.locale.en.view.map.LayersPanel', {
	override: 'OgamDesktop.view.map.LayersPanel',
	config: {
		title:'Layers'
	}
});
/*
* view navigation
*/
Ext.define('OgamDesktop.locale.en.view.navigation.MainWin', {
	override: 'OgamDesktop.view.navigation.MainWin',
	config: {
		title: 'Details',
		printButtonText: "Print"
	}
});

Ext.define('OgamDesktop.locale.en.view.navigation.Tab', {
	override: 'OgamDesktop.view.navigation.Tab',
	config: {
		title: 'Details'
	},
    seeChildrenButtonTitleSingular : 'Display the child',
    seeChildrenButtonTitlePlural : 'Display children',
	seeChildrenButtonTip : 'Show the children in the detail panel.',
    editLinkButtonTitle : 'Edit data',
    editLinkButtonTip : 'Open the data edition view.',
    linkFieldDefaultText : 'Consult',
    //TODO  tpl
    loadingMsg : "Loading..."
});

Ext.define('OgamDesktop.locale.en.view.navigation.Tab', {
	override: 'OgamDesktop.view.navigation.GridDetailsPanel',
	config:{
		title: "Detailed results"
	},
    loadingMsg: "Loading...",
    //dateFormat : 'Y/m/d',
    openNavigationButtonTitle : 'Display details',
    openNavigationButtonTip : 'Display the details in the detail view.'
}); 
