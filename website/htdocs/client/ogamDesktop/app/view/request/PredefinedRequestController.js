Ext.define('OgamDesktop.view.request.PredefinedRequestController', {
	extend : 'Ext.app.ViewController',

	alias : 'controller.predefinedrequest', // enable "controller:
											// 'predefinedrequest'" in the
											// PredefinedRequest view

	onGridRowSelect:function(sm, row, rec) {
		// console.log(this.getViewModel().getStore('criteria'));
		// this.getViewModel().getStore('criteria').load();
	},
	onLaunchRequest:function(b,e) {
		console.log('pred view controler');
        // Get the selected request and the new criteria values
        var selectedRequestData = this.getViewModel().get('requete.selection');
        var fieldValues = this.getView().getForm().getValues(); // getFieldValues() doesn't work like expected with the checkbox
     
    },
    onResetRequest:function(b, e) {
		this.getView().getForm().reset();
	}
	
});
