/**
 * 
 * A menu containing a {@link Genapp.DateRangePicker} Component.
 * 
 * @class Genapp.menu.DateRangeMenu
 * @extends Ext.menu.DateMenu
 * @constructor Create a new DateRangeMenu
 * @param {Object} config
 * @xtype daterangemenu
 */

Ext.namespace('Genapp.menu');

Genapp.menu.DateRangeMenu = Ext.extend( Ext.menu.DateMenu, {
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'table'.
     * Note: The layout 'menu' doesn't work on FF3.5,
     * the rangePicker items are not rendered 
     * because the rangePicker is hidden... 
     * But it's working on IE ???
     */
    layout:'table', 
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'x-date-range-menu').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls: 'x-date-range-menu',

    // private
    initComponent: function(){
        this.on('beforeshow', this.onBeforeShow, this);
        /**
         * The {@link Genapp.DateRangePicker} instance for this DateRangeMenu
         * @property rangePicker
         * @type Genapp.DateRangePicker
         */
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: [this.rangePicker = new Genapp.DateRangePicker(this.initialConfig)]
        });
        this.rangePicker.purgeListeners();
        Ext.menu.DateMenu.superclass.initComponent.call(this);
        this.relayEvents(this.rangePicker, ["select"]);
    },

    // private
    onBeforeShow: function(){
        if (this.rangePicker){
            this.rangePicker.startDatePicker.hideMonthPicker(true);
            this.rangePicker.endDatePicker.hideMonthPicker(true);
        }
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
            this.fireEvent("beforeshow", this);
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
Ext.reg('daterangemenu', Genapp.menu.DateRangeMenu);