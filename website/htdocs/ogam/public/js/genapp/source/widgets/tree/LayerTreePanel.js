/**
 * 
 * LayerTreePanel Class
 * 
 * @class Genapp.tree.LayerTreePanel
 * @extends Ext.tree.TreePanel
 * @constructor Create a new LayerTreePanel
 * @param {Object}
 *            config
 * @xtype Ext.tree.TreePanel
 */

Ext.namespace('Genapp.tree');

Genapp.tree.LayerTreePanel = Ext.extend(Ext.tree.TreePanel, {

	autoScroll : true,
	rootVisible : false,
	enableDD : true,
	title : '',
	border : false,

	// private
	initComponent : function() {

	    /**
	     * Read-only. An object containing the node id for each layer name.
	     * {layerName: nodeId, ...}
	     * Note: Must stay in the initComponent to avoid conflicts between 
	     * the instances of this class
	     * 
	     * @type Object
	     */
	    this.layerNodeIds = []; 

		// Add a loader to the root children node config if needed
		for ( var i = 0; i < this.rootChildren.length; i++) {
			this.addLoaderToNodeConfig(this.rootChildren[i]);
		}
		// Create the tree root node
		this.root = new Ext.tree.AsyncTreeNode({
			children : this.rootChildren,
			leaf : false,
			expanded : true
		});

		// add plugins
		this.plugins = this.plugins || [];
		this.plugins.push({
			ptype : "gx_treenodecomponent"
		});

		// Context menu with opacity slider, added by Lucia:
		this.plugins.push(new Genapp.tree.ContextMenuPlugin({
			sliderOptions : {
				aggressive : true,
				plugins : new GeoExt.LayerOpacitySliderTip()
			}
		})

		);

		// Toggle the children on the parent node 'checkchange' event
		this.on('checkchange', this.toggleChildrenOnParentToggle, this);

		Genapp.tree.LayerTreePanel.superclass.initComponent.call(this);
	},

	/**
	 * Add a loader to the node config if needed
	 * 
	 * @param {Ext.tree.TreeNode}
	 *            nodeCfg The node config
	 * @hide
	 */
	addLoaderToNodeConfig : function(nodeCfg) {
		if (!Ext.isEmpty(nodeCfg.nodeGroup)) {
			// Return the layers with the good nodeGroup
			var filter = function(record) {
				var layerNodeGroup = record.get("layer").options.nodeGroup;
				if (!Ext.isEmpty(layerNodeGroup) && layerNodeGroup.indexOf(nodeCfg.nodeGroup) !== -1) {
					return true;
				}
				return false;
			};
			nodeCfg.loader = new GeoExt.tree.LayerLoader({
				// Add the new filter
				"filter" : filter,
				// Override the default addLayerNode function to add the layer
				// options
				"addLayerNode" : function(node, layerRecord, index) {
					index = index || 0;
					if (this.filter(layerRecord) === true) {
						var child = this.createNode({
							nodeType : 'gx_layer',
							layer : layerRecord.getLayer(),
							layerStore : this.store,
							// New params
							checkedGroup : layerRecord.getLayer().options.checkedGroup,
							text : layerRecord.getLayer().options.label
						});

						var sibling = node.item(index);
						if (sibling) {
							node.insertBefore(child, sibling);
						} else {
							node.appendChild(child);
						}
					}
				},
				// Set the layersNodeIds object when the node order has changed
				listeners : {
					"load" : this.setLayerNodeIds,
					scope : this
				}
			});
		}
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
	toggleChildrenOnParentToggle : function(node, checked) {
		if (checked === true) {
			for ( var i = 0; i < node.childNodes.length; i++) {
				var child = node.childNodes[i];
				if (!child.ui.isChecked()) {
					child.ui.toggleCheck(true);
				}
			}
		} else {
			for ( var i = 0; i < node.childNodes.length; i++) {
				var child = node.childNodes[i];
				if (child.ui.isChecked()) {
					child.ui.toggleCheck(false);
				}
			}
		}
	},

	/**
	 * Set the layerNodeIds array
	 * 
	 * @hide
	 */
	setLayerNodeIds : function() {
		this.eachLayerChild(function(child) {
			this.layerNodeIds[child.layer.name] = child.id;
		}, this);
	},

	/**
	 * Call the callback function for each layer child
	 * 
	 * @param {Function}
	 *            fn The callback
	 * @param {Object}
	 *            scope The scope for the callback
	 * @param {Array}
	 *            args The arguments for the callback
	 * @param {Ext.tree.TreeNode}
	 *            node The child parent node
	 */
	eachLayerChild : function(fn, scope, args, node) {
		node = Ext.isEmpty(node) ? this.root : node;
		if (!Ext.isEmpty(node) && !Ext.isEmpty(node.childNodes)) {
			for ( var i = 0; i < node.childNodes.length; i++) {
				var child = node.childNodes[i];
				if (!Ext.isEmpty(child.layer)) {
					if (fn.apply(scope || child, args || [ child ]) === false) {
						break;
					}
				} else if (!child.isLeaf()) {
					this.eachLayerChild(fn, scope, args, child);
				}
			}
		}
	},

	/**
	 * Return the node for the passed layer name
	 * 
	 * @param {Ext.tree.TreeNode}
	 *            layerName The layer name
	 */
	getNodeByLayerName : function(layerName) {
		var nodeId = this.layerNodeIds[layerName];
		if (Ext.isEmpty(nodeId)) {
			this.setLayerNodeIds();
		}
		return this.getNodeById(nodeId);
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
		var node = this.getNodeById(nodeId);
		node.ui.toggleCheck(toggleCheck);

	}
});
Ext.reg('layertreepanel', Genapp.tree.LayerTreePanel);