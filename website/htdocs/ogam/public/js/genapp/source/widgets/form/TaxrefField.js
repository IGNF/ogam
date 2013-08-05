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
 * @extends Ext.form.TreeField
 * @constructor Create a new TaxrefField
 * @param {Object}
 *            config
 * @xtype taxreffield
 */

Ext.namespace('Genapp.form');

Genapp.form.TaxrefField = Ext.extend(Genapp.form.TreeField, {
	
	// Custom rendering template
	/*
	tpl :  '<tpl for="."><div>' + 
			'<tpl if="!Ext.isEmpty(isReference) && isReference == 0">'+ '<i>{label}</i>' + '</tpl>'+
			'<tpl if="!Ext.isEmpty(isReference) && isReference == 1">'+ '<b>{label}</b>' + '</tpl>'+
			'<tpl if="!Ext.isEmpty(vernacularName) && vernacularName != null">'+ '<br/>({vernacularName})' + '</tpl>'+
        '</div></tpl>',
    */
	
	
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
        }
        /*, {
            name : 'vernacularName',
            mapping : 'vernacularName'
        }, {
            name : 'isReference',
            mapping : 'isReference'
        } */
        ],
        url : Genapp.base_url  + 'query/ajaxgettaxrefcodes'
    },

    baseNodeUrl : Genapp.base_url + 'query/ajaxgettaxrefnodes/',
    
    
    /**
	 * Initialise the component.
	 */
	initComponent : function() {
		
		Genapp.form.TaxrefField.superclass.initComponent.call(this);
		
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
    }
});
Ext.reg('taxreffield', Genapp.form.TaxrefField);