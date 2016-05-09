/**
 * This class defines the controller with actions related to 
 * data loading into results grid
 */
Ext.define('OgamDesktop.controller.result.Grid',{
	extend: 'Ext.app.Controller',
	requires: [
		'OgamDesktop.view.result.GridTab',
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
		listen: {
        	controller: {
            	'advancedrequest': {
            		requestSuccess: 'setResultsGrid'
            	}
            }
        }
	},

	/**
	 * Fill the grid by updating binded model and store.
	 * @private
	 * @param {Array} fields The grid's colums that the server returns on the query form submission
	 */
	setResultsGrid: function(fields) {
		var resultStore = this.getStore('result.Grid');
		var gridModel = resultStore.getModel();
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
				gridTab.fireEvent('seeOnMapButtonClick', record.data);
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

						this.redirectTo('edition-edit/'+/*encodeURIComponent(*/record.data.id/*)*//*, true*/);

					},
					scope:this
				}]
			});
		}

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
				// OGAM-586 - TODO: refactor the code below to have only the switch on the inputType 
				default:
					switch (field.type) {
						// OGAM-587 - TODO : CODE, COORDINATE, ARRAY
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
							// OGAM-588 - TODO : createDelegate deprecated : using of Ext.Function.pass instead, not tested...
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

		

		// Update the grid model
		gridModel.replaceFields(gridModelCfg, true);
		
		// Update the results grid store binding the model to it
		// and apply pageSize value.
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
	 * @param {String} decimalSeparator The decimal separator (default to',')
	 * @param {Integer} decimalPrecision The decimal precision
	 * @param {String} groupingSymbol The grouping separator (absent by default)
	 * @return {String} The number format pattern
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

	/*
	 * OGAM-589 - TODO: Render an Icon for the data grid.
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