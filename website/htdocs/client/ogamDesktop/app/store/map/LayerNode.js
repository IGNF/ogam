Ext.define('OgamDesktop.store.map.LayerNode',{
	extend: 'Ext.data.TreeStore',
	requires: 'GeoExt.tree.GroupLayerContainer',
	model: 'OgamDesktop.model.map.LayerNode',
	root: {
		expanded: true,
		children: [{
			plugins: [{
				ptype: 'gx_layercontainer'
			}],
			expanded: true
		}]
	}
});