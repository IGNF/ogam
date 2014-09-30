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
Ext.define('GeoExt.tree.GroupLayerContainer', {
    extend: 'GeoExt.tree.LayerContainer',
    alias: 'plugin.gx_grouplayercontainer',

    /**
     * @private
     */
    init: function(target) {
        var me = this;
        me.defaultText= this.group;
        
        var loader = me.loader;
        console.log(target); 
        me.loader = Ext.applyIf(loader || {}, {
            filter: function(record) {
                var layer = record.getLayer();
                console.log(record);
                return (layer.displayInLayerSwitcher);
            }
        });
        me.callParent(arguments);
    }
});
