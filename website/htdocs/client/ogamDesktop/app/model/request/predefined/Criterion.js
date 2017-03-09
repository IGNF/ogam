/**
 * This class defines the OgamDesktop request predefined criterion model.
 * @deprecated
 */
Ext.define('OgamDesktop.model.request.predefined.Criterion', {
    extend: 'OgamDesktop.model.request.fieldset.Criterion',
    fields: [
        { name: 'requestName', type: 'string' },
        { name: 'fixed', type: 'boolean' }
    ],
    proxy: {
        reader:{
            type:'json',
            rootProperty:'data'
        }
    },

    /**
     * Return the criteria field config
     * @return {Object} The criteria field config
     */
    getCriteriaField: function() {
        return OgamDesktop.ux.request.RequestFieldSet.getCriteriaConfig(this, true);
    }
});