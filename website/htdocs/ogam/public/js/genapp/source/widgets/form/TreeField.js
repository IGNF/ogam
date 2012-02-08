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
	store : null,

	/**
	 * Value field in the store
	 */
	valueField : 'code',

	/**
	 * Display field in the store,
	 */
	displayField : 'label',

	/**
     * @cfg {String} emptyText The default text to place into an empty field (defaults to 'Select...').
     */
    emptyText : 'Select...',

	/**
	 * Manage multiple values,
	 */
	muliple : false,

	/**
	 * The field menu (displayed on a trigger click).
	 * 
	 * @property menu
	 * @type Genapp.form.menu.TreeMenu
	 */
	menu : null,

	/**
     * @cfg {String} nodeUrl The URL from which to request a Json string which
     * specifies an array of node definition objects representing the child nodes
     * to be loaded. (see dataUrl in Ext.tree.TreeLoader)
     */

	pageSize: 10,
	listWidth: 300,
	selectOnFocus: true,

	/**
	 * Initialise the component.
	 */
	initComponent : function() {

		// Create the datastore
		this.store = new Ext.data.JsonStore({
            autoDestroy : true,
            remoteSort : true,
            root : 'rows',
            idProperty : 'code',
            totalProperty: 'results',
            fields : [ {
                name : 'code',
                mapping : 'code'
            }, {
                name : 'label',
                mapping : 'label'
            } ],
            url : this.codeUrl,
            baseParams : {
                'unit' : this.unit
            }
        });

		// Set the submit name of the field
		this.hiddenName = this.name;

		// Add the default value to the store
		this.getStore().add([ new Ext.data.Record({
			code : this.value,
			label : this.valueLabel
		}) ]);

		// Set the current value to the default value
		this.setValue(this.value);

		Genapp.form.TreeField.superclass.initComponent.call(this);
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
	onSelect : function(record, index) {console.log(record)
        if(this.fireEvent('beforeselect', this, record, index) !== false){
    	    if (!Ext.isEmpty(record)){
    	        // Case where the selection is done in the tree
    	        if (record instanceof Ext.tree.AsyncTreeNode
    	                || record instanceof Ext.tree.TreeNode) {
            		if(this.menu){
            		    this.menu.hide();
            		}
        			if (record instanceof Array) {
        				var valueId = [];
        				for ( var i = 0; i < record.length; i++) {
        					var attributes = record[i].attributes;
        					if(Ext.isEmpty(this.getStore().getById(attributes.id))){
            					this.getStore().add([ new Ext.data.Record({
            						code : attributes.id,
            						label : attributes.text
            					}) ]);
        					}
        					valueId.push(attributes.id);
        				}
        				this.setValue(valueId);
        				this.collapse();
                        this.fireEvent('select', this, record, index);
        			} else {
        			    if(Ext.isEmpty(this.getStore().getById(record.attributes.id))){
            				this.getStore().add([ new Ext.data.Record({
            					code : record.attributes.id,
            					label : record.attributes.text
            				}) ]);
        			    }
        				this.setValue(record.attributes.id);
        				this.collapse();
                        this.fireEvent('select', this, record, index);
            		}
        	    }
    	        // Case where the selection is done in the list
    	        if(record instanceof Ext.data.Record) {
    	            this.setValue(record.data[this.valueField || this.displayField]);
    	            this.collapse();
    	            this.fireEvent('select', this, record, index);
        	    }
    	    }
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