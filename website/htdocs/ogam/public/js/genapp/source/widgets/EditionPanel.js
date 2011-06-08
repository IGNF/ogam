/**
 * An EditionPanel correspond to the complete page for editing/inserting a table
 * row.
 * 
 * @class Genapp.EditionPanel
 * @extends Ext.Panel
 * @constructor Create a new Edition Panel
 * @param {Object}
 *            config The config object
 * @xtype editionpanel
 */
Genapp.EditionPanel = Ext.extend(Ext.Panel, {

	/**
	 * @cfg {String} title The title text to be used as innerHTML (html tags are
	 *      accepted) to display in the panel <code>{@link #header}</code>
	 *      (defaults to ''). When a <code>title</code> is specified the
	 *      <code>{@link #header}</code> element will automatically be created
	 *      and displayed unless {@link #header} is explicitly set to
	 *      <code>false</code>. If you do not want to specify a
	 *      <code>title</code> at config time, but you may want one later, you
	 *      must either specify a non-empty <code>title</code> (a blank space ' '
	 *      will do) or <code>header:true</code> so that the container element
	 *      will get created.
	 */
	title : 'Edition',

	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'genapp_edition_panel'). This can
	 *      be useful for adding customized styles to the component or any of
	 *      its children using standard CSS rules.
	 */
	cls : 'genapp_edition_panel',

	/**
	 * @cfg {String} id
	 *      <p>
	 *      The <b>unique</b> id of this component (defaults to an
	 *      {@link #getId auto-assigned id}). You should assign an id if you
	 *      need to be able to access the component later and you do not have an
	 *      object reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).
	 *      </p>
	 *      <p>
	 *      Note that this id will also be used as the element id for the
	 *      containing HTML element that is rendered to the page for this
	 *      component. This allows you to write id-based CSS rules to style the
	 *      specific instance of this component uniquely, and also to select
	 *      sub-elements using this component's id as the parent.
	 *      </p>
	 *      <p>
	 *      <b>Note</b>: to avoid complications imposed by a unique <tt>id</tt>
	 *      also see <code>{@link #itemId}</code> and
	 *      <code>{@link #ref}</code>.
	 *      </p>
	 *      <p>
	 *      <b>Note</b>: to access the container of an item see
	 *      <code>{@link #ownerCt}</code>.
	 *      </p>
	 */
	id : 'edition_panel',

	/**
	 * @cfg {String} ref
	 *      <p>
	 *      A path specification, relative to the Component's
	 *      <code>{@link #ownerCt}</code> specifying into which ancestor
	 *      Container to place a named reference to this Component.
	 *      </p>
	 *      <p>
	 *      Also see the <code>{@link #added}</code> and
	 *      <code>{@link #removed}</code> events.
	 *      </p>
	 */
	ref : 'editionPage',

	width : 500,
	height : 500,
	
	/**
	 * @cfg {Ext.form.FormPanel} inner form panel
	 */ 
	
	
	items: [{
        fieldLabel: 'First Name',
        name: 'first',
        allowBlank:false
    }],

	// private
	initComponent : function() {

		/**
		 * The form fields Data Store.
		 * 
		 * @property criteriaDS
		 * @type Ext.data.JsonStore
		 */
		this.formDS = new Ext.data.JsonStore({
			url: Genapp.base_url + 'dataedition/ajaxgeteditform/SCHEMA/RAW_DATA/FORMAT/SPECIES_DATA/PROVIDER_ID/1/PLOT_CODE/21573-F1000-6-6T/CYCLE/5/SPECIES_CODE/031.001.041',
            method: 'POST',
            autoLoad: true,
            fields:[
                    {name:'name',mapping:'name'},
                    {name:'data',mapping:'data'},
                    {name:'format',mapping:'format'},
                    {name:'label',mapping:'label'},
                    {name:'inputType',mapping:'inputType'},
                    {name:'unit',mapping:'unit'},
                    {name:'type',mapping:'type'},
                    {name:'subtype',mapping:'subtype'},
                    {name:'definition',mapping:'definition'},
                    {name:'decimals',mapping:'decimals'},     
                    {name:'value',mapping:'value'},     // the current value  
                    {name:'editable',mapping:'editable'},       // is the field editable?
                    {name:'params',mapping:'params'} // reserved for min/max or list of codes
                ],
            idProperty : 'name',    			
            listeners : {
                'load': {
                    fn : function(store, records, options) {
                    	 for(i = 0; i<records.length; i++){
                        	//alert(records[i].data);
                            //this.getEditFormConfig(records[i].data.id);
                            }
                        }
                    },
                    scope :this
                }
            
		});
		
		/*var formPanel = new Ext.form.Panel({
			
			url:'save-form.php',
		    frame:true,
		    title: 'Simple Form',
		    bodyStyle:'padding:5px 5px 0',
		    width: 350,
		    fieldDefaults: {
		        msgTarget: 'side',
		        labelWidth: 75
		    },
		    defaultType: 'textfield',
		    defaults: {
		        anchor: '100%'
		    },

		    items: [{
		        fieldLabel: 'First Name',
		        name: 'first',
		        allowBlank:false
		    },{
		        fieldLabel: 'Last Name',
		        name: 'last'
		    },{
		        fieldLabel: 'Company',
		        name: 'company'
		    }, {
		        fieldLabel: 'Email',
		        name: 'email',
		        vtype:'email'
		    }, {
		        xtype: 'timefield',
		        fieldLabel: 'Time',
		        name: 'time',
		        minValue: '8:00am',
		        maxValue: '6:00pm'
		    }],

		    buttons: [{
		        text: 'Save'
		    },{
		        text: 'Cancel'
		    }]
		});*/
		
	
		
		Genapp.EditionPanel.superclass.initComponent.call(this);
	},
	
	
	
	 /**
     * Construct a edition form from the record.
     * 
     * @param {Ext.data.Record} record The form field to add
     */
    getEditFormConfig : function(record){
     
    	var field = {};
        field.name = record.name;

        // Creates the ext field config
        switch(record.inputType){
            case 'SELECT':  // The input type SELECT correspond generally to a data type CODE
                field.xtype = 'combo';
                field.itemCls = 'trigger-field'; // For IE7 layout
                field.hiddenName = field.name;
                field.triggerAction = 'all';
                field.typeAhead = true;
                field.mode = 'local';
                field.displayField = 'label';
                field.valueField  = 'code';
                field.emptyText = Genapp.FieldForm.prototype.criteriaPanelTbarComboEmptyText;
                field.disableKeyFilter = true;
                if (record.subtype == 'DYNAMIC') {
                	field.store = new Ext.data.JsonStore({
                		autoLoad: true,  
                		root: 'codes',
	                    fields:[
	                            {name:'code',mapping:'code'},
	                            {name:'label',mapping:'label'}
	                            ],
	                    url: 'ajaxgetdynamiccodes/unit/'+record.unit
	                });
                } else {
	                field.store = new Ext.data.ArrayStore({
	                    fields:['code','label'],
	                    data : record.params.options
	                });
                }
                break;
            case 'MULTIPLE':  // The input type MULTIPLE correspond generally to a data type ARRAY
                field.xtype = 'combo';
                field.itemCls = 'trigger-field'; // For IE7 layout
                field.hiddenName = field.name;
                field.triggerAction = 'all';
                field.typeAhead = true;
                field.mode = 'local';
                field.displayField = 'label';
                field.valueField  = 'code';
                field.emptyText = Genapp.FieldForm.prototype.criteriaPanelTbarComboEmptyText;
                field.disableKeyFilter = true;
                if (record.subtype=='DYNAMIC') {
                	field.store = new Ext.data.JsonStore({
                		autoLoad: true,  
                		root: 'codes',
                		fields:[
	                            {name:'code',mapping:'code'},
	                            {name:'label',mapping:'label'}
	                            ],
	                    url: 'ajaxgetdynamiccodes/unit/'+record.unit
	                });
                } else {
	                field.store = new Ext.data.ArrayStore({
	                    fields:['code','label'],
	                    data : record.params.options
	                });
                }
                break;
            case 'DATE': // The input type DATE correspond generally to a data type DATE
                field.xtype = 'daterangefield';
                field.itemCls = 'trigger-field'; // For IE7 layout
                field.format = Genapp.FieldForm.prototype.dateFormat;
                break;
            case 'NUMERIC': // The input type NUMERIC correspond generally to a data type NUMERIC or RANGE
                field.xtype = 'numberrangefield';
                field.itemCls = 'trigger-field'; // For IE7 layout
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
                 switch(record.default_value){
                     case 1:
                     case '1':
                     case true:
                     case 'true':
                         field.inputValue = '1';
                         break;
                     default:
                         field.inputValue = '0';
                     break;
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
                field.itemCls = 'trigger-field'; // For IE7 layout
                break;
            case 'TREE': 
            	
            	// Add a Tree View
                field.xtype = 'treeselectfield';
                field.enableDD = false; //  drag and drop
                field.animate = true; 
                field.border = false;
                field.rootVisible = false;
                field.useArrows = true;
                field.autoScroll = true;
                field.containerScroll = true;
                field.frame = false;
                field.dataUrl = 'ajaxgettreenodes/unit/'+record.unit+'/depth/1';  // TODO change depth depending on level
                field.root = {nodeType: 'async', text:'Tree Root', id:'*', draggable : false}; // root is always '*'                
                               
                
                
                break;    
            default: 
                field.xtype  = 'field';
            break;
        }
       
        field.value = record.value;
        field.fieldLabel = record.label;
        
        return field;
    }
}
);

Ext.reg('editionpage', Genapp.EditionPanel);