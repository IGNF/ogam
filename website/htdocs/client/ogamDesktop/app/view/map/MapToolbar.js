/**
 * Toolbar class associated to the map
 *
 * @constructor
 * Creates a new Toolbar
 * @param {Object/Object[]} config A config object or an array of buttons to {@link #method-add}
 */
Ext.define('OgamDesktop.view.map.MapToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    requires: [
    ],
    uses: [
    ],
    alias: 'widget.maptoolbar',
    xtype:'maptoolbar',
    items:[{
        iconCls : 'o-map-tools-map-drawpoint',
        tooltip: 'Add a point',
        listeners: {
            click: 'onDrawPointButtonPress'
        }
    }]
});