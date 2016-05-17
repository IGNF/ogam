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
 * Provides a radioButton input field
 *
 * @class OgamDesktop.ux.form.field.RadioButton
 * @extends Ext.form.RadioGroup
 * @constructor Create a newRadioButton
 * @param {Object} config
 * @xtype radiobuttonfield
 */
Ext.define('OgamDesktop.ux.form.field.RadioButton', {
    extend:'Ext.form.RadioGroup',
    alias: 'widget.radiobuttonfield',
    mixins: [
         'Ext.util.StoreHolder'
    ],
    
    initComponent: function() {
        var me = this,
            store = me.store;

        me.callParent();
        me.bindStore(store, true, 'store');
    },
    
    getStoreListeners:function(store){
        if (!store.isEmptyStore) {
            var me = this,
                result = {
                    load: me.onLoad
                };

            return result;
        }
    },

    onLoad:function(store, records, successful, operation, eOpts ){
        var me = this;
        store.getData().each(function (record){
            me.add({
                inputValue:record.get('code'),
                boxLabel:record.get('label')
            });
        });
        me.resetOriginalValue();
    },
    
    /**
     * @private
     */
    setValueOnData: function() {
        var me = this;
        me.setValue(me.value);

    },
    
    onBindStore: function(store, initial){
        var me = this,
        loadCallback = function(){
            me.setValueOnData();
        } ;

        if (!initial){
            this.removeAll();
        }
        if (store && !store.isLoaded()){
            store.load({callback:loadCallback});
            return;
        }
        this.onLoad(store, store.getData(), true);
        
        me.setValueOnData();

    },
    /**
     * set the current value
     * allow single value
     * @link Ext.form.RadioGroup#setValue
     * @param {String |Object}
     * @returns OgamDesktop.ux.form.field.RadioButton
     */
    setValue:function(value) {
        var val={};
        if (!Ext.isObject(value)) {
            val[this.name] = value;
        } else {
            val = value;
        }
        return this.callParent([val]);
    },
    
    /**
     * Destoy the component.
     */
    destroy: function () {
        this.mixins.storeholder.destroy.call(this);
        this.callParent();
    }
});
