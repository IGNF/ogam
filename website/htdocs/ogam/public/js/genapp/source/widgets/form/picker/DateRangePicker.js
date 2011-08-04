/**
 * Simple date range picker class.
 * 
 * @class Genapp.DateRangePicker
 * @extends Ext.Panel
 * @constructor Create a new DateRangePicker
 * @param {Object} config The config object
 * @xtype daterangepicker
 */

Ext.namespace('Genapp.form.picker');

Genapp.form.picker.DateRangePicker = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'column'.
     */
    layout: 'column',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'x-menu-date-range-item').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls: 'x-menu-date-range-item',
    /**
     * @cfg {String} buttonAlign
     * The alignment of any {@link #buttons} added to this panel.  Valid values are 'right',
     * 'left' and 'center' (defaults to 'center').
     */
    buttonAlign: 'center',
    /**
     * @cfg {Boolean} hideValidationButton if true hide the menu validation button (defaults to false).
     */
    hideValidationButton : false,
    /**
     * @cfg {String} tbarStartDateButtonText
     * The tbar start date button text (defaults to <tt>'Start Date ...'</tt>)
     */
    tbarStartDateButtonText:'Start Date ...',
    /**
     * @cfg {String} tbarRangeDateButtonText
     * The tbar range date button text (defaults to <tt>'Range Date'</tt>)
     */
    tbarRangeDateButtonText:'Range Date',
    /**
     * @cfg {String} tbarEndDateButtonText
     * The tbar end date button text (defaults to <tt>'... End Date'</tt>)
     */
    tbarEndDateButtonText:'... End Date',
    /**
     * @cfg {String} fbarOkButtonText
     * The fbar ok button text (defaults to <tt>'ok'</tt>)
     */
    fbarOkButtonText:'ok',
    /**
     * The selected dates (Default to '{startDate:null, endDate:null}'). Read-only.
     * @type Object
     * @property selectedDate
     */
    selectedDate: {startDate:null, endDate:null},

    // private
    initComponent : function(){
        this.items = [
            /**
             * The start date picker (The left picker).
             * @property startDatePicker
             * @type Ext.DatePicker
             */
            this.startDatePicker = new Ext.DatePicker(Ext.apply({
                internalRender: this.strict || !Ext.isIE,
                ctCls: 'x-menu-date-item',
                columnWidth: 0.5
                }, this.initialConfig)
            ),{
                xtype:'spacer',
                width:5,
                html:'&nbsp;' // For FF and IE8
            },
            /**
             * The end date picker (The right picker).
             * @property endDatePicker
             * @type Ext.DatePicker
             */
            this.endDatePicker = new Ext.DatePicker(Ext.apply({
                internalRender: this.strict || !Ext.isIE,
                ctCls: 'x-menu-date-item',
                columnWidth: 0.5
                }, this.initialConfig)
            )
        ];

        this.startDatePicker.on('select',this.startDateSelect, this);
        this.endDatePicker.on('select',this.endDateSelect, this);

        /**
         * The top toolbar.
         * @property tbar
         * @type Ext.Toolbar
         */
        this.tbar= new Ext.Toolbar({
             items: [
             this.startDateButton = new Ext.Button({
                 text: this.tbarStartDateButtonText,
                 cls: 'x-menu-date-range-item-start-date-button',
                 enableToggle: true,
                 allowDepress: false,
                 toggleGroup: 'DateButtonsGroup',
                 toggleHandler: this.onStartDatePress.createDelegate(this)
             }),
             this.rangeDateButton = new Ext.Button({
                 text: this.tbarRangeDateButtonText,
                 cls: 'x-menu-date-range-item-range-date-button',
                 pressed:true,
                 enableToggle: true,
                 allowDepress: false,
                 toggleGroup: 'DateButtonsGroup',
                 toggleHandler: this.onRangeDatePress.createDelegate(this)
             }),'->',
             this.endDateButton = new Ext.Button({
                 text: this.tbarEndDateButtonText,
                 cls: 'x-menu-date-range-item-end-date-button',
                 enableToggle: true,
                 allowDepress: false,
                 toggleGroup: 'DateButtonsGroup',
                 toggleHandler: this.onEndDatePress.createDelegate(this)
             })]
         });

        if(!this.hideValidationButton){
            this.fbar = new Ext.Toolbar({
                cls: 'x-date-bottom',
                items: [{
                    xtype:'button',
                    text:this.fbarOkButtonText,
                    width:'auto',
                    handler:this.onOkButtonPress.createDelegate(this)
                }]
            });
        }

        Genapp.form.picker.DateRangePicker.superclass.initComponent.call(this);
    },

    // private
    onRangeDatePress: function (button, state){
        if(state){
            this.startDatePicker.enable();
            this.endDatePicker.enable();
            this.resetDates();
        }
    },

    // private
    onStartDatePress: function (button, state){
        if(state){
            this.startDatePicker.enable();
            this.endDatePicker.disable();
            this.resetDates();
        }
    },

    // private
    onEndDatePress: function (button, state){
        if(state){
            this.startDatePicker.disable();
            this.endDatePicker.enable();
            this.resetDates();
        }
    },

    // private
    startDateSelect: function (startDatePicker, date){
        this.selectedDate.startDate = date;
        if(this.startDateButton.pressed){
            this.returnSelectedDate();
        }else{ // rangeDateButton is pressed
            if(this.selectedDate.endDate !== null){
                this.returnSelectedDate();
            }
        }
    },

    // private
    endDateSelect: function (endDatePicker, date){
        this.selectedDate.endDate = date;
        if(this.endDateButton.pressed){
            this.returnSelectedDate();
        }else{ // rangeDateButton is pressed
            if(this.selectedDate.startDate !== null){
                this.returnSelectedDate();
            }
        }
    },

    // private
    resetselectedDate: function(){
        this.selectedDate = {
            startDate:null,
            endDate:null
        };
    },

    /**
     * Reset the dates
     */
    resetDates: function(){
        this.resetselectedDate();
        this.startDatePicker.setValue(this.startDatePicker.defaultValue);
        this.endDatePicker.setValue(this.endDatePicker.defaultValue);
    },

    // private
    returnSelectedDate: function(){
        this.fireEvent('select', this, this.selectedDate);
        this.resetselectedDate();
    },

    /**
     * Checks if the date is in the interval [minDate,maxDate] of the picker
     */
    isEnabledDate: function (picker){
        if((picker.activeDate.getTime() - picker.minDate.getTime() >= 0) 
                && (picker.maxDate.getTime() - picker.activeDate.getTime() >= 0)){
            return true;
        } else {
            return false;
        }
    },

    // private
    onOkButtonPress: function (button, state){
        if (state){
            if (this.startDateButton.pressed){
                if (this.isEnabledDate(this.startDatePicker)){
                    this.selectedDate = {
                        startDate:this.startDatePicker.activeDate,
                        endDate:null
                    };
                    this.returnSelectedDate();
                }
            } else if(this.endDateButton.pressed){
                if (this.isEnabledDate(this.endDatePicker)){
                    this.selectedDate = {
                        startDate:null,
                        endDate:this.endDatePicker.activeDate
                    };
                    this.returnSelectedDate();
                }
            } else {
                if (this.isEnabledDate(this.startDatePicker) && this.isEnabledDate(this.endDatePicker)){
                    this.selectedDate = {
                        startDate:this.startDatePicker.activeDate,
                        endDate:this.endDatePicker.activeDate
                    };
                    this.returnSelectedDate();
                }
            }
        }
    }
});
Ext.reg('daterangepicker', Genapp.form.picker.DateRangePicker);