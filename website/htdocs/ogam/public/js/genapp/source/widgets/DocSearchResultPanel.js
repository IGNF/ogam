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
            // store configs
            autoDestroy: true,
            autoLoad:true,
            // reader configs
            //idIndex: 5,
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
                columns: this.columns/*[
                    {header: 'Titre', width: 200, dataIndex: 'title'},
                    {header: 'Sujet', width: 200, dataIndex: 'subject'},
                    {header: 'Auteurs', dataIndex: 'authors'},
                    {header: 'Parution', width: 50, dataIndex: 'publication_date'},
                    {header: 'Publication', dataIndex: 'publication'},
                    {id: 'reference', header: 'Référence', width: 50, dataIndex: 'reference'}
                ]*/
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
            /*margins:{
                top: 5,
                right: 0,
                bottom: 0,
                left: 0
            },*/
            tpl:new Ext.Template(
                    this.template
                /*'<div class="doc-search-page-doc-slip-panel-div">',
                    '<p><b>Titre :</b> {title}</p>',
                    '<p><b>Auteurs :</b> {authors}</p>',
                    '<p><b>Sujet :</b> {subject}</p>',
                    '<p><b>Année de publication :</b> {publication_date}</p>',
                    '<p><b>Publication :</b> {publication}</p>',
                    '<p><b>Référence :</b> {reference}</p>',
                '</div>'*/,
                // a configuration object:
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

        // Only for the demo, remove this listeners after
        /*this.westBottomPanel.on(
            'expand',
            function(){
                this.gridPanel.getSelectionModel().selectFirstRow.defer(300, this.gridPanel.getSelectionModel());
            },
            this,
            {single:true}
        );*/
        Genapp.DocSearchResultPanel.superclass.initComponent.call(this);
    },

    onEnter: function() {
        var sm = this.gridPanel.getSelectionModel();
        var sels = sm.getSelections();
        //for (var i = 0, len = sels.length; i < len; i++) {
            //var rowIdx = g.getStore().indexOf(sels[0]);
            this.fireEvent('pdfselect',sels[0].data);
        //}
    }
});
Ext.reg('docsearchresultpanel', Genapp.DocSearchResultPanel);