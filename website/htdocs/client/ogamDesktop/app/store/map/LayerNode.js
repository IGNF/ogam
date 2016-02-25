/**
 * This class defines the store for the tree layers nodes.
 */
Ext.define('OgamDesktop.store.map.LayerNode',{
    extend: 'Ext.data.Store',
    model: 'OgamDesktop.model.map.LayerNode',
    autoLoad: true,
    // Way to access data (ajax) and to read them (json)
    proxy: {
        type: 'ajax',
        isSynchronous: true,
        url: Ext.manifest.OgamDesktop.mapServiceUrl +'ajaxgettreelayers',
        actionMethods: {create: 'POST', read: 'POST', update: 'POST', destroy: 'POST'},
        reader: {
            type: 'json',
            rootProperty: ''
        }
    }
});