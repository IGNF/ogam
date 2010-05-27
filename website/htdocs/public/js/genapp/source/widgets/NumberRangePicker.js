/**
 * Simple number range picker class.
 * 
 * @class Genapp.NumberRangePicker
 * @extends Ext.Panel
 * @constructor Create a new NumberRangePicker
 * @param {Object} config The config object
 * @xtype numberrangepicker
 */
Genapp.NumberRangePicker = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'form'.
     */
    layout: 'form',
    /**
     * @cfg {Number} height
     * The height of this component in pixels (defaults to 59).
     */
    height:59,
    /**
     * @cfg {Number} width
     * The width of this component in pixels (defaults to 176).
     */
    width:176,
    /**
     * @cfg {Number} labelWidth The width of labels in pixels. This property cascades to child containers
     * and can be overridden on any child container (e.g., a fieldset can specify a different labelWidth
     * for its fields) (defaults to 30).
     * See {@link Ext.form.FormPanel#labelWidth} also.
     */
    labelWidth: 30,
    /**
     * @cfg {String} buttonAlign
     * The alignment of any {@link #buttons} added to this panel.  Valid values are 'right',
     * 'left' and 'center' (defaults to 'center').
     */
    buttonAlign: 'center',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'x-menu-number-range-item').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls: 'x-menu-number-range-item',
    /**
     * @cfg {String} minFieldLabel
     * The min Field Label (defaults to <tt>'Min'</tt>)
     */
    minFieldLabel:"Min",
    /**
     * @cfg {String} maxFieldLabel
     * The max Field Label (defaults to <tt>'Max'</tt>)
     */
    maxFieldLabel:"Max",
    /**
     * @cfg {String} okButtonText
     * The ok Button Text (defaults to <tt>'ok'</tt>)
     */
    okButtonText:"ok",
    /**
     * @cfg {Boolean} hideValidationButton if true hide the menu validation button (defaults to true).
     */
    hideValidationButton : true,

    // private
    initComponent : function(){
        Ext.apply(this, {
                items: [
                /**
                 * The min field.
                 * @property minField
                 * @type Genapp.form.TwinNumberField
                 */
                this.minField = new Genapp.form.TwinNumberField({
                    fieldLabel:this.minFieldLabel
                }),
                /**
                 * The max field.
                 * @property maxField
                 * @type Genapp.form.TwinNumberField
                 */
                this.maxField = new Genapp.form.TwinNumberField({
                    fieldLabel:this.maxFieldLabel
                })
            ]
        });
        if(!this.hideValidationButton){
            this.buttons = [{
                xtype:'button',
                text:this.okButtonText,
                width:'auto',
                handler:this.onOkButtonPress.createDelegate(this)
            }];
            this.height = this.height + 28;
        }

        Genapp.NumberRangePicker.superclass.initComponent.call(this);
    },

    // private
    onOkButtonPress: function (button, state){
        if(state){
            this.fireEvent('select', this, {
                minValue: this.minField.getValue(),
                maxValue: this.maxField.getValue()
            });
        }
    }
});
Ext.reg('numberrangepicker', Genapp.NumberRangePicker);