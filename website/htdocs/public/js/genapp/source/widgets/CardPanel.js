/**
 * A CardPanel correspond to the panel containing the application pages.
 * 
 * @class Genapp.CardPanel
 * @extends Ext.Panel
 * @constructor Create a new Card Panel
 * @param {Object} config The config object
 * @xtype cardpanel
 */
Genapp.CardPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String/Object} layout
     * <p><b>*Important</b>: In order for child items to be correctly sized and
     * positioned, typically a layout manager <b>must</b> be specified through
     * the <code>layout</code> configuration option.</p>
     * <br><p>The sizing and positioning of child {@link items} is the responsibility of
     * the Container's layout manager which creates and manages the type of layout
     * you have in mind.
     * For complete
     * details regarding the valid config options for each layout type, see the
     * layout class corresponding to the <code>layout</code> specified.</p>
     * @hide
     */
    layout:'card',
    /**
     * @cfg {String/Number} activeItem
     * A string component id or the numeric index of the component that should be initially activated within the
     * container's layout on render.  For example, activeItem: 'item-1' or activeItem: 0 (index 0 = the first
     * item in the container's collection).  activeItem only applies to layout styles that can display
     * items one at a time (like {@link Ext.layout.AccordionLayout}, {@link Ext.layout.CardLayout} and
     * {@link Ext.layout.FitLayout}).  Related to {@link Ext.layout.ContainerLayout#activeItem}.
     * 0 : PredefinedRequestPanel
     * 1 : ConsultationPanel
     */
    activeItem: 1,
    /**
     * @cfg {Boolean} border
     * True to display the borders of the panel's body element, false to hide them (defaults to false).  By default,
     * the border is a 2px wide inset border, but this can be further altered by setting {@link #bodyBorder} to false.
     */
    border :false,
    /**
     * @cfg {Mixed} renderTo
     * Specify the id of the element, a DOM element or an existing Element that this component will be rendered into.
     * Notes :
     * When using this config, a call to render() is not required.
     * Do not use this option if the Component is to be a child item of
     * a {@link Ext.Container Container}. It is the responsibility of the
     * {@link Ext.Container Container}'s {@link Ext.Container#layout layout manager}
     * to render its child items (Default to 'page').
     *
     * See {@link #render} also.
     */
    renderTo:'page',
    /**
     * @cfg {String} localeCls
     * The locale css class (defaults to <tt>''</tt>).
     */
    localeCls :'',
    /**
     * @cfg {String} widthToSubstract
     * The width to substract to the consultation panel (defaults to <tt>0</tt>)
     */
    widthToSubstract:120,
    /**
     * @cfg {String} heightToSubstract
     * The height to substract to the consultation panel (defaults to <tt>0</tt>)
     */
    heightToSubstract:210,

    // private
    initComponent : function() {

    this.addEvents(
            /**
             * @event resizewrapper
             * Fires after the Panel has been resized to resize the container (div html) of this consultation panel if exist.
             * This event is not the same that the 'bodyresize' event.
             * @param {Ext.Panel} p the Panel which has been resized.
             * @param {Number} width The Panel's new width.
             * @param {Number} height The Panel's new height.
             */
            'resizewrapper'
        );
        Ext.getBody().addClass(this.localeCls);

        this.height = Ext.getBody().getViewSize().height - this.heightToSubstract;
        this.width = Ext.getBody().getViewSize().width - this.widthToSubstract;

        Ext.EventManager.onWindowResize(
            function(w, h){
                var newSize = {
                        width:Ext.getBody().getViewSize().width - this.widthToSubstract,
                        height:Ext.getBody().getViewSize().height - this.heightToSubstract
                };
                this.setSize(newSize);
                this.fireEvent('resizewrapper', newSize.width, newSize.height);
            },
            this
        );
        if (!this.items) {
            this.items = [
                this.predefinedRequestPanel = new Genapp.PredefinedRequestPanel(),
                this.consultationPanel = new Genapp.ConsultationPanel()
            ]
        }

        Genapp.CardPanel.superclass.initComponent.call(this);
    }
});