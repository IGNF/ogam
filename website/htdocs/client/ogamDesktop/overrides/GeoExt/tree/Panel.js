
/**
 * bug fix EXTJS-14607
 * @see http://www.sencha.com/forum/showthread.php?289825-Datefield-Picker-lost-on-month-year-click
 */
Ext.define('GeoExtOverride.tree.Panel', {
   override: 'GeoExt.tree.Panel',
   initComponent: function() {
        var me = this;

        if (!me.columns) {
            if (me.initialConfig.hideHeaders === undefined) {
                me.hideHeaders = true;
            }
            me.addCls(Ext.baseCSSPrefix + 'autowidth-table');
            me.columns = [{
                xtype    : 'gx_treecolumn',
                text     : 'Name',
                autoWidth    : true,
                dataIndex: me.displayField         
            }];
        }

        me.callParent();
        me.id = me.getId().replace(/\./g,'-');
    }

});