/**
 * This class defines the controller with actions related to 
 * map main view.
 */
Ext.define('OgamDesktop.controller.map.Main',{
	extend: 'OgamDesktop.controller.AbstractWin',
	requires: [
		'OgamDesktop.view.map.MapPanel',
		'Ext.grid.column.Number'
	],

	/**
	 * The refs to get the views concerned
	 * and the control to define the handlers of the
	 * MapPanel.
	 */
	config: {
		refs: {
			mappanel: 'map-panel',
			detailTab: 'grid-detail-panel'
		},		
		control: {
			'map-panel': {
				getLocationInfo: 'showResultDetail',
				getLocationInfoActivated: 'locationInfoStateChange'
			},
			'deprecated-detail-grid': {
				beforedetailsgridrowenter: 'setResultStateToSelected',
				beforedetailsgridrowleave: 'setResultStateToDefault'
			}
		}
	},

	setResultStateToSelected: function(record) {
		this.getMappanel().highlightObject(record);
	},
	
	setResultStateToDefault: function(record) {
		this.getMappanel().showObjectInDefaultStyle(record);
	},
	
	// TODO : a buffer around the mouse cursor
	locationInfoStateChange: function(activated) {
		console.log('activated', activated);
	},
	
	showResultDetail: function(evt) {
//		this.getMappanel().vector.removeAllFeatures();
//		console.log('results', results);
//		var style = new OpenLayers.Style({
//			pointRadius: 8,
//			strokeWidth: 2,
//			strokeOpacity: 0.7,
//			graphicName: 'star',
//			strokeColor: "black",
//			fillColor: "red",
//			fillOpacity: 1
//		});
//		var styleMap =  new OpenLayers.StyleMap({
//			"default": style,
//			select: {
//				fillColor: "red",
//				pointRadius: 7,
//				strokeColor: "red",
//				strokeWidth: 2
//			},
//			renderers: ['Canvas']
//		});
//		this.getMappanel().vector.styleMap = styleMap;
//		var segmentLength = 5;
//
//		var res = this.getMappanel().map.getResolution();
//		var curMapUnits = this.getMappanel().map.getUnits();
//		var inches = OpenLayers.INCHES_PER_UNIT;
//
//		// convert maxWidth to map units
//		var barSize = segmentLength * res * inches[curMapUnits];
//
//		var angleDelta = 0;
//		if (results.data.length) {
//			angleDelta = 2*Math.PI/results.data.length;
//		}
//		
//		for (var i = 0 ; i < results.data.length ; i++) {
//			console.log(i);
//			var Feature = OpenLayers.Feature.Vector;
//			var Geometry = OpenLayers.Geometry;
//			var features = [
//				new Feature(new Geometry.LineString([
//					new Geometry.Point(llLocation.lon, llLocation.lat),
//					new Geometry.Point(llLocation.lon + barSize*Math.cos((i)*angleDelta), llLocation.lat + barSize*Math.sin((i)*angleDelta))
//				])),
//				new Feature(new Geometry.Point(llLocation.lon + barSize*Math.cos((i)*angleDelta), llLocation.lat + barSize*Math.sin((i)*angleDelta)))
//			];
//			this.getMappanel().vector.addFeatures(features);
//		}
//		this.getMappanel().vector.redraw();
		
		
//		var detailGrid = Ext.create('OgamDesktop.view.navigation.GridDetailsPanel', {
//			initConf: results
//		});
                console.log('show result details event', evt);
		this.getDetailTab().configureDetailGrid(evt.result);
		this.getDetailTab().expand();
	}
});