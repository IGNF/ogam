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
 * Provides a taxref field.
 * 
 * A taxref is a specialiced kind of tree used for taxonony.
 * 
 * @class Genapp.form.TaxrefField
 * @extends Ext.form.ComboBox
 * @constructor Create a new TaxrefField
 * @param {Object}
 *            config
 * @xtype taxreffield
 */

Ext.namespace('Genapp.form');

Genapp.form.TaxrefField = Ext.extend(Ext.form.ComboBox, {
	
	// Custom rendering template
	tpl :  '<tpl for="."><div class="x-combo-list-item">' + 
			'<tpl if="!Ext.isEmpty(values.isReference) && values.isReference == 0">'+ '<i>{label}</i>' + '</tpl>'+
			'<tpl if="!Ext.isEmpty(values.isReference) && values.isReference == 1">'+ '<b>{label}</b>' + '</tpl>'+
			'<br/>' +
			'<tpl if="!Ext.isEmpty(values.vernacularName) && values.vernacularName != null">'+ '({vernacularName})' + '</tpl>'+
			'<br/>' +
			'<tpl if="!Ext.isEmpty(values.code) && values.code != null">'+ '({code})' + '</tpl>'+
		'</div></tpl>', 
	
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
	 * The field menu (displayed on a trigger click).
	 * 
	 * @property menu
	 * @type Genapp.form.menu.TreeMenu
	 */
	menu : null,

	pageSize : 10,
	listWidth : 300,
	selectOnFocus : true,
	
	
    // Data store
    store: {
        xtype: 'jsonstore',
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
        }, {
            name : 'vernacularName',
            mapping : 'vernacularName'
        }, {
            name : 'isReference',
            mapping : 'isReference'
        }
        ],
        url : Genapp.base_url  + 'query/ajaxgettaxrefcodes'
    },

    baseNodeUrl : Genapp.base_url + 'query/ajaxgettaxrefnodes/',
    
    
    /**
	 * Initialise the component.
	 */
	initComponent : function() {
		
		// Set the submit name of the field
		this.hiddenName = this.name;
		
		Genapp.form.TaxrefField.superclass.initComponent.call(this);
		
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
		
		this.on('select', this.onSelect, this);
	},


    /**
     * The function that handle the trigger's click event. Implements the
     * default empty TriggerField.onTriggerClick function to display the
     * TaxrefPicker
     * 
     * @method onTriggerClick
     * @hide
     */
    onTriggerClick : function() {
        if (this.disabled) {
            return;
        }
        if (!this.menu) {
            /**
             * The field menu (displayed on a trigger click).
             * 
             * @property menu
             * @type Genapp.form.menu.TaxrefMenu
             */
            this.menu = new Genapp.form.menu.TaxrefMenu({
                hideOnClick : false,
                hideValidationButton : this.hideValidationButton,
                dataUrl : this.nodeUrl
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
				// Case where the selection is done in the tree
				if (record instanceof Ext.tree.AsyncTreeNode || record instanceof Ext.tree.TreeNode) {
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
					this.setValue(record.data[this.valueField]);
				} else {
					alert("Type inconnu");
				}
			}
			
			this.collapse();
			if (this.menu) {
				this.menu.hide();
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
		Genapp.form.TaxrefField.superclass.onDestroy.call(this);
	}
	
});
Ext.reg('taxreffield', Genapp.form.TaxrefField);
