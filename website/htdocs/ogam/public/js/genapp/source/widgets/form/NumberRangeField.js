/**
 * Provides a number range input field with a {@link Genapp.NumberRangePicker} dropdown and automatic number validation.
 *
 * @class Genapp.form.NumberRangeField
 * @extends Ext.form.TriggerField
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
     * @cfg {String} maxNumberPrefix
     * The prefix for the max number (defaults to <tt>'<= '</tt>)
     */
    maxNumberPrefix: '<= ',
    /**
     * @cfg {String} minNumberPrefix
     * The prefix for the min number (defaults to <tt>'>= '</tt>)
     */
    minNumberPrefix: '>= ',
    /**
     * @cfg {Boolean} usePrefix if true, maxNumberPrefix and minNumberPrefix are used (defaults to true).
     * Otherwise minValue and maxValue are used.
     */
    usePrefix: true,
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
     * <tt>'The max number must be posterior to the min number'</tt>).
     */
    reverseText : "The max number must be superior to the min number",
    /**
     * @cfg {String} formatText
     * The error text to display when the format isn't respected (defaults to
     * <tt>'The correct formats are'</tt>).
     */
    formatText : "The correct formats are",
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
     * @cfg {String} baseChars The base set of characters to evaluate as valid (defaults to '0123456789<>= ').
     */
    baseChars : "0123456789<>= ",
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
        var allowed = '';
        allowed += this.baseChars; // ! this.baseChars can be null
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
        var i;
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
        this.formatText = this.formatText + " '{0}', '"+this.maxNumberPrefix+" {0}', '"+this.minNumberPrefix+" {0}', '{0} "+this.numberSeparator+" {0}'.";
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
        var values = this.splitValue(value);
        if(values === null){
            this.markInvalid(this.formatText);
            return false;
        } else {
            var minv = values.minValue;
            var maxv = values.maxValue;
            if(minv !== null){
                minv = this.getNumber(minv);
                if(minv === null){
                    this.markInvalid(String.format(this.nanText, values.minValue));
                    return false;
                }
                if(minv < this.minValue){
                    this.markInvalid(String.format(this.minText, this.minValue));
                    return false;
                }
                if(!this.hasGoodNumberOfDecimals(minv)){
                    this.markInvalid(this.formatText);
                    return false;
                }
            }
            if(maxv !== null){
                maxv = this.getNumber(maxv);
                if(maxv === null){
                    this.markInvalid(String.format(this.nanText, values.maxValue));
                    return false;
                }
                if(maxv > this.maxValue){
                    this.markInvalid(String.format(this.maxText, this.maxValue));
                    return false;
                }
                if(!this.hasGoodNumberOfDecimals(maxv)){
                    this.markInvalid(this.formatText);
                    return false;
                }
            }
            if(minv !== null && maxv !== null && (maxv - minv) < 0){
                this.markInvalid(this.reverseText);
                return false;
            }
            return true;
        }
    },

    /**
     * Check if the number provided has not to much decimals
     * 
     * @param {Number} value The number to check
     * @return {boolean} Return 'true' if the number of decimals are respected
     */
    hasGoodNumberOfDecimals: function(value) {
        var v = value * Math.pow(10,this.decimalPrecision);
        if((v - parseInt(v, 10)) === 0){
            return true;
        }
        return false;
    },

    /**
     * Returns the normalized data value (undefined or emptyText will be returned as '').
     * To return the raw value see {@link #getRawValue}.
     * @return {Mixed} value The field value
     */
    getValue : function(){
        var value = Genapp.form.NumberRangeField.superclass.getValue.call(this);
        value = this.formatNumberValue(value);
        return value === null ? '' : value;
    },

    /**
     * Returns the values.
     * 
     * @return {Object} The field values
     */
    getValues : function(){
        var value = Genapp.form.NumberRangeField.superclass.getValue.call(this);
        return this.getNumbersObject(this.splitValue(value));
    },

    /**
     * Sets a data value into the field and validates it.
     * To set the value directly without validation see {@link #setRawValue}.
     * @param {Mixed} value The value to set
     * @return {Ext.form.Field} this
     */
    setValue : function(v){
        v = this.formatNumberValue(v);
        return Genapp.form.NumberRangeField.superclass.setValue.call(this, v);
    },
    
    /**
     * Format the field.
     * 
     * @param {Mixed} value The value to set
     * @return {String} The formated string value
     */
    formatNumberValue : function(v){
        var minv, maxv, mins, maxs;
        if(!Ext.isObject(v)){
            v = this.splitValue(v);
        }
        v = this.getNumbersObject(v);

        if(v !== null){
            minv = v.minValue;
            maxv = v.maxValue;
            mins = isNaN(minv) ? '' : String(this.fixPrecision(minv)).replace(".", this.decimalSeparator);
            maxs = isNaN(maxv) ? '' : String(this.fixPrecision(maxv)).replace(".", this.decimalSeparator);

            if(this.usePrefix === true){
                if(minv === null && maxv !== null){
                    v = this.maxNumberPrefix + maxv;
                } else if(minv !== null && maxv === null){
                    v = this.minNumberPrefix + minv;
                } else if(minv !== null && maxv !== null){
                    if(minv === maxv){
                        v = mins;
                    } else {
                        v = mins + this.numberSeparator + maxs;
                    }
                } else {
                    v = '';
                }
            } else {
                if(minv === null && maxv !== null){
                    v = this.minValue + this.numberSeparator + maxs;
                } else if(minv !== null && maxv === null){
                    v = mins + this.numberSeparator + this.maxValue;
                } else if(minv !== null && maxv !== null){
                    if(minv === maxv){
                        v = mins;
                    } else {
                        v = mins + this.numberSeparator + maxs;
                    }
                } else {
                    v = '';
                }
            }
        }
        return v;
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
    getNumber : function(value){
        return Ext.num(String(value).replace(this.decimalSeparator, "."), null);
    },

    // private
    getNumbersObject : function(obj){
        if(!obj || !Ext.isObject(obj)){
            return null;
        }
        var minv = this.getNumber(obj.minValue);
        var maxv = this.getNumber(obj.maxValue);
        if(minv !== null || maxv !== null){
            return {minValue:minv, maxValue:maxv};
        } else {
            return null;
        }
    },

    /**
     * Return an object with the numbers found in the string
     * 
     * @param {String} value The string value to parse
     * @return {object}/null an object with min and max values or null for failed match operations
     * @hide
     */
    splitValue : function(value){
        var minv, maxv, minnpIndex, maxnpIndex;
        if(!value || !Ext.isString(value)){
            return null;
        }
        var values = value.split(this.numberSeparator);
        if(values.length === 1){
            minnpIndex = value.indexOf(this.minNumberPrefix,0);
            maxnpIndex = value.indexOf(this.maxNumberPrefix,0);
            if(minnpIndex !== -1){
            // Case ">= 00.00"
                minv = value.substring(minnpIndex + this.minNumberPrefix.length);
                return {minValue:minv, maxValue:null};
            }else if(maxnpIndex !== -1){
            // Case "<= 00.00"
                maxv = value.substring(maxnpIndex + this.maxNumberPrefix.length);
                return {minValue:null, maxValue:maxv};
            }else{
            // Case "00.00"
                return {minValue:value, maxValue:value};
            }
        }else if(values.length === 2){
            // Case "00.00 - 00.00"
                return {minValue:values[0], maxValue:values[1]};
        }else{
            return null;
        }
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
             * @type Genapp.form.menu.NumberRangeMenu
             */
            this.menu = new Genapp.form.menu.NumberRangeMenu({
                hideOnClick: false,
                hideValidationButton: this.hideValidationButton
            });
            
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
        }
        this.onFocus();

        var values = this.getValues();
        if(values !== null){
            this.menu.rangePicker.minField.setValue(values.minValue);
            this.menu.rangePicker.maxField.setValue(values.maxValue);
        } else {
            if(this.getRawValue() !== ''){
                return;
            }
        }

        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
        this.menu.rangePicker.minField.focus(true, 60);
    },

    //private
    menuEvents: function(method){
        this.menu[method]('select', this.onSelect, this);
        this.menu[method]('hide', this.onMenuHide, this);
        this.menu[method]('show', this.onFocus, this);
    },

    //private
    onSelect: function(m, d){
        this.menu.hide();
        this.setValue(d);
        
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
    }
});
Ext.reg('numberrangefield', Genapp.form.NumberRangeField);