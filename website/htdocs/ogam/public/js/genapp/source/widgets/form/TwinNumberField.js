/**
 * 
 * A twin number field.
 * 
 * @class Genapp.form.TwinNumberField
 * @extends Ext.form.TwinTriggerField
 * @constructor Create a new TwinNumberField
 * @param {Object} config
 * @xtype twinnumberfield
 */

Ext.namespace('Genapp.form');

Genapp.form.TwinNumberField = Ext.extend(Ext.form.TwinTriggerField, {
    
    /**
     * @cfg {RegExp} stripCharsRe @hide
     */
    /**
     * @cfg {RegExp} maskRe @hide
     */
    /**
     * @cfg {String} fieldClass The default CSS class for the field (defaults to "x-form-field x-form-num-field")
     */
    fieldClass: "x-form-field x-form-num-field",
    /**
     * @cfg {Boolean} allowDecimals False to disallow decimal values (defaults to true)
     */
    allowDecimals : true,
    /**
     * @cfg {String} decimalSeparator Character(s) to allow as the decimal separator (defaults to '.')
     */
    decimalSeparator : ".",
    /**
     * @cfg {Number} decimalPrecision The maximum precision to display after the decimal separator (defaults to 2)
     */
    decimalPrecision : 2,
    /**
     * @cfg {Boolean} allowNegative False to prevent entering a negative sign (defaults to true)
     */
    allowNegative : true,
    /**
     * @cfg {Number} minValue The minimum allowed value (defaults to Number.NEGATIVE_INFINITY)
     */
    minValue : -Number.MAX_VALUE,
    /**
     * @cfg {Number} maxValue The maximum allowed value (defaults to Number.MAX_VALUE)
     */
    maxValue : Number.MAX_VALUE,
    /**
     * @cfg {String} minText Error text to display if the minimum value validation fails (defaults to "The minimum value for this field is {minValue}")
     */
    minText : "The minimum value for this field is {0}",
    /**
     * @cfg {String} maxText Error text to display if the maximum value validation fails (defaults to "The maximum value for this field is {maxValue}")
     */
    maxText : "The maximum value for this field is {0}",
    /**
     * @cfg {String} nanText Error text to display if the value is not a valid number.  For example, this can happen
     * if a valid character like '.' or '-' is left in the field with no number (defaults to "{value} is not a valid number")
     */
    nanText : "{0} is not a valid number",
    /**
     * @cfg {String} baseChars The base set of characters to evaluate as valid numbers (defaults to '0123456789').
     */
    baseChars : "0123456789",
    /**
     * @cfg {String} trigger1Class
     * An additional CSS class used to style the trigger button.  The trigger will always get the
     * class 'x-form-clear-trigger' by default and triggerClass will be appended if specified.
     */
    trigger1Class:'x-form-clear-trigger',
    /**
     * @cfg {Boolean} hideTrigger1
     * true to hide the first trigger. (Default to true)
     * See Ext.form.TwinTriggerField#initTrigger also.
     */
    hideTrigger1:true,
    /**
     * @cfg {Boolean} hideTrigger2
     * true to hide the second trigger. (Default to true)
     * See Ext.form.TwinTriggerField#initTrigger also.
     */
    hideTrigger2:true,

    // private
    initComponent : function(){
        this.on('change', this.onChange, this);
        Genapp.form.TwinNumberField.superclass.initComponent.call(this);
    },

    /**
     * The function that handle the trigger's click event.
     * See {@link Ext.form.TriggerField#onTriggerClick} for additional information.
     * @method
     * @param {EventObject} e
     * @hide
     */
    onTrigger1Click : function(){
        this.reset();
        this.triggers[0].hide();
    },

    // private
    onChange : function(field){
        var v = this.getValue();
        if(v !== '' && v !== null){
            this.triggers[0].show();
        }else{
            this.triggers[0].hide();
        }
    },

    // private
    initEvents : function(){
        var allowed = this.baseChars + '';
        if (this.allowDecimals) {
            allowed += this.decimalSeparator;
        }
        if (this.allowNegative) {
            allowed += '-';
        }
        this.maskRe = new RegExp('[' + Ext.escapeRe(allowed) + ']');
        Ext.form.NumberField.superclass.initEvents.call(this);
    },

    // private
    validateValue : function(value){
        if(!Ext.form.NumberField.superclass.validateValue.call(this, value)){
            return false;
        }
        if(value.length < 1){ // if it's blank and textfield didn't flag it then it's valid
             return true;
        }
        value = String(value).replace(this.decimalSeparator, ".");
        if(isNaN(value)){
            this.markInvalid(String.format(this.nanText, value));
            return false;
        }
        var num = this.parseValue(value);
        if(num < this.minValue){
            this.markInvalid(String.format(this.minText, this.minValue));
            return false;
        }
        if(num > this.maxValue){
            this.markInvalid(String.format(this.maxText, this.maxValue));
            return false;
        }
        return true;
    },

    /**
     * Returns the normalized data value (undefined or emptyText will be returned as '').
     * To return the raw value see {@link #getRawValue}.
     * @return {Mixed} value The field value
     */
    getValue : function(){
        return this.fixPrecision(this.parseValue(Ext.form.NumberField.superclass.getValue.call(this)));
    },

    /**
     * Sets a data value into the field and validates it.
     * To set the value directly without validation see {@link #setRawValue}.
     * @param {Mixed} value The value to set
     * @return {Ext.form.Field} this
     */
    setValue : function(v){
        v = typeof v === 'number' ? v : parseFloat(String(v).replace(this.decimalSeparator, "."));
        v = isNaN(v) ? '' : String(v).replace(".", this.decimalSeparator);
        if(this.triggers){
            if(v !== '' && v !== null && v !== this.minValue && v !== this.maxValue){
                this.triggers[0].show();
            }else{
                this.triggers[0].hide();
            }
        }
        return Ext.form.NumberField.superclass.setValue.call(this, v);
    },

    // private
    parseValue : function(value){
        value = parseFloat(String(value).replace(this.decimalSeparator, "."));
        return isNaN(value) ? '' : value;
    },

    // private
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowDecimals || this.decimalPrecision === -1 || nan || !value){
           return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalPrecision));
    },

    // private
    beforeBlur : function(){
        var v = this.parseValue(this.getRawValue());
        if(v !== '' && v !== null){
            this.setValue(this.fixPrecision(v));
        }
    }
});
Ext.reg('twinnumberfield', Genapp.form.TwinNumberField);