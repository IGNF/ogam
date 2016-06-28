/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 */
Ext.define('OgamDesktop.view.main.Main', {
	xtype: 'app-main',
	requires:[
		'Ext.plugin.Viewport'
	],
	plugins:[
		'viewport'
	],
	plain: true,
	frame: true,
	layout: 'card',
	itemId: 'main',
	controller: 'main',
	extend: 'Ext.tab.Panel',
	activeTab: 1,
	homeButtonText: 'Home',
	homeButtonTooltip: 'Go back to the home page',
	items: [{
		id:'predefined_request',
		xtype: 'predefined-request',
		name: 'predefined-request'
	},{
		xtype: 'panel',
		layout: 'border',
		title: 'Consultation',
		id:'consultation_panel',
		itemId:'consultationTab',
		items: [{
			xtype: 'advanced-request',
			region: 'west'
		},{
			xtype: 'container',
			region: 'center',
			layout: 'border',
			items: [{
				xtype: 'container',
				region: 'center',
				layout: 'border',
				items: [{
					xtype: 'tabpanel',
					region: 'center',
					layout: 'card',
					defaults: {
						closable: false
					},
					deferredRender : false,
					items: [
					        {
						xtype: 'map-mainwin'
					},
					        {
						xtype: 'result-mainwin'
					}]
				},{
					xtype: 'navigation-mainwin',
					region: 'east',
					width: 320,
					collapsible: true,
					collapsed: true,
					collapseDirection: 'right'
				}]
			},{
				xtype: 'grid-detail-panel',
				region: 'south',
				height: 200,
				collapsible: true,
				collapsed: true,
				collapseDirection: 'bottom'
			}]
		}]
	},{
		id:'edition_panel',
		title:'Edition',
		layout:{
			type:'vbox',
			align:'stretch'
		},
		scrollable:true,
		loader:{
			removeAll: true,
			renderer:'component',
			url:''
		}
	}],

	/**
	 * Initializes the component.
	 */
	initComponent : function() {
		this.getTabBar().add(
	        [{
	        	xtype:'tbfill'
	        },{
	        	xtype:'button',
	        	ui:'default-toolbar',
	        	text: this.homeButtonText,
	        	tooltip: this.homeButtonTooltip,
	        	handler: function() {
	                document.location = window.location.origin;
	            }
	        }]
		);
		this.callParent(arguments);
		var resultsgrid = Ext.ComponentQuery.query('results-grid')[0];
		var nav = Ext.ComponentQuery.query('navigation-mainwin')[0];
		if(resultsgrid){
			this.relayEvents(resultsgrid, ['onOpenNavigationButtonClick']);
		}
		if(nav){
			this.on('onOpenNavigationButtonClick', nav.openDetails, nav);
		}
	}
});
