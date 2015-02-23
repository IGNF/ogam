/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * Ã‚Â© European Union, 2008-2012
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
 * @class OgamDesktop.ux.form.field.Tree
 * @extends Ext.form.field.ComboBox
 * @constructor Create a new tree field
 * @param {Object}
 *            config
 * @xtype treefield
 */


Ext.define('OgamDesktop.ux.form.field.Tree', {
    extend:'Ext.form.field.ComboBox',
    alias: 'widget.treefield',
	requires:['OgamDesktop.ux.picker.Tree'],

	/**
	 * @cfg {Boolean} hideValidationButton if true hide the tree validation
	 *      button (defaults to true).
	 */
	hideValidationButton : false,

	triggers:{
		'tree':{
			handler:'onTreeTriggerClick',
			scope:'this'
		}
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
	 * @cfg {Ext.grid.column.Column[]/Object} treePickerColumns 
	 * array of column definition objects which define all columns that appear in this
     * tree
	 * @see Ext.tree.Panel.columns
	 */
	/**
	 * @cfg {Ext.data.store/Object} treePickerStore
	 * the store the tree should useas it data source 
	 */
	
	/**
	 * The field tree (displayed on a trigger click).
	 * 
	 * @property tree
	 * @type OgamDesktop.ux.picker.Tree
	 */
	tree : null,

	triggerAction:'query',
	queryMode:'remote',
	pageSize: 25,

	/**
	 * @cfg {bool} hidePickerTrigger Hide the picker trigger on the first render
	 * default to true
	 */
	hidePickerTrigger:true,
	
	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Set the submit name of the field
		this.hiddenName = this.name;

		this.callParent();
		this.getTrigger('picker').setHidden(this.hidePickerTrigger);
		
	},

	/**
	 * The function that handle the trigger's click event. Implements the
	 * default empty TriggerField.onTriggerClick function to display the
	 * TreePicker
	 * 
	 * @method onTreeTriggerClick
	 * @hide
	 */
	onTreeTriggerClick : function() {
		if (this.disabled) {
			return;
		}

		if (!this.tree) {
			this.createTreePicker();
		}
        var me = this,
        picker = me.tree,
        store = picker.store,
        value = me.value,
        node;
        
		if (!me.readOnly && !me.disabled) {
			if(picker.isVisible()){
				picker.hide();
			} else {
			    if (value) {
			        node = store.getNodeById(value);
			    }
		
			    if (!node) {
			        node = store.getRoot();
			    }
		
			    picker.selectPath(node.getPath());
			    picker.showBy(this.el, "tl-bl?");
			}
		}
	},

	createTreePicker:function(){
		var storepiker = this.treePickerStore;
		
		this.tree = new OgamDesktop.ux.picker.Tree({
			columns:this.treePickerColumns,
			hideOnClick : false,
			hideValidationButton : this.hideValidationButton,
			store:storepiker,
			floating: true,
			focusable:false,
			multiple : this.multiple
		});
		this.mon(this.tree,{
			choicemake:this.onTreeChoice,
			scope: this});
		return this.tree;
	},

	// private
	onTreeChoice : function(view, record) {

		this.setValue(record);
		this.fireEvent('select', this, record);
		if (this.tree) {
			this.tree.hide();
		}		
		
	},

	beforeDestroy: function(){
		if(this.tree) {
			this.tree.hide();
		}
		this.callParent();
	},

	onDestroy : function() {
		Ext.destroy(this.tree, this.wrap);
		this.callParent();
	}
	
});
