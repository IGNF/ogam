Ext.define('Ogam.view.request.MainWin', {
		extend: 'Ext.panel.Panel',
		mixins: ['Ogam.view.abstract.Win'],
		title : 'Query Panel',
		collapsible : true,
		margins : '0 5 0 0',
		titleCollapse : true,
		collapseDirection: 'left',
		width: 370,
		frame : true,
		layout : 'border'
});
