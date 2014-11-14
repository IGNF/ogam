Ext.define('OgamDesktop.view.map.LayersPanel', {
	extend: 'GeoExt.tree.Panel',
	mixins: ['OgamDesktop.view.interface.LayersPanel'],
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
	listeners: {
		nodeDisabled: function(node) {
			var parent = node.parentNode;
			node.data.cls = 'dvp-tree-node-disabled';
			if (!parent.collapsed) {
				parent.collapse();
				parent.expand();
			}
		},
		nodeEnabled: function(node) {
			var parent = node.parentNode;
			node.data.cls = '';
			if (!parent.collapsed) {
				parent.collapse();
				parent.expand();
			}
		}
	},
	
	initComponent: function() {
		// Context menu with opacity slider, added by Lucia:
		this.plugins = Ext.create('GeoExt.plugins.ContextMenuPlugin',{
			sliderOptions : {
				aggressive : true,
				plugins : Ext.create('GeoExt.slider.Tip')
			}
		});

		this.layerNodeIds = [];
		this.callParent(arguments);
	},

	/**
	 * Toggle the children checkbox on the parent checkbox change
	 * 
	 * @param {Ext.tree.TreeNode}
	 *            node The parent node
	 * @param {Boolean}
	 *            checked The checked status
	 * @hide
	 */
	onCheckChange : function(node, checked) {
		if (node.firstChild == null) {
			if(checked != node.get('layer').getVisibility()) {
				node._visibilityChanging = true;
				var layer = node.get('layer');
				if(checked && layer.isBaseLayer && layer.map) {
					layer.map.setBaseLayer(layer);
				} else if(!checked && layer.isBaseLayer && layer.map &&
					layer.map.baseLayer && layer.id == layer.map.baseLayer.id) {
					// Must prevent the unchecking of radio buttons
					node.set('checked', layer.getVisibility());
				} else {
					layer.setVisibility(checked);
				}
				delete node._visibilityChanging;
			}
		}
		for ( var i = 0 ; i < node.childNodes.length ; i++) {
			var child = node.childNodes[i];
			if (!child.get('disabled')) {
				child.set('checked', checked);
				this.onCheckChange(child, checked);
			}
		}
	}
});
