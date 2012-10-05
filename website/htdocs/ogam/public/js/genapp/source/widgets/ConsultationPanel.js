/**
 * A ConsultationPanel correspond to the complete page for querying request
 * results.
 * 
 * @class Genapp.ConsultationPanel
 * @extends Ext.Panel
 * @constructor Create a new Consultation Panel
 * @param {Object}
 *            config The config object
 * @xtype consultationpanel
 */
Genapp.ConsultationPanel = Ext
		.extend(
				Ext.Panel,
				{
					/**
					 * @cfg {String} title The title text to be used as
					 *      innerHTML (html tags are accepted) to display in the
					 *      panel <code>{@link #header}</code> (defaults to
					 *      ''). When a <code>title</code> is specified the
					 *      <code>{@link #header}</code> element will
					 *      automatically be created and displayed unless
					 *      {@link #header} is explicitly set to
					 *      <code>false</code>. If you do not want to specify
					 *      a <code>title</code> at config time, but you may
					 *      want one later, you must either specify a non-empty
					 *      <code>title</code> (a blank space ' ' will do) or
					 *      <code>header:true</code> so that the container
					 *      element will get created. Default to 'Predefined
					 *      Request'.
					 */
					title : 'Consultation',
					/**
					 * @cfg {Boolean} frame <code>false</code> by default to
					 *      render with plain 1px square borders.
					 *      <code>true</code> to render with 9 elements,
					 *      complete with custom rounded corners (also see
					 *      {@link Ext.Element#boxWrap}).
					 * @hide
					 */
					frame : true,
					/**
					 * @cfg {String} region Note: this config is only used when
					 *      this BoxComponent is rendered by a Container which
					 *      has been configured to use the
					 *      {@link Ext.layout.BorderLayout BorderLayout} layout
					 *      manager (eg. specifying layout:'border'). See
					 *      {@link Ext.layout.BorderLayout} also. Set by default
					 *      to 'center'.
					 */
					region : 'center',
					/**
					 * @cfg {String/Object} layout Specify the layout manager
					 *      class for this container either as an Object or as a
					 *      String. See
					 *      {@link Ext.Container#layout layout manager} also.
					 *      Default to 'border'.
					 */
					layout : 'border',
					/**
					 * @cfg {String} cls An optional extra CSS class that will
					 *      be added to this component's Element (defaults to
					 *      'genapp_consultation_panel'). This can be useful for
					 *      adding customized styles to the component or any of
					 *      its children using standard CSS rules.
					 */
					cls : 'genapp_consultation_panel',
					/**
					 * @cfg {Boolean} border True to display the borders of the
					 *      panel's body element, false to hide them (defaults
					 *      to false). By default, the border is a 2px wide
					 *      inset border, but this can be further altered by
					 *      setting {@link #bodyBorder} to false.
					 */
					border : false,
					/**
					 * @cfg {String} id
					 *      <p>
					 *      The <b>unique</b> id of this component (defaults to
					 *      an {@link #getId auto-assigned id}). You should
					 *      assign an id if you need to be able to access the
					 *      component later and you do not have an object
					 *      reference available (e.g., using {@link Ext}.{@link Ext#getCmp getCmp}).
					 *      </p>
					 *      <p>
					 *      Note that this id will also be used as the element
					 *      id for the containing HTML element that is rendered
					 *      to the page for this component. This allows you to
					 *      write id-based CSS rules to style the specific
					 *      instance of this component uniquely, and also to
					 *      select sub-elements using this component's id as the
					 *      parent.
					 *      </p>
					 *      <p>
					 *      <b>Note</b>: to avoid complications imposed by a
					 *      unique <tt>id</tt> also see
					 *      <code>{@link #itemId}</code> and
					 *      <code>{@link #ref}</code>.
					 *      </p>
					 *      <p>
					 *      <b>Note</b>: to access the container of an item see
					 *      <code>{@link #ownerCt}</code>.
					 *      </p>
					 */
					id : 'consultation_panel',
					/**
					 * @cfg {String} ref
					 *      <p>
					 *      A path specification, relative to the Component's
					 *      <code>{@link #ownerCt}</code> specifying into
					 *      which ancestor Container to place a named reference
					 *      to this Component.
					 *      </p>
					 *      <p>
					 *      The ancestor axis can be traversed by using '/'
					 *      characters in the path. For example, to put a
					 *      reference to a Toolbar Button into <i>the Panel
					 *      which owns the Toolbar</i>:
					 *      </p>
					 * 
					 * <pre><code>
					 * var myGrid = new Ext.grid.EditorGridPanel({
					 * 	title : 'My EditorGridPanel',
					 * 	store : myStore,
					 * 	colModel : myColModel,
					 * 	tbar : [ {
					 * 		text : 'Save',
					 * 		handler : saveChanges,
					 * 		disabled : true,
					 * 		ref : '../saveButton'
					 * 	} ],
					 * 	listeners : {
					 * 		afteredit : function() {
					 * 			//      The button reference is in the GridPanel
					 * 	myGrid.saveButton.enable();
					 * }
					 * }
					 * });
					 * </code></pre>
					 * 
					 * <p>
					 * In the code above, if the <code>ref</code> had been
					 * <code>'saveButton'</code> the reference would have been
					 * placed into the Toolbar. Each '/' in the <code>ref</code>
					 * moves up one level from the Component's
					 * <code>{@link #ownerCt}</code>.
					 * </p>
					 * <p>
					 * Also see the <code>{@link #added}</code> and
					 * <code>{@link #removed}</code> events.
					 * </p>
					 */
					ref : 'consultationPage',
					/**
					 * @cfg {Boolean} hideCsvExportAlert if true hide the csv
					 *      export alert for IE (defaults to true).
					 */
					hideCsvExportAlert : false,
					/**
					 * @cfg {Boolean} hideCsvExportButton if true hide the csv
					 *      export button (defaults to false).
					 */
					hideCsvExportButton : false,
					/**
					 * @cfg {Boolean} hideCancelButton if true hide the cancel
					 *      button (defaults to false).
					 */
					hideCancelButton : false,
					/**
					 * @cfg {Boolean} hideResetButton if true hide the reset
					 *      button (defaults to false).
					 */
					hideResetButton : false,
					/**
					 * @cfg {Boolean} hidePrintMapButton if true hide the Print
					 *      Map Button (defaults to false).
					 */
					hidePrintMapButton : true,
					/**
					 * @cfg {Boolean} hideDetails if true hide the details
					 *      button in the result panel (defaults to false).
					 */
					hideDetails : false,
					/**
					 * @cfg {Boolean} hideMapDetails if true hide the details
					 *      button in map toolbar (defaults to true).
					 */
					hideMapDetails : true,
					/**
					 * @cfg {Boolean} hideUserManualLink if true hide the user
					 *      manual link (defaults to true).
					 */
					hideUserManualLink : true,
					/**
					 * @cfg {Boolean} hidePredefinedRequestSaveButton if true
					 *      hide the predefined request save button (defaults to
					 *      true).
					 */
					hidePredefinedRequestSaveButton : true,
					/**
					 * @cfg {Boolean} hideGridDataEditButton if true hide the
					 *      grid data edit button (defaults to true).
					 */
					hideGridDataEditButton : true,
					/**
					 * @cfg {String} userManualLinkHref The user Manual Link
					 *      Href (defaults to
					 *      <tt>'Genapp.base_url + 'pdf/User_Manual.pdf''</tt>)
					 */
					userManualLinkHref : Genapp.base_url + 'pdf/User_Manual.pdf',
					/**
					 * @cfg {String} userManualLinkText The user Manual LinkText
					 *      (defaults to <tt>'User Manual'</tt>)
					 */
					userManualLinkText : 'User Manual',
					/**
					 * @cfg {Boolean} hideDetailsVerticalLabel if true hide the
					 *      details vertical label (defaults to false).
					 */
					hideDetailsVerticalLabel : false,
					/**
					 * @cfg {Boolean} hideLayerSelector if true hide the layer
					 *      selector. The layer selector is required for the
					 *      following tools.
					 */
					hideLayerSelector : false,
					hideSnappingButton : true,
					hideGetFeatureButton : true,
					hideFeatureInfoButton : false,
					/**
					 * @cfg {Boolean} showGridOnSubmit if true activate the Grid
					 *      Panel on the form submit (defaults to false).
					 */
					showGridOnSubmit : false,
					/**
					 * @cfg {String} datasetComboBoxEmptyText The dataset Combo
					 *      Box Empty Text (defaults to
					 *      <tt>'Please select a dataset'</tt>)
					 */
					datasetComboBoxEmptyText : "Please select a dataset...",
					/**
					 * @cfg {String} datasetPanelTitle The dataset Panel Title
					 *      (defaults to <tt>'Dataset'</tt>)
					 */
					datasetPanelTitle : 'Dataset',
					/**
					 * @cfg {String} formsPanelTitle The forms Panel Title
					 *      (defaults to <tt>'Forms Panel'</tt>)
					 */
					formsPanelTitle : 'Forms Panel',
					/**
					 * @cfg {String} exportButtonText The csv Export Button Text
					 *      (defaults to <tt>'Export'</tt>)
					 */
					exportButtonText : 'Export',
					/**
					 * @cfg {String} csvExportMenuItemText The grid Csv Export
					 *      Menu Item Text (defaults to <tt>'Export CSV'</tt>)
					 */
					csvExportMenuItemText : 'Export CSV',
					kmlExportMenuItemText : 'Export KML',
					/**
					 * @cfg {String} printMapButtonText The print Map Button
					 *      Text (defaults to <tt>'Print map'</tt>)
					 */
					printMapButtonText : 'Print map',
					/**
					 * @cfg {String} gridViewEmptyText The grid View Empty Text
					 *      (defaults to <tt>'No result...'</tt>)
					 */
					gridViewEmptyText : 'No result...',
					/**
					 * @cfg {String} gridPanelTitle The grid Panel Title
					 *      (defaults to <tt>'Results'</tt>)
					 */
					gridPanelTitle : 'Results',
					/**
					 * @cfg {String} gridPanelTabTip The grid Panel Tab Tip
					 *      (defaults to <tt>'The request's results'</tt>)
					 */
					gridPanelTabTip : 'The request\'s results',
					/**
					 * @cfg {Number} gridPageSize The grid page size (defaults
					 *      to <tt>20</tt>)
					 */
					gridPageSize : 20,
					/**
					 * @cfg {String} centerPanelTitle The center Panel Title
					 *      (defaults to <tt>'Result Panel'</tt>)
					 */
					centerPanelTitle : 'Result Panel',
					/**
					 * @cfg {String} queryPanelTitle The query Panel Title
					 *      (defaults to <tt>'Query Panel'</tt>)
					 */
					queryPanelTitle : "Query Panel",
					/**
					 * @cfg {Integer} queryPanelWidth The query Panel Width
					 *      (defaults to <tt>370</tt>)
					 */
					queryPanelWidth : 370,
					/**
					 * @cfg {String} queryPanelPinToolQtip The query Panel Pin
					 *      Tool Qtip (defaults to <tt>'Pin the panel'</tt>)
					 */
					queryPanelPinToolQtip : 'Pin the panel',
					/**
					 * @cfg {String} queryPanelUnpinToolQtip The query Panel
					 *      Unpin Tool Qtip (defaults to
					 *      <tt>'Unpin the panel'</tt>)
					 */
					queryPanelUnpinToolQtip : 'Unpin the panel',
					/**
					 * @cfg {String} queryPanelCancelButtonText The query Panel
					 *      Cancel Button Text (defaults to <tt>'Cancel'</tt>)
					 */
					queryPanelCancelButtonText : "Cancel",
					/**
					 * @cfg {String} queryPanelPredefinedRequestSaveButtonText
					 *      The query Panel Predefined Request Save Button Text
					 *      (defaults to <tt>'Save the request'</tt>)
					 */
					queryPanelPredefinedRequestSaveButtonText : "Save the request",
					/**
					 * @cfg {String} queryPanelResetButtonText The query Panel
					 *      Reset Button Text (defaults to <tt>'Reset'</tt>)
					 */
					queryPanelResetButtonText : "Reset",
					/**
					 * @cfg {String} queryPanelSearchButtonText The query Panel
					 *      Search Button Text (defaults to <tt>'Search'</tt>)
					 */
					queryPanelSearchButtonText : "Search",
					/**
					 * @cfg {String} queryPanelCancelButtonTooltip The query
					 *      Panel Cancel Button Tooltip (defaults to
					 *      <tt>'Cancel the request'</tt>)
					 */
					queryPanelCancelButtonTooltip : "Cancel the request",
					/**
					 * @cfg {String}
					 *      queryPanelPredefinedRequestSaveButtonTooltip The
					 *      query Panel Predefined Request Save Button Tooltip
					 *      (defaults to
					 *      <tt>'Add the current request to the predefined requests'</tt>)
					 */
					queryPanelPredefinedRequestSaveButtonTooltip : "Add the current request to the predefined requests",
					/**
					 * @cfg {String} queryPanelResetButtonTooltip The query
					 *      Panel Reset Button Tooltip (defaults to
					 *      <tt>'Reset the request'</tt>)
					 */
					queryPanelResetButtonTooltip : "Reset the request",
					/**
					 * @cfg {String} queryPanelSearchButtonTooltip The query
					 *      Panel Search Button Tooltip (defaults to
					 *      <tt>'Launch the request'</tt>)
					 */
					queryPanelSearchButtonTooltip : "Launch the request",
					/**
					 * @cfg {String} detailsPanelCtTitle The details PanelCt
					 *      Title (defaults to <tt>'Details'</tt>)
					 */
					detailsPanelCtTitle : 'Details',
					/**
					 * @cfg {String} detailsPanelCtPinToolQtip The details
					 *      PanelCt Pin Tool Qtip (defaults to
					 *      <tt>'Pin the panel'</tt>)
					 */
					detailsPanelCtPinToolQtip : 'Pin the panel',
					/**
					 * @cfg {String} detailsPanelCtUnpinToolQtip The details
					 *      PanelCt Unpin Tool Qtip (defaults to
					 *      <tt>'Unpin the panel'</tt>)
					 */
					detailsPanelCtUnpinToolQtip : 'Unpin the panel',
					/**
					 * @cfg {String} featuresInformationPanelCtTitle The
					 *      features Information PanelCt Title (defaults to
					 *      <tt>'Features Information'</tt>)
					 */
					featuresInformationPanelCtTitle : 'Features Information',
					/**
					 * @cfg {Number} featuresInformationPanelCtHeight The
					 *      features Information Panel Ct Height (defaults to
					 *      <tt>185 (3 rows)</tt>)
					 */
					featuresInformationPanelCtHeight : 185,
					/**
					 * @cfg {String} mapMaskMsg The map Mask Msg (defaults to
					 *      <tt>'Loading...'</tt>)
					 */
					mapMaskMsg : "Loading...",
					/**
					 * @cfg {String} alertErrorTitle The alert Error Title
					 *      (defaults to <tt>'Error :'</tt>)
					 */
					alertErrorTitle : 'Error :',
					/**
					 * @cfg {String} alertRequestFailedMsg The alert Request
					 *      Failed Msg (defaults to
					 *      <tt>'Sorry, the request failed...'</tt>)
					 */
					alertRequestFailedMsg : 'Sorry, the request failed...',

					/**
					 * @cfg {String} dateFormat The date format for the date
					 *      fields (defaults to <tt>'Y/m/d'</tt>)
					 */
					dateFormat : 'Y/m/d',
					/**
					 * @cfg {String} csvExportAlertTitle The export CSV alert
					 *      title (defaults to <tt>'CSV exportation on IE'</tt>)
					 */
					csvExportAlertTitle : 'CSV exportation on IE',
					/**
					 * @cfg {String} csvExportAlertMsg The export CSV alert
					 *      message (defaults to
					 *      <tt>'On IE you have to:<br> - Change the opening of a csv file.<br> - Change the security.'</tt>)
					 */
					csvExportAlertMsg : "<div><H2>For your comfort on Internet Explorer you can:</H2> \
        <H3>Disable confirmation for file downloads.</H3> \
        <ul> \
        <li>In IE, expand the 'Tools' menu</li> \
        <li>Click on 'Internet Options'</li> \
        <li>Click on the 'Security' tab</li> \
        <li>Click on 'Custom Level'</li> \
        <li>Scroll down to the 'Downloads' part</li> \
        <li>Enable the confirmation for file download </li> \
        </ul> \
        <H3>Disable the file opening in the current window.</H3> \
        <ul> \
        <li>Open the workstation</li> \
        <li>Expand the 'Tools' menu</li> \
        <li>Click on 'Folder Options ...'</li> \
        <li>Click on the 'File Types' tab</li> \
        <li>Select the XLS extension</li> \
        <li>Click on the 'Advanced' button</li> \
        <li>Uncheck 'Browse in same window'</li> \
        </ul></div>",
					/**
					 * @cfg {Ext.Button} csvExportButton The csv export button
					 */
					/**
					 * @cfg {Ext.Button} mapPrintButton The map print button
					 */
					/**
					 * @cfg {Boolean} autoZoomOnResultsFeatures True to zoom
					 *      automatically on the results features
					 */
					autoZoomOnResultsFeatures : false,
					/**
					 * @cfg {Boolean} launchRequestOnPredefinedRequestLoad True
					 *      to launch the request on a prefefined request load
					 *      (default to true)
					 */
					launchRequestOnPredefinedRequestLoad : true,
					/**
					 * @cfg {Boolean} collapseQueryPanelOnPredefinedRequestLoad
					 *      True to collapse the query panel on a prefefined
					 *      request load (default to true)
					 */
					collapseQueryPanelOnPredefinedRequestLoad : true,
					// private
					featuresInformationSearchNumber : 0,
					/**
					 * @cfg {Number} tipDefaultWidth The tip Default Width.
					 *      (Default to 300)
					 */
					tipDefaultWidth : 300,
	                /**
                     * @cfg {Number} tipImageDefaultWidth The tip Image Default Width.
                     *      (Default to 200)
                     */
                    tipImageDefaultWidth : 200,
					/**
					 * @cfg {String} openGridDetailsButtonTitle The open Grid
					 *      Details Button Title (defaults to
					 *      <tt>'See the details'</tt>)
					 */
					openGridDetailsButtonTitle : "See the details",
					/**
					 * @cfg {String} openGridDetailsButtonTip The open Grid
					 *      Details Button Tip (defaults to
					 *      <tt>'Display the row details into the details panel.'</tt>)
					 */
					openGridDetailsButtonTip : "Display the row details into the details panel.",
					/**
					 * @cfg {String} seeOnMapButtonTitle The see On Map Button
					 *      Title (defaults to <tt>'See on the map'</tt>)
					 */
					seeOnMapButtonTitle : "See on the map",
					/**
					 * @cfg {String} seeOnMapButtonTip The see On Map Button Tip
					 *      (defaults to
					 *      <tt>'Zoom and centre on the location on the map.'</tt>)
					 */
					seeOnMapButtonTip : "Zoom and centre on the location on the map.",
					/**
					 * @cfg {String} editDataButtonTitle The edit Data Button
					 *      Title (defaults to <tt>'Edit the data'</tt>)
					 */
					editDataButtonTitle : "Edit the data",
					/**
					 * @cfg {String} editDataButtonTip The edit Data Button Tip
					 *      (defaults to
					 *      <tt>'Go to the edition page to edit the page.'</tt>)
					 */
					editDataButtonTip : "Go to the edition page to edit the data.",
					/**
					 * @cfg {String} cannotEditTip
					 */
					cannotEditTip : "You don't have the rights to edit this data.",
					/**
					 * @cfg {Boolean} collapseQueryPanelOnPageLoad Collapse QueryPanel 
					 *      after the page loading (defaults to <tt>false</tt>)
					 */
					collapseQueryPanelOnPageLoad : false,
                    /**
                     * @cfg {Boolean} launchRequestOnPageLoad Launch the request 
                     *      after the page loading (defaults to <tt>false</tt>)
                     */
                    launchRequestOnPageLoad : false,
                    /**
                     * @cfg {String} exportAsPdfButtonText The export as pdf button text
                     *      (defaults to <tt>'Export as pdf'</tt>)
                     */
                    exportAsPdfButtonText: "Export as pdf",

					// private
					initComponent : function() {
						/**
						 * The dataset Data Store.
						 * 
						 * @property datasetDS
						 * @type Ext.data.JsonStore
						 */
						this.datasetDS = new Ext.data.JsonStore({
							url : Genapp.ajax_query_url + 'ajaxgetdatasets',
							method : 'POST',
							autoLoad : true,
							listeners : {
								'load' : {
									fn : function(store, records, options) {
										for (i = 0; i < records.length; i++) {
											if (records[i].data.is_default === '1') {
												this.datasetComboBox.setValue(records[i].data.id);
												this.updateDatasetFormsPanel(records[i].data.id,{
												    collapseQueryPanel : this.collapseQueryPanelOnPageLoad,
						                            launchRequest : this.launchRequestOnPageLoad
												});
												this.updateDatasetPanelToolTip(records[i].data);
												break;
											}
										}
									},
									scope : this
								}
							}
						});

						/**
						 * The dataset ComboBox.
						 * 
						 * @property datasetComboBox
						 * @type Ext.form.ComboBox
						 */
						this.datasetComboBox = new Ext.form.ComboBox({
							name : 'datasetId',
							hiddenName : 'datasetId',
							hideLabel : true,
							store : this.datasetDS,
							editable : false,
							displayField : 'label',
							valueField : 'id',
							forceSelection : true,
							mode : 'local',
							typeAhead : true,
							width : 345,
							maxHeight : 100,
							triggerAction : 'all',
							emptyText : this.datasetComboBoxEmptyText,
							selectOnFocus : true,
							disableKeyFilter : true,
							listeners : {
								'select' : {
									fn : function(combo, record, index) {
										this.updateDatasetFormsPanel(record.data.id);
										this.updateDatasetPanelToolTip(record.data);
									},
									scope : this
								}
							}
						});

						/**
						 * The dataset Panel.
						 * 
						 * @property datasetPanel
						 * @type Ext.Panel
						 */
						this.datasetPanel = new Ext.Panel({
							region : 'north',
							layout : 'form',
							autoHeight : true,
							frame : true,
							margins : '10 0 5 0',
							cls : 'genapp_query_panel_dataset_panel',
							title : this.datasetPanelTitle,
							items : this.datasetComboBox,
						    tools:[{
						        id:'help',
						        scope:this 
						    }]
						});

						/**
						 * The forms panel containing the dynamic forms.
						 * 
						 * @property formsPanel
						 * @type Ext.form.FieldSet
						 */
						this.formsPanel = new Ext.form.FieldSet({
							layout : 'auto',
							region : 'center',
							autoScroll : true,
							cls : 'genapp_query_formspanel',
							frame : true,
							margins : '5 0 5 0',
							title : this.formsPanelTitle,
							keys : {
								key : Ext.EventObject.ENTER,
								fn : this.submitRequest,
								scope : this
							}
						});

						/**
						 * The grid data store array reader with a customized
						 * updateMetadata function.
						 * 
						 * @property gridDSReader
						 * @type Ext.data.ArrayReader
						 */
						this.gridDSReader = new Ext.data.ArrayReader();

						// Creates a reader metadata update function
						this.gridDSReader.updateMetadata = function(meta) {
							delete this.ef;
							this.meta = meta;
							this.recordType = Ext.data.Record.create(meta.fields);
							this.onMetaChange(meta, this.recordType, {
								metaData : meta
							});
						};

						/**
						 * The grid data store.
						 * 
						 * @property gridDS
						 * @type Ext.data.Store
						 */
						this.gridDS = new Ext.data.Store({
							// store configs
							autoDestroy : true,
							url : Genapp.ajax_query_url + 'ajaxgetresultrows',
							remoteSort : true,
							// reader configs
							reader : this.gridDSReader
						});

						/**
						 * The grid paging toolbar with a customized reset
						 * function.
						 * 
						 * @property pagingToolbar
						 * @type Ext.PagingToolbar
						 */
						this.pagingToolbar = new Ext.PagingToolbar({
							pageSize : this.gridPageSize,
							store : this.gridDS,
							displayInfo : true
						});

						// Creates a paging toolbar reset function
						this.pagingToolbar.reset = function() {
							if (!this.rendered) {
								return;
							}
							this.afterTextItem.setText(String.format(this.afterPageText, 1));
							this.inputItem.setValue(1);
							this.first.setDisabled(true);
							this.prev.setDisabled(true);
							this.next.setDisabled(true);
							this.last.setDisabled(true);
							this.refresh.enable();
							if (this.displayItem) {
								this.displayItem.setText(this.emptyMsg);
							}
							this.fireEvent('change', this, {
								total : 0,
								activePage : 1,
								pages : 1
							});
						};

						/**
						 * The grid view with a customized reset function.
						 * 
						 * @property gridView
						 * @type Ext.grid.GridView
						 */
						this.gridView = new Ext.grid.GridView({
							autoFill : true,
							emptyText : this.gridViewEmptyText,
							deferEmptyText : true
						});

						// Creates a grid view reset function
						this.gridView.reset = function() {
							this.mainBody.dom.innerHTML = '&#160;';
						};

						/**
						 * The grid panel displaying the request results.
						 * 
						 * @property gridPanel
						 * @type Ext.grid.GridPanel
						 */
						this.gridPanel = new Ext.grid.GridPanel({
							frame : true,
							tabTip : this.gridPanelTabTip,
							collapsible : true,
							titleCollapse : true,
							title : this.gridPanelTitle,
							header : false,
							layout : 'fit',
							autoScroll : true,
							loadMask : true,
							view : this.gridView,
							store : this.gridDS,
							trackMouseOver : false,
							sm : new Ext.grid.RowSelectionModel({
								singleSelect : true
							}),
							cm : new Ext.grid.ColumnModel({}),
							bbar : this.pagingToolbar,
							listeners : {
								'activate' : function(panel) {
									if (!this.hideCsvExportButton) {
										this.csvExportButton.show();
									}
									if (!this.hidePrintMapButton) {
										this.printMapButton.hide();
									}
								},
								scope : this
							}
						});

						/**
						 * The map panel.
						 * 
						 * @property geoPanel
						 * @type Genapp.GeoPanel
						 */
						this.geoPanel = new Genapp.GeoPanel({
							hideMapDetails : this.hideMapDetails,
							hideLayerSelector : this.hideLayerSelector,
							hideSnappingButton : this.hideSnappingButton,
							hideGetFeatureButton : this.hideGetFeatureButton,
							hideFeatureInfoButton : this.hideFeatureInfoButton,
							listeners : {
								'activate' : function(panel) {
									if (!this.hideCsvExportButton) {
										this.csvExportButton.hide();
									}
									if (!this.hidePrintMapButton) {
										this.printMapButton.show();
									}
								},
								'addgeomcriteria' : this.addgeomcriteria,
								scope : this
							}
						});

						/**
						 * The center panel containing the map and the grid
						 * panels.
						 * 
						 * @property centerPanel
						 * @type Ext.TabPanel
						 */
						this.centerPanel = new Ext.TabPanel({
							activeItem : 0,
							frame : true,
							plain : true,
							region : 'center',
							title : this.centerPanelTitle,
							items : [ this.geoPanel, this.gridPanel ]
						});

						this.centerPanel.on('render', function(tabPanel) {
							var tabEdgeDiv = tabPanel.getEl().query(".x-tab-edge");
							if (!this.hideUserManualLink) {
								var userManualLinkEl = Ext.DomHelper.insertBefore(tabEdgeDiv[0], {
									tag : 'li',
									children : [ {
										tag : 'a',
										target : '_blank',
										href : this.userManualLinkHref,
										children : [ {
											tag : 'span',
											cls : 'x-tab-strip-text genapp-query-center-panel-tab-strip-link',
											html : this.userManualLinkText
										} ]
									} ]
								}, true);
								// Stop the event propagation to avoid the
								// TabPanel error
								userManualLinkEl.on('mousedown', Ext.emptyFn, null, {
									stopPropagation : true
								});
							}
							function addTopButton(config) {
								var el = Ext.DomHelper.insertBefore(tabEdgeDiv[0], {
									tag : 'li',
									cls : 'genapp-query-center-panel-tab-strip-top-button'
								}, true);
								// Set the ul dom to the size of the TabPanel
								// instead of 5000px by default
								el.parent().setWidth('100%');
								// Stop the event propagation to avoid the
								// TabPanel error
								el.on('mousedown', Ext.emptyFn, null, {
									stopPropagation : true
								});
								return new Ext.ComponentMgr.create(Ext.apply({
									renderTo : el.id
								}, config));
							}

							this.mask = new Ext.LoadMask(this.getEl(), {
								msg : this.mapMaskMsg
							});

							this.centerPanel.doLayout();

							// add the export button
							var csvExportMenuItems = [];
							if (!this.hideGridCsvExportMenuItem) {
								csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
									text : this.csvExportMenuItemText,
									handler : this.exportCSV.createDelegate(this, [ 'csv-export' ]),
									iconCls : 'genapp-query-center-panel-grid-csv-export-menu-item-icon'
								}));
								csvExportMenuItems.push(this.gridCsvExportMenuItem = new Ext.menu.Item({
									text : this.kmlExportMenuItemText,
									handler : this.exportCSV.createDelegate(this, [ 'kml-export' ]),
									iconCls : 'genapp-query-center-panel-grid-csv-export-menu-item-icon'
								}));
							}
							// Hide the csv export button if there are no menu
							// items
							if (Ext.isEmpty(csvExportMenuItems)) {
								this.hideCsvExportButton = true;
							}
							if (!this.hideCsvExportButton) {
								this.csvExportButton = addTopButton({
									xtype : 'splitbutton',
									text : this.exportButtonText,
									disabled : true,
									handler : this.exportCSV.createDelegate(this, [ 'csv-export' ]),
									menu : this.csvExportButtonMenu = new Ext.menu.Menu({
										items : csvExportMenuItems
									})
								});
							}
							if (!this.hidePrintMapButton) {
								this.printMapButton = addTopButton({
									xtype : 'button',
									iconCls : 'genapp-query-center-panel-print-map-button-icon',
									text : this.printMapButtonText,
									handler : this.printMap,
									scope : this
								});
							}
						}, this, {
							single : true
						});

						this.queryPanelPinned = true;

						var tools = null;
						if (!Genapp.hidePinButton) {
							tools = [ {
								id : 'pin',
								qtip : this.queryPanelPinToolQtip,
								hidden : true,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-unpin').show();
									this.queryPanelPinned = true;
								},
								scope : this
							}, {
								id : 'unpin',
								qtip : this.queryPanelUnpinToolQtip,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-pin').show();
									this.queryPanelPinned = false;
								},
								scope : this
							} ];
						}

						// Cancel button
						var cancelButton = null;
						if (!this.hideCancelButton) {
							cancelButton = {
								xtype : 'tbbutton',
								text : this.queryPanelCancelButtonText,
								tooltipType : 'title',
								tooltip : this.queryPanelCancelButtonTooltip,
								cls : 'genapp_query_formspanel_cancel_button',
								scope : this,
								handler : this.cancelRequest
							};
						} else {
							cancelButton = {
								xtype : 'tbspacer'
							};
						}

						// Request button
						var resetButton = null;
						if (!this.hideResetButton) {
							resetButton = {
								xtype : 'tbbutton',
								text : this.queryPanelResetButtonText,
								tooltipType : 'title',
								tooltip : this.queryPanelResetButtonTooltip,
								cls : 'genapp_query_formspanel_reset_button',
								scope : this,
								handler : this.resetRequest
							};
						} else {
							resetButton = {
								xtype : 'tbspacer'
							};
						}

						var queryPanelConfig = {
							region : 'west',
							title : this.queryPanelTitle,
							collapsible : true,
							margins : '0 5 0 0',
							titleCollapse : true,
							width : this.queryPanelWidth,
							frame : true,
							layout : 'border',
							cls : 'genapp_query_panel',
							items : [ this.datasetPanel, this.formsPanel ],
							tools : tools,
							bbar : [ cancelButton, {
								xtype : 'tbseparator'
							}, resetButton, {
								xtype : 'tbfill'
							}, {
								xtype : 'tbbutton',
								text : this.queryPanelSearchButtonText,
								tooltipType : 'title',
								tooltip : this.queryPanelSearchButtonTooltip,
								cls : 'genapp_query_formspanel_search_button',
								scope : this,
								handler : this.submitRequest
							} ]
						};

						if (!this.hidePredefinedRequestSaveButton) {
							queryPanelConfig.tbar = {
								cls : 'genapp_query_panel_tbar',
								items : [ {
									xtype : 'tbbutton',
									text : this.queryPanelPredefinedRequestSaveButtonText,
									tooltipType : 'title',
									tooltip : this.queryPanelPredefinedRequestSaveButtonTooltip,
									iconCls : 'genapp-query-panel-predefined-request-save-button-icon',
									scope : this,
									handler : function(b, e) {
										// TODO
									}
								} ]
							};
						}

						/**
						 * The query form panel contains the dataset list and
						 * the corresponding forms.
						 * 
						 * @property queryPanel
						 * @type Ext.FormPanel
						 */
						this.queryPanel = new Ext.FormPanel(queryPanelConfig);

						// Add the layers and legends vertical label
						if (!this.hideRequestVerticalLabel) {
							this.addVerticalLabel(this.queryPanel, 'genapp-query-request-panel-ct-xcollapsed-vertical-label-div');
						}

						/**
						 * The details panel.
						 * 
						 * @property detailsPanel
						 * @type Ext.TabPanel
						 */
						this.detailsPanel = new Ext.TabPanel({
							frame : true,
							plain : true,
							enableTabScroll : true,
							cls : 'genapp-query-details-panel',
							scrollIncrement : 91,
							scrollRepeatInterval : 100,
							idDelimiter : '___', // Avoid a conflict with the
							// Genapp id separator('__')
				            tbar : [
		                         {
		                             text: this.exportAsPdfButtonText,
		                             iconCls: 'genapp-query-details-panel-pdf-export',
		                             handler: function(){
		                                 var currentDP = this.detailsPanel.getActiveTab();
		                                 currentDP.exportAsPDF();
		                             },
		                             scope: this
		                         }
		                     ],
							listeners : {
								'render' : function(panel) {
									panel.items.on('remove', function(item) {
										if (this.items.getCount() === 0) {
											this.ownerCt.collapse();
										}
									}, panel);
								}
							}
						});

						this.detailsPanelPinned = true;

						var tools = null;
						if (!Genapp.hidePinButton) {
							tools = [ {
								id : 'pin',
								qtip : this.detailsPanelCtPinToolQtip,
								hidden : true,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-unpin').show();
									this.detailsPanelPinned = true;
								},
								scope : this
							}, {
								id : 'unpin',
								qtip : this.detailsPanelCtUnpinToolQtip,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-pin').show();
									this.detailsPanelPinned = false;
								},
								scope : this
							} ];
						}

						/**
						 * The details panel container.
						 * 
						 * @property detailsPanelCt
						 * @type Ext.Panel
						 */
						this.detailsPanelCt = new Ext.Panel({
							region : 'east',
							title : this.detailsPanelCtTitle,
							frame : true,
							split : true,
							layout : 'fit',
							width : 344,
							minWidth : 200,
							collapsible : true,
							titleCollapse : true,
							collapsed : true,
							items : this.detailsPanel,
							tools : tools,
							listeners : {
								// Collapse the layersAndLegendsPanel on expand
								// event
								expand : function() {
									// The map panel must be rendered and
									// activated to resize correctly the map div
									if (this.centerPanel.getActiveTab() instanceof Genapp.GeoPanel) {
										this.geoPanel.layersAndLegendsPanel.collapse();
									} else {
										this.centerPanel.activate(this.geoPanel);
										this.geoPanel.layersAndLegendsPanel.collapse();
										this.centerPanel.activate(this.gridPanel);
									}
								},
								scope : this
							}
						});

						// Add the layers and legends vertical label
						if (!this.hideDetailsVerticalLabel) {
							this.addVerticalLabel(this.detailsPanelCt, 'genapp-query-details-panel-ct-xcollapsed-vertical-label-div');
						}

						/**
						 * The features Information panel.
						 * 
						 * @property featuresInformationPanel
						 * @type Ext.TabPanel
						 */
						this.featuresInformationPanel = new Ext.TabPanel({
							frame : true,
							plain : true,
							enableTabScroll : true,
							cls : 'genapp-query-locations-panel',
							scrollIncrement : 91,
							scrollRepeatInterval : 100,
							idDelimiter : '___', // Avoid a conflict with the
							// Genapp id separator('__')
							listeners : {
								'render' : function(panel) {
									panel.items.on('remove', function(item) {
										if (this.items.getCount() === 0) {
											this.ownerCt.collapse();
										}
									}, panel);
								}
							}
						});

						this.featuresInformationPanelPinned = true;

						var tools = null;
						if (!Genapp.hidePinButton) {
							tools = [ {
								id : 'pin',
								qtip : this.featuresInformationPanelCtPinToolQtip,
								hidden : true,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-unpin').show();
									this.featuresInformationPanelPinned = true;
								},
								scope : this
							}, {
								id : 'unpin',
								qtip : this.featuresInformationPanelCtUnpinToolQtip,
								handler : function(event, toolEl, panel) {
									toolEl.hide();
									panel.header.child('.x-tool-pin').show();
									this.featuresInformationPanelPinned = false;
								},
								scope : this
							} ];
						}

						/**
						 * The features Information panel container.
						 * 
						 * @property featuresInformationPanelCt
						 * @type Ext.Panel
						 */
						this.featuresInformationPanelCt = new Ext.Panel({
							region : 'south',
							title : this.featuresInformationPanelCtTitle,
							frame : true,
							split : true,
							layout : 'fit',
							height : this.featuresInformationPanelCtHeight,
							collapsible : true,
							titleCollapse : true,
							collapsed : true,
							items : this.featuresInformationPanel,
							tools : tools
						});

						var centerPanelCtItems = [ this.centerPanel ];
						if (!this.hideDetails) {
							centerPanelCtItems.push(this.detailsPanelCt);
						}
						if (!this.hideMapDetails && Genapp.map.featureinfo_maxfeatures !== 1) {
							centerPanelCtItems.push(this.featuresInformationPanelCt);
						}
						this.centerPanelCt = new Ext.Panel({
							layout : 'border',
							region : 'center',
							items : centerPanelCtItems
						});

						if (!this.items) {
							this.items = [ this.queryPanel, this.centerPanelCt ];
						}

						// Add events listening
						Genapp.eventManager.on('getLocationInfo', this.getLocationInfo, this);

						Genapp.ConsultationPanel.superclass.initComponent.call(this);
					},

					/**
					 * Update the Forms Panel by adding the Panel corresponding
					 * to the selected dataset
					 * 
					 * @param {Object}
					 *            response The XMLHttpRequest object containing
					 *            the response data.
					 * @param {Object}
					 *            options The parameter to the request call.
					 * @param {Object}
					 *            apiParams The api parameters
					 * @param {Object}
					 *            criteriaValues The criteria values
					 * @hide
					 */
					updateWestPanels : function(response, opts, apiParams, criteriaValues) {
						var forms = Ext.decode(response.responseText), i;
						// Removes the loading message
						this.formsPanel.body.update();

						// Add each form
						for (i = 0; i < forms.data.length; i++) {
							if (!(Ext.isEmpty(forms.data[i].criteria) && Ext.isEmpty(forms.data[i].columns))) {
							    var formId = forms.data[i].id;
							    var criteria = forms.data[i].criteria;
								this.formsPanel.add(new Genapp.FieldForm({
									title : forms.data[i].label,
									id : formId,
									criteria : criteria,
									criteriaValues : criteriaValues,
									columns : forms.data[i].columns
								}));
	                            // Find the geom criteria and fill the geomCriteriaInfo param
	                            for (j = 0; j < criteria.length; j++) {
	                                if(criteria[j].type === 'GEOM'){
	                                    this.geomCriteriaInfo = {
	                                        'formId' : formId,
	                                        'id' : criteria[j].name
	                                    }
	                                }
	                            }
							}
						}
						this.formsPanel.doLayout();
						if (!Ext.isEmpty(apiParams)) {
							if (apiParams.collapseQueryPanel === true) {
								this.queryPanel.collapse();
							}
							if (apiParams.launchRequest === true) {
								this.submitRequest();
							}
						}
					},

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
					renderLeftTools : function(value, metadata, record, rowIndex, colIndex, store) {

						var stringFormat = '';
						if (!this.hideDetails) {
							stringFormat = '<div class="genapp-query-grid-slip" '
									+ 'onclick="Genapp.cardPanel.consultationPage.openDetails(\'{0}\', \'ajaxgetdetails\');" ' + 'ext:qtitle="'
									+ this.openGridDetailsButtonTitle + '"' + 'ext:qwidth="' + this.tipDefaultWidth + '"' + 'ext:qtip="'
									+ this.openGridDetailsButtonTip + '"' + '></div>';
						}
						stringFormat += '<div class="genapp-query-grid-map" '
								+ 'onclick="Genapp.cardPanel.consultationPage.displayLocation(\'{0}\',\'{1}\');" ' + 'ext:qtitle="' + this.seeOnMapButtonTitle
								+ '"' + 'ext:qwidth="' + this.tipDefaultWidth + '"' + 'ext:qtip="' + this.seeOnMapButtonTip + '"' + '></div>';

						return String.format(stringFormat, record.data.id, record.data.location_centroid);
					},

					/**
					 * Renders for the right tools column cell
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
					renderRightTools : function(value, metadata, record, rowIndex, colIndex, store) {

						var stringFormat = '';

						// If we don't check data rights or if the data belongs
						// to the provider, we display the edit link
						if (!this.checkEditionRights || Genapp.userProviderId == record.data._provider_id) {
							stringFormat = '<div class="genapp-query-grid-edit genapp-query-grid-editUI" '
									+ 'onclick="window.location.href=Genapp.base_url + \'dataedition/show-edit-data/{0}\';"' + 'ext:qtitle="'
									+ this.editDataButtonTitle + '"' + 'ext:qwidth="' + this.tipDefaultWidth + '"' + 'ext:qtip="' + this.editDataButtonTip
									+ '"' + '></div>';
						} else {
							stringFormat = '<div ext:qtip="' + this.cannotEditTip + '">&nbsp;</div>';
						}
						return String.format(stringFormat, record.data.id);
					},

					/**
					 * Open the row details
					 * 
					 * @param {String}
					 *            id The details id
					 * @param {String}
					 *            url The url to get the details
					 */
					openDetails : function(id, url) {
						if (!Ext.isEmpty(id)) {
							var consultationPanel = Ext.getCmp('consultation_panel');
							consultationPanel.collapseQueryPanel();
							consultationPanel.detailsPanel.ownerCt.expand();
							var tab = consultationPanel.detailsPanel.get(id);
							if (Ext.isEmpty(tab)) {
								tab = consultationPanel.detailsPanel.add(new Genapp.DetailsPanel({
									rowId : id,
									dataUrl : url
								}));
							}
							consultationPanel.detailsPanel.activate(tab);
						}
					},

					/**
					 * Open a features information panel
					 * 
					 * @param {Object}
					 *            selection The selection information
					 */
					openFeaturesInformationSelection : function(selection) {
						this.featuresInformationSearchNumber++;
						selection.featuresInformationSearchNumber = this.featuresInformationSearchNumber;
						if (!Ext.isEmpty(selection.data)) {
							var consultationPanel = Ext.getCmp('consultation_panel');
							consultationPanel.featuresInformationPanel.ownerCt.expand();
							var tab = consultationPanel.featuresInformationPanel.get(selection.id);
							if (Ext.isEmpty(tab)) {
								tab = consultationPanel.featuresInformationPanel.add(new Genapp.CardGridDetailsPanel({
									initConf : selection
								}));
							}
							consultationPanel.featuresInformationPanel.activate(tab);
						}
					},

					/**
					 * Add a geom criteria and open its map
					 */
					addgeomcriteria : function() {
						if (!Ext.isEmpty(this.geomCriteriaInfo)) {
							var form = this.formsPanel.get(this.geomCriteriaInfo.formId);
							var criteria = form.addCriteria(this.geomCriteriaInfo.id);
							criteria.openMap();
						}
					},

					/**
					 * Switch the current gridDetailsPanel to the children
					 * gridDetailsPanel
					 * 
					 * @param {String}
					 *            cardPanelId The id of the card panel
					 *            containing the current gridDetailsPanel
					 * @param {String}
					 *            id The id of the selected row in the current
					 *            gridDetailsPanel
					 */
					getChildren : function(cardPanelId, id) {
						var cardPanel = Ext.getCmp(cardPanelId);
						var tab = cardPanel.get(id);
						if (Ext.isEmpty(tab)) {
							// We must get the id and not a reference to the
							// activeItem
							var parentItemId = cardPanel.getLayout().activeItem.getId();
							Ext.Ajax.request({
								url : Genapp.ajax_query_url + 'ajaxgetchildren',
								success : function(response, opts) {
									var obj = Ext.decode(response.responseText);
									obj.parentItemId = parentItemId;
									obj.ownerCt = cardPanel;
									tab = cardPanel.add(new Genapp.GridDetailsPanel({
										initConf : obj
									}));
									cardPanel.getLayout().setActiveItem(tab);
								},
								failure : function(response, opts) {
									console.log('server-side failure with status code ' + response.status);
								},
								params : {
									id : id
								}
							});
						} else {
							cardPanel.getLayout().setActiveItem(tab);
						}
					},

					/**
					 * Add a new CardGridDetailsPanel and display the children
					 * 
					 * @param {String}
					 *            id The id of the selected row in the current
					 *            detailsPanel
					 */
					displayChildren : function(id) {
						var consultationPanel = Ext.getCmp('consultation_panel');
						tab = consultationPanel.featuresInformationPanel.get(id);
						if (!Ext.isEmpty(tab)) {
							consultationPanel.featuresInformationPanel.activate(tab);
						} else {
							Ext.Ajax.request({
								url : Genapp.ajax_query_url + 'ajaxgetchildren',
								success : function(response, opts) {
									var obj = Ext.decode(response.responseText);
									var consultationPanel = Ext.getCmp('consultation_panel');
									consultationPanel.openFeaturesInformationSelection(obj);
								},
								failure : function(response, opts) {
									console.log('server-side failure with status code ' + response.status);
								},
								params : {
									id : id
								}
							});
						}
					},

					/**
					 * Switch the current gridDetailsPanel to the parent
					 * gridDetailsPanel
					 * 
					 * @param {String}
					 *            cardPanelId The id of the card panel
					 *            containing the current gridDetailsPanel
					 */
					getParent : function(cardPanelId) {
						var cardPanel = Ext.getCmp(cardPanelId);
						cardPanel.getLayout().setActiveItem(Ext.getCmp(cardPanel.getLayout().activeItem.parentItemId));
					},

					/**
					 * Displays the location on the map
					 * 
					 * @param {String}
					 *            id The location id
					 * @param {String}
					 *            wkt a point WKT to be displayed as a flag.
					 */
					displayLocation : function(id, wkt) {
						var consultationPanel = Ext.getCmp('consultation_panel');
						consultationPanel.centerPanel.activate(consultationPanel.geoPanel);
						consultationPanel.geoPanel.zoomToFeature(id, wkt);
					},

					/**
					 * Cancel the current ajax request (submit or load)
					 */
					cancelRequest : function() {
						if (this.requestConn && this.requestConn !== null) {
							this.requestConn.abort();
							this.gridPanel.loadMask.hide();
							this.mapMask.hide();
						}
					},

					/**
					 * Reset the current ajax request (submit or load)
					 */
					resetRequest : function() {
						this.updateDatasetFormsPanel(this.datasetComboBox.getValue());
					},

					/**
					 * Submit the request and get the description of the result
					 * columns
					 */
					submitRequest : function() {
						var i;
						if (!this.hideCsvExportButton) {
							this.csvExportButton.disable();
						}
						// Hide the aggregated layer and legend
						this.geoPanel.disableLayersAndLegends(this.geoPanel.layersActivation['request'], true, false, true);

						// Init the mapResultLayers
						if (!this.mapResultLayers) {
							var rla = this.geoPanel.layersActivation['request'];
							this.mapResultLayers = [];
							if (!Ext.isEmpty(rla)) {
								for (i = 0; i < rla.length; i++) {
									var layer = this.geoPanel.map.getLayersByName(rla[i])[0];
									// The layer visibility must be set to true
									// to handle the 'loadend' event
									layer.events.register("loadend", this, function(info) {
										this.mapResultLayersLoadEnd[info.object.name] = 1;
										// Hide the map mask if all the result
										// layers are loaded
										var count = 0;
										for (layer in this.mapResultLayersLoadEnd) {
											if (typeof this.mapResultLayersLoadEnd[layer] !== 'function') {
												count += this.mapResultLayersLoadEnd[layer];
											}
										}
										if (count === this.mapResultLayers.length) {
											this.mapMask.hide();
										}
									});
									this.mapResultLayers.push(layer);
								}
							}
						}
						// Init mapResultLayersLoadEnd
						this.mapResultLayersLoadEnd = {};
						for (i = 0; i < this.mapResultLayers.length; i++) {
							var layer = this.mapResultLayers[i];
							this.mapResultLayersLoadEnd[layer.name] = 0;
						}

						if (!this.mapMask) {
							this.mapMask = new Ext.LoadMask(this.geoPanel.getEl(), {
								msg : this.mapMaskMsg
							});
						}

						// The panel must be rendered and active to show the
						// mask correctly
						if (this.showGridOnSubmit) {
							this.centerPanel.activate(this.geoPanel);
							this.mapMask.show();
							this.centerPanel.activate(this.gridPanel);
							this.gridPanel.loadMask.show();
						} else {
							this.centerPanel.activate(this.gridPanel);
							this.gridPanel.loadMask.show();
							this.centerPanel.activate(this.geoPanel);
							this.mapMask.show();
						}
						for (i = 0; i < this.mapResultLayersLoadEnd.length; i++) {
							var layer = this.mapResultLayersLoadEnd[i];
							layer.display(false);
						}
						this.geoPanel.clean();
						this.clearGrid();

						Ext.Ajax.on('beforerequest', function(conn, options) {
							this.requestConn = conn;
						}, this, {
							single : true
						});

						this.formsPanel.findParentByType('form').getForm().submit({
							url : Genapp.ajax_query_url + 'ajaxgetresultcolumns',
							timeout : 480000,
							success : function(form, action) {
								this.requestConn = null;
								// Creation of the column model and the reader
								// metadata fields
								var columns = action.result.columns;
								var newCM = [ {
									dataIndex : 'leftTools',
									header : '',
									renderer : this.renderLeftTools.createDelegate(this),
									sortable : false,
									fixed : true,
									menuDisabled : true,
									align : 'center',
									width : 50
								} ];
								var newRF = [];
								var columnConf;
								var readerFieldsConf;
								for (i = 0; i < columns.length; i++) {
									columnConf = {
										header : Genapp.util.htmlStringFormat(columns[i].label),
										sortable : true,
										dataIndex : columns[i].name,
										width : 100,
										tooltip : Genapp.util.htmlStringFormat(columns[i].definition),
										hidden : columns[i].hidden
									};
									readerFieldsConf = {
										name : columns[i].name
									};
									switch (columns[i].type) {
									// TODO : BOOLEAN, CODE, COORDINATE, ARRAY,
									// TREE
									case 'STRING':
										columnConf.xtype = 'gridcolumn';
										readerFieldsConf.type = 'string';
										break;
									case 'INTEGER':
										columnConf.xtype = 'gridcolumn';
										break;
									case 'NUMERIC':
										columnConf.xtype = 'numbercolumn';
										if (columns[i].decimals !== null) {
											columnConf.format = this.numberPattern('.', columns[i].decimals);
										}
										break;
									case 'DATE':
										columnConf.xtype = 'datecolumn';
										columnConf.format = this.dateFormat;
										break;
									case 'IMAGE':
									    columnConf.header = '';
									    columnConf.width = 30;
										columnConf.sortable = false;
										columnConf.renderer = this.renderIcon.createDelegate(this, [Genapp.util.htmlStringFormat(columns[i].label)], true);
										break;
									default:
										columnConf.xtype = 'gridcolumn';
										readerFieldsConf.type = 'auto';
										break;
									}
									newCM.push(columnConf);
									newRF.push(readerFieldsConf);
								}

								if (!this.hideGridDataEditButton) {
									newCM.push({
										dataIndex : 'rightTools',
										header : '',
										renderer : this.renderRightTools.createDelegate(this),
										sortable : false,
										fixed : true,
										menuDisabled : true,
										align : 'center',
										width : 30
									});
								}

								// Updates of the store reader metadata
								this.gridDSReader.updateMetadata({
									root : 'rows',
									fields : newRF,
									totalProperty : 'total'
								});

								// The grid panel must be rendered and activated
								// to resize correctly
								// the grid's view in proportion of the columns
								// number
								if (this.centerPanel.getActiveTab() instanceof Genapp.GeoPanel) {
									this.centerPanel.activate(this.gridPanel);
									// Updates of the column model
									this.gridPanel.getColumnModel().setConfig(newCM);
									this.centerPanel.activate(this.geoPanel);
								} else {
									// Updates of the column model
									this.gridPanel.getColumnModel().setConfig(newCM);
								}

								this.gridPanel.getView().reset();

								// Updates the rows
								Ext.Ajax.on('beforerequest', function(conn, options) {
									this.requestConn = conn;
								}, this, {
									single : true
								});
								this.gridPanel.getStore().load({
									params : {
										start : 0,
										limit : this.gridPageSize
									},
									callback : function() {
										this.requestConn = null;

										this.getResultsBBox();
										if (this.autoZoomOnResultsFeatures !== true) {
											// Display the results layer
											this.geoPanel.enableLayersAndLegends(this.geoPanel.layersActivation['request'], true, true);
										}

										// Collapse the panel only if the form
										// is valid
										this.collapseQueryPanel();
										this.collapseDetailsPanel();

										// Enable the top buttons
										if (!this.hideCsvExportButton) {
											this.csvExportButton.enable();
										}
										this.gridPanel.syncSize(); // Bug in
										// Ext 3.2.1
										// (The grid
										// bottom
										// tool bar
										// disappear)
									},
									scope : this
								});
							},
							failure : function(form, action) {
								if (action.result && action.result.errorMessage) {
									Ext.Msg.alert(this.alertErrorTitle, action.result.errorMessage);
								} else {
									Ext.Msg.alert(this.alertErrorTitle, this.alertRequestFailedMsg);
								}
								this.gridPanel.loadMask.hide();
								this.mapMask.hide();
							},
							scope : this
						});
					},

					/**
					 * Render an Icon for the data grid.
					 */
					renderIcon : function(value, metadata, record, rowIndex, colIndex, store, columnLabel) {
						if (!Ext.isEmpty(value)) {
							return '<img src="' + Genapp.base_url + '/js/genapp/resources/images/picture.png"'
							+ 'ext:qtitle="' + columnLabel + ' :"'
							+ 'ext:qwidth="' + this.tipImageDefaultWidth + '"'
							+ 'ext:qtip="'
							+ Genapp.util.htmlStringFormat('<img width="' + (this.tipImageDefaultWidth - 12) 
							+ '" src="' + Genapp.base_url + '/img/' + value 
							+'" />') 
							+ '">';
						}
					},

					/**
					 * Collapse the Query Form Panel if not pinned.
					 */
					collapseQueryPanel : function() {
						if (!this.queryPanelPinned) {
							this.queryPanel.collapse();
						}
					},

					/**
					 * Collapse the Details Panel if not pinned
					 */
					collapseDetailsPanel : function() {
						if (!this.detailsPanelPinned) {
							this.detailsPanel.ownerCt.collapse();
						}
					},

					/**
					 * Updates the FormsPanel body
					 * 
					 * @param {Object}
					 *            requestParams The parameters for the ajax
					 *            request
					 * @param {Object}
					 *            apiParams The api parameters
					 * @param {Object}
					 *            criteriaValues The criteria values
					 */
					updateFormsPanel : function(requestParams, apiParams, criteriaValues) {
						this.formsPanel.removeAll(true);
						this.formsPanel.getUpdater().showLoading();
						Ext.Ajax.request({
							url : Genapp.ajax_query_url + 'ajaxgetqueryform',
							success : this.updateWestPanels.createDelegate(this, [ apiParams, criteriaValues ], true),
							method : 'POST',
							params : requestParams,
							scope : this
						});
					},

					/**
					 * Update the forms panel for a predefined request
					 * 
					 * @param {String}
					 *            requestName The request name
					 * @param {Object}
					 *            criteriaValues The criteria values
					 */
					updatePredefinedRequestFormsPanel : function(requestName, criteriaValues) {
						this.updateFormsPanel({
							requestName : requestName
						}, {
							'launchRequest' : this.launchRequestOnPredefinedRequestLoad,
							'collapseQueryPanel' : this.collapseQueryPanelOnPredefinedRequestLoad
						}, criteriaValues);
					},

					/**
					 * Update the forms panel for a datasetId
					 * 
					 * @param {String}
					 *            datasetId The dataset ID
					 */
					updateDatasetFormsPanel : function(datasetId, apiParams) {
						this.updateFormsPanel({
							datasetId : datasetId
						},apiParams);
					},

					/**
					 * Update the dataset panel tooltip
					 * 
					 * @param {Object}
                     *            datasetRecordData The data of the selected dataset record
					 */
					updateDatasetPanelToolTip : function(datasetRecordData){
					    this.datasetPanelToolTip = new Ext.ToolTip({
                            anchor: 'left',
                            target: this.datasetPanel.getEl(),
                            title: datasetRecordData.label,
                            html:datasetRecordData.definition,
                            showDelay: Ext.QuickTips.getQuickTip().showDelay,
                            dismissDelay: Ext.QuickTips.getQuickTip().dismissDelay
                        });
					},

					/**
					 * Load a predefined request into the request panel
					 * 
					 * @param {Object}
					 *            request A object containing the predefined
					 *            request data
					 */
					loadRequest : function(request) {
						this.datasetComboBox.setValue(request.datasetId);
						this.updatePredefinedRequestFormsPanel(request.name, request.fieldValues);
					},

					/**
					 * Clears the grid
					 */
					clearGrid : function() {
						var gridDs = this.gridPanel.getStore();
						if (gridDs.getCount() !== 0) {
							// Reset the paging toolbar
							this.gridPanel.getBottomToolbar().reset();
						}
						if (this.gridPanel.rendered) {
							// Remove the column headers
							this.gridPanel.getColumnModel().setConfig({});
							// Remove the horizontal scroll bar if present
							this.gridPanel.getView().updateAllColumnWidths();// Bug
							// Ext
							// 3.0
							// Remove the emptyText message
							this.gridPanel.getView().reset();
						}
					},

					/**
					 * Export the data as a CSV file
					 * 
					 * @param {String}
					 *            actionName The name of the action to call
					 */
					exportCSV : function(actionName) {
						var launchCsvExport = function(buttonId, text, opt) {
							this.showMask(true);
							window.location = Genapp.ajax_query_url + actionName;
						};
						if (Ext.isIE && !this.hideCsvExportAlert) {
							Ext.Msg.show({
								title : this.csvExportAlertTitle,
								msg : this.csvExportAlertMsg,
								cls : 'genapp-query-center-panel-csv-export-alert',
								buttons : Ext.Msg.OK,
								fn : launchCsvExport,
								animEl : this.csvExportButton.getEl(),
								icon : Ext.MessageBox.INFO,
								scope : this
							});
							// The message is displayed only one time
							this.hideCsvExportAlert = true;
						} else {
							launchCsvExport.call(this);
						}
					},

					/**
					 * Print the map
					 * 
					 * @param {Ext.Button}
					 *            button The print map button
					 * @param {EventObject}
					 *            event The click event
					 */
					printMap : function(button, event) {
						// Get the BBOX
						var center = this.geoPanel.map.center, zoom = this.geoPanel.map.zoom, i;

						// Get the layers
						var activatedLayers = this.geoPanel.map.getLayersBy('visibility', true);
						var activatedLayersNames = '';
						for (i = 0; i < activatedLayers.length; i++) {
							currentLayer = activatedLayers[i];
							if (currentLayer.printable !== false &&
								currentLayer.visibility == true &&
								currentLayer.inRange == true) {
								activatedLayersNames += activatedLayers[i].name + ',';
							}
						}
						activatedLayersNames = activatedLayersNames.substr(0, activatedLayersNames.length - 1);

						Genapp.util.post(Genapp.base_url + 'map/generatemap', {
							center : center,
							zoom : zoom,
							layers : activatedLayersNames
						});
					},

					/**
					 * Show the consultation page mask
					 * 
					 * @param {Boolean}
					 *            hideOnFocus True to hide the mask on window
					 *            focus
					 */
					showMask : function(hideOnFocus) {
						this.mask.show();
						if (hideOnFocus) {
							window.onfocus = (function() {
								this.mask.hide();
								window.onfocus = Ext.emptyFn;
							}).createDelegate(this);
						}
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
					},

					/**
					 * Hide the consultation page mask
					 */
					hideMask : function() {
						this.mask.hide();
					},

					/**
					 * Add a vertical label to the collapsed panel
					 * 
					 * @param {Object}
					 *            the Ext.Panel
					 * @param {String}
					 *            the css class
					 * @hide
					 */
					addVerticalLabel : function(panel, cls) {
						panel.on('collapse', function(panel) {
							Ext.get(panel.id + '-xcollapsed').createChild({
								tag : "div",
								cls : cls
							});
						}, this, {
							single : true
						});
					},

					/**
					 * Launch a ajax request to get the java service status
					 * 
					 * @param {String}
					 *            serviceName The service name
					 * @param {String}
					 *            callback A callback function to call when the
					 *            status is equal to 'OK'
					 * @return {String} The status
					 */
					getStatus : function(serviceName, callback) {
						Ext.Ajax.request({
							url : Genapp.base_url + serviceName + '/ajax-get-status',
							success : function(rpse, options) {
								var response = Ext.decode(rpse.responseText), msg;
								if (Ext.isEmpty(response.success) || response.success === false) {
									this.hideMask();
									msg = 'An error occured during the status request.';
									if (!Ext.isEmpty(response.errorMsg)) {
										msg += ' ' + response.errorMsg;
									}
									Ext.Msg.alert('Error...', msg);
								} else {
									if (response.status === 'RUNNING') {
										this.getStatus.defer(2000, this, [ serviceName, callback ]);
									} else if (response.status === 'OK') {
										this.hideMask();
										callback.call(this);
									} else { // The service is done or an
										// error occured
										this.hideMask();
										msg = 'An error occured during the status request.';
										if (!Ext.isEmpty(response.errorMsg)) {
											msg += ' ' + response.errorMsg;
										}
										Ext.Msg.alert('Error...', msg);
									}
								}
							},
							failure : function() {
								this.hideMask();
								var msg = 'An error occured during the status request.';
								Ext.Msg.alert('Error...', msg);
							},
							scope : this
						});
					},

					/**
					 * Display the detail panel for a location.
					 * 
					 * Called when a location info event is received.
					 */
					getLocationInfo : function(result, mapId) {
						if (this.geoPanel.map.id == mapId) {
							if (Genapp.map.featureinfo_maxfeatures === 1) {
								this.openDetails(result.data[0][0], 'ajaxgetdetails');
							} else {
								this.openFeaturesInformationSelection(result);
							}
						}
					},

					/**
					 * Launch a ajax request to get the bounding box of the
					 * result features.
					 */
					getResultsBBox : function() {
						Ext.Ajax.request({
							url : Genapp.ajax_query_url + 'ajaxgetresultsbbox',
							success : function(rpse, options) {
								try {
									var response = Ext.decode(rpse.responseText);
									if (Ext.isEmpty(response.success) || response.success === false) {
										if (!Ext.isEmpty(response.errorMsg)) {
											throw (response.errorMsg);
										}
										throw ('');
									} else {
										if (!Ext.isEmpty(response.resultsbbox)) {
											this.geoPanel.resultsBBox = response.resultsbbox;
										} else {
											this.geoPanel.resultsBBox = null;
										}
										if (this.autoZoomOnResultsFeatures === true) {
											if (this.geoPanel.resultsBBox !== null) {
												this.geoPanel.zoomOnBBox(this.geoPanel.resultsBBox);
											}
											// Display the results layer
											this.geoPanel.enableLayersAndLegends(this.geoPanel.layersActivation['request'], true, true);
										}
									}
								} catch (err) {
									var msg = 'An error occured during the bounding box request.';
									if (!Ext.isEmpty(err)) {
										msg += ' ' + err;
									}
									Ext.Msg.alert('Error...', msg);
								}
							},
							failure : function(response, options) {
								var msg = 'An error occured during the bounding box request. Status code : ' + response.status;
								Ext.Msg.alert('Error...', msg);
							},
							scope : this
						});
					}
				});
Ext.reg('consultationpage', Genapp.ConsultationPanel);