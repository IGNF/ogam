/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('OgamDesktop.view.main.Main', {
	//extend: 'Ext.container.Container',

	xtype: 'app-main',
	plain: true,
	frame: true,
	layout: 'card',

	controller: 'main',
	viewModel: {
		type: 'main'
	},
	extend: 'Ext.tab.Panel',
	renderTo: Ext.get('content'),
	//width: Ext.getBody().getViewSize().width - 80,
	//height: Ext.getBody().getViewSize().height - 160,
	activeTab: 1,
	items: [{
		xtype: 'predefined-request'
	},{
		xtype: 'panel',
		layout: 'border',
		title: 'Consultation',
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
					items: [{
						xtype: 'map-mainwin'
					},{
						xtype: 'result-mainwin'
					}]
				},{
					xtype: 'navigation-mainwin',
					region: 'east',
					width: 370,
					collapsible: true,
					collapsed: true,
					collapseDirection: 'right'
				}]
			},{
				xtype: 'deprecated-detail-grid',
				region: 'south',
				height: 200,
				collapsible: true,
				collapsed: true,
				collapseDirection: 'bottom'
			}]
		}]
	}],
	initComponent : function() {
		/*Ext.on('resize',function(){
			this.setWidth(Ext.getBody().getViewSize().width - 80);
			this.setHeight(Ext.getBody().getViewSize().height - 160);
		},this);*/
		this.callParent(arguments);
	}
});
