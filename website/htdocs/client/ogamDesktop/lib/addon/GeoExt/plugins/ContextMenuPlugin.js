/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license. 
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text of the license.
 */

// A supprimer quand sera intégré dans GeoExt
Ext.define('GeoExt.plugins.ContextMenuPlugin',{
	extend: 'Ext.util.Observable',
	/* begin i18n */

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
		//this.addEvents("contextmenu");
		this.callParent(arguments);
	},

	init : function(tree) {
		tree.on({
			"itemcontextmenu" : this.onContextMenu,
			scope : this
		});
	},

	onContextMenu : function(target, record, item, index, e) {
		// if the node clicked has no layer, there is nothing to do.
		if (!record.data.layer) {
			return;
		}

		var sliderOptions, contextMenuItems = [], a;

		e.stopEvent();

		sliderOptions = Ext.applyIf({
			layer : record.data.layer
		}, this.sliderOptions);

		// OpacitySlider
		contextMenuItems.push({
			text : this.changeOpacityText,
			menu : {
				plain : true,
				items : [ Ext.create('GeoExt.slider.LayerOpacity',sliderOptions) ]
			}
		});

		// ContextMenu
		this.menu = Ext.create('Ext.menu.Menu',{
			ignoreParentClick : true,
			defaults : {
				scope : record.getOwnerTree()
			},
			items : contextMenuItems
		});
		
		this.menu.showAt(e.getXY());
	}
	
});
