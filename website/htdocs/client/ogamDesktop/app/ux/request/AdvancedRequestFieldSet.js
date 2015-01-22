/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

/**
 * Show one field form.
 * 
 * The following parameters are expected : title : The title of the form id :
 * The identifier of the form
 * 
 * @class Genapp.FieldForm
 * @extends Ext.Panel
 * @constructor Create a new FieldForm
 * @param {Object}
 *            config The config object
 */
Ext.define('OgamDesktop.ux.request.AdvancedRequestFieldSet', {
	extend: 'Ext.panel.Panel',
	alias:'widget.advancedrequestfieldset',
	xtype: 'advanced-request-fieldset',
	uses:['Ext.data.JsonStore','OgamDesktop.model.request.object.field.Code',
	      'OgamDesktop.ux.form.field.*'],
	/**
	 * @cfg {Boolean} frame See {@link Ext.Panel#frame}. Default to true.
	 */
	frame : true,
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'genapp-query-field-form-panel').
	 *      This can be useful for adding customized styles to the component or
	 *      any of its children using standard CSS rules.
	 */
	cls : 'genapp-query-field-form-panel',
	
//<locale>
	/**
	 * @cfg {String} criteriaPanelTbarLabel The criteria Panel Tbar Label
	 *      (defaults to <tt>'Criteria'</tt>)
	 */
	criteriaPanelTbarLabel : 'Criteria',
	/**
	 * @cfg {String} criteriaPanelTbarComboLoadingText The criteria Panel Tbar
	 *      Combo Loading Text (defaults to <tt>'searching...'</tt>)
	 */
	criteriaPanelTbarComboLoadingText : 'Searching...',
	/**
	 * @cfg {String} columnsPanelTbarLabel The columns Panel Tbar Label
	 *      (defaults to <tt>'Columns'</tt>)
	 */
	columnsPanelTbarLabel : 'Columns',
	/**
	 * @cfg {String} columnsPanelTbarComboEmptyText The columns Panel Tbar Combo
	 *      Empty Text (defaults to <tt>'Select...'</tt>)
	 */
	columnsPanelTbarComboEmptyText : 'Select...',
	/**
	 * @cfg {String} columnsPanelTbarComboLoadingText The columns Panel Tbar
	 *      Combo Loading Text (defaults to <tt>'searching...'</tt>)
	 */
	columnsPanelTbarComboLoadingText : 'Searching...',
	/**
	 * @cfg {String} columnsPanelTbarAddAllButtonTooltip The columns Panel Tbar
	 *      Add All Button Tooltip (defaults to <tt>'Add all the columns'</tt>)
	 */
	columnsPanelTbarAddAllButtonTooltip : 'Add all the columns',
	/**
	 * @cfg {String} columnsPanelTbarRemoveAllButtonTooltip The columns Panel
	 *      Tbar Remove All Button Tooltip (defaults to
	 *      <tt>'Remove all the columns'</tt>)
	 */
	columnsPanelTbarRemoveAllButtonTooltip : 'Remove all the columns',
//</locale>	
	/**
	 * @cfg {Integer} criteriaLabelWidth The criteria Label Width (defaults to
	 *      <tt>120</tt>)
	 */
	criteriaLabelWidth : 120,

	// private
	initComponent : function() {
		/**
		 * The criteria Data Store.
		 * 
		 * @property criteriaDS
		 * @type Ext.data.JsonStore
		 */
		/*this.criteriaDS = new Ext.data.JsonStore({
			idProperty : 'name',
			fields : [ {
				name : 'name',
				mapping : 'name'
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
				name : 'is_default',
				mapping : 'is_default'
			}, {
				name : 'default_value',
				mapping : 'default_value'
			}, {
				name : 'decimals',
				mapping : 'decimals'
			}, {
				name : 'params',
				mapping : 'params'
			} // reserved for min/max or list of codes
			],
			data : this.criteria
		});*/

		/**
		 * The columns Data Store.
		 * 
		 * @property columnsDS
		 * @type Ext.data.JsonStore
		 */
		/*this.columnsDS = new Ext.data.JsonStore({
			idProperty : 'name',
			fields : [ {
				name : 'name',
				mapping : 'name'
			}, {
				name : 'label',
				mapping : 'label'
			}, {
				name : 'definition',
				mapping : 'definition'
			}, {
				name : 'is_default',
				mapping : 'is_default'
			}, {
				name : 'decimals',
				mapping : 'decimals'
			}, {
				name : 'params',
				mapping : 'params'
			} // reserved for min/max or list of codes
			],
			data : this.columns
		});*/

		/**
		 * The panel used to show the criteria.
		 * 
		 * @property criteriaPanel
		 * @type Ext.Panel
		 */
		this.criteriaPanel = new Ext.panel.Panel({
			layout : {
				type : 'form'
				//labelWidth: 100 // Don't use this parameter because it change the bin width (Bug Ext! Check with ext 5.0.1 post version)
			},
			//hidden : Ext.isEmpty(this.criteriaDS) ? true : false, //FIXME
			hideMode : 'offsets',
			cls : 'o-ux-adrfs-filter-item',
			labelWidth : this.criteriaLabelWidth,
			defaults : {
				labelStyle : 'padding: 0; margin-top:3px',
				beforeLabelTpl : '<div class="filterBin">&nbsp;&nbsp;&nbsp;</div>',
				labelClsExtra : 'columnLabelColor labelNextBin'
				//width : 180 not used in a form layout (Table-row display)
			},
			/* FIXME deprecated ?
			listeners : {
				'add' : function(container, cmp, index) {
					var subName = cmp.name, i = 0, foundComponents, tmpName = '', criteriaPanel = cmp.ownerCt, className = 'first-child';
					if (container.defaultType === 'panel') { // The add event
						// is not only
						// called for
						// the items
						// Add a class to the first child for IE7 layout
						if (index === 0) {
							if (cmp.rendered) {
								cmp.getEl().addClass(className);
							} else {
								if (cmp.itemCls) {
									cmp.itemCls += ' ' + className;
								} else {
									cmp.itemCls = className;
								}
							}
						}
						// Setup the name of the field
						do {
							tmpName = subName + '[' + i++ + ']';
						} while (criteriaPanel.items.findIndex('name', tmpName) !== -1);
						cmp.name = cmp.hiddenName = tmpName;
					}
				},
				scope : this
			},
			*/
			items : Ext.isEmpty(this.criteriaValues) ? this.getDefaultCriteriaConfig() : this.getFilledCriteriaConfig(),
			tbar : [ {
				// Filler
				xtype : 'tbfill'
			},
			// The label
			{
				xtype : 'tbtext',
				text  : this.criteriaPanelTbarLabel
			},{
				// A spacer
				xtype : 'tbspacer'
			}, {
				// The combobox with the list of available criterias
				xtype : 'combo',
				hiddenName : 'Criteria',
				store : this.criteriaDS,
				editable : false,
				displayField : 'label',
				valueField : 'name',
				queryMode : 'local',
				lastQuery: '',
				width : 220,
				maxHeight : 100,
				triggerAction : 'all',
				emptyText : this.criteriaPanelTbarComboEmptyText,
				loadingText : this.criteriaPanelTbarComboLoadingText,
				listeners : {
					scope : this,
					'select' : {
						fn : this.addSelectedCriteria,
						scope : this
					}
				}
			}, {
				// A spacer
				xtype : 'tbspacer'
			} ]
		});

		/**
		 * The panel used to show the columns.
		 * 
		 * @property columnsPanel
		 * @type Ext.Panel
		 */
		this.columnsPanel = new Ext.panel.Panel({
			hidden : Ext.isEmpty(this.columnsDS) ? true : false,
			hideMode : 'offsets',
			items : this.getDefaultColumnsConfig(),
			tbar : [ {
				// The add-all button
				type : 'plus',
				xtype :'tool',
				tooltip : this.columnsPanelTbarAddAllButtonTooltip,
				ctCls : 'genapp-tb-btn',
				iconCls : 'genapp-tb-btn-add',
				handler : this.addAllColumns,
				scope : this
			}, {
				// The remove-all button
				xtype :'tool',
				type : 'minus',
				tooltip : this.columnsPanelTbarRemoveAllButtonTooltip,
				ctCls : 'genapp-tb-btn',
				iconCls : 'genapp-tb-btn-remove',
				handler : this.removeAllColumns,
				scope : this
			}, {
				// Filler
				xtype : 'tbfill'
			},
			// The label
			{
				xtype : 'tbtext',
				text  : this.columnsPanelTbarLabel
			}, {
				// A space
				xtype : 'tbspacer'
			}, {
				// The combobox with the list of available columns
				xtype : 'combo',
				hiddenName : 'Columns',
				store : this.columnsDS,
				editable : false,
				displayField : 'label',
				valueField : 'name',
				queryMode : 'local',
				lastQuery: '',
				width : 220,
				maxHeight : 100,
				triggerAction : 'all',
				emptyText : this.columnsPanelTbarComboEmptyText,
				loadingText : this.columnsPanelTbarComboLoadingText,
				listeners : {
					scope : this,
					'select' : {
						fn : this.addColumn,
						scope : this
					}
				}
			}, {
				xtype : 'tbspacer'
			} ]
		});

		if (!this.items) {
			this.items = [ this.criteriaPanel, this.columnsPanel ];
		}
		this.collapsible = true;
		this.titleCollapse = true;
	
		this.callParent(arguments);
		this.updateLayout();

	},

	/**
	 * Add the selected criteria to the list of criteria.
	 * 
	 * @param {Ext.form.field.ComboBox}
	 *            combo The criteria combobox
	 * @param {Ext.data.Model[]}
	 *            record The criteria combobox record to add
	 * @param {Object}
	 *            The options object passed to Ext.util.Observable.addListener.
	 * @hide
	 */
	addSelectedCriteria : function(combo, records, eOpts) {
		
		if (combo !== null) {
			combo.clearValue();
			combo.collapse();
		}
		// Add the field
		
		for(var i=0, l=records.length;i<l; i++) {
			this.criteriaPanel.add(this.self.getCriteriaConfig(records[i].data));
		}
		//this.criteriaPanel.updateLayout();
	},

	/**
	 * Add the criteria to the list of criteria.
	 * 
	 * @param {String}
	 *            criteriaId The criteria id
	 * @param {String}
	 *            value The criteria value
	 * @return {Object} The criteria object
	 */
	addCriteria : function(criteriaId, value) {
		// Setup the field
		var record = this.criteriaDS.getById(criteriaId);
		record.data.default_value = value;
		// Add the field
		var criteria = this.criteriaPanel.add(this.self.getCriteriaConfig(record.data));
		//this.criteriaPanel.updateLayout();
		return criteria;
	},

	/**
	 * Construct the default criteria
	 * 
	 * @return {Array} An array of the default criteria config
	 */
	getDefaultCriteriaConfig : function() {
		var items = [];
		this.criteriaDS.each(function(record) {
			if (record.data.is_default) {
				// if the field have multiple default values, duplicate the
				// criteria
				var defaultValue = record.data.default_value;
				if (!Ext.isEmpty(defaultValue)) {
					var defaultValues = defaultValue.split(';'), i;
					for (i = 0; i < defaultValues.length; i++) {
						// clone the object
						var newRecord = record.copy();
						newRecord.data.default_value = defaultValues[i];
						// <debug>
						console.log('defaultValues',newRecord.data.default_value);
						console.log(this.items);
						console.log(this.form);
						//</debug>
						this.items.push(this.form.self.getCriteriaConfig(newRecord.data));
					}
				} else {
					this.items.push(this.form.self.getCriteriaConfig(record.data));
				}
			}
		}, {
			form : this,
			items : items
		});
		return items;
	},

	/**
	 * Construct the filled criteria
	 * 
	 * @return {Array} An array of the filled criteria config
	 */
	getFilledCriteriaConfig : function() {
		var items = [];
		this.criteriaDS.each(function(record) {
			var fieldValues, newRecord, i;
			// Check if there are some criteriaValues from the predefined
			// request page
			if (!Ext.isEmpty(this.form.criteriaValues)) {
				fieldValues = this.form.criteriaValues['criteria__' + record.data.name];
				// Check if there are some criteriaValues for this criteria
				if (!Ext.isEmpty(fieldValues)) {
					// Transform fieldValues in array if needed
					if (!Ext.isArray(fieldValues)) {
						fieldValues = [ fieldValues ];
					}
					// Duplicate the criteria if the field have multiple values
					for (i = 0; i < fieldValues.length; i++) {
						newRecord = record.copy();
						newRecord.data.default_value = fieldValues[i];
						this.items.push(this.form.self.getCriteriaConfig(newRecord.data));
					}
				}
			}
		}, {
			form : this,
			items : items
		});
		return items;
	},

	/**
	 * Add the selected column to the column list.
	 * 
	 * @param {Ext.form.ComboBox}
	 *            combo The column combobox
	 * @param {Ext.data.Record[]}
	 *            records The column combobox records to add
	 * @param {Object}
	 *            The options object passed to Ext.util.Observable.addListener.
	 * @hide
	 */
	addColumn : function(combo, records, eOpts) {
		
		if (combo !== null) {
			combo.clearValue();
			combo.collapse();
		}
		
		
		for(var i=0, l=records.length;i<l; i++) {
			if (this.columnsPanel.down('[name=column__' + records[i].data.name+']')=== null) {
				// Add the field
				this.columnsPanel.add(this.getColumnConfig(records[i].data));
				//this.columnsPanel.updateLayout();
			}
		}
	},

	/**
	 * Construct a column for the record
	 * 
	 * @param {Ext.data.Record}
	 *            record The column combobox record to add
	 * @hide
	 */
	getColumnConfig : function(record) {
		var field = {
			xtype : 'container',
			autoEl : 'div',
			width : '100%',
			cls : 'o-ux-adrfs-column-item',
			items : [ {
				xtype : 'box',
				autoEl : {
					tag : 'div',
					cls : 'columnLabelBin columnLabelBinColor',
					html : '&nbsp;&nbsp;&nbsp;&nbsp;'
				},
				listeners : {
					'render' : function(cmp) {
						cmp.getEl().on('click', function(event, el, options) {
							this.columnsPanel.remove(cmp.ownerCt);
						}, this, {
							single : true
						});
					},
					scope : this
				}
			}, {
				xtype : 'box',
				autoEl : {
					tag : 'span',
					cls : 'columnLabel columnLabelColor',
					html : record.label
				},
				listeners : {
					'render' : function(cmp) {
						Ext.QuickTips.register({
							target : cmp.getEl(),
							title : record.label, //Genapp.util.htmlStringFormat(record.label),
							text : record.definition, //Genapp.util.htmlStringFormat(record.definition),
							width : 200
						});
					},
					scope : this
				}
			}, {
				xtype : 'hidden',
				name : 'column__' + record.name,
				value : '1'
			} ]
		};
		return field;
	},

	/**
	 * Construct the default columns
	 * 
	 * @return {Array} An array of the default columns config
	 */
	getDefaultColumnsConfig : function() {
		var items = [];
		this.columnsDS.each(function(record) {
			if (record.data.is_default) {
				this.items.push(this.form.getColumnConfig(record.data));
			}
		}, {
			form : this,
			items : items
		});
		return items;
	},

	/**
	 * Adds all the columns of a column panel
	 */
	addAllColumns : function() {

		if (this.columnsDS) {
			this.addColumn(null, this.columnsDS.getData().items);
		}
		
	},

	/**
	 * Adds all the columns of a column panel
	 */
	removeAllColumns : function() {
		this.columnsPanel.removeAll();
	},

	statics: {
//<locale>		
		/**
		 * @cfg {String} criteriaPanelTbarComboEmptyText The criteria Panel Tbar
		 *      Combo Empty Text (defaults to <tt>'Select...'</tt>)
		 */
		criteriaPanelTbarComboEmptyText : 'Select...',
//</locale>
		/**
		 * @cfg {String} dateFormat The date format for the date fields (defaults to
		 *      <tt>'Y/m/d'</tt>)
		 */
		dateFormat : 'Y/m/d',

		/**
		 * Construct a criteria from the record
		 * 
		 * @param {Ext.data.Record}
		 *            record The criteria combobox record to add. A serialized
		 *            FormField object.
		 * @hide
		 */
		getCriteriaConfig : function(record) {
			var cls = this.self || OgamDesktop.ux.request.AdvancedRequestFieldSet;
			// If the field have multiple default values, duplicate the criteria
			if (!Ext.isEmpty(record.default_value) && Ext.isString(record.default_value) && record.default_value.indexOf(';') !== -1) {
				var fields = [];
				var defaultValues = record.default_value.split(';'), i;
				for (i = 0; i < defaultValues.length; i++) {
					record.default_value = defaultValues[i];
					fields.push(cls.getCriteriaConfig(record));
				}
				return fields;
			}
			var field = {};
			field.name = 'criteria__' + record.name;

			// Creates the ext field config
			switch (record.inputType) {
			case 'SELECT': // The input type SELECT correspond generally to a data
				// type CODE
				field.xtype = 'combo';
				field.formItemCls = 'trigger-field'; // For IE7 layout //TODO needed ?
				field.hiddenName = field.name;
				field.triggerAction = 'all';
				field.typeAhead = true;
				field.displayField = 'label';
				field.valueField = 'code';
				field.emptyText = cls.criteriaPanelTbarComboEmptyText;
				if (record.subtype === 'DYNAMIC') {
					field.queryMode = 'remote';
					field.store = new Ext.data.JsonStore({
						autoDestroy : true,
						autoLoad : true,
						model:'OgamDesktop.model.request.object.field.Code',
						proxy:{
							type: 'ajax',
							url : Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxgetdynamiccodes',
							extraParams : {
								'unit' : record.unit
							},
							reader: {
								rootProperty:'codes'
							}
						}
						
					});
				} else {
					// Subtype == CODE (other possibilities are not available)
					field.queryMode = 'remote';
					field.store = new Ext.data.JsonStore({
						autoDestroy : true,
						autoLoad : true,
						model:'OgamDesktop.model.request.object.field.Code',
						proxy:{
							type: 'ajax',
							url: Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxgetcodes',
							extraParams : {
								'unit' : record.unit
							},
							reader: {
								rootProperty:'codes'
							}
						}
					});
				}
				break;
			case 'DATE': // The input type DATE correspond generally to a data
				// type DATE
				field.xtype = 'daterangefield';
				field.formItemCls = 'trigger-field'; // For IE7 layout
				field.format = cls.dateFormat;
				break;
			case 'NUMERIC': // The input type NUMERIC correspond generally to a data
				// type NUMERIC or RANGE
				field.xtype = 'numberrangefield';
				field.formItemCls = 'trigger-field'; // For IE7 layout
				// If RANGE we set the min and max values
				if (record.subtype === 'RANGE') {
					field.minValue = record.params.min;
					field.maxValue = record.params.max;
					field.decimalPrecision = (record.params.decimals === null) ? 20 : record.params.decimals;
				}
				// IF INTEGER we remove the decimals
				if (record.subtype === 'INTEGER') {
					field.allowDecimals = false;
					field.decimalPrecision = 0;
				}
				break;
			case 'CHECKBOX':
				field.xtype = 'checkbox';
				//field.xtype = 'switch_checkbox'; //FIXME
				//field.ctCls = 'improvedCheckbox';
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
				field.formItemCls = 'trigger-field'; // For IE7 layout
				field.hideDrawPointButton = true;
				field.hideDrawLineButton = true;
				break;
			case 'TREE':
				field.xtype = 'treefield';
				field.valueLabel = record.valueLabel;
				field.unit = record.unit;
				break;
			case 'TAXREF':
				field.xtype = 'taxreffield';
				field.valueLabel = record.valueLabel;
				field.unit = record.unit;
				break;
			default:
				field.xtype = 'field';
				break;
			}
			if (!Ext.isEmpty(record.default_value)) {
				field.value = record.default_value;
			}
			if (!Ext.isEmpty(record.fixed)) {
				field.disabled = record.fixed;
			}
			field.fieldLabel = record.label;

			if (Ext.isEmpty(field.listeners)) {
				field.listeners = {
					scope : this
				};
			}
			field.listeners.render = function(cmp) {
				if (cmp.xtype != 'hidden') {

					// Add the tooltip
					var binCt = cmp.getEl().parent();

					var labelDiv = cmp.getEl().child('.x-form-item-label');
					Ext.QuickTips.register({
						target : labelDiv,
						title : record.label,
						text : record.definition,
						width : 200
					});

					labelDiv.parent().first().on('click', function(event, el, options) {
						cmp.ownerCt.remove(cmp);
					}, this, {
						single : true
					});

					// Refresh the field value after the store load
					// Check if the field is a 'combo' and with a mode set to
					// 'remote'
					if (cmp.xtype === 'combo' && !Ext.isEmpty(cmp.getStore().proxy)) {
						cmp.getStore().on('load', function(store, records, options) {
							this.reset();
						}, cmp)
					}
				}

			};
			//<debug>
			console.log('field', field);
			//</debug>
			return field;
		}
	}
});