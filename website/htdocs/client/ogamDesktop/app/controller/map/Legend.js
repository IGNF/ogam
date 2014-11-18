Ext.define('OgamDesktop.controller.map.Legend',{
	extend: 'Ext.app.Controller',
//	mixins: ['OgamDesktop.view.interface.LegendsPanel'],
	requires: [
		'OgamDesktop.view.map.LayersPanel',
		'OgamDesktop.view.map.LegendsPanel',
		'OgamDesktop.view.map.MapPanel'
	],
	layerTree: null,
	legendsPanel: null,
	config: {
		refs: {
			layerspanel: 'layers-panel',
			legendspanel: 'legends-panel',
			mappanel: 'map-panel'
		},
		control: {
			'map-panel': {
				onLayerVisibilityChange: 'toggleLayersAndLegendsForZoom'
			}
		}
	},
	
	/**
	 * Convenience function to hide or show a legend by boolean.
	 * 
	 * @param {Array}
	 *            layerNames The layers name
	 * @param {Boolean}
	 *            visible True to show, false to hide
	 */
	setLegendsVisible : function(layerNames, visible) {
		var i;
		for (i = 0; i < layerNames.length; i++) {
			var legendCmp = this.legendsPanel.getComponent(this.id + layerNames[i]);
			if (!Ext.isEmpty(legendCmp)) {
				if (visible === true) {
					var layers = this.getMappanel().map.getLayersByName(layerNames[i]);
					if (layers[0].calculateInRange() && layers[0].getVisibility()) {
						legendCmp.show();
					} else {
						legendCmp.hide();
					}
				} else {
					legendCmp.hide();
				}
			}
		}
	},

	/**
	 * Toggle the layer node and legend in function of the zoom
	 * range
	 * 
	 * @param {OpenLayers.Layer}
	 *            layer The layer to check
	 */
	toggleLayersAndLegendsForZoom : function(layer) {
		this.layerTree = this.getLayerspanel();
		this.legendsPanel = this.getLegendspanel();
		if (!Ext.isEmpty(this.layerTree)) {
			var node;
			layerStore = this.layerTree.store;
			layerStore.each(function(layerNode){
				if (layerNode.data.name == layer.name){
					node = layerNode;
				}
			})
			if (!Ext.isEmpty(node) && !node.hidden) {
				if (!layer.calculateInRange()) {
					node.zoomDisable = true;
					this.disableLayersAndLegends([ layer.name ], false, false, false);
				} else {
					node.zoomDisable = false;
					if (node.forceDisable !== true) {
						this.enableLayersAndLegends([ layer.name ], false, false);
					}
				}
			}
		}
	},

	/**
	 * Enable and show the layer(s) node and show the legend(s)
	 * 
	 * @param {Array}
	 *            layerNames The layer names
	 * @param {Boolean}
	 *            check True to check the layerTree node
	 *            checkbox (default to false)
	 * @param {Boolean}
	 *            setForceDisable Set the layerTree node
	 *            forceDisable parameter (default to true) The
	 *            forceDisable is used by the
	 *            'toggleLayersAndLegendsForZoom' function to
	 *            avoid to enable, a node disabled for another
	 *            cause that the zoom range.
	 */
	enableLayersAndLegends : function(layerNames, check, setForceDisable) {
		if (!Ext.isEmpty(layerNames)) {
			var i;
			for (i = 0; i < layerNames.length; i++) {
				var node;
				layerStore = this.layerTree.store;
				layerStore.each(function(layerNode){
					if (layerNode.data.name == layerNames[i]){
						node = layerNode;
					}
				})
				if (!Ext.isEmpty(node)) {
					var nodeId = node.id;
					if (setForceDisable !== false) {
						this.layerTree.store.getNodeById(nodeId).forceDisable = false;
					}
					if (this.layerTree.store.getNodeById(nodeId).zoomDisable !== true) {
						node.data.disabled = false;
						this.layerTree.fireEvent('nodeEnable', node, true);
					}

					if (check === true) {
						// Note: the redraw must be done before
						// to
						// check the node
						// to avoid to redisplay the old layer
						// images before the new one
						var layers = this.getMappanel().map.getLayersByName(layerNames[i]);
						layers[0].redraw(true);
						this.toggleNodeCheckbox(nodeId, true);
					}
				}
			}

			this.setLegendsVisible(layerNames, true);

		} else {
			console.warn('EnableLayersAndLegends : layerNames parameter is empty.');
		}
	},

	/**
	 * Disable (and hide if asked) the layer(s) And hide the
	 * legend(s)
	 * 
	 * @param {Array}
	 *            layerNames The layer names
	 * @param {Boolean}
	 *            uncheck True to uncheck the layerTree node
	 *            checkbox (default to false)
	 * @param {Boolean}
	 *            hide True to hide the layer(s) and legend(s)
	 *            (default to false)
	 * @param {Boolean}
	 *            setForceDisable Set the layerTree node
	 *            forceDisable parameter (default to true) The
	 *            forceDisable is used by the
	 *            'toggleLayersAndLegendsForZoom' function to
	 *            avoid to enable, a node disable for another
	 *            cause that the zoom range.
	 */
	disableLayersAndLegends : function(layerNames, uncheck, hide, setForceDisable) { // hide ne sert à rien
		var i;
		if (!Ext.isEmpty(layerNames) && (this.layerTree !== null)) {
			for (i = 0; i < layerNames.length; i++) {
				var node;
				layerStore = this.layerTree.store;
				layerStore.each(function(layerNode){
					if (layerNode.data.name == layerNames[i]){
						node = layerNode;
					}
				})
				if (!Ext.isEmpty(node)) {
					var nodeId = node.id;
					if (uncheck === true) {
						this.toggleNodeCheckbox(nodeId, false);
					}
					node.data.disabled = true;
					this.layerTree.fireEvent('nodeEnable', node, false);
				}
				this.setLegendsVisible([ layerNames[i] ], false);
			}
		}
	},

	/**
	 * Toggle the node checkbox
	 * 
	 * @param {Integer}
	 *            nodeId The node id
	 * @param {Boolean}
	 *            toggleCheck True to check, false to uncheck the box. If no
	 *            value was passed, toggles the checkbox
	 */
	toggleNodeCheckbox : function(nodeId, toggleCheck) {
		var node = this.layerTree.store.getNodeById(nodeId);
		node.set('checked', toggleCheck);
	}
});