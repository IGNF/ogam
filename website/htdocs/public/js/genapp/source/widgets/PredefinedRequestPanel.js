/**
 * A PredefinedRequestPanel correspond to the complete page for selecting the predefined request.
 * 
 * @class Genapp.PredefinedRequestPanel
 * @extends Ext.Panel
 * @constructor Create a new Predefined Request Panel
 * @param {Object} config The config object
 * @xtype predefinedrequestpanel
 */
Genapp.PredefinedRequestPanel = Ext.extend(Ext.Panel, {
    /**
     * @cfg {String} itemId
     * <p>An <tt>itemId</tt> can be used as an alternative way to get a reference to a component
     * when no object reference is available.  Instead of using an <code>{@link #id}</code> with
     * {@link Ext}.{@link Ext#getCmp getCmp}, use <code>itemId</code> with
     * {@link Ext.Container}.{@link Ext.Container#getComponent getComponent} which will retrieve
     * <code>itemId</code>'s or <tt>{@link #id}</tt>'s. Since <code>itemId</code>'s are an index to the
     * container's internal MixedCollection, the <code>itemId</code> is scoped locally to the container --
     * avoiding potential conflicts with {@link Ext.ComponentMgr} which requires a <b>unique</b>
     * <code>{@link #id}</code>.</p>
     * <p>Also see <tt>{@link #id}</tt> and <code>{@link #ref}</code>.</p>
     * <p><b>Note</b>: to access the container of an item see <tt>{@link #ownerCt}</tt>.</p>
     * @hide
     */
    itemId:'predefined_request',
    /**
     * @cfg {Boolean} frame
     * <code>false</code> by default to render with plain 1px square borders. <code>true</code> to render with
     * 9 elements, complete with custom rounded corners (also see {@link Ext.Element#boxWrap}).
     * @hide
     */
    frame: true,
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
    title: 'Predefined Request',
    /**
     * @cfg {String/Object} layout
     * <p><b>*Important</b>: In order for child items to be correctly sized and
     * positioned, typically a layout manager <b>must</b> be specified through
     * the <code>layout</code> configuration option.</p>
     * <br><p>The sizing and positioning of child {@link items} is the responsibility of
     * the Container's layout manager which creates and manages the type of layout
     * you have in mind.
     * For complete
     * details regarding the valid config options for each layout type, see the
     * layout class corresponding to the <code>layout</code> specified.</p>
     * @hide
     */
    layout: 'border',
    /**
     * @cfg {String} consultationButtonText
     * The consultation Button Text (defaults to <tt>'Consultation'</tt>)
     */
    consultationButtonText: "Consultation",
    /**
     * @cfg {String} consultationButtonTooltip
     * The consultation Button Tooltip (defaults to <tt>'Go to the consultation page'</tt>)
     */
    consultationButtonTooltip:"Go to the consultation page",

    // private
    initComponent : function() {

        /**
         * The grid reader
         */
        var gridReader = new Ext.data.ArrayReader({
            root:'rows',
            totalProperty:'total'
            }, [
           {name: 'name', type: 'string'},
           {name: 'label', type: 'string'},
           {name: 'definition', type: 'string'},
           {name: 'click', type: 'int'},
           {name: 'date', type: 'date', dateFormat: 'Y-m-d'},
           {name: 'criteria_hint', type: 'string'},
           {name: 'group', type: 'string'},
           {name: 'datasetId', type: 'string'}
        ]);

        /**
         * The grid store
         */
        var gridStore = new Ext.data.GroupingStore({
            reader: gridReader,
            autoDestroy: true,
            autoLoad: true,
            url: Genapp.ajax_query_url + 'ajaxgetpredefinedrequestlist',
            remoteSort: true,
            sortInfo:{field: 'name', direction: "ASC"},
            groupField:'group'
        });

        /**
         * The grid row expander
         */
        var gridRowExpander = new Ext.ux.grid.RowExpander({
            tpl : new Ext.Template(
                '<p><b>Request description:</b> {definition}</p>'
            )
        });

        /**
         * The grid column model
         */
        var colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true
            },
            columns:[
                //gridRowExpander, // Show a expand/collapse tools for each row
                {id: 'name', header: "Name", dataIndex: 'name', width:30},
                {header: "Label", dataIndex: 'label'},
                {header: "Description", dataIndex: 'definition', hidden: true},
                {header: "Date", dataIndex: 'date', format: 'Y/m/d', xtype:'datecolumn', width:20},
                {header: "Click", dataIndex: 'click', width:10},
                {header: "Group", dataIndex: 'group', hidden: true}
            ]
        });

        /**
         * @cfg {Ext.grid.GridPanel} grid
         * The grid
         */
        this.grid = new Ext.grid.GridPanel({
            region:'center',
            margins:{
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            },
            autoExpandColumn: 1,
            border: true,
            plugins: gridRowExpander,
            ds: gridStore,
            cm: colModel,
            view: new Ext.grid.GroupingView({
                forceFit:true,
                groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Items" : "Item"]})'
            }),
            sm: new Ext.grid.RowSelectionModel({
                singleSelect: true,
                listeners: {
                    'rowselect': this.onGridRowSelect,
                    scope:this
                }
            })
        });

        /**
         * @cfg {Ext.form.FieldSet} requestCriteriaCardPanel
         * The request Criteria Card Panel
         */
        this.requestCriteriaCardPanel = new Ext.form.FieldSet({
            cls: 'genapp-predefined-request-criteria-card-panel',
            layout: 'card',
            autoScroll: true,
            activeItem: 1,
            labelWidth: 90,
            title:' ', // Without space the title div is not rendered, so it's not possible to change it later
            defaults: {width: 140, border:false},
            width: 340, // Bug ext: The size must be specified to have a good render when the panel is not activated
            border: true,
            fbar: this.requestCriteriaCardPanelFooterTBar = new Ext.Toolbar({
                hidden: true,
                cls: 'genapp-predefined-request-criteria-panel-footerTBar',
                items: [
                    this.resetButton = new Ext.Button({
                        text:'Reset',
                        handler:function(b,e){
                            var selectedRequest = this.grid.getSelectionModel().getSelected();
                            this.requestCriteriaCardPanel.getComponent(selectedRequest.data.name).getForm().reset();
                        },
                        scope:this
                    }),
                    this.launchRequestButton = new Ext.Button({
                        text:'Launch the request',
                        handler:function(b,e){
                            // Get the selected request and the new criteria values
                            var selectedRequestData = this.grid.getSelectionModel().getSelected().data;
                            var fieldValues = this.requestCriteriaCardPanel.getComponent(selectedRequestData.name).getForm().getValues(); // getFieldValues() doesn't work like expected with the checkbox
                            // Load and launch the request
                            var consultationPanel = Ext.getCmp('consultation_panel');
                            consultationPanel.loadRequest({
                                datasetId:selectedRequestData.datasetId,
                                name:selectedRequestData.name,
                                fieldValues:fieldValues
                            });
                            Genapp.cardPanel.getLayout().setActiveItem('consultation_panel');
                        },
                        scope:this
                    })
                ]
            }),
            items: [{// We can't use the default loading indicator for IE7
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'loading-indicator',
                    html: 'Loading...'
                }
            },{
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'genapp-predefined-request-criteria-panel-intro',
                    html: 'Please select a request...'
                }
            }]
        });

        /**
         * @cfg {Ext.Panel} eastPanel
         * The east Panel containing the requestCriteriaCardPanel
         */
        this.eastPanel = new Ext.Panel({
            region: 'east',
            width: '340px',
            cls:'genapp-predefined-request-east-panel',
            margins:{
                top: 5,
                right: 5,
                bottom: 5,
                left: 5
            },
            bbar: {
                items:[{
                    xtype: 'tbfill'
                },{
                    xtype: 'tbbutton',
                    text: this.consultationButtonText,
                    tooltipType: 'title',
                    tooltip: this.consultationButtonTooltip,
                    scope: this,
                    handler: function(b,e){
                        Genapp.cardPanel.getLayout().setActiveItem('consultation_panel');
                    }
                }]
            },
            items: this.requestCriteriaCardPanel
        });

        this.items = [this.grid,this.eastPanel];

        Genapp.PredefinedRequestPanel.superclass.initComponent.call(this);
    },

    /**
     * Show a criteria panel when a row is selected.
     * 
     * @param {SelectionModel} sm the grid selection model
     * @param {Number} row The selected index
     * @param {Ext.data.Record} rec The selected record
     */
    onGridRowSelect : function(sm, row, rec) {
        this.requestCriteriaCardPanel.setTitle('');
        this.requestCriteriaCardPanelFooterTBar.hide();
        this.requestCriteriaCardPanel.getLayout().setActiveItem(0);
        if(Ext.isEmpty(this.requestCriteriaCardPanel.getComponent(rec.data.name))){
            Ext.Ajax.request({
                url: Genapp.ajax_query_url + 'ajaxgetpredefinedrequestcriteria',
                success: function(response, opts) {
                    var myReader = new Ext.data.ArrayReader({
                        root:'criteria',
                        fields:[
                            'name',
                            'format',
                            'data',
                            'default_value', // value
                            'fixed',
                            'inputType',
                            'type',
                            'label',
                            'definition',
                            'params'
                        ]
                    });
                    var result = myReader.readRecords(Ext.decode(response.responseText));
                    var requestCriteriaPanel = new Ext.form.FormPanel({
                        itemId: rec.data.name,
                        labelWidth: 120,
                        autoHeight: true, // Necessary for IE7
                        defaults: {
                            labelStyle: 'padding: 0; margin-top:3px', 
                            width: 180
                        },
                        items: {
                            xtype: 'box',
                            autoEl: {
                                tag: 'div',
                                cls: 'genapp-predefined-request-criteria-panel-criteria-hint',
                                style: 'width:200px;',
                                html: rec.data.criteria_hint
                            }
                        }
                    });
                    for(var i = 0; i < result.records.length; i++){
                        // Add the field
                        requestCriteriaPanel.add(Genapp.FieldForm.prototype.getCriteriaConfig(result.records[i].data, true, requestCriteriaPanel));
                    }
                    this.requestCriteriaCardPanel.add(requestCriteriaPanel);
                    this.showCriteriaPanel(rec.data.name);
                    this.requestCriteriaCardPanel.doLayout();
                },
                failure: function(response, opts) {
                    console.log('server-side failure with status code ' + response.status);
                },
                params: { request_name: rec.data.name },
                scope:this
             });
        }else{
            this.showCriteriaPanel(rec.data.name);
        }
    },

    /**
     * Show a criteria panel
     * 
     * @param {String} requestName The request name
     */
    showCriteriaPanel : function(requestName){
        this.requestCriteriaCardPanel.setTitle('Request criteria');
        this.requestCriteriaCardPanelFooterTBar.show();
        this.requestCriteriaCardPanel.getLayout().setActiveItem(requestName);
    }
});