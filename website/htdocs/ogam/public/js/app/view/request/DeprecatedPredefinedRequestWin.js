Ext.define('Ogam.view.request.DeprecatedPredefinedRequestWin', {
	extend: 'Ext.panel.Panel',
	xtype: 'deprecated-predefined-request-win',
	layout: 'hbox',
	title: 'Predefined Request',
	frame: true,
	requires: [
			'Ext.grid.feature.Grouping'
		],
		initComponent: function() {
			var store = Ext.create('Ogam.store.request.PredefinedGroup');
			var columns = [{
				text: 'Label',
				flex: 1,
				dataIndex: 'name'
			}];

			var features = [{
				ftype: 'grouping',
				groupHeaderTpl: '{name} ({rows.length} Requete{[values.rows.length > 1 ? "s" : ""]})',
				hideGroupedHeader: true,
				startCollapsed: true,
				id: 'requestsGrouping'
			}];
			
			this.items = [{
				xtype: 'gridpanel',
				store: store,
				width: '65%',
				margin: '10 10 10 10',
				columns: columns,
				features: features,
				groupingFeature: features,
				listeners: {
					itemclick: this.onGridRowSelect,
					scope:this
				}
			},{
				xtype: 'fieldset',
				title: 'Request Criteria',
				hideMode: 'display',
				flex: 1,
				margin: '5 10 10 10',
				items: [{
					xtype: 'button',
					margin: '5 5 5 5',
					text: 'Reset'
				},{
					xtype: 'button',
					margin: '5 5 5 5',
					text: 'Launch the request'
				}]
			}];
			
			this.callParent();


		},
		onGridRowSelect : function(sm, row, rec) {
			
		}
	});