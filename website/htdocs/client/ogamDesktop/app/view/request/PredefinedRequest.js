/**
 * TODO: Refactor this code for the next version
 * @deprecated
 */
Ext.define('OgamDesktop.view.request.PredefinedRequest', {
	extend: 'OgamDesktop.view.request.MainWin',
	alias: 'widget.predefined-request',
	xtype: 'predefined-request',
	layout: 'hbox',
	title: 'Predefined Request',
	frame: true,
	requires: [
		'OgamDesktop.view.request.PredefinedRequestModel',
		'OgamDesktop.view.request.PredefinedRequestController',
		'OgamDesktop.ux.request.AdvancedRequestFieldSet',
		'Ext.grid.feature.Grouping',
			'OgamDesktop.store.request.PredefinedGroup',
			'OgamDesktop.view.request.PredefinedRequestSelector',
			'Ext.grid.Panel',
			'OgamDesktop.ux.request.AdvancedRequestSelector'
		],
	controller: 'predefinedrequest',
	viewModel:{
		type:'predefinedrequest'
	},
//<loacle>		
    /**
     * @cfg {String} resetButtonText
     * The reset Button Text (defaults to <tt>'Reset'</tt>)
     */
    resetButtonText:"Reset",
    /**
     * @cfg {String} resetButtonTooltip
     * The reset Button Tooltip (defaults to <tt>'Reset the form with the default values'</tt>)
     */
    resetButtonTooltip:"Reset the form with the default values",
    /**
     * @cfg {String} launchRequestButtonText
     * The launch Request Button Text (defaults to <tt>'Launch the request'</tt>)
     */
    launchRequestButtonText:"Launch the request",
    /**
     * @cfg {String} launchRequestButtonTooltip
     * The launch Request Button Tooltip (defaults to <tt>'Launch the request in the consultation page'</tt>)
     */
    launchRequestButtonTooltip:"Launch the request in the consultation page",
    /**
     * @cfg {String} loadingText
     * The loading Text (defaults to <tt>'Loading...'</tt>)
     */
    loadingText:"Loading...",

    /**
     * @cfg {String} defaultErrorCardPanelText
     * The default Error Card Panel Text (defaults to <tt>'Sorry, the loading failed...'</tt>)
     */
    defaultErrorCardPanelText:"Sorry, the loading failed...",
    /**
     * @cfg {String} criteriaPanelTitle
     * The criteria Panel Title (defaults to <tt>'Request criteria'</tt>)
     */
    criteriaPanelTitle:"Request criteria",	
//</loacle>

    
    initItems: function() {
			var store = new OgamDesktop.store.request.PredefinedGroup({
				groupField:'group_label'});
			var columns = [{
				text: 'Label',
				flex: 1,
				dataIndex: 'label'
			}];

			var features = [{
				ftype: 'grouping',
				groupHeaderTpl: '{name} ({children.length:plural("Requete")})',
				//hideGroupedHeader: true,
				startCollapsed: true,
				itemId: 'requestsGrouping'
			}];
			
			this.items = [{
				xtype: 'gridpanel',
				height:'100%',
				store: store,
				width: '65%',
				margin: '10 10 10 10',
				columns: columns,
				features: features,
				reference:'requete',
				listeners: {
					itemclick: 'onGridRowSelect',
				},
				plugins: [{
			        ptype: 'rowexpander',
			        //columnWidth: 0, doesn't work on extjs 6.0.1.250
			        //headerWidth: 0, doesn't work properly on extjs 6.0.1.250
			        rowBodyTpl : new Ext.XTemplate('<p class="o-predefined-request-grid-panel-description-text">{definition}</p>')
			    }]
			},{
				title: 'Request Criteria',
				hideMode: 'display',
				itemId:'myfieldset',
				xtype:'predefined-request-selector',
				bind:{
					criteria :{
						bindTo:'{criteria}',
						deep:true
					}
				},
				flex: 1,
				margin: '5 10 10 10',
				
			}];
			this.callParent();
    },
	initComponent:function(){
			this.fbar= [{
				xtype: 'button',
				margin: '5 5 5 5',
				text: this.resetButtonText,
				tooltip:this.resetButtonTooltip,
				handler:'onResetRequest'
			},{
				xtype: 'button',
				itemId:'launchRequest',
				margin: '5 5 5 5',
				text: this.launchRequestButtonText,
				tooltip:this.launchRequestButtonTooltip,
				handler:'onLaunchRequest'
					
			}]
			
			this.callParent();


		}
	});