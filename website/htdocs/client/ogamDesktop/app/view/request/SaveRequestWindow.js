/**
 * This class defines the save request window view.
 */
Ext.define('OgamDesktop.view.request.SaveRequestWindow',{
	extend: 'Ext.window.Window',
	xtype: 'save-request-window',
	requires: [
        'OgamDesktop.store.request.predefined.Group',
        'OgamDesktop.view.request.SaveRequestWindowController',
        'Ext.form.Panel'
    ],
	controller: 'saverequestwindow',
	resizable: true,
	title: 'Sauvegarder la requête',
	dockedItems: [{
	    xtype: 'toolbar',
	    dock: 'bottom',
	    items: [{
			itemId: 'CancelButton',
			xtype: 'button',
			text: 'Cancel',
			tooltip : 'Cancel the request'
		},'->',{
			itemId: 'SaveButton',
			xtype: 'button',
			text: 'Save',
			tooltip : 'Save the request'
		},{
			itemId: 'SaveAndDisplayButton',
			xtype: 'button',
			text: 'Save and Display',
			tooltip : 'Save and Display the request'
		}]
	}],
	requestId : null,

	/**
	 * Initializes the items.
	 */
	initItems: function(){
		this.items = new Ext.form.Panel({ // Can't be created with xtype='formpanel'...
			xtype: 'formpanel',
			itemId:'SaveForm',
			defaults: {
				margin: '10 10 10 10',
				padding: '10 10 10 10'
			},
			items: [{
				xtype: 'fieldset',
				title: 'Sélection de la requête',
				items: [{
		            xtype      : 'fieldcontainer',
		            defaultType: 'radiofield',
		            defaults: {
		                flex: 1
		            },
		            layout: 'vbox',
		            items: [{
		            	itemId    : 'createRadioField',
	                    boxLabel  : 'Créer une nouvelle requête',
	                    name      : 'savingType',
	                    inputValue: 'CREATION',
	                    margin: '0 20px 0 0',
	                    checked   : true
	                },{
	                    itemId    : 'editRadioField',
	                    boxLabel  : 'Modifier une requête existante',
	                    name      : 'savingType',
	                    inputValue: 'EDITION'
	                },{
	                	itemId: 'requestCombo',
	                	disabled: true,
						xtype: 'combo',
						name: 'requestId',
						fieldLabel: 'Requête',
						allowBlank: false,
						width: 500,
			    		store: new OgamDesktop.store.request.predefined.PredefinedRequest({
			    			storeId: 'SaveRequestWindowRequestComboStore'
    					}),
			    		emptyText: 'Sélectionner...',
			    		queryMode: 'local',
			    		displayField: 'label',
			    		valueField: 'request_id'
			    	}]
		        }]
		    },{
				xtype: 'fieldset',
				title: 'Informations sur la requête',
				defaults: {
	                width: 500
	            },
				items: [{
					itemId: 'groupCombo',
					xtype: 'combo',
					name      : 'groupId',
					fieldLabel: 'Groupe *',
					allowBlank: false,
					emptyText: 'Sélectionner...',
		    		store: new OgamDesktop.store.request.predefined.Group(),
		    		queryMode: 'local',
		    		displayField: 'label',
		    		valueField: 'group_id'
		    	},{
		    		itemId: 'labelTextField',
					xtype: 'textfield',
					name      : 'label',
					fieldLabel: 'Libellé *',
					allowBlank: false
				},{
					itemId: 'definitionTextField',
			        xtype     : 'textareafield',
			        name      : 'definition',
			        fieldLabel: 'Description'
			    },{
		            xtype      : 'fieldcontainer',
		            fieldLabel : 'Portée',
		            defaultType: 'radiofield',
		            width: 300,
		            defaults: {
		                flex: 1
		            },
		            layout: 'hbox',
		            items: [
		                {
		                    itemId: 'privateRadioField',
		                    boxLabel  : 'Privée',
		                    name      : 'isPublic',
		                    inputValue: false,
		                    checked   : true
		                },{
		                	itemId: 'publicRadioField',
		                    boxLabel  : 'Publique',
		                    name      : 'isPublic',
		                    inputValue: true
		                }
		            ]
		        }]
			}]
		});
		
		this.callParent(arguments);
	}
});