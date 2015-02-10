Ext.define('GeoExtOverride.data.LayerTreeModel', {
    override: 'GeoExt.data.LayerTreeModel',
    constructor: function(data, id, raw, convertedData) {
        var me = this;
        if (!me.isFirstInstance){
        }
        me.callParent(arguments);
        if (me.getId()){
            me.set('id',me.getId().replace(/\./g,'-'));
        }
        
        window.setTimeout(function() {
        	var ls = Ext.create('GeoExt.data.LayerStore');
            var plugins = me.get('plugins');
            if (plugins) {
                var plugin, instance;
                for (var i=0, ii=plugins.length; i<ii; ++i) {
                    plugin = plugins[i];
                    instance = Ext.PluginMgr.create(Ext.isString(plugin) ? {
                        ptype: plugin
                    } : plugin);
                    me.join(ls);
                    instance.init(me);
                }
            }
        });
    }
});