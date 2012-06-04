/**
 * A DocSearchResultPanel.
 * 
 * @class Genapp.DocSearchResultPanel
 * @extends Ext.Panel
 * @constructor Create a new DocSearchResultPanel 
 * @param {Object} config The config object
 * @xtype docsearchresultpanel
 */
Genapp.DocSearchResultPanel = Ext.extend(Ext.Panel, {

    title:'Resultat(s)',
    frame:true,
    layout:'border',
    docSlipPanelHeight:150,

    // private
    initComponent : function() {

        this.fields = [];
        this.columns = [];
        this.template = '<div class="doc-search-page-doc-slip-panel-div">';
        var meta;
        for (meta in this.hits[0]) {
            if (typeof this.hits[0][meta] !== 'function') {
                this.fields.push(meta);
                this.columns.push({'header': meta, 'dataIndex':meta});
                this.template += '<p><b>'+meta+' :</b> {'+meta+'}</p>';
            }
        }
        this.template += '</div>';

        this.store = new Ext.data.JsonStore({
            autoDestroy: true,
            autoLoad:true,
            fields: this.fields,
            data: this.hits
        });

        this.gridPanel = new Ext.grid.GridPanel({
            region:'center',
            store : this.store,
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    width: 120,
                    sortable: true
                },
                columns: this.columns
            }),
            sm: new Ext.grid.RowSelectionModel({
                singleSelect:true,
                listeners:{
                    'rowselect':function(sm, rowIdx, r){
                        this.docSlipPanel.update(r.data);
                        this.fireEvent('rowselect',r.data);
                    },
                    scope:this
                }
            }),
            listeners:{
                'keydown':function(event){
                    if(event.keyCode === event.ENTER){
                        this.onEnter();
                    }
                },
                'rowdblclick':function(grid, rowIndex, event){
                    this.onEnter();
                },
                'viewready':function(grid){
                    grid.getSelectionModel().selectFirstRow();
                    grid.getView().focusRow(0);
                },
                scope:this
            }
        });

        this.docSlipPanel = new Ext.form.FieldSet({
            region:'south',
            height:this.docSlipPanelHeight,
            data:{
                title:'-',
                subject:'-',
                authors:'-',
                publication_date:'-',
                publication:'-',
                reference:'-'
            },
            tpl:new Ext.Template(
                    this.template,
                {
                    compiled: true,      // compile immediately
                    disableFormats: true // See Notes below.
                }
            )
        });

        this.items = [
            this.gridPanel,
            this.docSlipPanel
        ];

        Genapp.DocSearchResultPanel.superclass.initComponent.call(this);
    },

    onEnter: function() {
        var sm = this.gridPanel.getSelectionModel();
        var sels = sm.getSelections();
        this.fireEvent('pdfselect',sels[0].data);
    }
});
Ext.reg('docsearchresultpanel', Genapp.DocSearchResultPanel);