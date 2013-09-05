/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

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
	
	/**
	 * Internationalization.
	 */
	alertInvalidLayerMove : "Déplacement non autorisé",

	/**
	 * Read-only. An object containing the node id for each layer name.
	 * {layerName: nodeId, ...} Note: Must stay in the initComponent to avoid
	 * conflicts between the instances of this class
	 * 
	 * @type Object
	 */
	layerNodeIds : null,

	/**
	 * @cfg {OpenLayers.map} map The map linked to this layer Tree.
	 */
	map : null,

	store : null,

	// private
	initComponent : function() {

		this.store = new GeoExt.data.LayerStore({
			map : this.map,
			initDir : GeoExt.data.LayerStore.MAP_TO_STORE
		});

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
		}));

		// Register "checkchange" event
		//Toggle the children on the parent node 'checkchange' event
		this.on('checkchange', this.toggleChildrenOnParentToggle, this);
		
		Genapp.tree.LayerTreePanel.superclass.initComponent.call(this);
	},

	/**
	 * Filter the layers to be loaded.
	 * 
	 * Layers that are loaded are the ones with the good nodeGroup.
	 * 
	 * @param record
	 *            a record corresponding to a layer
	 * @param nodeGroup
	 *            the name of the group we want to load
	 */
	filterGroup : function(record, nodeGroup) {
		var layerNodeGroup = record.getLayer().options.nodeGroup;
		if (!Ext.isEmpty(layerNodeGroup) && layerNodeGroup.indexOf(nodeGroup) !== -1) {
			return true;
		}
		return false;
	},
	
	/**
	 * Reorganize the layers indexes and Z layers indexes when moving a layer
	 *
	 */
	setLayerIdx : function(layer, idxDepart,idxArrivee) {
        if (idxArrivee < 0) {
        	console.log('a');
            idxArrivee = 0;
        } else if (idxArrivee > this.map.layers.length) {
        	console.log('b')
            idxArrivee = this.map.layers.length;
        }
        if (idxDepart != idxArrivee) {
        	
        	this.map.layers.splice(idxDepart,1);
        	console.log(this.map.getLayerIndex(layer));
        	this.map.layers.splice(idxArrivee, 0, layer);
        	console.log(this.map.getLayerIndex(layer));
            for (var i=0, len=this.map.layers.length; i<len; i++) {
            	console.log(this.map.layers[i].label+' : '+this.map.getLayerIndex(this.map.layers[i]));
            	this.map.layers[i].setZIndex(i);
            }
        }
        
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

			nodeCfg.loader = new GeoExt.tree.LayerLoader({

				store : this.store,

				// Add the filter
				"filter" : this.filterGroup.createDelegate(this, nodeCfg.nodeGroup, true),

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
						
						// TODO : Sortir ces 2 fonctions (dans le bon scope ...)
						
						var indexVariation;
						// Sauvegarde de l'ancien index du noeud
						child.addListener('beforemove', function (tree, thisNode, oldParent, newParent, index) {
							   thisNode.oldIndex = oldParent.indexOf(thisNode);
						});
				
						
						// Déplacement du layer
						// @thanks to Francois Valiquette : http://www.mail-archive.com/users@geoext.org/msg02579.html
						child.addListener('move', function (tree, thisNode, oldParent, newParent, index, refNode) {
							// On ne fait le déplacement que si le parent est le même
							
							if (oldParent == newParent) {
							   // On calcule le déplacement du node
							   indexVariation = thisNode.oldIndex - oldParent.indexOf(thisNode);
							   idxDepart = tree.map.getLayerIndex(thisNode.layer);
							   if (refNode) { //if not out of the list of layers
								   idxArrivee = tree.map.getLayerIndex(refNode.layer);
							   }
							   else { //if moving after the last layer of the list
								   idxArrivee = 0;
							   }
							   
							   /* call the function to place the layer at the good Z in the map
							    and to assign the good index for the tree panel
							    */
							   tree.setLayerIdx(thisNode.layer,idxDepart,idxArrivee);
							   
							} else if (typeof thisNode.recursiveCall === "undefined" || thisNode.recursiveCall == false) {
								//to avoid an infinite loop
								thisNode.recursiveCall = true; 		
								
								// Sinon on remet le node à sa place
								Ext.MessageBox.alert('Error', Genapp.tree.LayerTreePanel.prototype.alertInvalidLayerMove, function reverseChange(btn, texte, opt) {
									oldParent.insertBefore(thisNode, oldParent.item(thisNode.oldIndex));
									thisNode.recursiveCall = false;									
								});
								
							}
							
						});					
						// On interdit le drag des noeuds parents 
						node.draggable = false;

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
				},
				scope : this
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

		if (node.firstChild == null) {
			return; // The node has no child
		}

		// Check that the event have been launched on this instance
		if (this.map.id == node.firstChild.layerStore.map.id) {
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