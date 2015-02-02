/**
 * Licensed under EUPL v1.1 (see http://ec.europa.eu/idabc/eupl).
 *
 * © European Union, 2008-2012
 *
 * Reuse is authorised, provided the source is acknowledged. The reuse policy of the European Commission is implemented by a Decision of 12 December 2011.
 *
 * The general principle of reuse can be subject to conditions which may be specified in individual copyright notices.
 * Therefore users are advised to refer to the copyright notices of the individual websites maintained under Europa and of the individual documents.
 * Reuse is not applicable to documents subject to intellectual property rights of third parties.
 */

/**
 * The class of the Grid Details Panel.
 * 
 * @class Genapp.GridDetailsPanel
 * @extends Ext.GridPanel
 * @constructor Create a new GridDetailsPanel
 * @param {Object} config The config object
 */
Ext.define('OgamDesktop.view.navigation.GridDetailsPanel', {
	extend: 'Ext.grid.Panel',
	xtype: 'grid-detail-panel',
    /**
     * @cfg {Number} headerWidth
     * The tab header width. (Default to 60)
     */
    headerWidth:95,
    title: 'Features Information',

    /**
     * @cfg {Boolean} autoScroll
     * true to use overflow:'auto' on the panel's body element and show scroll bars automatically when
     * necessary, false to clip any overflowing content (defaults to true).
     */
    autoScroll:true,
    
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp-query-grid-details-panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-query-grid-details-panel',
    /**
     * @cfg {String} loadingMsg
     * The loading message (defaults to <tt>'Loading...'</tt>)
     */
    loadingMsg: 'Loading...',
    layout: 'fit',
    /**
     * @cfg {Number} tipDefaultWidth
     * The tip Default Width. (Default to 300)
     */
    tipDefaultWidth: 300,
    // sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
    /**
     * @cfg {String} dateFormat The date format for the date
     *      fields (defaults to <tt>'Y/m/d'</tt>)
     */
    // TODO: Merge this param with the dateFormat param of the consultation panel
    dateFormat : 'Y/m/d',
    /**
     * @cfg {Number} tipImageDefaultWidth The tip Image Default Width.
     *      (Default to 200)
     */
    // TODO: Merge this param with the tipImageDefaultWidth param of the consultation panel
    tipImageDefaultWidth : 200,
	/**
	 * @cfg {String} openNavigationButtonTitle The open Grid
	 *      Details Button Title (defaults to
	 *      <tt>'See the details'</tt>)
	 */
	openNavigationButtonTitle : "See the details", // TODO: Merge with the GridTab properties
	/**
	 * @cfg {String} openNavigationButtonTip The open Grid
	 *      Details Button Tip (defaults to
	 *      <tt>'Display the row details into the details panel.'</tt>)
	 */
	openNavigationButtonTip : "Display the row details into the details panel.", // TODO: Merge with the GridTab properties

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
    // TODO: Merge this function with the numberPattern fct of the consultation panel
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
    },

    /**
     * Render an Icon for the data grid.
     */
     // TODO: Merge this function with the renderIcon fct of the result panel
    renderIcon : function(value, metadata, record, rowIndex, colIndex, store, columnLabel) {
        if (!Ext.isEmpty(value)) {
            return '<img src="' + Genapp.base_url + '/js/genapp/resources/images/picture.png"'
            + 'ext:qtitle="' + columnLabel + ' :"'
            + 'ext:qwidth="' + this.tipImageDefaultWidth + '"'
            + 'ext:qtip="'
            + Genapp.util.htmlStringFormat('<img width="' + (this.tipImageDefaultWidth - 12) 
            + '" src="' + Genapp.base_url + '/img/photos/' + value 
            +'" />') 
            + '">';
        }
    },
    listeners : {
		'beforeitemmouseenter' : function(view, record, item, index, e, eOpts ) {
			this.ownerCt.fireEvent('beforedetailsgridrowenter', record);
		},
		'beforeitemmouseleave' : function(view, record, item, index, e, eOpts ) {
			this.ownerCt.fireEvent('beforedetailsgridrowleave', record);
		}
    },
    // private
    configureDetailGrid : function(initConf) {
    	console.log('grid details panel');
            this.itemId = initConf.id;
            this.title = initConf.title;
            var store = new Ext.data.ArrayStore({
                // store configs
                autoDestroy: true,
                // reader configs
                idIndex: 0,
                fields: initConf.fields,
                data: initConf.data
            });

            // setup the columns
            var i;
            var columns = initConf.columns;
            for(i = 0; i<columns.length; i++){
                // TODO: Merge this part with the same part of the result panel
                switch (columns[i].type) {
                // TODO : BOOLEAN, CODE, COORDINATE, ARRAY,
                // TREE
                case 'STRING':
                case 'INTEGER':
                    columns[i].xtype = 'gridcolumn';
                    break;
                case 'NUMERIC':
                    columns[i].xtype = 'numbercolumn';
                    if (!Ext.isEmpty(columns[i].decimals)) {
                        columns[i].format = this.numberPattern('.', columns[i].decimals);
                    }
                    break;
                case 'DATE':
                    columns[i].xtype = 'datecolumn';
                    columns[i].format = this.dateFormat;
                    break;
                case 'IMAGE':
                    columns[i].header = '';
                    columns[i].width = 30;
                    columns[i].sortable = false;
                    //columns[i].renderer = this.renderIcon.createDelegate(this, [Genapp.util.htmlStringFormat(columns[i].tooltip)], true);
                    break;
                default:
                    columns[i].xtype = 'gridcolumn';
                    break;
                }
            }

            // Add the action column
            columns.unshift({
    			xtype: 'actioncolumn',
				sortable : false,
				fixed : true,
				menuDisabled : true,
				align : 'center',
				width : 40,
				items : [{
    				iconCls: 'o-navigation-gd-tools-nav-showdetails',
    				tooltip: "<b>"+this.openNavigationButtonTitle+"</b><br/>"+this.openNavigationButtonTip,
    				handler: function(grid, rowIndex, colIndex, item, e, record, row) {
    					this.fireEvent('clickIntoDetailGrid', record);
    				},
    				scope: this
    			}]
            });
            this.reconfigure(store, columns);
	}
});