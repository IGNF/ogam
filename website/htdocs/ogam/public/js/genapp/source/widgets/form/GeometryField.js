/**
 * Provides a Geometry input field.
 *
 * @class Genapp.form.GeometryField
 * @extends Ext.form.TriggerField
 * @constructor Create a new GeometryField
 * @param {Object} config
 * @xtype geometryfield
 */

Ext.namespace('Genapp.form');

Genapp.form.GeometryField = Ext.extend(Ext.form.TriggerField, {

    /**
     * @cfg {String} listUrl The url to get the Geometry's list (defaults to undefined)
     */
    /**
     * @cfg {String} fieldLabel The label text to display next to this field (defaults to 'Geometry * ')
     */
    fieldLabel: 'Location',
    /**
     * @cfg {String} mapWindowTitle The map window title (defaults to 'Draw the search zone on the map :')
     */
    mapWindowTitle: 'Draw the search zone on the map :',
    /**
     * @cfg {String} mapWindowValidateButtonText The map windows validate button text (defaults to 'Validate')
     */
    mapWindowValidateButtonText: 'Validate',
    /**
     * @cfg {String} mapWindowValidateAndSearchButtonText The map windows validate and search button text (defaults to 'Validate and search')
     */
    mapWindowValidateAndSearchButtonText: 'Validate and search',
    /**
     * @cfg {String} mapWindowCancelButtonText The map windows cancel button text (defaults to 'Cancel')
     */
    mapWindowCancelButtonText: 'Cancel',
    /**
     * @cfg {String} triggerClass
     * An additional CSS class used to style the trigger button.  The trigger will always get the
     * class 'x-form-trigger' by default and triggerClass will be appended if specified.
     * (Default to 'x-form-map-trigger')
     */
    triggerClass: 'x-form-map-trigger',
    /**
     * @cfg {Boolean} editable false to prevent the user from typing text directly into the field,
     * the field will only respond to a click on the trigger to set the value. (defaults to false).
     */
    editable: false,
    /**
     * @cfg {Boolean} hideMapDetails
     * if true hide the details button in map toolbar (defaults to false).
     */
    hideMapDetails : true,
    /**
     * @cfg {Boolean} maximizable
     * True to display the 'maximize' tool button and allow the user to maximize the window, false to hide the button
     * and disallow maximizing the window (defaults to true).  Note that when a window is maximized, the tool button
     * will automatically change to a 'restore' button with the appropriate behavior already built-in that will
     * restore the window to its previous size.
     */
    mapWindowMaximizable : true,
    /**
     * @cfg {Boolean} maximized
     * True to initially display the window in a maximized state. (Defaults to false).
     */
    mapWindowMaximized: false,
    /**
     * @cfg {Number} height
     * The height of the map window in pixels (defaults to 500).
     * Note to express this dimension as a percentage or offset see {@link Ext.Component#anchor}.
     */
    mapWindowHeight: 500,
    /**
     * @cfg {Number} width
     * The width of the map window in pixels (defaults to 850).
     * Note to express this dimension as a percentage or offset see {@link Ext.Component#anchor}.
     */
    mapWindowWidth: 850,
    /**
     * @cfg {Integer} mapWindowMinZoomLevel
     * The min zoom level for the map (defaults to <tt>0</tt>)
     */
    mapWindowMinZoomLevel: 0,

    // private
    initComponent : function(){
        Genapp.form.GeometryField.superclass.initComponent.call(this);

        if(!this.hideTrigger){
            this.onTriggerClick = function(){
                if(this.disabled){
                    return;
                }
                if(!(this.mapWindow instanceof Ext.Window)){
                    this.openMap(this);
                }else{
                    this.mapWindow.show();
                }
            };
        }
    },

    /**
     * Open the map
     */
    openMap : function(){
        if (!this.mapWindow){
            /**
             * The map window.
             * @property mapWindow
             * @type Ext.Window
             */
            this.mapWindow = new Ext.Window({
                layout: 'fit',
                maximizable: this.mapWindowMaximizable,
                maximized: this.mapWindowMaximized,
                title: this.mapWindowTitle,
                width: this.mapWindowWidth,
                height: this.mapWindowHeight,
                closeAction: 'destroy',
                // please do not overwrite !!!
                draggable: false, // both of these lines
                resizable: false, // are useful for mapfish, cf https://trac.mapfish.org/trac/mapfish/ticket/84
                // please do not overwrite !!!
                modal: true,
                scope: true,
                /**
                 * The map panel.
                 * @property mapPanel
                 * @type Genapp.MapPanel
                 */
                items:this.mapPanel = new Genapp.MapPanel({
                    title:'',
                    isDrawingMap:true,
                    featureWKT: this.getRawValue(),
                    hideMapDetails: this.hideMapDetails,
                    minZoomLevel: this.mapWindowMinZoomLevel,
                    resultsBBox: Ext.getCmp('consultation_panel').mapPanel.resultsBBox
                }),
                buttons: [{
                    text: this.mapWindowCancelButtonText,
                    handler: function(){
                        this.mapWindow.destroy();
                    },
                    scope:this
                },{
                    text: this.mapWindowValidateButtonText,
                    handler: this.onWindowValidate,
                    scope:this
                },{
                    text: this.mapWindowValidateAndSearchButtonText,
                    handler: this.onWindowValidate.createDelegate(this, [true])
                }]
            });
            // because Ext does not clean everything (mapWindow still instanceof Ext.Window):
            this.mapWindow.on('destroy', function(){
                delete this.mapWindow;
                if(this.submitRequest == true){
                    Ext.getCmp('consultation_panel').submitRequest();
                    this.submitRequest = false;
                }
            }, this);
            this.mapPanel.on('afterinit', function(mapPanel){
                var consultationPanel = Ext.getCmp('consultation_panel');
                mapPanel.map.setCenter(consultationPanel.mapPanel.map.getCenter());
                mapPanel.map.zoomTo(consultationPanel.mapPanel.map.getZoom() - this.mapWindowMinZoomLevel);
                mapPanel.enableLayersAndLegends(this.mapPanel.layersActivation['request'],true, true);
            }, this);
        }
        this.mapWindow.show();
    },

    /**
     * Function called when the window validate button is pressed
     * 
     * @param {Boolean} search True to submit the request
     */
    onWindowValidate: function (search){
        var value = this.mapPanel.vectorLayer.features.length ? this.mapPanel.wktFormat.write(this.mapPanel.vectorLayer.features[0]) : '';
        this.setValue(value);
        if (search == true) {
            this.submitRequest = true;
        }
        this.mapWindow.destroy();
        this.el.highlight();
    }
});
Ext.reg('geometryfield', Genapp.form.GeometryField);