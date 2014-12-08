/**
 * The main controller of results which manages
 * results grid actions. 
 */
Ext.define('OgamDesktop.controller.result.Main',{
	extend: 'OgamDesktop.controller.AbstractWin',
	id: 'result-main-controller',
	requires: [
		'OgamDesktop.view.result.GridTab',
		'OgamDesktop.view.result.MainWin',
		'OgamDesktop.view.main.Main',
		'OgamDesktop.view.map.MapPanel'
	],
	config: {
		refs: {
			mappanel: 'map-panel',
			mapmainwin: 'map-mainwin',
			resultmainwin: 'result-mainwin'
		},
		control: {
			'results-grid actioncolumn': {
				onOpenNavigationButtonClick: 'openNavigation',
				onSeeOnMapButtonClick: 'seeOnMap',
				onEditDataButtonClick: 'openEditForm'
			},
			'result-mainwin': {
				exportresults: 'exportResults'
			},
			'results-grid': {
				resultsload: 'disableExportButton'
			}
		}
	},

	/**
	 * Show the map container and zoom on the result BBox.
	 * 
	 * @param {Object}
	 *            feature The feature corresponding to the grid row,
	 *            contains id and geometry.
	 */
	seeOnMap: function(feature) {
		this.getMapmainwin().ownerCt.setActiveItem(this.getMapmainwin());
		this.getController('map.Layer').zoomToFeature(feature.id, feature.location_centroid);
	},

	/**
	 * Show the Navigation container and display the data card.
	 * 
	 * @param {Object}
	 *            grid The results grid view.
	 * @param {integer}
	 *            rowIndex The index of the clicked data row.
	 */
	openNavigation: function(record) {
		console.log('open navigation grid', record);
	},

	/**
	 * Show the data edit form of the clicked row.
	 * 
	 * @param {Object}
	 *            grid The results grid view.
	 * @param {integer}
	 *            rowIndex The index of the clicked data row
	 */
	openEditForm: function(record) {
		console.log('open edit form grid', record);
	},
	
	/**
	 * Show the data edit form of the clicked row.
	 * 
	 * @param {Object}
	 *            grid The results grid view.
	 * @param {integer}
	 *            rowIndex The index of the clicked data row
	 */
	disableExportButton: function(emptyResult) {
		if (!emptyResult) {
			this.getResultmainwin().exportButton.enable();
		} else {
			this.getResultmainwin().exportButton.disable();
		}
		
	},
	
	/**
	 * Export the data as a CSV file
	 * 
	 * @param {String}
	 *            actionName The name of the action to call
	 */
	exportResults : function(actionName) {
		var launchCsvExport = function(buttonId, text, opt) {
			window.location = Ext.manifest.OgamDesktop.requestServiceUrl + actionName;
		};
		if (Ext.isIE && !this.getResultmainwin().hideCsvExportAlert) {
			Ext.Msg.show({
				title : this.getResultmainwin().csvExportAlertTitle,
				msg : this.getResultmainwin().csvExportAlertMsg,
				cls : 'genapp-query-center-panel-csv-export-alert',
				buttons : Ext.Msg.OK,
				fn : launchCsvExport,
				animEl : this.getResultmainwin().exportButton.getEl(),
				icon : Ext.MessageBox.INFO,
				scope : this
			});
			// The message is displayed only one time
			this.getResultmainwin().hideCsvExportAlert = true;
		} else {
			launchCsvExport.call(this);
		}
	}
});