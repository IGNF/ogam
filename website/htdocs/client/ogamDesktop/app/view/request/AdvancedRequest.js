/**
 * This class defines the advanced request view.
 * 
 * TODO: Refactor this code for the next version
 * @deprecated
 */
Ext.define('OgamDesktop.view.request.AdvancedRequest', {
	extend: 'OgamDesktop.view.request.MainWin',
	alias: 'widget.advanced-request',
	xtype: 'advanced-request',
	requires: [
		'OgamDesktop.view.request.AdvancedRequestController',
		'OgamDesktop.view.request.AdvancedRequestModel',
		'Ext.form.field.ComboBox'
	],
	controller: 'advancedrequest',
	viewModel: {
		type: 'advancedrequest'
	},
	session: {},
	layout: 'border',
	bbar:[{ //TODO: Put this button into the loading popup (create on the submit event a Ext.window.MessageBox with a button for that).
		itemId:'CancelButton',
		reference:'cancelButton',
		type: 'button'
  	},'-',{
  		itemId:'ResetButton',
  		reference:'resetButton',
  		type: 'button'
  	},{
  		xtype: 'tbspacer',
  		flex: 1
  	},{
  		itemId:'SubmitButton',
  		reference:'submitButton',
  		type: 'button',
  		action: 'submit'
  	}],

	locales:{
		buttons:{
			submit:{
				text : 'Launch',
				tooltip : 'Launch the request'
			},
			cancel:{
				text : 'Cancel',
				tooltip : 'Cancel the request'
			},
			reset :{
				text : 'Reset',
				tooltip : 'Reset the request form'
			}
		}
	},

	/**
	 * @cfg String/object [requestSelectTitle] title for the advance request selector
	 * @see Ext.panael.panel.title
	 * @default '<b>Forms Panel</b>'
	 */
	requestSelectTitle:'<b>Forms Panel</b>',
	/**
	 * @cfg String/object [processPanelTitle] title for the process panel
	 * @see Ext.panael.panel.title
	 * @default 'Dataset'
	 */
	processPanelTitle:'Dataset',

	/**
	 * @cfg string [processCBEmptyText] the processcomboBox empty text
	 */
	processCBEmptyText:'Please select a dataset...',
	
	/**
	 * Initializes the component.
	 */
	initComponent:function(){

		this.callParent(arguments);

		// Locales
		Ext.apply(this.lookupReference('cancelButton'), this.locales.buttons.cancel);
		Ext.apply(this.lookupReference('resetButton'), this.locales.buttons.reset);
		Ext.apply(this.lookupReference('submitButton'), this.locales.buttons.submit);
	},

	/**
	 * Initializes the items.
	 */
	initItems:function(){
		this.items=[{ // The advanced request selector	
		xtype:'advanced-request-selector',
		itemId: 'advancedRequestSelector',
		reference:'advancedRequestSelector',
		layout : 'auto',
		autoScroll : true,
		margin : '5 0 5 0',
		title : this.requestSelectTitle,
		bind: {
			criteriaValues:'{userchoices}',
			store: '{fieldsets}'
		},
		region : 'center'
		/*keys : { //FIXME
			key : Ext.EventObject.ENTER,
			fn : this.submitRequest,
			scope : this
		}*/
	},{ // The process panel
		xtype: 'panel',
		region : 'north',
		frame : true,
		margins : '10 0 5 0',
		height: 60,
		title: this.processPanelTitle,
		layout: 'fit',
		tools:[{
			type:'help',
			tooltipType:'title',
			bind:{
				tooltip:{
					anchor: 'left',
					title: '{currentProcess.label}',
					text: '{currentProcess.definition}'
				}
			}
		}],
		items: [{ // The process combobox
			xtype: 'combobox',
			itemId: 'processComboBox',
			name : 'datasetId',
			hiddenName : 'datasetId',
			reference:'processComboBox',
			hideLabel : true,
			displayField : 'label',
			valueField : 'id',
			forceSelection : true,
			queryMode : 'local',
			typeAhead : true,
			width : 345,
			maxHeight : 100,
			triggerAction : 'all',
			emptyText : this.processCBEmptyText,
			selectOnFocus : true,
			disableKeyFilter : true,
			bind: {
				store: '{processStore}',
				selection:'{currentProcess}'
			},
			 listeners:{
				select:'onUpdateDataset'
			}
		}]
	}];
		this.callParent(arguments);
	}
});