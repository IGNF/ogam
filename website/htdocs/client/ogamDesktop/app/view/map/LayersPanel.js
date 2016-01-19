/**
 * This class defines the layers tree view.
 * 
 * TODO: An interface for GeoExt
 */
Ext.define('OgamDesktop.view.map.LayersPanel', {
	extend: 'Ext.tree.Panel',
	xtype: 'layers-panel',
	requires: [
		'Ext.data.TreeStore'
	],
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
	}
});