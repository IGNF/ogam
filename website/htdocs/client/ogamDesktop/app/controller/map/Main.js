/**
 * This class defines the controller with actions related to 
 * map main view.
 */
Ext.define('OgamDesktop.controller.map.Main',{
	extend: 'Ext.app.Controller',
	requires: [
		'OgamDesktop.view.result.GridTab',
        'OgamDesktop.view.main.Main',
		'Ext.grid.column.Number'
	],

	/**
	 * The refs to get the views concerned
	 * and the control to define the handlers of the
	 * MapPanel.
	 */
	config: {
		refs: {
			mappanel: '#map-panel',
            mapmainwin: 'map-mainwin'
		},		
		control: {
			'deprecated-detail-grid': {
				beforedetailsgridrowenter: 'setResultStateToSelected',
				beforedetailsgridrowleave: 'setResultStateToDefault'
			},
			'results-grid': {
                resultsload: 'getResultsBbox'
            }
		}
	},

	setResultStateToSelected: function(record) {
		this.getMappanel().highlightObject(record);
	},

	setResultStateToDefault: function(record) {
		this.getMappanel().showObjectInDefaultStyle(record);
	},

	getResultsBbox: function(emptyResult) {
        this.getMapmainwin().ownerCt.setActiveItem(this.getMapmainwin());
        Ext.Ajax.request({
            url : Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgetresultsbbox',
            success : function(rpse, options) {
                var response = Ext.decode(rpse.responseText);
                var mapCmp = this.getMappanel().child('mapcomponent');
                mapCmp.resultsBBox = response.resultsbbox;
                if (mapCmp.autoZoomOnResultsFeatures === true) {
                    mapCmp.fireEvent('resultswithautozoom');
                }
                // Display the results layer
                mapCmp.fireEvent('onGetResultsBBox',mapCmp.layersActivation['request'], true);
            },
            scope: this
        });
    }
});