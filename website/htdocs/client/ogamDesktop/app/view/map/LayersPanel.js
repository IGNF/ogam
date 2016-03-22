/**
 * This class defines the layers tree view.
 * 
 * TODO: An interface for GeoExt
 */
Ext.define('OgamDesktop.view.map.LayersPanel', {
    extend: 'Ext.tree.Panel',
    xtype: 'layers-panel',
    controller: 'layerspanel',
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
    },
    countLoadedStores: 0,
    stores: {},
    initComponent : function() {
        var layerNodeStore = Ext.getStore('map.LayerNode');
        var layerStore = Ext.getStore('map.Layer');
        var serviceStore = Ext.getStore('map.LayerService');
        layerNodeStore.on('load', function(store, records) {
            this.fireEvent('storeLoaded',  'layerNodes', records );
        }, this);
        layerStore.on('load', function(store, records) {
            this.fireEvent('storeLoaded', 'layers', records);
        }, this);
        serviceStore.on('load', function(store, records) {
            this.fireEvent('storeLoaded', 'services', records);
        }, this);
        this.on('storeLoaded', function(storeName, storeRecords) {
            this.countLoadedStores += 1;
            this.stores[storeName] = storeRecords;
            if (this.countLoadedStores === 3) {
                this.fireEvent('layersPanelStoresLoaded', this.stores);
            }
        }, this);
        this.on('checkchange', function(node, checked, e, eOpts) {
                this.getController().fireEvent('checkchange', node, checked);
        }, this);
        this.callParent(arguments);
    }
});