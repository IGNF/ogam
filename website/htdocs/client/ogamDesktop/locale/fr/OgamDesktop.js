Ext.define("OgamDesktop.locale.fr.ux.request.AdvancedRequestFieldSet", {
    override: "OgamDesktop.ux.request.AdvancedRequestFieldSet",
	criteriaPanelTbarLabel : "Crit�res",
	criteriaPanelTbarComboEmptyText : "S�lectionner...",
	criteriaPanelTbarComboLoadingText : "Recherche en cours...",
	columnsPanelTbarLabel : "Colonnes",
	columnsPanelTbarComboEmptyText : "S�lectionner...",
	columnsPanelTbarComboLoadingText : "Recherche en cours...",
	columnsPanelTbarAddAllButtonTooltip : "Ajouter toutes les colonnes",
	columnsPanelTbarRemoveAllButtonTooltip : "Supprimer toutes les colonnes"
});

Ext.define("OgamDesktop.locale.fr.ux.picker.Tree", {
	override: "OgamDesktop.ux.picker.Tree",
	okButtonText : "ok"
});

Ext.define("OgamDesktop.locale.fr.ux.picker.NumberRange", {
		override: "OgamDesktop.ux.picker.NumberRange",
		minFieldLabel : "Min",
		maxFieldLabel : "Max",
		okButtonText : "ok"
});

Ext.define("OgamDesktop.locale.fr.ux.picker.DateRange", {
	override: "OgamDesktop.ux.picker.DateRange",
	tbarStartDateButtonText : "Date de d�but ...",
	tbarRangeDateButtonText : "Intervalle",
	tbarEndDateButtonText : "... Date de fin",
	fbarOkButtonText : "ok"
});

Ext.define("OgamDesktop.locale.fr.ux.form.field.DateRangeField", {
	override: "OgamDesktop.ux.form.field.DateRangeField",
	minText : "Les dates contenues dans ce champ doivent �tre �gales ou post�rieures au {0}",
	maxText : "Les dates contenues dans ce champ doivent �tre �gales ou ant�rieures au {0}",
	reverseText : "La date de fin doit �tre post�rieure � la date de d�but",
	notEqualText : "Les dates de d�but et de fin ne peuvent �tre �gales",
    dateSeparator: ' - ',
    endDatePrefix: '<= ',
    startDatePrefix: '>= '
});

Ext.define("OgamDesktop.locale.fr.ux.form.field.TwinNumberField", {
	override: "OgamDesktop.ux.form.field.TwinNumberField",
	decimalSeparator : ".",
	minText : "La valeur minimum pour ce champ est {0}",
	maxText : "La valeur maximum pour ce champ est {0}",
	nanText : "'{0}' n'est pas un nombre valide"
});

Ext.define("OgamDesktop.locale.fr.ux.form.field.Tree", {
	override: "OgamDesktop.ux.form.field.Tree",
	emptyText : "S�lectionner..."
});

Ext.define("OgamDesktop.locale.fr.ux.form.field.NumberRangeField", {
	override: "OgamDesktop.ux.form.field.NumberRangeField",
	numberSeparator: ' - ',
	decimalSeparator : ".",
	maxNumberPrefix: '<= ',
	minNumberPrefix: '>= ',
	minText : "La valeur minimum pour ce champ est {0}",
	maxText : "La valeur maximum pour ce champ est {0}",
	reverseText : "Le maximum doit �tre sup�rieur au minimum",
	formatText : "Les formats corrects sont",
	nanText : "'{0}' n'est pas un nombre valide"
});

Ext.define("OgamDesktop.locale.fr.ux.form.field.GeometryField", {
	override: "OgamDesktop.ux.form.field.GeometryField",
	fieldLabel : "Localisation",
	mapWindowTitle : "Dessinez la zone recherch�e sur la carte :",
	mapWindowValidateButtonText : "Valider",
	mapWindowValidateAndSearchButtonText : "Valider et rechercher",
	mapWindowCancelButtonText : "Annuler"
});

/*
 * view
 */

/*
 * view result
 */
Ext.define("OgamDesktop.locale.fr.view.result.MainWin", {
	override: 'OgamDesktop.view.result.MainWin',
    config: {
    	title : 'R�sultats'
    },
	exportButtonText : "Export",
	csvExportMenuItemText: 'Export CSV',
	kmlExportMenuItemText: 'Export KML',
	geojsonExportMenuItemText: 'Export GeoJSON',
	csvExportAlertTitle : "Exportation d'un fichier CSV avec Internet Explorer",
	csvExportAlertMsg : "<div><H2>Pour votre confort sur Internet Explorer vous pouvez: </H2> \
    <H3>D�sactiver la confirmation pour les t�l�chargements de fichiers.</H3> \
    <ul> \
    <li>Dans IE, d�rouler le menu 'Outils'</li> \
    <li>Cliquer sur 'Options Internet'</li> \
    <li>Cliquer sur l'onglet 'S�curit�'</li> \
    <li>Cliquer sur le bouton 'Personnaliser le niveau'</li> \
    <li>Descendre jusqu'� la partie 'T�l�chargements'</li> \
    <li>Activ� la demande de confirmation pour les t�l�chargements de fichiers</li> \
    </ul> \
    <H3>D�sactiver l'ouverture du fichier dans la fen�tre courante.</H3> \
    <ul> \
    <li>Ouvrir le poste de travail</li> \
    <li>D�rouler le menu 'Outils'</li> \
    <li>Cliquer sur 'Options des dossiers...'</li> \
    <li>Cliquer sur l'onglet 'Types de fichiers'</li> \
    <li>S�lectionner l'extension XLS</li> \
    <li>Cliquer sur le bouton 'Avanc�'</li> \
    <li>D�cocher 'Parcourir dans une m�me fen�tre'</li> \
    </ul></div>",
	maskMsg : "Chargement..."
});

Ext.define("OgamDesktop.locale.fr.view.result.GridTab", {
	override: 'OgamDesktop.view.result.GridTab',
	emptyText : "Pas de r�sultat...",
	openNavigationButtonTitle : "Voir les d�tails",
	openNavigationButtonTip : "Affiche les informations d�taill�es dans l'onglet des d�tails.",
	seeOnMapButtonTitle : "Voir sur la carte",
	seeOnMapButtonTip :  "Affiche la carte, puis zoom et centre sur la localisation.",
	editDataButtonTitle : "Editer les donn�es",
	//	dateFormat : 'Y/m/d',
	editDataButtonTip : "Ouvre la page d'�dition pour �diter les donn�es."
});

/*
 * view request
 */
Ext.define("OgamDesktop.locale.fr.view.request.MainWin", {
	override: 'OgamDesktop.view.request.MainWin',
	config: {
		title : 'Requ�teur'
	}
});

Ext.define("OgamDesktop.locale.fr.view.request.AdvancedRequest", {
	override:'OgamDesktop.view.request.AdvancedRequest',
	requestSelectTitle:'<b>Formulaires</b>',
	processPanelTitle:'Type de donn�es',
	processCBEmptyText:'Selectionner un type de donn�es...',
	buttonsText:{
		submit:'Rechercher',
		cancel:'Annuler',
		reset :'R�initialiser'
	}
});

/*
 * view map
 */
Ext.define('OgamDesktop.locale.fr.view.map.MainWin', {//TODO fix override warning
	override: 'OgamDesktop.view.map.MainWin',
	config: {
		title : 'Carte'
	}
});

Ext.define('OgamDesktop.locale.fr.view.map.MapPanel', {
	override: 'OgamDesktop.view.map.MapPanel',
	popupTitle : 'Information(s) sur la g�om�trie',
	tabTip : "La carte avec les localisations des r�sultats de la requ�te",
//	layerPanelTitle : "Couches",
//	layerPanelTabTip : "L'arbre de s�lection des couches",
//	legendPanelTitle : "L�gendes",
//	legendPanelTabTip : "Les legendes des couches",
	panZoomBarControlTitle : "Zoom",
	navigationControlTitle : "D�placer la carte",
	invalidWKTMsg : "La g�om�trie ne peut �tre affich�e",
	zoomToFeaturesControlTitle : "Zoomer sur la s�lection",
	zoomToResultControlTitle : "Zoomer sur le r�sultat",
	drawPointControlTitle : "Dessiner un point",
	drawLineControlTitle : "Dessiner une ligne",
	drawFeatureControlTitle : "Dessiner un polygone",
	modifyFeatureControlTitle : "Modifier la g�om�trie",
	tbarDeleteFeatureButtonTooltip : "Effacer la g�om�trie",
	tbarPreviousButtonTooltip : "Position pr�c�dente",
	tbarNextButtonTooltip : "Position suivante",
	zoomBoxInControlTitle : "Zoom en avant",
	zoomBoxOutControlTitle : "Zoom en arri�re",
	zoomToMaxExtentControlTitle : "Zoom arri�re maximum",
	snappingControlTitle:'Snapping',
	locationInfoControlTitle : "Voir les informations sur le point",
	LayerSelectorEmptyTextValue: "Selectionner une couche",
	selectFeatureControlTitle : "Selectionner un contour de sur la couche s�lectionn�e",
	featureInfoControlTitle : "Voir les informations sur la couche s�lectionn�e",
	legalMentionsLinkText : "Mentions l�gales",
	addGeomCriteriaButtonText : "S�lectionner une zone g�ographique",
	printMapButtonText : 'Imprimer la carte'
});

Ext.define('OgamDesktop.locale.fr.view.map.MapAddonsPanel', {
	override: 'OgamDesktop.view.map.MapAddonsPanel',
	config: {
		title: 'Couches & Legendes'
	}
});

Ext.define('OgamDesktop.locale.fr.view.map.LegendsPanel', {
	override: 'OgamDesktop.view.map.LegendsPanel',
	config: {
		title:'Legendes'
	}
});

Ext.define('OgamDesktop.locale.fr.view.map.LayersPanel', {
	override: 'OgamDesktop.view.map.LayersPanel',
	config: {
		title:'Couches'
	}
});
/*
* view navigation
*/
Ext.define('OgamDesktop.locale.fr.view.navigation.MainWin', {
	override: 'OgamDesktop.view.navigation.MainWin',
	config: {
		title: 'D�tails',
		exportAsPdfButtonText: "Exporter en pdf"
	}
});

Ext.define('OgamDesktop.locale.fr.view.navigation.Tab', {
	override: 'OgamDesktop.view.navigation.Tab',
	config: {
		title: 'D�tails'
	},
    seeChildrenButtonTitleSingular : 'Voir l\'unique enfant',
    seeChildrenButtonTitlePlural : 'Voir les enfants',
	seeChildrenButtonTip : 'Afficher les enfants dans le tableau des d�tails.',
    editLinkButtonTitle : 'Editer les donn�es',
    editLinkButtonTip : 'Ouvre la page d\'�dition pour �diter les donn�es.',
    //TODO  tpl
    loadingMsg : "Cgmt..."
});

Ext.define('OgamDesktop.locale.fr.view.navigation.Tab', {
	override: 'OgamDesktop.view.navigation.GridDetailsPanel',
	config:{
		title: "Tableau(x) d�taill�(s)"
	},
    loadingMsg: "Cgmt...",
    //dateFormat : 'Y/m/d',
    openNavigationButtonTitle : 'Afficher les d�tails',
    openNavigationButtonTip : 'Affiche la fiche d�taill�e dans l\'onglet des fiches d�taill�es.'
}); 