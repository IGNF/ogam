Ext.define('OgamDesktop.view.request.PredefinedRequestSelector', {
	extend : 'Ext.form.FieldSet',
	xtype : 'predefined-request-selector',
	alias : 'widget.predefined-request-selector',
	uses : [ 'OgamDesktop.model.request.fieldset.Criterion' ],

	config : {
		/**
		 * @config OgamDesktop.model.request.fieldset.Criterion[] list/store
		 */
		criteria : undefined,
	},
	/**
	 * @cfg {String} defaultCardPanelText The default Card Panel Text (defaults
	 *      to <tt>'Please select a request...'</tt>)
	 */
	defaultCardPanelText : 'Please select a request...',
	updateCriteria : function(n, o) {
		Ext.suspendLayouts();
		if (o) {
			this.removeAll();
		}

		if (n && !Ext.isEmpty(n)) {
			//add fields
			n.each(function(criterion) {
				this.add(criterion.getCriteriaField());
			}, this);
		} else {
			//default message
			this.add([{
				xtype : 'box',
				html : this.defaultCardPanelText
			}]);
		}

		Ext.resumeLayouts(true);
	}
});