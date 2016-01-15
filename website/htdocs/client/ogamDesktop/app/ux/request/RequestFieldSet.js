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
Ext.define('OgamDesktop.ux.request.RequestFieldSet', {
	extend: 'Ext.panel.Panel',
	requires:['Ext.data.JsonStore','OgamDesktop.store.Tree',
	      'OgamDesktop.model.request.object.field.Code',
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
		this.criteriaDS = Ext.data.StoreManager.lookup(this.criteriaDS || 'ext-empty-store');
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
		this.callParent(arguments);

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
	addCriteria :Ext.emptyFn,

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
				fieldValues = this.form.criteriaValues['criteria__' + record.data.name+'[]'];
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
	 * Construct a column for the record
	 * 
	 * @param {Ext.data.Record}
	 *            record The column combobox record to add
	 * @hide
	 */
	getColumnConfig : Ext.emptyFn,
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


	
	setCriteriaDS : function(store) {
		this.criteriaPanel.removeAll();
		this.criteriaDS = store;
		this.criteriaPanel.add(Ext.isEmpty(this.criteriaValues) ? this.getDefaultCriteriaConfig() : this.getFilledCriteriaConfig());
	},
	getCriteriaDS: function() {
		return this.criteriaDS;
	},

	inheritableStatics : {
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
			var cls = this.self || OgamDesktop.ux.request.RequestFieldSet;
//<debug>
			//console.log(record);
//</debug>			
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
			field.name = 'criteria__' + record.name+'[]';

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
				field.uncheckedValue = 0;
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
				//field.unit = record.unit;
				field.store = {
					xtype : 'jsonstore',
					autoDestroy : true,
					remoteSort : true,
					model:'OgamDesktop.model.request.object.field.Code',
					proxy:{
						type:'ajax',
						url : Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxgettreecodes',
						extraParams:{unit:record.unit},
						reader:{
							idProperty : 'code',
							totalProperty : 'results',
							rootProperty : 'rows'
						}
					}};
				field.treePickerStore = Ext.create('OgamDesktop.store.Tree',{
					root :{
						allowDrag : false,
						id : '*'
					},
					proxy:{
						extraParams:{unit:record.unit}
					}});
				break;
			case 'TAXREF':
				field.xtype = 'treefield';
				field.valueLabel = record.valueLabel;
				//field.unit = record.unit;
				field.treePickerColumns = {
				    items: [{
				    	xtype: 'treecolumn',
			            text: "name",
			            dataIndex: "label"
			        },{
			            text: "vernacular",
			            dataIndex: "vernacularName"
			        },{
			        	text: "Reference",
			        	xtype: 'booleancolumn',
			            dataIndex: "isReference",
			            flex:0,
			            witdh:15
			        }],
					defaults : {
						flex : 1
					}
				};
				field.listConfig={
					itemTpl:  [
						'<tpl for=".">',
						'<div>',
							'<tpl if="!Ext.isEmpty(values.isReference) && values.isReference == 0"><i>{label}</i></tpl>',
							'<tpl if="!Ext.isEmpty(values.isReference) && values.isReference == 1"><b>{label}</b></tpl>',
							'<br/>',
							'<tpl if="!Ext.isEmpty(values.vernacularName) && values.vernacularName != null">({vernacularName})</tpl>',
				        '</div></tpl>'
				        ]};
				field.store = {
					xtype : 'jsonstore',
					autoDestroy : true,
					remoteSort : true,
					fields:['code', 'label',
					        'isReference','vernacularName'],//TODO changed to a generate model ?
					proxy:{
						type:'ajax',
						url : Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxgettaxrefcodes',
						extraParams:{unit:record.unit},
						reader:{
							idProperty : 'code',
							totalProperty : 'results',
							rootProperty : 'rows'
						}
					}};
				field.treePickerStore = Ext.create('OgamDesktop.store.Tree',{
					model:'OgamDesktop.model.NodeRef',
					root :{
						allowDrag : false,
						id : '*'
					},
					proxy:{
						type:'ajax',
						url:Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxgettaxrefnodes',
						extraParams:{unit:record.unit}
					}});
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
				}
			};
			return field;
		}
	}
});