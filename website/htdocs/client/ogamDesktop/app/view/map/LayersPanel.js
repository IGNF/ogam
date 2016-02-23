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
    //cls: 'genapp-query-layer-tree-panel',
    border: false,
    rootVisible: false,
    autoScroll: true,
    title:'Layers',
    viewConfig: {
        plugins: { ptype: 'treeviewdragdrop' }
    },
    flex: 1,
    listeners: {
        itemcontextmenu: function(me, rec, item, index, e, eOpts) {
            e.preventDefault();
            if (!rec.getData().isLayerGroup) {
                var opacity = rec.getData().getOpacity();
                var slider = Ext.create('Ext.slider.Single', {
                    width: 120,
                    value: opacity*100,
                    increment: 1,
                    minValue: 0,
                    maxValue: 100,
                    renderTo: Ext.getBody(),
                    listeners: {
                        change: function(slider, newValue) {
                            rec.getData().setOpacity(newValue/100);
                        }
                    }
                });
                var contextMenu = Ext.create('Ext.menu.Menu',{
                    items: [slider]
                });
                contextMenu.showAt(e.getXY());
            }
        }
    }
});