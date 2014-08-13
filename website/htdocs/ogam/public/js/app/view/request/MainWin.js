Ext.define('Ogam.view.request.MainWin', {
		extend: 'Ogam.view.abstract.Win',
		title : 'Query Panel',
		collapsible : true,
		margins : '0 5 0 0',
		titleCollapse : true,
		collapseDirection: 'left',
		width: 370,
		height: Ext.getBody().getViewSize().height - 160,
		frame : true,
		layout : 'border',
		initComponent : function() {
			Ext.on('resize',function(){
				this.setHeight(Ext.getBody().getViewSize().height - 160);
			},this);
		this.callParent(arguments);
		}
});
