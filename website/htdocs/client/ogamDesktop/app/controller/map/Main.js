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
                resultsload: 'getResultsBbox',
                onSeeOnMapButtonClick: 'seeOnMap'
            }
		}
	},

    onLaunch:function(){
        //clean previous request or result in server side
        Ext.Ajax.request({
            url: Ext.manifest.OgamDesktop.requestServiceUrl+'ajaxrestresultlocation',
            failure: function(response, opts) {
                console.warn('server-side failure with status code ' + response.status);
            }
        });
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
                var mapCmpCtrl = mapCmp.getController();
                mapCmp.resultsBBox = response.resultsbbox;
                if (mapCmpCtrl.autoZoomOnResultsFeatures === true) {
                    mapCmp.fireEvent('resultswithautozoom');
                }
                // Display the results layer
                mapCmpCtrl.fireEvent('resultsBBoxChanged', mapCmpCtrl, mapCmp.resultsBBox);
            },
            scope: this
        });
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
		this.getMappanel().child('mapcomponent').getController().zoomToFeature(feature.id, feature.location_centroid);
	}
});