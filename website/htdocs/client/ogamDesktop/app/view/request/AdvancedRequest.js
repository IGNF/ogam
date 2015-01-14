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

	items: [{ // The advanced request selector
		xtype:'advanced-request-selector',
		layout : 'auto',
		autoScroll : true,
		margin : '5 0 5 0',
		title : '<b>Forms Panel :</b>',
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
		title: 'Dataset',
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
			emptyText : "Please select a dataset...",
			selectOnFocus : true,
			disableKeyFilter : true,
	        bind: {
	            store: '{processStore}',
	            selection:'{currentProcess}'
	        }
		}]
	}],
	bbar: [{ // The bottom tools bar
		type: 'button', text: 'Cancel'
	},'-',{
		type: 'button', text: 'Reset'
	},{
		xtype: 'tbspacer',
		flex: 1
	},{
		itemId:'SubmitButton', type: 'button', text: 'Search'
	}]
});