/**
 * This class defines the controller with actions related to 
 * data loading into results grid
 */
Ext.define('OgamDesktop.controller.result.Grid',{
	extend: 'Ext.app.Controller',
	requires: [
		'OgamDesktop.view.result.GridTab',
		'OgamDesktop.model.result.Grid',
		'OgamDesktop.store.result.Grid',
		'OgamDesktop.ux.data.field.Factory',
		'OgamDesktop.ux.grid.column.Factory',
		'Ext.window.MessageBox',
		'Ext.grid.column.Action',
		'Ext.grid.column.Date',
		'Ext.grid.column.Boolean'
	],
	uses:[
	    'OgamDesktop.view.edition.Panel',
	    'OgamDesktop.view.edition.PanelController'
	],
	config: {
		refs: {
			resultsgrid: 'results-grid'
		},
		control: {
			'advanced-request button[action = submit]': {
				requestSuccess: 'setResultsGrid'
			}
		}
	},

	/**
	 * Fill the grid updating binded model and store.
	 * 
	 * @param {Array}
	 *            fields The columns of the grid that the server
	 *            send as query form is submitted
	 */
	setResultsGrid: function(fields) {
		var gridModel = this.getModel('result.Grid');
		var gridTab = this.getResultsgrid();
		var gridModelCfg = [];
		var gridColumnCfg = [];

		// Add 'open details' and 'see on the map' actions
		var leftActionColumnItems = [];
		if (!gridTab.hideNavigationButton) {
			leftActionColumnItems.push({
				iconCls: 'o-result-tools-nav-showdetails',
				tooltip: "<b>"+gridTab.openNavigationButtonTitle+"</b><br/>"+gridTab.openNavigationButtonTip,
				handler: function(grid, rowIndex, colIndex, item, e, record, row) {
					// Action managed into result main controller
					gridTab.fireEvent('onOpenNavigationButtonClick', record);
				}
			});
		}
		leftActionColumnItems.push({
			iconCls: 'o-result-tools-nav-showmap',
			tooltip: "<b>"+gridTab.seeOnMapButtonTitle+"</b><br/>"+gridTab.seeOnMapButtonTip,
			handler: function(grid, rowIndex, colIndex, item, e, record, row) {
				// Action managed into result main controller
				gridTab.fireEvent('onSeeOnMapButtonClick', record.data);
			}
		});
		gridColumnCfg.push({
			xtype: 'actioncolumn',
			sortable : false,
			fixed : true,
			menuDisabled : true,
			align : 'center',
			width : 40,
			items: leftActionColumnItems
		});

		// Build the result fields for the model and the column
		for (i in fields) {
			var field = fields[i];
			var fieldConfig = {
				name: field.name,
				type: field.type ? field.type.toLowerCase() : 'auto',
				defaultValue : null
			};
			var columnConfig = {
					dataIndex: field.name,
					text: field.label,
					tooltip: field.definition,
					hidden: field.hidden
				};
			switch (field.inputType) {
				case 'CHECKBOX':
					Ext.applyIf(columnConfig, OgamDesktop.ux.grid.column.Factory.buildBooleanColumnConfig());
					Ext.applyIf(fieldConfig, OgamDesktop.ux.data.field.Factory.buildCheckboxFieldConfig(field));
					break;
				// TODO: refactor the code below to have only the switch on the inputType 
				default:
					switch (field.type) {
						// TODO : CODE, COORDINATE, ARRAY
						case 'STRING':
							columnConfig.xtype = 'gridcolumn';
							break;
						case 'INTEGER':
							columnConfig.xtype = 'gridcolumn';
							break;
						case 'NUMERIC':
							columnConfig.xtype = 'numbercolumn';
							if (field.decimals !== null) {
								columnConfig.format = this.numberPattern('.', field.decimals);
							}
							break;
						case 'DATE':
							columnConfig.xtype = 'datecolumn';
							columnConfig.format = gridTab.dateFormat;
							break;
						case 'IMAGE':
							columnConfig.header = '';
							columnConfig.width = 30;
							columnConfig.sortable = false;
							// TODO : createDelegate deprecated : using of Ext.Function.pass instead, not tested...
							//columnConfig.renderer = Ext.Function.pass(this.renderIcon, [Ext.String.htmlEncode(field.label)], this);
							break;
						default:
							columnConfig.xtype = 'gridcolumn';
							break;
					}
					break;
			}
			gridColumnCfg.push(columnConfig);
			gridModelCfg.push(Ext.create('Ext.data.field.Field', fieldConfig));
		}

		// Add 'edit data' action
		if (!gridTab.hideGridDataEditButton) {
			Ext.require([
			    'OgamDesktop.view.edition.Panel',
			    'OgamDesktop.view.edition.PanelController'
			]);
			Ext.Loader.loadScript(Ext.manifest.OgamDesktop.editionServiceUrl+'getParameters');
			gridColumnCfg.push({
				xtype: 'actioncolumn',
				sortable : false,
				fixed : true,
				menuDisabled : true,
				align : 'center',
				width : 30,
				items:[{
					iconCls: 'o-result-tools-edit-editdetails',
					tooltip: "<b>"+gridTab.editDataButtonTitle+"</b><br/>"+gridTab.editDataButtonTip,
					handler: function(grid, rowIndex, colIndex, item, e, record, row) {
						// Action managed into result main controller
						gridTab.fireEvent('onEditDataButtonClick', record);

						this.redirectTo('edition_panel/'+/*encodeURIComponent(*/record.data.id/*)*//*, true*/);

					},
					scope:this
				}]
			});
		}

		// Update the grid model
		gridModel.replaceFields(gridModelCfg, true);
		
		// Update the results grid store binding the model to it
		// and apply pageSize value.
		var resultStore = this.getStore('result.Grid');
		resultStore.setConfig('pageSize', gridTab.gridPageSize);
		resultStore.setModel(gridModel);

		// Load the grid results store
		resultStore.load({
			params: {
				// specify params for the first page because using paging.
				start: 0,
				limit: gridTab.gridPageSize
			},
			callback: function(records) {
				gridTab.fireEvent('resultsload', Ext.isEmpty(records));
			}
		});
		
		// Update the grid adding the columns and the data rows.
		gridTab.reconfigure(resultStore, gridColumnCfg);
	},
	
	/**
	 * Return the pattern used to format a number.
	 * 
	 * @param {String}
	 *            decimalSeparator the decimal separator
	 *            (default to',')
	 * @param {Integer}
	 *            decimalPrecision the decimal precision
	 * @param {String}
	 *            groupingSymbol the grouping separator (absent
	 *            by default)
	 */
	numberPattern : function(decimalSeparator, decimalPrecision, groupingSymbol) {
		// Building the number format pattern for use by ExtJS
		// Ext.util.Format.number
		var pattern = [], i;
		pattern.push('0');
		if (groupingSymbol) {
			pattern.push(groupingSymbol + '000');
		}
		if (decimalPrecision) {
			pattern.push(decimalSeparator);
			for (i = 0; i < decimalPrecision; i++) {
				pattern.push('0');
			}
		}
		return pattern.join('');
	}//,

	/**
	 * Render an Icon for the data grid.
	 * @TODO
	 */
	/*renderIcon : function(value, metadata, record, rowIndex, colIndex, store, columnLabel) {
		if (!Ext.isEmpty(value)) {
			return '<img src="' + Ext.manifest.OgamDesktop.requestServiceUrl + '../client/ogamDesktop/resources/images/picture.png"'
			+ 'ext:qtitle="' + columnLabel + ' :"'
			+ 'ext:qwidth="' + this.getResultsgrid().tipImageDefaultWidth + '"'
			+ 'ext:qtip="'
			+ Ext.String.htmlEncode('<img width="' + (this.getResultsgrid().tipImageDefaultWidth - 12) 
			+ '" src="' + Ext.manifest.OgamDesktop.requestServiceUrl + '../client/ogamDesktop/img/photos/' + value 
			+'" />') 
			+ '">';
		}
	}*/
});