/**
 * Show one field form.
 * 
 * The following parameters are expected :
 * title : The title of the form
 * id : The identifier of the form
 * 
 * @class Genapp.FieldForm
 * @extends Ext.Panel
 * @constructor Create a new FieldForm
 * @param {Object} config The config object
 */
Genapp.FieldForm = Ext.extend(Ext.Panel, {
    /**
     * @cfg {Boolean} frame
     * See {@link Ext.Panel#frame}.
     * Default to true.
     */
    frame:true,
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp-query-field-form-panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-query-field-form-panel',
    /**
     * @cfg {String} criteriaPanelTbarLabel
     * The criteria Panel Tbar Label (defaults to <tt>'Criteria'</tt>)
     */
    criteriaPanelTbarLabel:'Criteria',
    /**
     * @cfg {String} criteriaPanelTbarComboEmptyText
     * The criteria Panel Tbar Combo Empty Text (defaults to <tt>'Select...'</tt>)
     */
    criteriaPanelTbarComboEmptyText:'Select...',
    /**
     * @cfg {String} criteriaPanelTbarComboLoadingText
     * The criteria Panel Tbar Combo Loading Text (defaults to <tt>'searching...'</tt>)
     */
    criteriaPanelTbarComboLoadingText:'searching...',
    /**
     * @cfg {String} criteriaPanelTbarLabel
     * The criteria Panel Tbar Label (defaults to <tt>'Columns'</tt>)
     */
    columnsPanelTbarLabel:'Columns',
    /**
     * @cfg {String} criteriaPanelTbarComboEmptyText
     * The criteria Panel Tbar Combo Empty Text (defaults to <tt>'Select...'</tt>)
     */
    columnsPanelTbarComboEmptyText:'Select...',
    /**
     * @cfg {String} criteriaPanelTbarComboLoadingText
     * The criteria Panel Tbar Combo Loading Text (defaults to <tt>'searching...'</tt>)
     */
    columnsPanelTbarComboLoadingText:'searching...',
    /**
     * @cfg {String} columnsPanelTbarAddAllButtonTooltip
     * The columns Panel Tba rAdd All Button Tooltip (defaults to <tt>'Add all the columns'</tt>)
     */
    columnsPanelTbarAddAllButtonTooltip:'Add all the columns',
    /**
     * @cfg {String} columnsPanelTbarRemoveAllButtonTooltip
     * The columns Panel Tbar Remove All Button Tooltip (defaults to <tt>'Remove all the columns'</tt>)
     */
    columnsPanelTbarRemoveAllButtonTooltip:'Remove all the columns',
    /**
     * @cfg {String} dateFormat
     * The date format for the date fields (defaults to <tt>'Y/m/d'</tt>)
     */
    dateFormat:'Y/m/d',

    // private
    initComponent : function() {
        /**
         * The criteria Data Store.
         * @property criteriaDS
         * @type Ext.data.JsonStore
         */
        this.criteriaDS = new Ext.data.JsonStore({
            fields:[
                {name:'name',mapping:'a'},
                {name:'label',mapping:'b'},
                {name:'inputType',mapping:'c'},
                {name:'type',mapping:'d'},
                {name:'definition',mapping:'e'},
                {name:'is_default',mapping:'f'},
                {name:'default_value',mapping:'g'},
                {name:'params',mapping:'p'}
            ],
            data:this.criteria
        });

        /**
         * The columns Data Store.
         * @property columnsDS
         * @type Ext.data.JsonStore
         */
        this.columnsDS = new Ext.data.JsonStore({
            fields:[
                {name:'name',mapping:'a'},
                {name:'label',mapping:'b'},
                {name:'definition',mapping:'c'},
                {name:'is_default',mapping:'d'},
                {name:'params',mapping:'p'}
            ],
            data:this.columns
        });

        /**
         * The panel used to show the criteria.
         * @property criteriaPanel
         * @type Ext.Panel
         */
        this.criteriaPanel = new Ext.Panel({
            layout:'form',
            hidden:Ext.isEmpty(this.criteria) ? true:false,
            hideMode:'offsets',
            labelWidth:120,
            cls:'genapp-query-criteria-panel',
            bodyStyle: 'padding:0px 5px;',
            defaults: {
                labelStyle: 'padding: 0; margin-top:3px', 
                width: 180
            },
            items:  this.getDefaultCriteriaConfig(),
            tbar: [
                {
                    // Filler
                    xtype: 'tbfill'
                },
                    //The label
                    new Ext.Toolbar.TextItem(this.criteriaPanelTbarLabel),
                {
                    // A spacer
                    xtype: 'tbspacer'
                },
                {
                    // The combobox with the list of available criterias
                    xtype: 'combo',
                    hiddenName: 'Criteria',
                    store : this.criteriaDS,
                    editable :false,
                    displayField :'label',
                    valueField :'name',
                    mode :'local',
                    width :220,
                    maxHeight :100,
                    triggerAction :'all',
                    emptyText:this.criteriaPanelTbarComboEmptyText,
                    loadingText :this.criteriaPanelTbarComboLoadingText,
                    listeners : {
                        scope :this,
                        'select' : {
                            fn : this.addCriteria,
                            scope :this
                        }
                    }
                },
                {
                    // A spacer
                    xtype: 'tbspacer'
                }
            ]
        });

        /**
         * The panel used to show the columns.
         * @property columnsPanel
         * @type Ext.Panel
         */
        this.columnsPanel = new Ext.Panel({
            layout:'form',
            hidden:Ext.isEmpty(this.columns) ? true:false,
            hideMode:'offsets',
            items: this.getDefaultColumnsConfig(),
            tbar: [
               {
                    // The add all button
                    xtype: 'tbbutton',
                    tooltip:this.columnsPanelTbarAddAllButtonTooltip,
                    ctCls: 'genapp-tb-btn',
                    iconCls: 'genapp-tb-btn-add',
                    handler: this.addAllColumns,
                    scope:this
               },
               {
                    // The remove all button
                    xtype: 'tbbutton',
                    tooltip:this.columnsPanelTbarRemoveAllButtonTooltip,
                    ctCls: 'genapp-tb-btn',
                    iconCls: 'genapp-tb-btn-remove',
                    handler: this.removeAllColumns,
                    scope:this
               },
               {
                    // Filler
                    xtype: 'tbfill'
               },
                    // The label
                    new Ext.Toolbar.TextItem(this.columnsPanelTbarLabel),
               {
                    // A space
                    xtype: 'tbspacer'
               },
               {
                    // The combobox with the list of available columns
                    xtype: 'combo',
                    fieldLabel: 'Columns',
                    hiddenName: 'Columns',
                    store : this.columnsDS,
                    editable :false,
                    displayField :'label',
                    valueField :'name',
                    mode :'local',
                    width :220,
                    maxHeight :100,
                    triggerAction :'all',
                    emptyText:this.columnsPanelTbarComboEmptyText,
                    loadingText :this.columnsPanelTbarComboLoadingText,
                    listeners : {
                        scope :this,
                        'select' : {
                            fn : this.addColumn,
                            scope :this
                        }
                    }
                },
                {xtype: 'tbspacer'}
            ]
        });

        if (!this.items) {
            this.items = [ this.criteriaPanel, this.columnsPanel ];
        }
        this.collapsible = true;
        this.titleCollapse = true;
        Genapp.FieldForm.superclass.initComponent.call(this);
        
        this.doLayout();
        
    },

    /**
     * Add the selected criteria to the list of criteria.
     * @param {Ext.form.ComboBox} combo The criteria combobox
     * @param {Ext.data.Record} record The criteria combobox record to add
     * @param {Number} index The criteria combobox record index
     * @hide
     */
    addCriteria : function(combo, record, index) {
        if(combo !== null){
            combo.clearValue();
            combo.collapse();
        }
        // Add the field
        this.criteriaPanel.add(this.getCriteriaConfig(record.data));
        this.criteriaPanel.doLayout();
    },

    /**
     * Construct a criteria from the record
     * @param {Ext.data.Record} record The criteria combobox record to add
     * @hide
     */
    getCriteriaConfig : function(record){
        var field = {};
        // Setup the name of the field
        var subName = 'criteria__' + record.name;
        var i = 0;
        var foundComponents;
        do {
            field.name = field.hiddenName = subName + '[' + i++ + ']';
            if(this.criteriaPanel){ // The panel is rendered
                foundComponents = this.criteriaPanel.find('name', field.name).length;
            }else{
                break;
            }
        }
        while (foundComponents !== 0);

        // Creates the ext field config
        switch(record.inputType){
            case 'SELECT':  // The input type SELECT correspond generally to a data type CODE
                field.xtype = 'combo';
                field.hiddenName = field.name;
                field.triggerAction = 'all';
                field.typeAhead = true;
                field.mode = 'local';
                field.displayField = 'label';
                field.valueField  = 'code';
                field.emptyText = this.criteriaPanelTbarComboEmptyText;
                field.disableKeyFilter = true;
                field.store = new Ext.data.ArrayStore({
                    fields:['code','label'],
                    data : record.params.options
                });
                break;
            case 'DATE': // The input type DATE correspond generally to a data type DATE
                field.xtype = 'daterangefield';
                field.format = this.dateFormat;
                break;
            case 'NUMERIC': // The input type NUMERIC correspond generally to a data type NUMERIC or RANGE
                field.xtype = 'numberrangefield';
                
                // If RANGE we set the min and max values
                if (record.type=='RANGE') {
                    field.minValue = record.params.min;
                    field.maxValue = record.params.max;
                }
                // IF INTEGER we remove the decimals
                if (record.type=='INTEGER') {
                    field.allowDecimals = false;
                    field.decimalPrecision = 0;
                }
                break;
            case 'CHECKBOX':
                 field.xtype = 'switch_checkbox';
                 field.ctCls = 'improvedCheckbox';
                 if(!Ext.isEmpty(record.default_value)){
                    field.inputValue = '1';
                 }
                 //field.boxLabel = record.label;
                 break;
            case 'RADIO':
            case 'TEXT':
                switch(record.type){
                    // TODO : BOOLEAN, COORDINATE
                    case 'INTEGER':
                        field.xtype  = 'numberfield';
                        field.allowDecimals = false;
                        break;
                    case 'NUMERIC':
                        field.xtype  = 'numberfield';
                        break;
                    default : // STRING
                        field.xtype  = 'textfield';
                        break;
                }
                break;
            case 'GEOM':
                field.xtype = 'geometryfield';
                break;
            default: 
                field.xtype  = 'field';
            break;
        }
        if(!Ext.isEmpty(record.default_value)){
            field.value = record.default_value;
        }
        field.fieldLabel = record.label;
        field.listeners = {
            'render':function(cmp){
                // Add the bin
                var binCt = Ext.get('x-form-el-' + cmp.id).parent();
                var labelDiv = binCt.child('.x-form-item-label');
                labelDiv.set({
                    'ext:qtitle':record.label,
                    'ext:qwidth':200,
                    'ext:qtip':record.definition
                });
                labelDiv.addClass('labelNextBin');
                var binDiv = binCt.createChild({
                    tag: "div",
                    cls: "filterBin"
                }, labelDiv);
                binDiv.insertHtml('afterBegin', '&nbsp;&nbsp;&nbsp;');
                binDiv.on(
                    'click',
                    function(event,el,options){
                        this.criteriaPanel.remove(cmp);
                    },
                    this,
                    {
                        single:true
                    }
                );
            },
            scope:this
        };
        return field;
    },

    /**
     * Construct the default criteria
     * @return {Array} An array of the default criteria config
     */
    getDefaultCriteriaConfig : function() {
        var items = [];
        this.criteriaDS.each(function(record){
            if(record.data.is_default){
                // if the field have multiple default values, duplicate the criteria
                var defaultValue = record.data.default_value;
                if(!Ext.isEmpty(defaultValue)){
                    var defaultValues = defaultValue.split(';');
                    for (var i = 0; i < defaultValues.length; i++) {
                        // clone the object
                        var newRecord = record.copy();
                        newRecord.data.default_value = defaultValues[i];
                        this.items.push(this.form.getCriteriaConfig(newRecord.data));
                    }
                }
            }
        },{form:this, items:items})
        return items;
    },

    /**
     * Add the selected column to the column list.
     * @param {Ext.form.ComboBox} combo The column combobox
     * @param {Ext.data.Record} record The column combobox record to add
     * @param {Number} index The column combobox record index
     * @hide
     */
    addColumn : function(combo, record, index) {
        if(combo !== null){
            combo.clearValue();
            combo.collapse();
        }
        if (this.columnsPanel.find('name', 'column__' + record.data.name).length === 0){
            // Add the field
            this.columnsPanel.add(this.getColumnConfig(record.data));
            this.columnsPanel.doLayout();
        }
    },

    /**
     * Construct a column for the record
     * @param {Ext.data.Record} record The column combobox record to add
     * @hide
     */
    getColumnConfig : function(record){
        var field = {
            xtype: 'container',
            autoEl: 'div',
            cls: 'genapp-query-column-item',
            items: [{
                xtype:'box',
                autoEl:{
                    tag:'div',
                    cls:'columnLabelBin',
                    html:'&nbsp;&nbsp;&nbsp;&nbsp;'
                },
                listeners:{
                    'render':function(cmp){
                        cmp.getEl().on(
                            'click',
                            function(event,el,options){
                                this.columnsPanel.remove(cmp.ownerCt);
                            },
                            this,
                            {
                                single:true
                            }
                        );
                    },
                    scope:this
                }
            },{
                xtype:'box',
                autoEl:{
                    tag:'span',
                    cls: 'columnLabel',
                    'ext:qtitle':Genapp.util.htmlStringFormat(record.label),
                    'ext:qwidth':200,
                    'ext:qtip':Genapp.util.htmlStringFormat(record.definition),
                    html:record.label
                }
            },{
                xtype: 'hidden',
                name: 'column__' + record.name,
                value: '1'
            }]
        };
        return field;
    },

    /**
     * Construct the default columns
     * @return {Array} An array of the default columns config
     */
    getDefaultColumnsConfig : function(){
        var items = [];
        this.columnsDS.each(function(record){
            if(record.data.is_default){
                this.items.push(this.form.getColumnConfig(record.data));
            }
        },{form:this, items:items})
        return items;
    },

    /**
     * Adds all the columns of a column panel
     */
    addAllColumns: function() {
        this.columnsDS.each( 
            function(record){
                this.addColumn(null, record);
            }, 
            this
        );
    },

    /**
     * Adds all the columns of a column panel
     */
    removeAllColumns: function() {
        this.columnsPanel.removeAll();
    }

});