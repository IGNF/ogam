Ext.define('OgamDesktop.view.map.LegendsPanel', {
	extend: 'Ext.container.Container',
	xtype: 'legends-panel',
	id: 'legendspanel',
	cls : 'genapp-query-legend-panel',
	frame : true,
	autoScroll : true,
	layoutConfig : {
		animate : true
	},
	items: [],
//	initComponent: function(){
//		var store = Ext.create('Ext.data.TreeStore', {
//            model: 'GeoExt.data.LayerTreeModel',
//            root: {
//                plugins: [{
//                    ptype: "gx_layercontainer",
//                    loader: {
//                        createNode: function(attr) {
//						console.log(attr);
//                            // add a WMS legend to each node created
//                            attr.component = {
//                                xtype: "gx_wmslegend",
//                                layerRecord: Ext.getCmp('mappanel').layers.getByLayer(attr.layer),
//                                showTitle: false,
//                                // custom class for css positioning
//                                // see tree-legend.html
//                                cls: "legend"
//                            };
//                            return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
//                        }
//                    }
//                }]
//            }
//        });
//		this.store = store;
//		console.log(store);
		
//		this.on('show', function() {
//			layers = Ext.get('mappanel').layers;
//			console.log(Ext.get('mappanel'));
//			for (i in layers){
//				layer = layers[i];
//				console.log(layer);
//			}
//		})
//		
//		this.callParent(arguments);
//	}
});