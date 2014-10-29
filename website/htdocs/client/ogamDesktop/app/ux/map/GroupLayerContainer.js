/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include GeoExt/tree/LayerContainer.js
 */

/**
 * A layer node plugin that will collect all base layers of an OpenLayers
 * map. Only layers that have `displayInLayerSwitcher` set to `true`
 * will be included. The node's text defaults to 'Overlays'.
 *
 * When you use the tree in an application, make sure to include the proper
 * stylesheet depending on the Ext theme that you use: `tree-classic.css`,
 * `tree-access.css`, 'tree-gray.css` or `tree-neptune.css`.
 *
 * To use this node plugin in a tree node config, configure a node like this:
 *
 *     {
 *         plugins: "gx_overlaylayercontainer",
 *         text: "My overlays"
 *     }
 *
 * @class GeoExt.tree.OverlayLayerContainer
 */
Ext.define('OgamDesktop.ux.map.GroupLayerContainer', {
    extend: 'GeoExt.tree.LayerContainer',
    alias: 'plugin.gx_grouplayercontainer',
    alternateClassName: 'GeoExt.GroupLayerContainer',
    containerCheckedStatus: false,
    containerExpandedStatus: false,
    nodeGroup: null,
    /**
     * @private
     */
    init: function(target) {
    	target.set('checked', this.containerCheckedStatus);
    	target.set('expanded', this.containerExpandedStatus);
    	target.set('allowDrag', true);
    	target.on("insert", function(thisNode, node, refNode, eOpts) {
//    		node.data.oldIndex = idx;
    	});
        var me = this;
        var loader = me.loader;
        me.loader = Ext.applyIf(loader || {}, {
        	store: me.store,
            filter: function(record) {
                var layer = record.getLayer();
                return (layer.displayInLayerSwitcher);
            },
            addLayerNode: function(node, layerRecord, index) {
            	index = index || 0;
            	 if (this.filter(layerRecord) === true) {
                     var layer = layerRecord.getLayer();
                     var child = this.createNode({
                    	 layerStore: this.store,
                         plugins: [{
                             ptype: 'gx_layer'
                         }],
                         layer: layer,
                         text: layer.options.label,
                         name: layer.name,
                         listeners: {
                             move: this.onChildMove,
                             scope: this
                         }
                     });
                     if (index !== undefined) {
                         node.insertChild(index, child);
                     } else {
                         node.appendChild(child);
                     }
					// Sauvegarde de l'ancien index du noeud
                     node.getChildAt(index).addListener('beforemove', function (node, oldParent, newParent, index, eOpts) {
							node.oldIndex = oldParent.indexOf(node);
							alert('before move');
						});
     				// Sauvegarde de l'ancien index du noeud
                    node.getChildAt(index).addListener("move", this.onChildMove, this);
                }
            },
            
            onChildMove: function(node, oldParent, newParent, index) {
            	if (oldParent != newParent) {
            	}
                var me = this,
                    record = me.store.getByLayer(node.get('layer')),
                    container = newParent.get('container'),
                    parentLoader = container.loader;
                	layerOnMapIndex = record.data.getZIndex();
                // remove the record and re-insert it at the correct index
                me._reordering = true;
                if (parentLoader instanceof me.self && me.store === parentLoader.store) {
                    parentLoader._reordering = true;
                    me.store.remove(record);
                    var newRecordIndex;
                    if (newParent.childNodes.length > 1) {
                        // find index by neighboring node in the same container
                        var searchIndex = (index === 0) ? index + 1 : index - 1;
                        newRecordIndex = me.store.findBy(function(r) {
                            return newParent.childNodes[searchIndex]
                                .get('layer') === r.getLayer();
                        });
                        if (index === 0) {
                            newRecordIndex++;
                        }
                    } else if (oldParent.parentNode === newParent.parentNode) {
                        // find index by last node of a container above
                        var prev = newParent;
                        do {
                            prev = prev.previousSibling;
                        } while (prev &&
                            !(prev.get('container') instanceof container.self &&
                            prev.lastChild));
                        if (prev) {
                            newRecordIndex = me.store.findBy(function(r) {
                                return prev.lastChild.get('layer') === r.getLayer();
                            });
                        } else {
                            // find index by first node of a container below
                            var next = newParent;
                            do {
                                next = next.nextSibling;
                            } while (next &&
                                !(next.get('container') instanceof container.self &&
                                next.firstChild));
                            if (next) {
                                newRecordIndex = me.store.findBy(function(r) {
                                    return next.firstChild.get('layer') === r.getLayer();
                                });
                            }
                            newRecordIndex++;
                        }
                    }
                    if (newRecordIndex !== undefined) {
                        me.store.insert(newRecordIndex, [record]);
                    } else {
                        me.store.insert(oldRecordIndex, [record]);
                    }
                    delete parentLoader._reordering;
                }
                delete me._reordering;
            },

//            createNode: function(attr) {
//                    // add a WMS legend to each node created
//                    attr.component = {
//                        xtype: "gx_wmslegend",
//                        layerRecord: Ext.getCmp('mappanel').layers.getByLayer(attr.layer),
//                        // custom class for css positioning
//                        // see tree-legend.html
////                        cls: "legend"
//                    };
//                    return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
//                }
        });
        me.callParent(arguments);
    }
});
