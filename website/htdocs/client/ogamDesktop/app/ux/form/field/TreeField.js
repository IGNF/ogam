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
 * @class Genapp.form.TreeField
 * @extends Ext.form.TriggerField
 * @constructor Create a new TreeField
 * @param {Object}
 *            config
 * @xtype treefield
 */


Ext.define('OgamDesktop.ux.form.field.TreeField', {
    extend:'Ext.form.field.ComboBox',
    alias: 'widget.treefield',
	requires:['OgamDesktop.ux.picker.TreePicker'],

	/**
	 * @cfg {Boolean} hideValidationButton if true hide the tree validation
	 *      button (defaults to true).
	 */
	hideValidationButton : false,

	/**
	 * The datastore
	 */
	store : {
		xtype : 'jsonstore',
		autoDestroy : true,
//		remoteSort : true,


		fields : [ {
			name : 'code', // Must be equal to this.valueField
			mapping : 'code'
		}, {
			name : 'label', // Must be equal to this.displayField
			mapping : 'label'
		} ],
		proxy:{
			type:'ajax',
			url : Ext.manifest.OgamDesktop.requestServiceUrl + 'ajaxgettreecodes',
			reader:{
				idProperty : 'code',
				totalProperty : 'results',
				rootProperty : 'rows'
			}
		}
	},
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
	 * The field tree (displayed on a trigger click).
	 * 
	 * @property tree
	 * @type OgamDesktop.picker.TreePicker
	 */
	tree : null,

	triggerAction:'query',
	queryMode:'remote',
	pageSize: 25,

	/**
	 * @cfg {String} baseNodeUrl The URL from which to request a Json string which
	 *      specifies an array of node definition objects representing the child
	 *      nodes to be loaded. 
	 */
	baseNodeUrl : Ext.manifest.OgamDesktop.requestServiceUrl +'ajaxgettreenodes/',

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
		
		// TODO change depth depending on level
		this.nodeUrl = this.baseNodeUrl;
		if (!Ext.isEmpty(this.unit)) {
			this.nodeUrl += 'unit/' + this.unit + '/';
		}
		this.nodeUrl += 'depth/1';

		this.store.getProxy().setExtraParam('unit', this.unit);
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
		var storepiker = Ext.create('OgamDesktop.store.TreeUnit');
		storepiker.proxy.setExtraParam('unit',this.unit);
		storepiker.proxy.setUrl(this.nodeUrl);
		
		this.tree = new OgamDesktop.ux.picker.TreePicker({
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
