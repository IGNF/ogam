/**
 * A menu containing a {@link Genapp.TreePicker} Component.
 *
 * @class Genapp.menu.TreeMenu
 * @extends Ext.menu.Menu
 * @constructor Create a new TreeMenu
 * @param {Object} config
 * @xtype treemenu
 */

Ext.namespace('Genapp.menu');

Genapp.menu.TreeMenu = Ext.extend( Ext.menu.Menu, {
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'auto'.
     * Note: The layout 'menu' doesn't work on FF3.5,
     * the rangePicker items are not rendered 
     * because the rangePicker is hidden... 
     * But it's working on IE ???
     */
    layout:'auto', 
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'x-number-range-menu').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls: 'x-tree-menu',

    // private
    initComponent: function(){
        /**
         * The {@link Genapp.NumberRangePicker} instance for this NumberRangeMenu
         * @property rangePicker
         * @type Genapp.NumberRangePicker
         */
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: [this.treePicker = new Genapp.TreePicker(this.initialConfig)]
        });
        //this.treePicker.purgeListeners();
        Genapp.menu.TreeMenu.superclass.initComponent.call(this);
        this.relayEvents(this.treePicker, ["select"]);
    },

    /**
     * Displays this menu at a specific xy position
     * @param {Array} xyPosition Contains X & Y [x, y] values for the position at which to show the menu (coordinates are page-based)
     * @param {Ext.menu.Menu} parentMenu (optional) This menu's parent menu, if applicable (defaults to undefined)
     */
    showAt : function(xy, parentMenu, /* private: */_e){
        this.parentMenu = parentMenu;
        if(!this.el){
            this.render();
        }
        if(_e !== false){
            xy = this.el.adjustForConstraints(xy);
        }
        this.el.setXY(xy);
        if(this.enableScrolling){
            this.constrainScroll(xy[1]);     
        }
        this.el.show();
        Ext.menu.Menu.superclass.onShow.call(this);
        this.hidden = false;
        this.focus();
        this.fireEvent("show", this);
    }
});
Ext.reg('treemenu', Genapp.menu.TreeMenu);