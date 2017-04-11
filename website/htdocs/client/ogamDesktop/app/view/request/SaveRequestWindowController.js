/**
 * This class manages the save request window view.
 */
Ext.define('OgamDesktop.view.request.SaveRequestWindowController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.saverequestwindow',
    config: {
        listen: {
            component:{
                '#CancelButton': {
                    click:'onCancel'
                },
                '#SaveButton': {
                    click:'onSave'
                },
                '#SaveAndDisplayButton': {
                    click:'onSaveAndDisplay'
                }
            }
        }
    },

//<locale>
    /**
     * @cfg {String} loadingText
     * The loading text used when the submit button is pressed(defaults to <tt>'Loading...'</tt>)
     */
    loadingText: 'Loading...',
        /**
     * @cfg {String} toastTitle_invalidForm
     * The toast title used for the invalid form (defaults to <tt>'Form submission:'</tt>)
     */
    toastTitle_invalidForm: 'Form submission:',
    /**
     * @cfg {String} toastHtml_invalidForm
     * The toast html used for the invalid form (defaults to <tt>'The form is not valid. Please correct the error(s).'</tt>)
     */
    toastHtml_invalidForm: 'The form is not valid. Please correct the error(s).',
    /**
     * @cfg {String} invalidValueSubmittedErrorTitle
     * The invalid value submitted error title (defaults to <tt>'Form submission:'</tt>)
     */
    invalidValueSubmittedErrorTitle: 'Form submission:',
    /**
     * @cfg {String} invalidValueSubmittedErrorMessage
     * The invalid value submitted error message (defaults to <tt>'A field appears to contain an error. Please check your filter criteria.'</tt>)
     */
    invalidValueSubmittedErrorMessage: 'A field appears to contain an error. Please check your filter criteria.',
        /**
     * @cfg {String} toastTitle_formSaved
     * The toast form saved title (defaults to <tt>'Form submission:'</tt>)
     */
    toastTitle_formSaved: 'Form submission:',
    /**
     * @cfg {String} toastHtml_formSaved
     * The toast form saved message (defaults to <tt>'Your request has been saved.'</tt>)
     */
    toastHtml_formSaved: 'Your request has been saved.',
//</locale>

    /**
     * Cancel the current save request if exist and hide the current window.
     */
    onCancel: function() {
        if (this.requestConn && this.requestConn !== null) {
            this.requestConn.abort();
        }
        this.getView().close();
    },

    /**
     * Save the current request
     */
    onSave: function(){
        this.saveRequest(false);
    },

    /**
     * Save the current request and display it
     */
    onSaveAndDisplay: function() {
        this.saveRequest(true);
    },

    /**
     * Save the current request and display it (if asked).
     * @param boolean display True to display the predefined request after the saving.
     */
    saveRequest: function(display = false) {
        var formComponent = this.getView().queryById('SaveForm');
        var form = formComponent.getForm();

        // Checks the validity of the form
        if (form.isValid()) {
            var saveBouton = this.getView().queryById('SaveButton');
            var saveAndDisplayButton = this.getView().queryById('SaveAndDisplayButton');
            var mask = new Ext.LoadMask({
                target : formComponent,
                msg: this.loadingText
            });
            mask.show();
            saveBouton.disable();
            saveAndDisplayButton.disable();

            Ext.Ajax.on(
                'beforerequest', 
                function(conn, options) { this.requestConn = conn; },
                this, 
                { single : true }
            );

            var requestId = form.findField('requestId').getValue();
            var url = Ext.manifest.OgamDesktop.requestServiceUrl + 'predefinedrequest';
            form.submit({
                clientValidation: true,
                submitEmptyText: false,
                //waitMsg: Ext.view.AbstractView.prototype.loadingText,
                autoAbort: true,
                method: requestId === null ? 'POST' : 'PUT',
                url: requestId === null ? url : url + '/' + requestId,
                params: this.getView().requestFieldsValues,
                success: function(form, action) {
                    this.requestConn = null;
                    var requestId = Ext.decode(action.response.responseText).requestId;
                    this.getView().fireEvent('requestIdChange', requestId);
                    mask.hide();
                    saveBouton.enable();
                    saveAndDisplayButton.enable();
                    this.getView().close();
                    OgamDesktop.toast(this.toastHtml_formSaved, this.toastTitle_formSaved);
                    Ext.getStore('PredefinedRequestTabRequestStore').reload();
                    if (display) {
                        var pr = Ext.getCmp('predefined_request');
                        pr.ownerCt.setActiveTab(pr);
                    }
                },
                failure: function(form, action) {
                    switch (action.failureType) {
                        case Ext.form.action.Action.CLIENT_INVALID:
                            OgamDesktop.toast(this.invalidValueSubmittedErrorMessage, this.invalidValueSubmittedErrorTitle);
                            break;
                        case Ext.form.action.Action.SERVER_INVALID:
                            OgamDesktop.toast(action.result.errorMessage, this.invalidValueSubmittedErrorTitle);
                            break;
                    }
                    mask.hide();
                    saveBouton.enable();
                    saveAndDisplayButton.enable();
                },
                scope: this
            });
        } else {
            OgamDesktop.toast(this.toastHtml_invalidForm, this.toastTitle_invalidForm);
        }
    }
});