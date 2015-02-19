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
	 * @cfg object buttonsText list of button used
	 * @default {
		submit:'search',
		cancel:'cancel',
		reset :'reset'
	}
	 */
	buttonsText:{
		submit:'search',
		cancel:'cancel',
		reset :'reset'
	},
	/**
	 * @cfg string [processCBEmptyText] the processcomboBox empty text
	 */
	processCBEmptyText:'Please select a dataset...',
	
	initComponent:function(){
		this.initBbar();
		this.callParent(arguments);
	},
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
			store: '{currentProcess.fieldsets}'
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
			}
		}]
	}];
		this.callParent(arguments);
	},
	// The bottom tools bar
	initBbar:function(){
		this.bbar=[/*{ TODO: Put this button into the loading popup (create on the submit event a Ext.window.MessageBox with a button for that).
				itemId:'CancelButton', type: 'button', text: this.buttonsText.cancel
		  	},'-',*/{
		  		itemId:'ResetButton', type: 'button', text: this.buttonsText.reset
		  	},{
		  		xtype: 'tbspacer',
		  		flex: 1
		  	},{
		  		itemId:'SubmitButton', type: 'button', action: 'submit', text: this.buttonsText.submit
		  	}];
	}
});