Ext.define('OgamDesktop.controller.result.Layer',{
	extend: 'Ext.app.Controller',
	requires: [
		'OgamDesktop.view.result.GridTab',
		'OgamDesktop.view.map.MapPanel',
		'OgamDesktop.view.map.LayersPanel',
		'OgamDesktop.view.main.Main'
	],

	config: {
		refs: {
			mappanel: 'map-panel',
			layerspanel: 'layers-panel',
			mapmainwin: 'map-mainwin'
		},
		control: {
			'results-grid': {
				resultsload: 'getResultsBbox'
			}
		}
	},

	getResultsBbox: function(emptyResult) {
		this.getMapmainwin().ownerCt.setActiveItem(this.getMapmainwin());
		Ext.Ajax.request({
			url : Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetresultsbbox',
			success : function(rpse, options) {
				var response = Ext.decode(rpse.responseText);
				this.getMappanel().resultsBBox = response.resultsbbox;
				if (this.getMappanel().autoZoomOnResultsFeatures === true) {
					this.getMappanel().fireEvent('resultswithautozoom');
				}

				// Display the results layer
				this.getMappanel().fireEvent('onGetResultsBBox',this.getMappanel().layersActivation['request'], true, true);
			},
			scope: this
		});
	}
});