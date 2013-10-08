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
 * Simple tree picker class.
 * 
 * @class Genapp.form.picker.TreePicker
 * @extends Ext.TreePanel
 * @constructor Create a new TreePicker
 * @param {Object}
 *            config The config object
 * @xtype treepicker
 */
Ext.namespace('Genapp.form.picker');

Genapp.form.picker.TreePicker = Ext.extend(Ext.tree.TreePanel, {

	/**
	 * Internationalization.
	 */
	okButtonText : "ok",

	/**
	 * @cfg {Number} height The height of this component in pixels (defaults to
	 *      300).
	 */
	height : 300,
	/**
	 * @cfg {Number} width The width of this component in pixels (defaults to
	 *      300).
	 */
	width : 500,
	/**
	 * @cfg {String} buttonAlign The alignment of any {@link #buttons} added to
	 *      this panel. Valid values are 'right', 'left' and 'center' (defaults
	 *      to 'center').
	 */
	buttonAlign : 'center',
	/**
	 * @cfg {String} cls An optional extra CSS class that will be added to this
	 *      component's Element (defaults to 'x-menu-number-range-item'). This
	 *      can be useful for adding customized styles to the component or any
	 *      of its children using standard CSS rules.
	 */
	cls : 'x-menu-tree-item',

	/**
	 * Manage multiple values,
	 */
	multiple : false,

	/**
	 * @cfg {Boolean} hideValidationButton if true hide the menu validation
	 *      button (defaults to true).
	 */
	hideValidationButton : true,

	/**
	 * Validation button
	 * 
	 * @type Ext.Button
	 */
	validationButton : null,

	padding : 5,
	enableDD : false,
	animate : true,
	border : false,
	rootVisible : false,
	useArrows : true,
	autoScroll : true,
	containerScroll : true,
	frame : false,
	baseAttr : {
		singleClickExpand : true
	},
	listeners : {
		'dblclick' : {// Select the node on double click
			fn : function(node, event) {
				this.fireEvent('select', node);
			}
		}
	},

	/**
	 * Initialise the component.
	 */
	initComponent : function() {
		/*
		 * The root must be instancied here and not in the static part of the
		 * class to avoid a conflict between the instance of the class
		 */
		this.root = new Ext.tree.AsyncTreeNode({
			draggable : false,
			id : '*'
		}); // root is always '*'

		this.validationButton = {
			xtype : 'button',
			text : this.okButtonText,
			width : 'auto',
			handler : this.onOkButtonPress.createDelegate(this)
		};

		// Add the validation button
		if (!this.hideValidationButton) {
			this.buttons = [ this.validationButton ];
			this.height = this.height + 28;
		}

		// Allow multiple selection in the picker
		if (this.multiple) {
			this.selModel = new Ext.tree.MultiSelectionModel();
		}

		Genapp.form.picker.TreePicker.superclass.initComponent.call(this);
	},

	/**
	 * Launched when the OK button is pressed.
	 */
	onOkButtonPress : function(button, state) {
		if (state) {
			if (this.multiple) {
				var selectedNodes = this.getSelectionModel().getSelectedNodes();
				this.fireEvent('select', selectedNodes === null ? null : selectedNodes);
			} else {
				var selectedNode = this.getSelectionModel().getSelectedNode();
				this.fireEvent('select', selectedNode === null ? null : selectedNode);

			}
		}
	}
});
Ext.reg('treepicker', Genapp.form.picker.TreePicker);