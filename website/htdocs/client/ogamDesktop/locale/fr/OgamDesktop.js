Ext.define("OgamDesktop.locale.fr.ux.request.AdvancedRequestFieldSet", {
    override: "OgamDesktop.ux.request.AdvancedRequestFieldSet",
	criteriaPanelTbarLabel : "Critères",
	criteriaPanelTbarComboEmptyText : "Sélectionner...",
	criteriaPanelTbarComboLoadingText : "Recherche en cours...",
	columnsPanelTbarLabel : "Colonnes",
	columnsPanelTbarComboEmptyText : "Sélectionner...",
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
	tbarStartDateButtonText : "Date de début ...",
	tbarRangeDateButtonText : "Intervalle",
	tbarEndDateButtonText : "... Date de fin",
	fbarOkButtonText : "ok"
});

Ext.define("OgamDesktop.locale.fr.ux.form.field.DateRangeField", {
	override: "OgamDesktop.ux.form.field.DateRangeField",
	minText : "Les dates contenues dans ce champ doivent être égales ou postérieures au {0}",
	maxText : "Les dates contenues dans ce champ doivent être égales ou antérieures au {0}",
	reverseText : "La date de fin doit être postérieure à la date de début",
	notEqualText : "Les dates de début et de fin ne peuvent être égales",
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
	emptyText : "Sélectionner..."
});

Ext.define("OgamDesktop.locale.fr.ux.form.field.NumberRangeField", {
	override: "OgamDesktop.ux.form.field.NumberRangeField",
	numberSeparator: ' - ',
	decimalSeparator : ".",
	maxNumberPrefix: '<= ',
	minNumberPrefix: '>= ',
	minText : "La valeur minimum pour ce champ est {0}",
	maxText : "La valeur maximum pour ce champ est {0}",
	reverseText : "Le maximum doit être supérieur au minimum",
	formatText : "Les formats corrects sont",
	nanText : "'{0}' n'est pas un nombre valide"
});

Ext.define("OgamDesktop.locale.fr.ux.form.field.GeometryField", {
	override: "OgamDesktop.ux.form.field.GeometryField",
	fieldLabel : "Localisation",
	mapWindowTitle : "Dessinez la zone recherchée sur la carte :",
	mapWindowValidateButtonText : "Valider",
	mapWindowValidateAndSearchButtonText : "Valider et rechercher",
	mapWindowCancelButtonText : "Annuler"
});

/*
 * view
 */

/*
 * view edition
 */
Ext.define('OgamDesktop.locale.fr.view.edition.Panel',{
	override:'OgamDesktop.view.edition.Panel',
	geoMapWindowTitle :'Saisir la localisation',
	unsavedChangesMessage :'Vous avez des modifications non sauvegardées',
	config:{
		title : 'Edition'
	},
	parentsFSTitle : 'Parents',
	dataEditFSDeleteButtonText :'Supprimer',
	dataEditFSDeleteButtonTooltip : 'Supprimer la donnée',
	dataEditFSDeleteButtonConfirm :'Voulez-vous vraiment effacer cette donnée ?',
	dataEditFSDeleteButtonDisabledTooltip : 'La donnée ne peut pas être supprimée (des enfants existent)',
	dataEditFSValidateButtonText :  'Valider',
	dataEditFSValidateButtonTooltip :  'Sauvegarder les modifications',
	dataEditFSSavingMessage : 'Sauvegarde en cours ...',
	dataEditFSLoadingMessage : 'Chargement ...',
	dataEditFSValidateButtonDisabledTooltip :  'La donnée ne peut pas être éditée (droits manquants)',
	childrenFSTitle :  'Enfants',
	childrenFSAddNewChildButtonText : 'Ajouter',
	childrenFSAddNewChildButtonTooltip : 'Ajouter un nouvel enfant',
	contentTitleAddPrefix : 'Ajout d\'un(e)',
	contentTitleEditPrefix : 'Edition d\'un(e)',
	tipEditPrefix :'Editer le/la/l\''
});

/*
 * view result
 */
Ext.define("OgamDesktop.locale.fr.view.result.MainWin", {
	override: 'OgamDesktop.view.result.MainWin',
	config: {
		title : 'Résultats'
	},
	exportButtonText : "Export",
	csvExportMenuItemText: 'Export CSV',
	kmlExportMenuItemText: 'Export KML',
	geojsonExportMenuItemText: 'Export GeoJSON',
	csvExportAlertTitle : "Exportation d'un fichier CSV avec Internet Explorer",
	csvExportAlertMsg : "<div><H2>Pour votre confort sur Internet Explorer vous pouvez: </H2> \
    <H3>Désactiver la confirmation pour les téléchargements de fichiers.</H3> \
    <ul> \
    <li>Dans IE, dérouler le menu 'Outils'</li> \
    <li>Cliquer sur 'Options Internet'</li> \
    <li>Cliquer sur l'onglet 'Sécurité'</li> \
    <li>Cliquer sur le bouton 'Personnaliser le niveau'</li> \
    <li>Descendre jusqu'à la partie 'Téléchargements'</li> \
    <li>Activé la demande de confirmation pour les téléchargements de fichiers</li> \
    </ul> \
    <H3>Désactiver l'ouverture du fichier dans la fenêtre courante.</H3> \
    <ul> \
    <li>Ouvrir le poste de travail</li> \
    <li>Dérouler le menu 'Outils'</li> \
    <li>Cliquer sur 'Options des dossiers...'</li> \
    <li>Cliquer sur l'onglet 'Types de fichiers'</li> \
    <li>Sélectionner l'extension XLS</li> \
    <li>Cliquer sur le bouton 'Avancé'</li> \
    <li>Décocher 'Parcourir dans une même fenêtre'</li> \
    </ul></div>",
	maskMsg : "Chargement..."
});

Ext.define("OgamDesktop.locale.fr.view.result.GridTab", {
	override: 'OgamDesktop.view.result.GridTab',
	emptyText : "Pas de résultat...",
	openNavigationButtonTitle : "Voir les détails",
	openNavigationButtonTip : "Affiche les informations détaillées dans l'onglet des détails.",
	seeOnMapButtonTitle : "Voir sur la carte",
	seeOnMapButtonTip :  "Affiche la carte, puis zoom et centre sur la localisation.",
	editDataButtonTitle : "Editer les données",
	//	dateFormat : 'Y/m/d',
	editDataButtonTip : "Ouvre la page d'édition pour éditer les données."
});

/*
 * view request
 */
Ext.define("OgamDesktop.locale.fr.view.request.MainWin", {
	override: 'OgamDesktop.view.request.MainWin',
	config: {
		title : 'Requêteur'
	}
});

Ext.define("OgamDesktop.locale.fr.view.request.AdvancedRequest", {
	override:'OgamDesktop.view.request.AdvancedRequest',
	requestSelectTitle:'<b>Formulaires</b>',
	processPanelTitle:'Type de données',
	processCBEmptyText:'Selectionner un type de données...',
	buttonsText:{
		submit:'Rechercher',
		cancel:'Annuler',
		reset :'Réinitialiser'
	}
});

Ext.define('OgamDesktop.locale.fr.view.request.PredefinedRequest', {
	override:'OgamDesktop.view.request.PredefinedRequest',
	config:{
		title: 'Requête prédéfinie',
	},
	labelColumnHeader : "Libellé",
	resetButtonText:"Annuler",
	resetButtonTooltip: "Réinitialise le formulaire avec les valeurs par défaut",
	launchRequestButtonText:"OK",
	launchRequestButtonTooltip:"Lance la requête dans la page de consultation",
	loadingText:"Chargement...",
	defaultErrorCardPanelText:"Désolé, le chargement a échoué...",
	criteriaPanelTitle:"Indiquez votre choix :",
	groupTextTpl:"{name} ({children.length:plural('Requete')})"
});

Ext.define('OgamDesktop.locale.fr.view.request.PredefinedRequestSelector', {
	override:'OgamDesktop.view.request.PredefinedRequestSelector',
	defaultCardPanelText : 'Veuillez sélectionner une requête...'
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
	popupTitle : 'Information(s) sur la géométrie',
	tabTip : "La carte avec les localisations des résultats de la requête",
//	layerPanelTitle : "Couches",
//	layerPanelTabTip : "L'arbre de sélection des couches",
//	legendPanelTitle : "Légendes",
//	legendPanelTabTip : "Les legendes des couches",
	panZoomBarControlTitle : "Zoom",
	navigationControlTitle : "Déplacer la carte",
	invalidWKTMsg : "La géométrie ne peut être affichée",
	zoomToFeaturesControlTitle : "Zoomer sur la sélection",
	zoomToResultControlTitle : "Zoomer sur le résultat",
	drawPointControlTitle : "Dessiner un point",
	drawLineControlTitle : "Dessiner une ligne",
	drawFeatureControlTitle : "Dessiner un polygone",
	modifyFeatureControlTitle : "Modifier la géométrie",
	tbarDeleteFeatureButtonTooltip : "Effacer la géométrie",
	tbarPreviousButtonTooltip : "Position précédente",
	tbarNextButtonTooltip : "Position suivante",
	zoomBoxInControlTitle : "Zoom en avant",
	zoomBoxOutControlTitle : "Zoom en arrière",
	zoomToMaxExtentControlTitle : "Zoom arrière maximum",
	snappingControlTitle:'Snapping',
	locationInfoControlTitle : "Voir les informations sur le point",
	LayerSelectorEmptyTextValue: "Selectionner une couche",
	selectFeatureControlTitle : "Selectionner un contour de sur la couche sélectionnée",
	featureInfoControlTitle : "Voir les informations sur la couche sélectionnée",
	legalMentionsLinkText : "Mentions légales",
	addGeomCriteriaButtonText : "Sélectionner une zone géographique",
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
		title: 'Détails',
		exportAsPdfButtonText: "Exporter en pdf"
	}
});

Ext.define('OgamDesktop.locale.fr.view.navigation.Tab', {
	override: 'OgamDesktop.view.navigation.Tab',
	config: {
		title: 'Détails'
	},
    seeChildrenButtonTitleSingular : 'Voir l\'unique enfant',
    seeChildrenButtonTitlePlural : 'Voir les enfants',
	seeChildrenButtonTip : 'Afficher les enfants dans le tableau des détails.',
    editLinkButtonTitle : 'Editer les données',
    editLinkButtonTip : 'Ouvre la page d\'édition pour éditer les données.',
    //TODO  tpl
    loadingMsg : "Cgmt..."
});

Ext.define('OgamDesktop.locale.fr.view.navigation.Tab', {
	override: 'OgamDesktop.view.navigation.GridDetailsPanel',
	config:{
		title: "Tableau(x) détaillé(s)"
	},
    loadingMsg: "Cgmt...",
    //dateFormat : 'Y/m/d',
    openNavigationButtonTitle : 'Afficher les détails',
    openNavigationButtonTip : 'Affiche la fiche détaillée dans l\'onglet des fiches détaillées.'
}); 