/**
 * missing fr locale, present into de @version extjs6.0.1
 */
Ext.define("Ext.locale.fr.panel.Panel", {
	override:'Ext.panel.Panel',
	collapseToolText : 'Réduire',
	expandToolText:'Agrandir',
	closeToolText: 'Fermer l\'onglet'
});

Ext.Date.patterns = {
    ShortTime: "G:i",
    LongTime: "G:i:s"
};
Ext.define("Ext.locale.fr.form.field.Time", {
		override:'Ext.form.field.Time'
}, function (){
		Ext.form.field.Time.prototype.altFormats +="|H:i:s|"+Ext.Date.patterns.LongTime;
});;