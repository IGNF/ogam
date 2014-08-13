Ext.define('Ogam.view.Main', {
	extend: 'Ogam.view.abstract.Win',
	layout: 'border',
	width: Ext.getBody().getViewSize().width - 80,
	height: Ext.getBody().getViewSize().height - 160,
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
					xtype: 'tab',
					title: 'Results'
				}]
			},{
				xtype: 'panel',
				region: 'east',
				width: 370,
				collapsible: true,
				collapseDirection: 'right',
				title: 'Details'
			}]
		},{
			xtype: 'panel',
			region: 'south',
			height: 200,
			collapsible: true,
			collapseDirection: 'bottom',
			title: 'Features Information'
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