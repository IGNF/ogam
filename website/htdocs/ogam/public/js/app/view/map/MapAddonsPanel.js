Ext.define('Ogam.view.map.MapAddonsPanel', {
	extend: 'Ext.toolbar.Toolbar',
	xtype: 'map-addons-panel',
	items: [{
		xtype: 'tbspacer',
		flex: 1
	},{
		type: 'button', text: 'i'
	},{
		type: 'button', text: 'sl'
	},'-',{
		type: 'button', text: 'p'
	},{
		type: 'button', text: 'n'
	},{
		type: 'button', text: 'i'
	},{
		type: 'button', text: 'zi'
	},{
		type: 'button', text: 'zo'
	},{
		type: 'button', text: 'dm'
	},'-',{
		type: 'button', text: 'zr'
	},{
		type: 'button', text: 'me'
	}]
});