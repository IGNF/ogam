Ext.define('OgamDesktop.view.map.LayersPanel', {
	extend: 'GeoExt.tree.Panel',
//	mixins: ['OgamDesktop.view.interface.LayersPanel'],
	requires: [
		'OgamDesktop.ux.map.GroupLayerContainer',
		'Ext.data.TreeStore',
		'GeoExt.data.LayerTreeModel',
		'GeoExt.data.LayerStore',
		'GeoExt.tree.LayerNode',
		'GeoExt.plugins.ContextMenuPlugin',
		'GeoExt.slider.Tip',
		'GeoExt.slider.LayerOpacity'
	],
	xtype: 'layers-panel',
//	id: 'layerspanel',
	cls: 'genapp-query-layer-tree-panel',
	border: false,
	rootVisible: false,
	autoScroll: true,
	viewConfig: {
		plugins: [{
			ptype: 'treeviewdragdrop',
			appendOnly: false
		},{
			ptype: 'dvp_nodedisabled'
		}]
	},
	// Context menu with opacity slider, added by Lucia:
	plugins: Ext.create('GeoExt.plugins.ContextMenuPlugin',{
		sliderOptions : {
			aggressive : true,
			plugins : Ext.create('GeoExt.slider.Tip')
		}
	})
});