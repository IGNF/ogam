Ext.define('Ogam.view.map.LayersPanel', {
	extend: 'GeoExt.tree.Panel',
	mixins: ['Ogam.view.interface.LayersPanel'],
	xtype: 'layers-panel',
	border: false,
	rootVisible: false,
	autoScroll: true,
	lines: false,
	store: 'map.LayerTreeNodes',
	viewConfig: {
		plugins: [{
			ptype: 'treeviewdragdrop',
			appendOnly: false
		}]
	},
	plugins: [],
	items: [],
	initComponent: function() {
		// Context menu with opacity slider, added by Lucia:
		this.plugins.push(new GeoExt.plugins.ContextMenuPlugin({
			allowDelete: true,
			sliderOptions : {
				aggressive : true,
				plugins : new GeoExt.slider.Tip()
			}
		}));
		this.callParent(arguments);
	}
});