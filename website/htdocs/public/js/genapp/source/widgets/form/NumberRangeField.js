/**
 * Provides a number range input field with a {@link Genapp.NumberRangePicker} dropdown and automatic number validation.
 *
 * @class Genapp.form.NumberRangeField
 * @extends Ext.form.NumberField
 * @constructor Create a new NumberRangeField
 * @param {Object} config
 * @xtype numberrangefield
 */

Ext.namespace('Genapp.form');

Genapp.form.NumberRangeField = Ext.extend(Ext.form.TriggerField,  {
    /**
     * @cfg {String} numberSeparator
     * The separator text to display between the numbers (defaults to <tt>' - '</tt>)
     */
    numberSeparator: ' - ',
    /**
     * @cfg {String} minText Error text to display if the minimum value validation fails (defaults to "The minimum value for this field is {minValue}")
     */
    minText : "The minimum value for this field is {0}",
    /**
     * @cfg {String} maxText Error text to display if the maximum value validation fails (defaults to "The maximum value for this field is {maxValue}")
     */
    maxText : "The maximum value for this field is {0}",
    /**
     * @cfg {String} reverseText
     * The error text to display when the numbers are reversed (defaults to
     * <tt>'The end number must be posterior to the start number'</tt>).
     */
    reverseText : "The max number must be superior to the min number",
    /**
     * @cfg {String} formatText
     * The error text to display when the format isn't respected (defaults to
     * <tt>'The correct format is 0.00 - 0.00'</tt>).
     */
    formatText : "The correct format is '{0}'",
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
     * @cfg {Number} minValue The minimum allowed value (defaults to -Number.MAX_VALUE)
     */
    minValue : -Number.MAX_VALUE,
    /**
     * @cfg {Number} maxValue The maximum allowed value (defaults to Number.MAX_VALUE)
     */
    maxValue : Number.MAX_VALUE,
    /**
     * @cfg {String} nanText Error text to display if the value is not a valid number.  For example, this can happen
     * if a valid character like '.' or '-' is left in the field with no number (defaults to "{value} is not a valid number")
     */
    nanText : "'{0}' is not a valid number",
    /**
     * @cfg {String} baseChars The base set of characters to evaluate as valid numbers (defaults to '0123456789').
     */
    baseChars : "0123456789 ",
    /**
     * @cfg {Boolean} hideValidationButton if true hide the menu validation button (defaults to true).
     */
    hideValidationButton : false,
    /**
     * @cfg {Boolean} setEmptyText if true set emptyText of the fields with the min and the max values (defaults to false).
     */
    setEmptyText : false,

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
        Genapp.form.NumberRangeField.superclass.initEvents.call(this);
    },

    // private
    initComponent : function(){
        Genapp.form.NumberRangeField.superclass.initComponent.call(this);

        this.addEvents(
            /**
             * @event select
             * Fires when a date is selected via the date picker.
             * @param {Ext.form.DateField} this
             * @param {Date} date The date that was selected
             */
            'select'
        );
        if(this.setEmptyText){
            this.emptyText = this.minValue + this.numberSeparator + this.maxValue;
        }
        // Formating of the formatText string
        var format = 0;
        if (this.decimalPrecision > 0) {
            format = format+ this.decimalSeparator;
            for (i = 0; i < this.decimalPrecision; i++) {
                format = format + "0";
            }
        }
        format = format + this.numberSeparator + format;
        this.formatText = String.format(this.formatText, format);
    },

    // private
    validateValue : function(value){
        if(!Genapp.form.NumberRangeField.superclass.validateValue.call(this, value)){
            return false;
        }
        if(value.length < 1){ // if it's blank and textfield didn't flag it then it's valid
             return true;
        }

        var values = value.split(this.numberSeparator);
        // The value can be one number if min = max
        if(values.length == 1){
            var v = this.parseValue(values[0]);
            if(isNaN(v)){
                this.markInvalid(String.format(this.nanText, v));
                return false;
            }else{
                return true;
            }
        }else if(values.length == 2){
            var minv = this.parseValue(values[0]);
            var maxv = this.parseValue(values[1]);
            if(maxv === '' || minv === ''){
                this.markInvalid(this.formatText);
                return false;
            }
            if(isNaN(minv)){
                this.markInvalid(String.format(this.nanText, minv));
                return false;
            }
            if(isNaN(maxv)){
                this.markInvalid(String.format(this.nanText, maxv));
                return false;
            }
            if(minv < this.minValue){
                this.markInvalid(String.format(this.minText, this.minValue));
                return false;
            }
            if(maxv > this.maxValue){
                this.markInvalid(String.format(this.maxText, this.maxValue));
                return false;
            }
            if((maxv - minv) < 0){
                this.markInvalid(this.reverseText);
                return false;
            }
            return true;
        }else{
            this.markInvalid(this.formatText);
            return false;
        }
    },

    /**
     * Returns the normalized data value (undefined or emptyText will be returned as '').
     * To return the raw value see {@link #getRawValue}.
     * @return {Mixed} value The field value
     */
    getValue : function(){
        var value = Genapp.form.NumberRangeField.superclass.getValue.call(this);
        var values = value.split(this.numberSeparator);
        if(values.length == 1){
            return String(this.fixPrecision(this.parseValue(values[0]))).replace(".", this.decimalSeparator);
        }else if(values.length == 2){
            return String(this.fixPrecision(this.parseValue(values[0]))).replace(".", this.decimalSeparator) 
            + this.numberSeparator 
            + String(this.fixPrecision(this.parseValue(values[1]))).replace(".", this.decimalSeparator);
        }else{
            return '';
        }
    },

    /**
     * Sets a data value into the field and validates it.
     * To set the value directly without validation see {@link #setRawValue}.
     * @param {Mixed} value The value to set
     * @return {Ext.form.Field} this
     */
    setValue : function(v){
        var minv = null;
        var maxv = null;
        if(Ext.isObject(v)){
            if(typeof v.minValue !== 'undefined' && typeof v.maxValue !== 'undefined'){
                minv = v.minValue;
                maxv = v.maxValue;
            }else{
                return '';
            }
        }else{
            if(typeof v === 'string'){
                var values = v.split(this.numberSeparator);
                if(values.length == 1){
                    minv = maxv = this.parseValue(values[0]);
                }else if(values.length == 2){
                    minv = this.parseValue(values[0]);
                    maxv = this.parseValue(values[1]);
                }else{
                    return '';
                }
            }else{
                return '';
            }
        }
        min = typeof minv == 'number' ? minv : parseFloat(String(minv).replace(this.decimalSeparator, "."));
        max = typeof maxv == 'number' ? maxv : parseFloat(String(maxv).replace(this.decimalSeparator, "."));
        mins = isNaN(min) ? '' : String(this.fixPrecision(min)).replace(".", this.decimalSeparator);
        maxs = isNaN(max) ? '' : String(this.fixPrecision(max)).replace(".", this.decimalSeparator);

        if(min == max){
            v = mins;
        }else if(min < max){
            v = mins + this.numberSeparator + maxs;
        }else{
            v = maxs + this.numberSeparator + mins;
        }

        return Genapp.form.NumberRangeField.superclass.setValue.call(this, v);
    },

    // private
    parseValue : function(value){
        value = parseFloat(String(value).replace(this.decimalSeparator, "."));
        return isNaN(value) ? '' : value;
    },

    // private
    fixPrecision : function(value){
        var nan = isNaN(value);
        if(!this.allowDecimals || this.decimalPrecision == -1 || nan || !value){
           return nan ? '' : value;
        }
        return parseFloat(parseFloat(value).toFixed(this.decimalPrecision));
    },

    /**
     * The function that handle the trigger's click event.
     * Implements the default empty TriggerField.onTriggerClick function to display the NumberRangePicker
     * @method onTriggerClick
     * @hide
     */
    onTriggerClick : function(){
        if(this.disabled){
            return;
        }
        if(!this.menu){
            /**
             * The field menu (displayed on a trigger click).
             * @property menu
             * @type Genapp.menu.NumberRangeMenu
             */
            this.menu = new Genapp.menu.NumberRangeMenu({
                hideOnClick: false,
                hideValidationButton: this.hideValidationButton
            });
        }
        this.onFocus();
        Ext.apply(this.menu.rangePicker.minField,  {
            emptyText: this.setEmptyText ? this.minValue : null,
            allowDecimals : this.allowDecimals,
            decimalSeparator : this.decimalSeparator,
            decimalPrecision : this.decimalPrecision,
            allowNegative : this.allowNegative,
            minValue : this.minValue,
            maxValue : this.maxValue,
            baseChars : this.baseChars
        });
        Ext.apply(this.menu.rangePicker.maxField,  {
            emptyText : this.setEmptyText ? this.maxValue : null,
            allowDecimals : this.allowDecimals,
            decimalSeparator : this.decimalSeparator,
            decimalPrecision : this.decimalPrecision,
            allowNegative : this.allowNegative,
            minValue : this.minValue,
            maxValue : this.maxValue,
            baseChars : this.baseChars
        });

        var values = this.getValue().split(this.numberSeparator);
        if(values.length == 1){
            var minv = this.parseValue(values[0]);
            var maxv = minv;
        }else if(values.length == 2){
            var minv = this.parseValue(values[0]);
            var maxv = this.parseValue(values[1]);
        }else{
            return;
        }

        this.menu.rangePicker.minField.setValue(minv);
        this.menu.rangePicker.maxField.setValue(maxv);

        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
    },

    //private
    menuEvents: function(method){
        this.menu[method]('select', this.onSelect, this);
        this.menu[method]('hide', this.onMenuHide, this);
        this.menu[method]('show', this.onFocus, this);
    },

    //private
    onSelect: function(m, d){
        this.fireEvent('select', this, d);
        this.menu.hide();
    },

    //private
    onMenuHide: function(){
        this.focus(false, 60);
        this.menuEvents('un');
        this.setValue({
            minValue: this.menu.rangePicker.minField.getValue(),
            maxValue: this.menu.rangePicker.maxField.getValue()
        });
    },

    // private
    // Provides logic to override the default TriggerField.validateBlur which just returns true
    validateBlur : function(){
        return !this.menu || !this.menu.isVisible();
    },

    // private
    onDestroy : function(){
        Ext.destroy(this.menu, this.wrap);
        Genapp.form.NumberRangeField.superclass.onDestroy.call(this);
    },

    // private
    beforeBlur : function(){
        var v = this.getRawValue();
        if(v){
            this.setValue(v);
        }
    }
});
Ext.reg('numberrangefield', Genapp.form.NumberRangeField);