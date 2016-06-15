/**
 * This class manages the predefined request view.
 */
Ext.define('OgamDesktop.view.request.PredefinedRequestController', {
	extend : 'Ext.app.ViewController',
	alias : 'controller.predefinedrequest',

	/**
	 * Fonction handling the click event on the launch request button.
	 * @param {Ext.button.Button} b the button
     * @param {Event} e The click event
	 */
	onLaunchRequest:function(b,e) {
		console.log('pred view controler');
        // Get the selected request and the new criteria values
        var selectedRequestData = this.getViewModel().get('requete.selection');
        var fieldValues = this.getView().getForm().getValues(); // getFieldValues() doesn't work like expected with the checkbox
     
    },

    /**
	 * Fonction handling the click event on the reset request button.
	 * @param {Ext.button.Button} b the button
     * @param {Event} e The click event
	 */
    onResetRequest:function(b, e) {
		this.getView().getForm().reset();
	}
});
