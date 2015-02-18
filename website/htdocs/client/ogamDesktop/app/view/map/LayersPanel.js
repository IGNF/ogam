/**
 * This class defines the layers tree view.
 * 
 * TODO: An interface for GeoExt
 */
Ext.define('OgamDesktop.view.map.LayersPanel', {
	extend: 'GeoExt.tree.Panel',
	xtype: 'layers-panel',
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
//	id: 'layerspanel',
	cls: 'genapp-query-layer-tree-panel',
	border: false,
	rootVisible: false,
	autoScroll: true,
	title:'Layers',
	viewConfig: {
		plugins: [{ // To let drag and drop of tree nodes
			ptype: 'treeviewdragdrop',
			appendOnly: false
		},{ // To disable nodes
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