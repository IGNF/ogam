/**
 * The Main includes the module panels of Ogam.
 */
Ext.define('Ogam.view.Main', {
	extend: 'Ext.tab.Panel',
	renderTo: Ext.get('content'),
	width: Ext.getBody().getViewSize().width - 80,
	height: Ext.getBody().getViewSize().height - 160,
    activeTab: 1,
	items: [{
		xtype: 'deprecated-predefined-request-win'
	},{
		xtype: 'panel',
		layout: 'border',
		title: 'Consultation',
		items: [{
			xtype: 'deprecated-advanced-request-win',
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
		Ext.on('resize',function(){
			this.setWidth(Ext.getBody().getViewSize().width - 80);
			this.setHeight(Ext.getBody().getViewSize().height - 160);
		},this);
	this.callParent(arguments);
	}
});