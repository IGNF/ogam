/**
 * This class manages the navigation main view.
 */
Ext.define('OgamDesktop.view.navigation.MainWinController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.navigationmainwin',

    /**
     * Fonction handling the click event on the navigation print button.
     * @private
     * @param {Ext.button.Button} button The button
     * @param {Event} e The click event
     */
    onPrintButtonPress : function(button, e) {

        // Gets the active tab
        var tab = this.getView().getActiveTab();

        // Builds the print preview
        Ext.getBody().createChild({
            tag: 'div',
            id: 'o-navigation-print-main-div'
        },Ext.getBody().first());

        // Adds the current tab body content to the print preview div
        document.getElementById('o-navigation-print-main-div').appendChild(tab.body.dom.firstElementChild);

        // Adds a event to close properly the print window
        if ('matchMedia' in window) {
            window.matchMedia('print').addListener(function (mediaQueryListEvent) {
                if (!mediaQueryListEvent.matches) { // After print
                    var navBody = document.getElementById('o-navigation-print-main-div').firstElementChild;
                    tab.body.dom.appendChild(navBody);
                    Ext.get('o-navigation-print-main-div').destroy();
                    mediaQueryListEvent.target.removeListener(arguments.callee);
                }
            });
        }

        // Launches the print
        window.print();
    }
});