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

	/**
	 * @cfg {String} parentsFSTitle The parents FieldSet Title (defaults to
	 *      'Parents Summary').
	 */
	parentsFSTitle : 'Parents Summary',
	/**
	 * @cfg {String} dataEditFSDeleteButtonText The data Edit FieldSet Delete
	 *      Button Text (defaults to 'Delete').
	 */
	dataEditFSDeleteButtonText : 'Delete',
	/**
	 * @cfg {String} dataEditFSDeleteButtonTooltip The data Edit FieldSet Delete
	 *      Button Tooltip (defaults to 'Delete the data (Disabled if exist
	 *      children)').
	 */
	dataEditFSDeleteButtonTooltip : 'Delete the data (Disabled if exist children)',
	/**
	 * @cfg {String} dataEditFSValidateButtonText The data Edit FieldSet
	 *      Validate Button Text (defaults to 'Validate').
	 */
	dataEditFSValidateButtonText : 'Validate',
	/**
	 * @cfg {String} dataEditFSValidateButtonTooltip The data Edit FieldSet
	 *      Validate Button Tooltip (defaults to 'Save changes').
	 */
	dataEditFSValidateButtonTooltip : 'Save changes',
	/**
	 * @cfg {String} childrenFSTitle The children FieldSet Title (defaults to
	 *      'Children Summary').
	 */
	childrenFSTitle : 'Children Summary',
	/**
	 * @cfg {String} childrenFSAddNewChildButtonText The children FieldSet Add
	 *      New Child Button Text (defaults to 'New child').
	 */
	childrenFSAddNewChildButtonText : 'Add',
	/**
	 * @cfg {String} childrenFSAddNewChildButtonTooltip The children FieldSet
	 *      Add New Child Button Tooltip (defaults to 'Add a new child').
	 */
	childrenFSAddNewChildButtonTooltip : 'Add a new child',
	/**
	 * @cfg {String} contentTitleAddPrefix The content Title Add Prefix
	 *      (defaults to 'Add').
	 */
	contentTitleAddPrefix : 'Add',
	/**
	 * @cfg {String} contentTitleEditPrefix The content Title Edit Prefix
	 *      (defaults to 'Edit').
	 */
	contentTitleEditPrefix : 'Edit',
	/**
	 * @cfg {String} tooltipEditPrefix The tooltip Edit Prefix (defaults to
	 *      'Edit the').
	 */
	tipEditPrefix : 'Edit the',
	/**
	 * @cfg {Numeric} tipDefaultWidth The tip Default Width (defaults to '400').
	 */
	tipDefaultWidth : 350,
	/**
	 * @cfg {String} addMode The constant for the add mode (defaults to 'ADD').
	 */
	addMode : 'ADD',
	/**
	 * @cfg {String} editMode The constant for the edit mode (defaults to
	 *      'EDIT').
	 */
	editMode : 'EDIT',

	layout : 'column',

	// private
	initComponent : function() {

		// Header
		var contentTitlePrefix = '';
		var getFormURL = '';
		switch (this.mode) {
		case this.addMode:
			contentTitlePrefix = this.contentTitleAddPrefix + '&nbsp';
			getFormURL = Genapp.base_url + 'dataedition/ajax-get-add-form/' + this.dataId;
			break;
		case this.editMode:
			contentTitlePrefix = this.contentTitleEditPrefix + '&nbsp';
			getFormURL = Genapp.base_url + 'dataedition/ajax-get-edit-form/' + this.dataId;
			break;
		}

		/**
		 * The form fields Data Store.
		 * 
		 * @property criteriaDS
		 * @type Ext.data.JsonStore
		 */
		this.formDS = new Ext.data.JsonStore({
			url : getFormURL,
			method : 'POST',
			root : 'data',
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
				name : 'valueLabel',
				mapping : 'valueLabel'
			}, // the label of the current value
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

						for (i = 0; i < records.length; i++) {
							formItems.push(this.getFieldConfig(records[i].data, true));
						}
						this.dataEditForm.add(formItems);
						this.dataEditForm.doLayout();
					}
				},
				scope : this
			}

		});

		var centerPanelItems = [];

		this.headerPanel = new Ext.BoxComponent({
			html : '<h1>' + contentTitlePrefix + this.dataTitle.toLowerCase() + '<h1>'
		});
		centerPanelItems.push(this.headerPanel);

		// Message
		this.messagePanel = new Ext.BoxComponent({
			html : this.message,
			cls : 'message'
		});
		centerPanelItems.push(this.messagePanel);

		// Parents
		if (!Ext.isEmpty(this.parentsLinks)) {
			this.parentsFS = new Ext.form.FieldSet({
				title : '&nbsp;' + this.parentsFSTitle + '&nbsp;',
				html : this.getEditLinks(this.parentsLinks)
			});
			centerPanelItems.push(this.parentsFS);
		}

		// Data
		this.dataEditForm = new Ext.FormPanel({
			border : false,
			url : Genapp.ajax_query_url + 'ajax-validate-edit-data',
			labelWidth : 200,
			defaults : {
				msgTarget : 'side',
				width : 250
			},
			buttonAlign : 'center',
			buttons : [ {
				text : this.dataEditFSDeleteButtonText,
				disabled : this.disableDeleteButton,
				tooltip : this.dataEditFSDeleteButtonTooltip,
				handler : this.deleteData,
				scope : this
			}, {
				text : this.dataEditFSValidateButtonText,
				tooltip : this.dataEditFSValidateButtonTooltip,
				handler : this.editData,
				scope : this
			} ]
		});
		this.dataEditFS = new Ext.form.FieldSet({
			title : '&nbsp;' + this.dataTitle + '&nbsp;',
			items : this.dataEditForm
		});
		centerPanelItems.push(this.dataEditFS);

		// Children
		if (!Ext.isEmpty(this.childrenConfigOptions)) {
			var childrenItems = [];
			for ( var i in this.childrenConfigOptions) {
				if (typeof this.childrenConfigOptions[i] !== 'function') {
					var cCO = this.childrenConfigOptions[i];
					// title
					cCO['title'] = '&nbsp;' + cCO['title'] + '&nbsp;';

					// html
					if (Ext.isEmpty(cCO['html'])) {
						cCO['html'] = this.getEditLinks(cCO['childrenLinks']);
						delete cCO['childrenLinks'];
					}

					// buttons
					cCO['buttons'] = [];
					cCO['buttons'][0] = {
						text : this.childrenFSAddNewChildButtonText,
						tooltip : this.childrenFSAddNewChildButtonTooltip,
						handler : (function(location) {
							document.location = location;
						}).createCallback(cCO['AddChildURL']),
						scope : this
					};
					childrenItems.push(new Ext.form.FieldSet(cCO));
				}
			}
			this.childrenFS = new Ext.form.FieldSet({
				title : '&nbsp;' + this.childrenFSTitle + '&nbsp;',
				items : childrenItems
			});
			centerPanelItems.push(this.childrenFS);
		}

		this.items = [ {
			xtype : 'box',
			html : '&nbsp;',
			columnWidth : .5,
			border : false
		}, {
			items : centerPanelItems,
			width : 500,
			border : false,
			defaults : {
				width : 500
			}
		}, {
			xtype : 'box',
			html : '&nbsp;',
			columnWidth : .5,
			border : false
		} ];

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
		case 'SELECT':
			// The input type SELECT correspond to a data type CODE or ARRAY
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

				// Fill the list of codes / labels for default values
				var codes = [];
				if (record.type === 'CODE') {
					codes.push({
						code : record.value,
						label : record.valueLabel
					});
				} else { // case of ARRAY
					if (record.valueLabel) {
						for ( var i = 0; i < record.value.length; i++) {
							codes.push({
								code : record.value[i],
								label : record.valueLabel[i]
							});
						}
					}
				}

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
					url : Genapp.base_url + '/query/ajaxgetdynamiccodes',
					baseParams : {
						'unit' : record.unit
					},
					data : {
						codes : codes
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
			field.valueLabel = record.valueLabel;
			// TODO : change depth depending on level
			field.dataUrl = Genapp.base_url + '/query/ajaxgettreenodes/unit/' + record.unit + '/depth/1';
			break;
		case 'TAXREF':
			field.xtype = 'taxreffield';
			field.valueLabel = record.valueLabel;
			// TODO : change depth depending on level
			field.dataUrl = Genapp.base_url + '/query/ajaxgettreenodes/unit/' + record.unit + '/depth/1';
			break;
		default:
			field.xtype = 'field';
			break;
		}
		if (!Ext.isEmpty(record.value)) {
			field.value = record.value;
		}
		if (!Ext.isEmpty(record.editable) && record.editable == false) {
			field.readOnly = true;
			field.fieldClass = "x-item-disabled";
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
		Ext.Ajax.request({
			form : this.dataEditForm.getForm().getEl(),
			url : Genapp.ajax_query_url + 'ajax-validate-edit-data',
			timeout : 480000,
			success : this.editSuccess,
			failure : this.editFailure,
			scope : this
		});
	},

	/**
	 * Delete the data
	 */
	deleteData : function() {
		Ext.Ajax.request({
			url : Genapp.ajax_query_url + 'ajax-delete-data',
			success : this.editSuccess,
			failure : this.editFailure,
			params : {
				dataId : this.dataId
			},
			scope : this
		});
	},

	/**
	 * Ajax success common function
	 */
	editSuccess : function(response, opts) {
		var obj = Ext.decode(response.responseText);
		if (!Ext.isEmpty(obj.message)) {
			this.messagePanel.update(obj.message);
		}
		if (!Ext.isEmpty(obj.errorMessage)) {
			this.messagePanel.update(obj.errorMessage);
			console.log('Server-side failure with status code (1): ' + response.status);
			console.log('errorMessage : ' + response.errorMessage);
		}
	},

	/**
	 * Ajax failure common function
	 */
	editFailure : function(response, opts) {
		console.log(response);
		var obj = Ext.decode(response.responseText);
		if (!Ext.isEmpty(obj.errorMessage)) {
			this.messagePanel.update(obj.errorMessage);
		}
		console.log('Server-side failure with status code (2): ' + response.status);
		console.log('errorMessage : ' + response.errorMessage);
	},

	/**
	 * Generate the html links
	 * 
	 * @param {Object}
	 *            links A links object
	 * @return {String} The html links
	 */
	getEditLinks : function(links) {
		var html = '', tipContent;
		for ( var i in links) {
			if (typeof links[i] !== 'function') {
				var tipTitle = this.tipEditPrefix + '&nbsp' + links[i].text.toLowerCase() + ' :';
				tipContent = '';
				for ( var data in links[i].fields) {
					var value = links[i].fields[data];
					if (typeof value !== 'function') {
						value = Ext.isEmpty(value) ? ' -' : value;
						tipContent += '<b>' + data + ' : </b>' + value + '</br>';
					}
				}
				html += '<a href="' + links[i].url + '" ' + 'ext:qtitle="<u>' + tipTitle + '</u>" ' + 'ext:qwidth="' + this.tipDefaultWidth + '" '
						+ 'ext:qtip="' + tipContent + '" ' + '>' + links[i].text + '</a><br/>';
			}
		}
		return html;
	}
});

Ext.reg('editionpage', Genapp.EditionPanel);