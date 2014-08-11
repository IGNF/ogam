Ext.define('Ogam.view.request.DeprecatedFormPanel', {
	extend: 'Ext.form.FieldSet',
	xtype: 'deprecated-form-panel',
	autoScroll : true,
	frame : true,
	height: '95%',
	layout : 'auto',
	title : 'Forms Panel',
	items: [{
		layout : 'form',
		labelWidth : 120,
		hidden : false,
		hideMode : 'offsets',
		defaults : {
			labelStyle : 'padding: 0; margin-top:3px',
			width : 180
		},
		items: [{
			xtype : 'combo',
			fieldLabel : 'Criteria',
			hiddenName : 'Criteria',
			editable : false,
			width : 220,
			maxHeight : 100
		}]
	},{
		layout : 'form',
		items:[{
			xtype : 'combo',
			fieldLabel : 'Columns',
			hiddenName : 'Columns',
			editable : false,
			width : 220,
			maxHeight : 100
		}]
	}]
});