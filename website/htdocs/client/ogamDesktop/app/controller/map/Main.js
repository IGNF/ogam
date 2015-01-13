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
			detailTab: 'deprecated-detail-grid'
		},		
		control: {
			'map-panel toolbar button[action="print"]': {
				click: 'printMap'
			},
			'map-panel': {
				getLocationInfo: 'showResultDetail',
				getLocationInfoActivated: 'locationInfoStateChange'
			}
		}
	},

	locationInfoStateChange: function(activated) {
		console.log('activated', activated);
	},
	
	showResultDetail: function(results, llLocation) {
		this.getMappanel().vector.removeAllFeatures();
		console.log('results', results);
		var style = new OpenLayers.Style({
			pointRadius: 8,
			strokeWidth: 2,
			strokeOpacity: 0.7,
			graphicName: 'star',
			strokeColor: "black",
			fillColor: "red",
			fillOpacity: 1
		});
		var styleMap =  new OpenLayers.StyleMap({
			"default": style,
			select: {
				fillColor: "red",
				pointRadius: 7,
				strokeColor: "red",
				strokeWidth: 2
			},
			renderers: ['Canvas']
		});
		this.getMappanel().vector.styleMap = styleMap;
		var segmentLength = 5;

		var res = this.getMappanel().map.getResolution();
		var curMapUnits = this.getMappanel().map.getUnits();
		var inches = OpenLayers.INCHES_PER_UNIT;

		// convert maxWidth to map units
		var barSize = segmentLength * res * inches[curMapUnits];

		var angleDelta = 0;
		if (results.data.length) {
			angleDelta = 2*Math.PI/results.data.length;
		}
		
		for (var i = 0 ; i < results.data.length ; i++) {
			console.log(i);
			var Feature = OpenLayers.Feature.Vector;
			var Geometry = OpenLayers.Geometry;
			var features = [
				new Feature(new Geometry.LineString([
					new Geometry.Point(llLocation.lon, llLocation.lat),
					new Geometry.Point(llLocation.lon + barSize*Math.cos((i)*angleDelta), llLocation.lat + barSize*Math.sin((i)*angleDelta))
				])),
				new Feature(new Geometry.Point(llLocation.lon + barSize*Math.cos((i)*angleDelta), llLocation.lat + barSize*Math.sin((i)*angleDelta)))
			];
			this.getMappanel().vector.addFeatures(features);
		}
		this.getMappanel().vector.redraw();
		
		
		
		
		
		
		
		console.log('showResultDetail');
		this.getDetailTab().expand();
		var detailGrid = Ext.create('OgamDesktop.view.navigation.GridDetailsPanel', {
			initConf: results
		});
		console.log('showResultDetail2');
		this.getDetailTab().add(detailGrid);
		this.getDetailTab().setActiveItem(detailGrid);
		console.log('showResultDetail3');
		
		
	},

	/**
	 * Create and submit a form
	 * 
	 * @param {String}
	 *            url The form url
	 * @param {object}
	 *            params The form params
	 */
	post: function(url, params) {
		var temp = document.createElement("form"), x;
		temp.action = url;
		temp.method = "POST";
		temp.style.display = "none";
		for (x in params) {
			var opt = document.createElement("textarea");
			opt.name = x;
			opt.value = params[x];
			temp.appendChild(opt);
		}
		document.body.appendChild(temp);
		temp.submit();
		return temp;
	}, 

	/**
	 * Print the map
	 * 
	 * @param {Ext.Button}
	 *            button The print map button
	 * @param {EventObject}
	 *            event The click event
	 */
	printMap : function(button, event) {
		// Get the BBOX
		var center = this.getMappanel().map.center, zoom = this.getMappanel().map.zoom, i;

		// Get the layers
		var activatedLayers = this.getMappanel().map.getLayersBy('visibility', true);
		var activatedLayersNames = '';
		for (i = 0; i < activatedLayers.length; i++) {
			currentLayer = activatedLayers[i];
			if (currentLayer.printable !== false &&
				currentLayer.visibility == true &&
				currentLayer.inRange == true) {
				activatedLayersNames += activatedLayers[i].name + ',';
			}
		}
		activatedLayersNames = activatedLayersNames.substr(0, activatedLayersNames.length - 1);
		this.post(Ext.manifest.OgamDesktop.requestServiceUrl +'../map/printmap', {
			center : center,
			zoom : zoom,
			layers : activatedLayersNames
		});
	}
});