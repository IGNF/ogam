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
	 * @cfg {String} dataId Unique identifier of the data being edited.
	 */
	dataId : '',

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
	padding : 20,
	autoScroll : true,

	// private
	initComponent : function () {
	    this.items = [];
		/**
		 * The form fields Data Store.
		 * 
		 * @property criteriaDS
		 * @type Ext.data.JsonStore
		 */
		this.formDS = new Ext.data.JsonStore({
			url : Genapp.base_url + 'dataedition/ajaxgeteditform/' + this.dataId,
			method : 'POST',
			autoLoad : true,
			fields : [ {
				name : 'name',
				mapping : 'name'
			}, {
				name : 'data',
				mapping : 'data'
			}, {
				name : 'format',
				mapping : 'format'
			}, {
				name : 'label',
				mapping : 'label'
			}, {
				name : 'inputType',
				mapping : 'inputType'
			}, {
				name : 'unit',
				mapping : 'unit'
			}, {
				name : 'type',
				mapping : 'type'
			}, {
				name : 'subtype',
				mapping : 'subtype'
			}, {
				name : 'definition',
				mapping : 'definition'
			}, {
				name : 'decimals',
				mapping : 'decimals'
			}, {
				name : 'value',
				mapping : 'value'
			}, // the current value
			{
				name : 'editable',
				mapping : 'editable'
			}, // is the field editable?
			{
				name : 'params',
				mapping : 'params'
			} // reserved for min/max or list of codes
			],
			idProperty : 'name',
			listeners : {
				'load' : {
					fn : function(store, records, options) {
						var i, formItems = [];
						
						for (i = 0; i < 1/*records.length*/; i++) {
							// alert(records[i].data);
							formItems.push(this.getFieldConfig(records[i].data, true));
						}
						console.log(formItems);
						this.dataEditFS.add(formItems);
						this.dataEditForm.doLayout();
					}
				},
				scope : this
			}

		});

		this.headerPanel = new Ext.BoxComponent({
			html : this.contentTitle
		});
		this.messagePanel = new Ext.BoxComponent({
			html : this.message,
			cls : 'message'
		});
		if(!Ext.isEmpty(this.parentsLinks)){
		    this.parentsFS = new Ext.form.FieldSet({
	            title : '&nbsp;Parents Summary&nbsp;',
	            html : this.parentsLinks
	        });
		    this.items.push(this.parentsFS);
		}
		this.dataEditFS = new Ext.form.FieldSet({
			title : '&nbsp;' + this.dataTitle + '&nbsp;',
			labelWidth : 150,
			defaults : {
				msgTarget : 'side',
				width : 250
			},
			buttonAlign : 'center',
			buttons : [ {
				text : 'Supprimer',
				disabled : this.disableDeleteButton,
				tooltip : this.deleteButtonTooltip,
				handler : this.deleteData,
				scope : this
			}, {
				text : 'Valider',
				tooltip: 'Click here to save changes',
				handler : this.editData,
				scope : this
			} ]
		});
		var childrenItems = [];
		for ( var i in this.childrenConfigOptions) {
			if (typeof this.childrenConfigOptions[i] !== 'function') {
			    var cCO = this.childrenConfigOptions[i];
			    var addChildButton = cCO['buttons'][0];
			    addChildButton.handler = function(){document.location = Genapp.base_url + 'dataedition/show-add-data/' + this.dataId;}
			    addChildButton.scope = this;
			    console.log('cCO',cCO);
				childrenItems.push(new Ext.form.FieldSet(cCO));
			}
		}
		this.childrenFS = new Ext.form.FieldSet({
			title : '&nbsp;Children Summary&nbsp;',
			items : childrenItems
		});
		
		
		this.dataEditForm = new Ext.FormPanel({
		    items : this.dataEditFS
		}); 
		
		this.items.push(this.headerPanel);
		this.items.push(this.dataEditForm);
		this.items.push(this.childrenFS);

		Genapp.EditionPanel.superclass.initComponent.call(this);
	},

	/**
	 * Construct a FieldForm from the record
	 * 
	 * @param {Ext.data.Record}
	 *            record The criteria combobox record to add
	 * @param {Boolean}
	 *            hideBin True to hide the bin
	 * @hide
	 */
	getFieldConfig : function(record, hideBin) {
		var field = {};
		field.name = record.name;

		// Creates the ext field config
		switch (record.inputType) {
		case 'SELECT': // The input type SELECT correspond generally to a data
						// type CODE
			field.xtype = 'combo';
			field.itemCls = 'trigger-field'; // For IE7 layout
			field.hiddenName = field.name;
			field.triggerAction = 'all';
			field.typeAhead = true;
			field.displayField = 'label';
			field.valueField = 'code';
			field.emptyText = Genapp.FieldForm.prototype.criteriaPanelTbarComboEmptyText;
			if (record.subtype === 'DYNAMIC') {
				field.mode = 'remote';
				field.store = new Ext.data.JsonStore({
					root : 'codes',
					idProperty : 'code',
					fields : [ {
						name : 'code',
						mapping : 'code'
					}, {
						name : 'label',
						mapping : 'label'
					} ],
					url : 'ajaxgetdynamiccodes',
					baseParams : {
						'unit' : record.unit
					}
				});
			} else {
				field.mode = 'local';
				field.store = new Ext.data.ArrayStore({
					fields : [ 'code', 'label' ],
					data : record.params.options
				});
			}
			break;
		case 'DATE': // The input type DATE correspond generally to a data
						// type DATE
			field.xtype = 'datefield';
			field.itemCls = 'trigger-field'; // For IE7 layout
			field.format = Genapp.FieldForm.prototype.dateFormat;
			break;
		case 'NUMERIC': // The input type NUMERIC correspond generally to a data
						// type NUMERIC or RANGE
			field.xtype = 'numberfield';
			field.itemCls = 'trigger-field'; // For IE7 layout
			// If RANGE we set the min and max values
			if (record.subtype === 'RANGE') {
				field.decimalPrecision = (record.params.decimals == null) ? 20 : record.params.decimals;
			}
			// IF INTEGER we remove the decimals
			if (record.subtype === 'INTEGER') {
				field.allowDecimals = false;
				field.decimalPrecision = 0;
			}
			break;
		case 'CHECKBOX':
			field.xtype = 'switch_checkbox';
			field.ctCls = 'improvedCheckbox';
			switch (record.default_value) {
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
			// field.boxLabel = record.label;
			break;
		case 'RADIO':
		case 'TEXT':
			switch (record.subtype) {
			// TODO : BOOLEAN, COORDINATE
			case 'INTEGER':
				field.xtype = 'numberfield';
				field.allowDecimals = false;
				break;
			case 'NUMERIC':
				field.xtype = 'numberfield';
				break;
			default: // STRING
				field.xtype = 'textfield';
				break;
			}
			break;
		case 'GEOM':
			field.xtype = 'geometryfield';
			field.itemCls = 'trigger-field'; // For IE7 layout
			break;
		case 'TREE':
			field.xtype = 'treefield';
			field.dataUrl = 'ajaxgettreenodes/unit/' + record.unit + '/depth/1'; // TODO
																					// change
																					// depth
																					// depending
																					// on
																					// level
			break;
		default:
			field.xtype = 'field';
			break;
		}
		if (!Ext.isEmpty(record.value)) {
			field.value = record.value;
		}
		if (!Ext.isEmpty(record.editable)) {
			field.disabled = record.editable;
		}

		if (!Ext.isEmpty(record.definition)) {
			field.tooltip = record.definition;
			// see http://www.rowlandsgroup.com/blog/tooltips-form-fields
			// http://www.sencha.com/forum/showthread.php?28293-Tooltip-not-getting-displayed-FormPanel
		}

		field.fieldLabel = record.label;

		return field;
	},

	/**
	 * Submit the form to save the edited data
	 */
	editData : function() {
		this.dataEditForm.getForm().submit({
			url : Genapp.ajax_query_url + 'ajax-validate-edit-data',
			timeout : 480000,
			success : this.editSuccess,
			failure : this.editFailure,
			scope : this
		});
	}
});

Ext.reg('editionpage', Genapp.EditionPanel);