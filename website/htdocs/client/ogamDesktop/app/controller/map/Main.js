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
                seeOnMapButtonClick: 'onSeeOnMapButtonClick'
            },
            'advanced-request button[action = submit]': {
				requestSuccess: 'onRequestSuccess'
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

    /**
	 * Show the map container and zoom on the result BBox.
	 * 
	 * @param {Object}
	 *            feature The feature corresponding to the grid row,
	 *            contains id and geometry.
	 */
	onSeeOnMapButtonClick: function(feature) {
		this.getMapmainwin().ownerCt.setActiveItem(this.getMapmainwin());
		this.getMappanel().child('mapcomponent').getController().zoomToFeature(feature.id, feature.location_centroid);
	},

    /**
	 * Update the map on request success
	 */
	onRequestSuccess: function() {
		this.getResultsBbox();
		this.updateRequestLayers();
	},

    /**
	 * Update the map results bounding box
	 */
	getResultsBbox: function() {
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
                mapCmpCtrl.fireEvent('resultsBBoxChanged', mapCmpCtrl, mapCmp.resultsBBox);
            },
            scope: this
        });
    },

    /**
	 * Update the request layers
	 */
	updateRequestLayers: function() {
		var mapCmp = this.getMappanel().child('mapcomponent');
		// Forces the layer to redraw itself
        var requestLayers = mapCmp.getController().requestLayers;
        requestLayers.forEach(function(element, index, array){
        	/**
        	 * Note : 
        	 * The ol.source.changed and ol.source.dispatchEvent('change') functions 
        	 * doesn't work with openlayers v3.12.1
        	 */
        	element.getSource().updateParams({"_dc": Date.now()});
        });
	}
});