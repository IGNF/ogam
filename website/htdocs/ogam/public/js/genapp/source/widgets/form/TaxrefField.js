/**
 * Provides a taxref field.
 * 
 * A taxref is a specialiced kind of tree used for taxonony.
 * 
 * @class Genapp.form.TaxrefField
 * @extends Ext.form.TreeField
 * @constructor Create a new TaxrefField
 * @param {Object}
 *            config
 * @xtype treefield
 */

Ext.namespace('Genapp.form');

Genapp.form.TaxrefField = Ext.extend(Genapp.form.TreeField, {
	

	// private
	initComponent : function() {
		Genapp.form.TaxrefField.superclass.initComponent.call(this);
	},

    /**
     * The function that handle the trigger's click event. Implements the
     * default empty TriggerField.onTriggerClick function to display the
     * TaxrefPicker
     * 
     * @method onTriggerClick
     * @hide
     */
    onTriggerClick : function() {
        if (this.disabled) {
            return;
        }
        if (!this.menu) {
            /**
             * The field menu (displayed on a trigger click).
             * 
             * @property menu
             * @type Genapp.form.menu.TaxrefMenu
             */
            this.menu = new Genapp.form.menu.TaxrefMenu({
                hideOnClick : false,
                hideValidationButton : this.hideValidationButton,
                dataUrl : this.nodeUrl
            });
        }
        this.onFocus();

        this.menu.show(this.el, "tl-bl?");
        this.menuEvents('on');
    },

	// private
	onDestroy : function() {
		Ext.destroy(this.menu, this.wrap);
		Genapp.form.TaxrefField.superclass.onDestroy.call(this);
	}

});
Ext.reg('taxreffield', Genapp.form.TaxrefField);