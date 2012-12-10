/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license. 
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text of the license.
 */

// A supprimer quand sera intégré dans GeoExt
Ext.namespace("Genapp.tree");

Genapp.tree.ContextMenuPlugin = Ext.extend(Ext.util.Observable, {

	/* begin i18n */
	/** api: config[deleteLayerText] ``String`` i18n */
	deleteLayerText : "Delete layer",

	/** api: config[deleteLayerConfirmationText] ``String`` i18n */
	deleteLayerConfirmationText : "Are you sure you wish to remove this layer ?",

	/** api: config[changeOpacityText] ``String`` i18n */
	changeOpacityText : "Change opacity",

	/* end i18n */

	sliderOptions : {},

	defaultSliderOptions : {
		width : 200
	},

	menu : null,

	constructor : function(config) {
		Ext.apply(this.initialConfig, Ext.apply({}, config));
		Ext.apply(this, config);
		Ext.applyIf(this.sliderOptions, this.defaultSliderOptions);
		this.addEvents("contextmenu");
		Genapp.tree.ContextMenuPlugin.superclass.constructor.apply(this, arguments);
	},

	init : function(tree) {
		tree.on({
			"contextmenu" : this.onContextMenu,
			scope : this
		});
	},

	onContextMenu : function(node, e) {
		// if the node clicked has no layer, there is nothing to do.
		if (!node.layer) {
			return;
		}

		var sliderOptions, contextMenuItems = [], a;

		e.stopEvent();

		a = node.attributes;

		if (this.menu) {
			this.menu.destroy();
		}

		sliderOptions = Ext.applyIf({
			layer : node.layer
		}, this.sliderOptions);

		// OpacitySlider
		contextMenuItems.push({
			text : this.changeOpacityText,
			menu : {
				plain : true,
				items : [ new GeoExt.LayerOpacitySlider(sliderOptions) ]
			}
		});

		// DeleteLayer
		if (a.allowDelete) {
			contextMenuItems.push({
				text : this.deleteLayerText,
				handler : function() {
					Ext.MessageBox.confirm(this.deleteLayerText, this.deleteLayerConfirmationText + node.layer.name, function(btn) {
						if (btn == 'yes') {
							var store = this.layerStore;
							var nRecords = store.getCount();

							var layers = [];
							for ( var i = 0; i < nRecords; i++) {
								layers.push(store.getAt(i).get('layer'));
							}

							var layerIdx = OpenLayers.Util.indexOf(layers, this.layer);

							if (layerIdx != -1) {
								store.remove(store.getAt(layerIdx));
							}
						}
					}, node);
				},
				scope : this
			});
		}

		// ContextMenu
		this.menu = new Ext.menu.Menu({
			ignoreParentClick : true,
			defaults : {
				scope : node.getOwnerTree()
			},
			items : contextMenuItems
		});

		this.menu.showAt(e.getXY());
	}

});

Ext.preg && Ext.preg("gx_tree_contextmenuplugin", Genapp.tree.ContextMenuPlugin);