/**
 * This class defines the predefined request selector view.
 */
Ext.define('OgamDesktop.view.request.PredefinedRequestSelector', {
	extend : 'Ext.form.FieldSet',
	xtype : 'predefined-request-selector',
	alias : 'widget.predefined-request-selector',
	uses : [ 'OgamDesktop.model.request.fieldset.Criterion' ],
	config : {
		/**
		 * @cfg {OgamDesktop.model.request.fieldset.Criterion[] list/store} criteria A list/store of criterion
		 */
		criteria : undefined
	},

	/**
	 * @cfg {String} defaultCardPanelText The default Card Panel Text (defaults
	 *      to <tt>'Please select a request...'</tt>)
	 */
	defaultCardPanelText : 'Please select a request...',

	/**
	 * Fonction handling the update of the criteria property
	 * @param {OgamDesktop.model.request.fieldset.Criterion[] list/store} n The new value
	 * @param {OgamDesktop.model.request.fieldset.Criterion[] list/store} o The old value
	 */
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