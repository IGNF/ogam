/**
 * This class defines the controller with actions related to 
 * map main view.
 */
Ext.define('OgamDesktop.controller.map.Main',{
	extend: 'OgamDesktop.controller.AbstractWin',
	requires: [
		'OgamDesktop.view.map.MapPanel'
	],

	/**
	 * The refs to get the views concerned
	 * and the control to define the handlers of the
	 * MapPanel.
	 */
	config: {
		refs: {
			mappanel: 'map-panel'
		},		
		control: {
			'map-panel toolbar button[action="print"]': {
				click: 'printMap'
			},
			'map-panel': {
				addgeomcriteria: 'addgeomcriteria'
			}
		}
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
	},

	/**
	 * Add a geom criteria and open its map
	 */
	addgeomcriteria : function() {
		/**
		 *  @TODO 
		 */
		var criteria = Ext.create('Ext.ux.form.field.GeometryField');
		criteria.openMap();
	}
});