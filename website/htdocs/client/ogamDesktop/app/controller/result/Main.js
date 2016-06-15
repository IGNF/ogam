/**
 * The main controller of results which manages results grid actions. 
 */
Ext.define('OgamDesktop.controller.result.Main',{
	extend: 'Ext.app.Controller',
	id: 'result-main-controller',
	requires: [
		'OgamDesktop.view.result.GridTab',
		'OgamDesktop.view.result.MainWin',
		'OgamDesktop.view.main.Main'
	],
	config: {
		refs: {
			resultmainwin: 'result-mainwin'
		},
		control: {
			'results-grid': {
				resultsload: 'toggleExportButton'
			},
			'result-mainwin': {
				exportresults: 'exportResults'
			}
		}
	},

	/**
	 * Toggle the export button
	 * @private
	 * @param {Boolean} emptyResult True if there are no result
	 */
	toggleExportButton: function(emptyResult) {
		if (!emptyResult) {
			this.getResultmainwin().exportButton.enable();
		} else {
			this.getResultmainwin().exportButton.disable();
		}
	},

	/**
	 * Export the data into a file
	 * @param {String} actionName The name of the action to call
	 */
	exportResults : function(actionName) {
		var launchCsvExport = function(buttonId, text, opt) {
			window.location = Ext.manifest.OgamDesktop.requestServiceUrl + actionName;
		};
		if (Ext.isIE && !this.getResultmainwin().hideCsvExportAlert) {
			Ext.Msg.show({
				title : this.getResultmainwin().csvExportAlertTitle,
				msg : this.getResultmainwin().csvExportAlertMsg,
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