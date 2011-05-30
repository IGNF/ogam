/**
 * The class of the Grid Details Panel.
 * 
 * @class Genapp.GridDetailsPanel
 * @extends Ext.GridPanel
 * @constructor Create a new GridDetailsPanel
 * @param {Object} config The config object
 */
Genapp.GridDetailsPanel = Ext.extend(Ext.grid.GridPanel, {
    /**
     * @cfg {Number} headerWidth
     * The tab header width. (Default to 60)
     */
    headerWidth:95,
    /**
     * @cfg {Boolean} closable
     * Panels themselves do not directly support being closed, but some Panel subclasses do (like
     * {@link Ext.Window}) or a Panel Class within an {@link Ext.TabPanel}.  Specify true
     * to enable closing in such situations. Defaults to true.
     */
    closable: true,
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
    sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
    /**
     * Renders for the left tools column cell
     * 
     * @param {Object}
     *            value The data value for the cell.
     * @param {Object}
     *            metadata An object in which you may set the
     *            following attributes: {String} css A CSS class
     *            name to add to the cell's TD element. {String}
     *            attr : An HTML attribute definition string to
     *            apply to the data container element within the
     *            table cell (e.g. 'style="color:red;"').
     * @param {Ext.data.record}
     *            record The {@link Ext.data.Record} from which
     *            the data was extracted.
     * @param {Number}
     *            rowIndex Row index
     * @param {Number}
     *            colIndex Column index
     * @param {Ext.data.Store}
     *            store The {@link Ext.data.Store} object from
     *            which the Record was extracted.
     * @return {String} The html code for the column
     * @hide
     */
    renderLeftTools : function(value, metadata, record,
            rowIndex, colIndex, store) {

        var stringFormat = '';
        if (!this.hideDetails) {
            stringFormat = '<div class="genapp-query-grid-details-panel-slip" onclick="Genapp.cardPanel.consultationPage.openDetails(\'{0}\', \'getdetails\');"></div>';
        }
        stringFormat += '<div class="genapp-query-grid-details-panel-search" onclick="Genapp.cardPanel.consultationPage.launchLocationRequest(\'\',\'{2}\');"></div>';
        if(this.hasChild) {
            stringFormat += '<div class="genapp-query-grid-details-panel-get-children" onclick="Genapp.cardPanel.consultationPage.getChildren(\'{1}\',\'{0}\');"></div>';
        }
        return String.format(stringFormat, record.data.id, this.ownerCt.getId(),record.data.LOCATION_COMPL_DATA__SIT_NO_CLASS);
    },

    // private
    initComponent : function() {
            this.itemId = this.initConf.id;
            this.hasChild = this.initConf.hasChild;
            this.title = this.initConf.title;
            this.parentItem = this.initConf.parentItem;
            // We need of the ownerCt here (before it's set automatically when this Component is added to a Container)
            this.ownerCt = this.initConf.ownerCt;
            console.log('initConf',this.initConf);
            this.store = new Ext.data.ArrayStore({
                // store configs
                autoDestroy: true,
                // reader configs
                idIndex: 0,
                fields: this.initConf.fields,
                data: this.initConf.data
            });

            // setup the columns
            var i;
            var columns = this.initConf.columns;
            for(i = 0; i<columns.length; i++){
                columns[i].header =  Genapp.util.htmlStringFormat(columns[i].header);
                columns[i].tooltip =  Genapp.util.htmlStringFormat(columns[i].tooltip);
            }console.log('ownerCt',this.ownerCt);
            var leftToolsHeader = '';
            if (!Ext.isEmpty(this.parentItem)) {
                leftToolsHeader = '<div class="genapp-query-grid-details-panel-get-parent" onclick="Genapp.cardPanel.consultationPage.getParent(\''
                + this.ownerCt.getId() +'\');"></div>';
            }
            this.initConf.columns.unshift({
                dataIndex:'leftTools',
                header:leftToolsHeader,
                renderer:this.renderLeftTools.createDelegate(this),
                sortable:false,
                fixed:true,
                menuDisabled:true,
                align:'center',
                width:70
            });
            this.colModel = new Ext.grid.ColumnModel({
                defaults: {
                    width: 100,
                    sortable: true
                },
                columns: columns
            });
        Genapp.GridDetailsPanel.superclass.initComponent.call(this);
    }
});