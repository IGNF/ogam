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
    /**
     * @cfg {String} descriptionTitle
     * The description Title (defaults to <tt>''</tt>)
     */
    descriptionTitle:"",
    /**
     * @cfg {String} nameColumnHeader
     * The name Column Header (defaults to <tt>'Name'</tt>)
     */
    nameColumnHeader: "Name",
    /**
     * @cfg {String} labelColumnHeader
     * The label Column Header (defaults to <tt>'Label'</tt>)
     */
    labelColumnHeader: "Label",
    /**
     * @cfg {String} descriptionColumnHeader
     * The description Column Header (defaults to <tt>'Description'</tt>)
     */
    descriptionColumnHeader: "Description",
    /**
     * @cfg {String} dateColumnHeader
     * The date Column Header (defaults to <tt>'Date'</tt>)
     */
    dateColumnHeader: "Date",
    /**
     * @cfg {String} clickColumnHeader
     * The click Column Header (defaults to <tt>'Click(s)'</tt>)
     */
    clickColumnHeader: "Click(s)",
    /**
     * @cfg {String} positionColumnHeader
     * The position Column Header (defaults to <tt>'Rank'</tt>)
     */
    positionColumnHeader: "Rank",
    /**
     * @cfg {String} groupNameColumnHeader
     * The group Name Column Header (defaults to <tt>'Group name'</tt>)
     */
    groupNameColumnHeader: "Group name",
    /**
     * @cfg {String} groupLabelColumnHeader
     * The group Label Column Header (defaults to <tt>'Group label'</tt>)
     */
    groupLabelColumnHeader: "Group label",
    /**
     * @cfg {String} groupPositionColumnHeader
     * The group Position Column Header (defaults to <tt>'Group Rank'</tt>)
     */
    groupPositionColumnHeader: "Group Rank",
    /**
     * @cfg {String} groupTextTpl
     * The group Text Tpl (defaults to <tt>'{group} ({[values.rs.length]})'</tt>)
     */
    groupTextTpl:"{group} ({[values.rs.length]})",
    /**
     * @cfg {String} resetButtonText
     * The reset Button Text (defaults to <tt>'Reset'</tt>)
     */
    resetButtonText:"Reset",
    /**
     * @cfg {String} resetButtonTooltip
     * The reset Button Tooltip (defaults to <tt>'Reset the form with the default values'</tt>)
     */
    resetButtonTooltip:"Reset the form with the default values",
    /**
     * @cfg {String} launchRequestButtonText
     * The launch Request Button Text (defaults to <tt>'Launch the request'</tt>)
     */
    launchRequestButtonText:"Launch the request",
    /**
     * @cfg {String} launchRequestButtonTooltip
     * The launch Request Button Tooltip (defaults to <tt>'Launch the request in the consultation page'</tt>)
     */
    launchRequestButtonTooltip:"Launch the request in the consultation page",
    /**
     * @cfg {String} loadingText
     * The loading Text (defaults to <tt>'Loading...'</tt>)
     */
    loadingText:"Loading...",
    /**
     * @cfg {String} defaultCardPanelText
     * The default Card Panel Text (defaults to <tt>'Please select a request...'</tt>)
     */
    defaultCardPanelText:"Please select a request...",
    /**
     * @cfg {String} defaultErrorCardPanelText
     * The default Error Card Panel Text (defaults to <tt>'Sorry, the loading failed...'</tt>)
     */
    defaultErrorCardPanelText:"Sorry, the loading failed...",
    /**
     * @cfg {String} criteriaPanelTitle
     * The criteria Panel Title (defaults to <tt>'Request criteria'</tt>)
     */
    criteriaPanelTitle:"Request criteria",

    // private
    initComponent : function() {

        /**
         * The grid reader
         */
        var gridReader = new Ext.data.ArrayReader({
            root:'rows',
            totalProperty:'total'
            }, [
           {name: 'request_name', type: 'string'},
           {name: 'label', type: 'string'},
           {name: 'definition', type: 'string'},
           {name: 'click', type: 'int'},
           {name: 'date', type: 'date', dateFormat: 'Y-m-d'},
           {name: 'criteria_hint', type: 'string'},
           {name: 'position', type: 'int'},
           {name: 'group_name', type: 'string'},
           {name: 'group_label', type: 'string'},
           {name: 'group_position', type: 'int'},
           {name: 'dataset_id', type: 'string'}
        ]);

        /**
         * The grid store
         */
        var gridStore = new Ext.data.GroupingStore({
            reader: gridReader,
            autoDestroy: true,
            url: Genapp.ajax_query_url + 'ajaxgetpredefinedrequestlist',
            remoteSort: false,
            sortInfo:{field: 'position', direction: "ASC"},
            groupField:'group_position' // Note: This field is used to group the rows and to sort the groups too
        });

        /**
         * Setup the grid row expander template
         */
        var gridRowExpanderTemplate = [];
        if(!Ext.isEmpty(this.descriptionTitle)){
            gridRowExpanderTemplate.push('<h4 class="genapp-predefined-request-grid-panel-description-title">' + this.descriptionTitle + ':</h4>');
        }
        gridRowExpanderTemplate.push('<p class="genapp-predefined-request-grid-panel-description-text">{definition}</p>');

        /**
         * The grid row expander
         */
        var gridRowExpander = new Ext.ux.grid.RowExpander({
            tpl : new Ext.Template(gridRowExpanderTemplate)
        });

        /**
         * Function used to format the grouping field value for display in the group
         * 
         * @param {Object} v The new value of the group field.
         * @param {undefined} unused Unused parameter.
         * @param {Ext.data.Record} r The Record providing the data for the row which caused group change.
         * @param {Number} rowIndex The row index of the Record which caused group change.
         * @param {Number} colIndex The column index of the group field.
         * @param {Ext.data.Store} ds The Store which is providing the data Model.
         * @param {String} dataName The dataName to display
         * @returns {String} A string to display.
         */
        var groupRendererFct = function(v, unused, r, rowIndex, colIndex, ds, dataName) {
            return r.data[dataName];
        }

        /**
         * The grid column model
         */
        var colModel = new Ext.grid.ColumnModel({
            defaults: {
                sortable: true
            },
            columns:[
                //gridRowExpander, // Show a expand/collapse tools for each row
                {id: 'request_name', header: this.nameColumnHeader, dataIndex: 'request_name', width:30, groupable :false, hidden: true},
                {header: this.labelColumnHeader, dataIndex: 'label', groupable :false},
                {header: this.descriptionColumnHeader, dataIndex: 'definition', groupable :false, hidden: true},
                {header: this.dateColumnHeader, dataIndex: 'date', format: 'Y/m/d', xtype:'datecolumn', width:20, groupable :false, hidden: true},
                {header: this.clickColumnHeader, dataIndex: 'click', width:10, groupable :false, hidden: true},
                {header: this.positionColumnHeader, dataIndex: 'position', width:10, groupable :false},
                {header: this.groupNameColumnHeader, dataIndex: 'group_name', hidden: true, 
                    groupRenderer: groupRendererFct.createDelegate(this, ['group_label'], true)
                },
                {header: this.groupLabelColumnHeader, dataIndex: 'group_label', hidden: true},
                {header: this.groupPositionColumnHeader, dataIndex: 'group_position', width:10,
                    groupRenderer: groupRendererFct.createDelegate(this, ['group_label'], true)
                }
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
                groupTextTpl: this.groupTextTpl
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
            activeItem: 2,
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
                        text:this.resetButtonText,
                        listeners:{
                            'render':function(cmp){
                                new Ext.ToolTip({
                                    anchor: 'left',
                                    target: cmp.getEl(),
                                    html:this.resetButtonTooltip,
                                    showDelay: Ext.QuickTips.getQuickTip().showDelay,
                                    dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                                });
                            },
                            scope:this
                        },
                        handler:function(b,e){
                            var selectedRequest = this.grid.getSelectionModel().getSelected();
                            this.requestCriteriaCardPanel.getComponent(selectedRequest.data.request_name).getForm().reset();
                        },
                        scope:this
                    }),
                    this.launchRequestButton = new Ext.Button({
                        text: this.launchRequestButtonText,
                        listeners:{
                            'render':function(cmp){
                                new Ext.ToolTip({
                                    anchor: 'left',
                                    target: cmp.getEl(),
                                    html:this.launchRequestButtonTooltip,
                                    showDelay: Ext.QuickTips.getQuickTip().showDelay,
                                    dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                                });
                            },
                            scope:this
                        },
                        handler:function(b,e){
                            // Get the selected request and the new criteria values
                            var selectedRequestData = this.grid.getSelectionModel().getSelected().data;
                            var fieldValues = this.requestCriteriaCardPanel.getComponent(selectedRequestData.request_name).getForm().getValues(); // getFieldValues() doesn't work like expected with the checkbox
                            // Load and launch the request
                            var consultationPanel = Ext.getCmp('consultation_panel');
                            consultationPanel.loadRequest({
                                datasetId:selectedRequestData.dataset_id,
                                name:selectedRequestData.request_name,
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
                    html: this.loadingText
                }
            },{
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'genapp-predefined-request-criteria-panel-error-msg',
                    html: this.defaultErrorCardPanelText
                }
            },{
                xtype: 'box',
                autoEl: {
                    tag: 'div',
                    cls: 'genapp-predefined-request-criteria-panel-intro',
                    html: this.defaultCardPanelText
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
                    xtype: 'button',
                    text: this.consultationButtonText,
                    listeners:{
                        'render':function(cmp){
                            new Ext.ToolTip({
                                anchor: 'left',
                                target: cmp.getEl(),
                                html:this.consultationButtonTooltip,
                                showDelay: Ext.QuickTips.getQuickTip().showDelay,
                                dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                            });
                        },
                        scope:this
                    },
                    scope: this,
                    handler: function(b,e){
                        Genapp.cardPanel.getLayout().setActiveItem('consultation_panel');
                    }
                }]
            },
            items: this.requestCriteriaCardPanel
        });

        this.items = [this.grid,this.eastPanel];
        this.listeners = {
            'activate': function(){
                var selectedRecord = this.grid.getSelectionModel().getSelected();
                this.grid.getStore().reload({
                    callback: function(records, options, success) {
                        if (success) {
                            if (!Ext.isEmpty(selectedRecord)) {
                                var indexToSelect = this.grid.getStore().findExact('request_name',selectedRecord.data.request_name);
                                this.grid.getSelectionModel().selectRow(indexToSelect);
                                this.grid.plugins.expandRow(indexToSelect);
                            }
                        } else {
                            console.log('Request failure: ');
                            console.log('records:', records, 'options:', options);
                            this.requestCriteriaCardPanel.getLayout().setActiveItem(1);
                        }
                    },
                    scope: this
                });
            },
            scope: this
        }

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
        if(Ext.isEmpty(this.requestCriteriaCardPanel.getComponent(rec.data.request_name))){
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
                        itemId: rec.data.request_name,
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
                        requestCriteriaPanel.add(Genapp.FieldForm.prototype.getCriteriaConfig(result.records[i].data, true));
                    }
                    this.requestCriteriaCardPanel.add(requestCriteriaPanel);
                    this.showCriteriaPanel(rec.data.request_name);
                    this.requestCriteriaCardPanel.doLayout();
                },
                failure: function(response, opts) {
                    console.log('Request failure: ' + response.statusText);
                    console.log('Response:', response, 'Options:', opts);
                    this.requestCriteriaCardPanel.getLayout().setActiveItem(1);
                },
                params: { request_name: rec.data.request_name },
                scope:this
             });
        }else{
            this.showCriteriaPanel(rec.data.request_name);
        }
    },

    /**
     * Show a criteria panel
     * 
     * @param {String} requestName The request name
     */
    showCriteriaPanel : function(requestName){
        this.requestCriteriaCardPanel.setTitle(this.criteriaPanelTitle);
        this.requestCriteriaCardPanelFooterTBar.show();
        this.requestCriteriaCardPanel.getLayout().setActiveItem(requestName);
    }
});