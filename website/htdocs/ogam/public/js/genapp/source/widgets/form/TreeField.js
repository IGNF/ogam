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
 * Provides a tree field
 * 
 * @class Genapp.form.TreeField
 * @extends Ext.form.TriggerField
 * @constructor Create a new TreeField
 * @param {Object}
 *            config
 * @xtype treefield
 */

Ext.namespace('Genapp.form');

Genapp.form.TreeField = Ext.extend(Ext.form.ComboBox, {
	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : false,

	/**
	 * The datastore
	 */
	store : {
		xtype : 'jsonstore',
		autoDestroy : true,
		remoteSort : true,
		root : 'rows',
		idProperty : 'code',
		totalProperty : 'results',
		fields : [ {
			name : 'code', // Must be equal to this.valueField
			mapping : 'code'
		}, {
			name : 'label', // Must be equal to this.displayField
			mapping : 'label'
		} ],
		url : Genapp.base_url + 'query/ajaxgettreecodes'
	},

	/**
	 * Value field in the store
	 */
	valueField : 'code',

	/**
	 * Display field in the store,
	 */
	displayField : 'label',

	/**
	 * @cfg {String} emptyText The default text to place into an empty field
	 *      (defaults to 'Select...').
	 */
	emptyText : 'Select...',

	/**
	 * Manage multiple values,
	 */
	multiple : false,

	/**
	 * The field menu (displayed on a trigger click).
	 * 
	 * @property menu
	 * @type Genapp.form.menu.TreeMenu
	 */
	menu : null,

	pageSize : 10,
	listWidth : 300,
	selectOnFocus : true,

	/**
	 * @cfg {String} baseNodeUrl The URL from which to request a Json string which
	 *      specifies an array of node definition objects representing the child
	 *      nodes to be loaded. 
	 */
	baseNodeUrl : Genapp.base_url + 'query/ajaxgettreenodes/',

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Set the submit name of the field
		this.hiddenName = this.name;

		Genapp.form.TreeField.superclass.initComponent.call(this);

		// TODO change depth depending on level
		this.nodeUrl = this.baseNodeUrl;
		if (!Ext.isEmpty(this.unit)) {
			this.nodeUrl += 'unit/' + this.unit + '/';
		}
		this.nodeUrl += 'depth/1';

		this.store.setBaseParam('unit', this.unit);

		// Set the current value to the default value
		this.setValue(this.value);
		
		// Add the default value and its label to the store
		var record = {};
		record[this.valueField] = this.value;
		record[this.displayField] = (this.valueLabel !== undefined) ? this.valueLabel : this.value;
		this.getStore().add(new Ext.data.Record(record));
	},

	/**
	 * The function that handle the trigger's click event. Implements the
	 * default empty TriggerField.onTriggerClick function to display the
	 * TreePicker
	 * 
	 * @method onTriggerClick
	 * @hide
	 */
	onTriggerClick : function() {
		if (this.disabled) {
			return;
		}
		if (!this.menu) {
			this.menu = new Genapp.form.menu.TreeMenu({
				hideOnClick : false,
				hideValidationButton : this.hideValidationButton,
				dataUrl : this.nodeUrl,
				multiple : this.multiple
			});
		}
		this.onFocus();

		this.menu.show(this.el, "tl-bl?");
		this.menuEvents('on');
	},

	// private
	menuEvents : function(method) {
		this.menu[method]('select', this.onSelect, this);
		this.menu[method]('hide', this.onMenuHide, this);
		this.menu[method]('show', this.onFocus, this);
	},

	// private
	onSelect : function(record, index) {
		if (this.fireEvent('beforeselect', this, record, index) !== false) {
			if (!Ext.isEmpty(record)) {
				// Case of an array
				if (record instanceof Array) {
					this.onArraySelect(record, index);
				}
				// Case where the selection is done in the tree
				else if (record instanceof Ext.tree.AsyncTreeNode || record instanceof Ext.tree.TreeNode) {
					if (Ext.isEmpty(this.getStore().getById(record.attributes.id))) {
						var rc = {};
						rc[this.valueField] = record.attributes.id;
						rc[this.displayField] = record.attributes.text;
						this.getStore().add([ new Ext.data.Record(rc) ]);
					}
					this.setValue(record.attributes.id);
				}
				// Case where the selection is done in the list
				else if (record instanceof Ext.data.Record) {
					this.setValue(record.data[this.valueField || this.displayField]);
				} else {
					alert("Type inconnu");
				}
				
			}
			
			if (this.menu) {
				this.menu.hide();
			}			
			this.collapse();			
		}
	},

	// private
	onArraySelect : function(record, index) {
		// Case where the selection is done in the tree
		if (record[0] instanceof Ext.tree.AsyncTreeNode || record[0] instanceof Ext.tree.TreeNode) {
			if (this.menu) {
				this.menu.hide();
			}
			var valueFields = [];
			var displayFields = [];
			for ( var i = 0; i < record.length; i++) {
				var attributes = record[i].attributes;
				valueFields.push(attributes.id);
				displayFields.push(attributes.text);
			}
			this.addArrayToStore(valueFields, displayFields);
			this.setValue(valueFields.toString());
			this.fireEvent('select', this, record, index);
		}
		// Case where the selection is done in the list
		// Not possible for now. Wait for EXTJS4
		else if (record[0] instanceof Ext.data.Record) {
			var valueFields = [];
			var displayFields = [];
			for ( var i = 0; i < record.length; i++) {
				var data = record[i].data;
				valueFields.push(data[this.valueField]);
				displayFields.push(data[this.displayField]);
			}
			this.addArrayToStore(valueFields, displayFields);
			this.setValue(valueFields.toString());
			this.setValue(values);
			this.fireEvent('select', this, record, index);
		}
		
		this.collapse();
		
	},

	// private
	addArrayToStore : function(valueFields, displayFields) {
		if (Ext.isEmpty(this.getStore().getById(valueFields.toString()))) {
			var rc = {};
			rc[this.valueField] = valueFields.toString();
			rc[this.displayField] = displayFields.toString();
			this.getStore().add([ new Ext.data.Record(rc) ]);
		}
	},

	// private
	onMenuHide : function() {
		this.focus(false, 60);
		this.menuEvents('un');
	},

	onDestroy : function() {
		Ext.destroy(this.menu, this.wrap);
		Genapp.form.TreeField.superclass.onDestroy.call(this);
	}

});
Ext.reg('treefield', Genapp.form.TreeField);