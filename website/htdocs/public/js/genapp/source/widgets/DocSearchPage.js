/**
 * A ConsultationPanel correspond to the complete page for querying request results.
 * 
 * @class Genapp.ConsultationPanel
 * @extends Ext.Panel
 * @constructor Create a new Consultation Panel
 * @param {Object} config The config object
 * @xtype consultationpanel
 */
Genapp.DocSearchPage = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} title
     * The title text to be used as innerHTML (html tags are accepted) to display in the panel
     * <code>{@link #header}</code> (defaults to ''). When a <code>title</code> is specified the
     * <code>{@link #header}</code> element will automatically be created and displayed unless
     * {@link #header} is explicitly set to <code>false</code>.  If you do not want to specify a
     * <code>title</code> at config time, but you may want one later, you must either specify a non-empty
     * <code>title</code> (a blank space ' ' will do) or <code>header:true</code> so that the container
     * element will get created.
     * Default to 'Predefined Request'.
     */
    title: 'Documents',
    /**
     * @cfg {Boolean} frame
     * <code>false</code> by default to render with plain 1px square borders. <code>true</code> to render with
     * 9 elements, complete with custom rounded corners (also see {@link Ext.Element#boxWrap}).
     * @hide
     */
    frame:true,
    /**
     * @cfg {String/Object} layout
     * Specify the layout manager class for this container either as an Object or as a String.
     * See {@link Ext.Container#layout layout manager} also.
     * Default to 'border'.
     */
    layout :'border',
    /**
     * @cfg {String} cls
     * An optional extra CSS class that will be added to this component's Element (defaults to 'genapp_consultation_panel').
     * This can be useful for adding customized styles to the component or any of its children using standard CSS rules.
     */
    cls:'genapp-doc-search-page',
    /**
     * @cfg {Boolean} border
     * True to display the borders of the panel's body element, false to hide them (defaults to false).  By default,
     * the border is a 2px wide inset border, but this can be further altered by setting {@link #bodyBorder} to false.
     */
    border :false,
    /**
     * @cfg {String} id
     * <p>The <b>unique</b> id of this component (defaults to an {@link #getId auto-assigned id}).
     * You should assign an id if you need to be able to access the component later and you do
     * not have an object reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).</p>
     * <p>Note that this id will also be used as the element id for the containing HTML element
     * that is rendered to the page for this component. This allows you to write id-based CSS
     * rules to style the specific instance of this component uniquely, and also to select
     * sub-elements using this component's id as the parent.</p>
     * <p><b>Note</b>: to avoid complications imposed by a unique <tt>id</tt> also see
     * <code>{@link #itemId}</code> and <code>{@link #ref}</code>.</p>
     * <p><b>Note</b>: to access the container of an item see <code>{@link #ownerCt}</code>.</p>
     */
    id:'doc_search_page',
    /**
     * @cfg {String} ref
     * <p>A path specification, relative to the Component's <code>{@link #ownerCt}</code>
     * specifying into which ancestor Container to place a named reference to this Component.</p>
     * <p>The ancestor axis can be traversed by using '/' characters in the path.
     * For example, to put a reference to a Toolbar Button into <i>the Panel which owns the Toolbar</i>:</p><pre><code>
var myGrid = new Ext.grid.EditorGridPanel({
title: 'My EditorGridPanel',
store: myStore,
colModel: myColModel,
tbar: [{
    text: 'Save',
    handler: saveChanges,
    disabled: true,
    ref: '../saveButton'
}],
listeners: {
    afteredit: function() {
//      The button reference is in the GridPanel
        myGrid.saveButton.enable();
    }
}
});
</code></pre>
     * <p>In the code above, if the <code>ref</code> had been <code>'saveButton'</code>
     * the reference would have been placed into the Toolbar. Each '/' in the <code>ref</code>
     * moves up one level from the Component's <code>{@link #ownerCt}</code>.</p>
     * <p>Also see the <code>{@link #added}</code> and <code>{@link #removed}</code> events.</p>
     */
    ref:'docSearchPage',

    // private
    initComponent : function() {

        this.westSearchPanel = new Ext.Panel({
            title:'Filtre(s)',
            frame:true,
            items:{
                xtype: 'form',
                labelWidth: 130, // label settings here cascade unless overridden
                bodyStyle:'padding:5px 10px 0',
                defaults: {width: 230},
                defaultType: 'textfield',
                items:[{
                    xtype: 'combo',
                    fieldLabel: 'Titre'
                },{
                    xtype: 'combo',
                    fieldLabel: 'Auteur'
                },{
                    xtype: 'combo',
                    fieldLabel: 'Sujet'
                },{
                    xtype: 'combo',
                    fieldLabel: 'Année de Parution'
                },{
                    xtype: 'combo',
                    fieldLabel: 'Publication'
                },{
                    xtype: 'combo',
                    fieldLabel: 'Référence'
                }],
                buttons:[{
                    xtype: 'button',
                    text: 'Effacer filtres',
                    handler:function(){
                        this.westBottomPanel.expand();
                    },
                    scope:this
                },{
                    xtype: 'button',
                    text: 'Filtrer',
                    handler:function(){
                        this.westBottomPanel.expand();
                    },
                    scope:this
                }]
            }
        });

        var myData = [
            ['RENECOFOR - Manuel de référence n°5 pour la collecte de la litière et le traitement des échantillons','litière, fruit, aiguille, gland, faîne, méthodologie, manuel','',2008,'Publications lors de congrès, colloques et séminaires','09-38'],
            ['RENECOFOR - Manuel de référence n°5 pour la collecte de la litière et le traitement des échantillons','litière, fruit, aiguille, gland, faîne, méthodologie, manuel','Ulrich E, Lanier M, Roulet P',1994,'Manuels de référence','17-06'],
            ['RENECOFOR - Manuel de référence n°6 pour l\'échantillonnage foliaire, la préparation des échantillons et l\'analyse, placette de niveau 1','échantillonnage foliaire, analyse foliaire, aiguille, manuel, méthodologie','Bonneau M, Ulrich E, Adrian M, Lanier M',1993,'Manuels de référence','17-07'],
            ['RENECOFOR - Manuel de référence n°6 pour l\'échantillonnage foliaire, la préparation des échantillons et l\'analyse, placette de niveau 1','échantillonnage foliaire, analyse foliaire, aiguille, manuel, méthodologie','Croisé L, Bonneau M, Ulrich E, Adrian M, Lanier M',2005,'Manuels de référence','17-08']
        ];

        this.westgridPanel = new Ext.grid.GridPanel({
            region:'center',
            store : new Ext.data.ArrayStore({
                // store configs
                autoDestroy: true,
                data:myData,
                autoLoad:true,
                // reader configs
                idIndex: 5,
                fields: [
                   {name: 'title'},
                   {name: 'subject'},
                   {name: 'authors'},
                   {name: 'publication_date', type: 'int'},
                   {name: 'publication'},
                   {name: 'reference'}
                ]
            }),
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    width: 120,
                    sortable: true
                },
                columns: [
                    {header: 'Titre', width: 200, dataIndex: 'title'},
                    {header: 'Sujet', width: 200, dataIndex: 'subject'},
                    {header: 'Auteurs', dataIndex: 'authors'},
                    {header: 'Parution', width: 50, dataIndex: 'publication_date'},
                    {header: 'Publication', dataIndex: 'publication'},
                    {id: 'reference', header: 'Référence', width: 50, dataIndex: 'reference'}
                ],
            }),
            sm: new Ext.grid.RowSelectionModel({
                singleSelect:true,
                listeners:{
                    'rowselect':function(sm, rowIdx, r){
                        this.westDocSlipPanel.update(r.data);
                    },
                    scope:this
                }
            }),
            listeners:{
                'keydown':function(event){
                    if(event.keyCode == event.ENTER){
                        this.onEnter();
                    }
                },
                scope:this
            }
        });
        
        this.westDocSlipPanel = new Ext.form.FieldSet({
            region:'south',
            data:{
                title:'RENECOFOR - Manuel de référence n°5 pour la collecte de la litière et le traitement des échantillons recueillis, placette de niveau 1',
                subject:'litière, fruit, aiguille, gland, faîne...',
                authors:'Ulrich E, Lanier M, Roulet P',
                publication_date:1994,
                publication:'Manuels de référence',
                reference:'17-06'
            },
            margins:{
                top: 5,
                right: 0,
                bottom: 0,
                left: 0
            },
            tpl:new Ext.Template(
                '<div class="doc-search-page-doc-slip-panel-div">',
                    '<p><b>Titre :</b> {title}</p>',
                    '<p><b>Auteurs :</b> {authors}</p>',
                    '<p><b>Sujet :</b> {subject}</p>',
                    '<p><b>Année de publication :</b> {publication_date}</p>',
                    '<p><b>Publication :</b> {publication}</p>',
                    '<p><b>Référence :</b> {reference}</p>',
                '</div>',
                // a configuration object:
                {
                    compiled: true,      // compile immediately
                    disableFormats: true // See Notes below.
                }
            )
        });
        this.westBottomPanel = new Ext.Panel({
            title:'Resultat(s)',
            frame:true,
            layout:'border',
            items:[
                this.westgridPanel,
                this.westDocSlipPanel
            ]
        });

        this.westPanel = new Ext.Panel({
            region:'west',
            layout:'accordion',
            width:'400px',
            items:[
                this.westSearchPanel,
                this.westBottomPanel
            ]
        });

        this.pdf = new Genapp.PDFComponent({
            xtype: 'pdf',
            url: 'pdf'
        });

        this.centerPanel = new Ext.Panel({
            title: 'My pdf',
            region: 'center',
            frame: true,
            margins:{
                top: 0,
                right: 0,
                bottom: 0,
                left: 5
            },
            items: this.pdf
        });

        if (!this.items) {
            this.items = [this.westPanel, this.centerPanel];
        }

        Genapp.ConsultationPanel.superclass.initComponent.call(this);
    },
    
    onEnter: function() {
        var g = this.westgridPanel;
        var sm = g.getSelectionModel();
        var sels = sm.getSelections();
        //for (var i = 0, len = sels.length; i < len; i++) {
            //var rowIdx = g.getStore().indexOf(sels[0]);
            this.pdf.updateUrl('pdf/' + sels[0].data.reference + '.pdf');
        //}
    },
});
Ext.reg('docsearchpage', Genapp.DocSearchPage);