Genapp.config.localCls = 'fr';
if (Genapp.tree.LayerTreePanel) {
	Ext.apply(Genapp.tree.LayerTreePanel.prototype, {
		alertInvalidLayerMove : "Déplacement non autorisé"
	});
}
if (Genapp.form.TreeField) {
	Ext.apply(Genapp.form.TreeField.prototype, {
		emptyText : "Sélectionner..."
	});
}
if (Genapp.form.DateRangeField) {
	Ext.apply(Genapp.form.DateRangeField.prototype, {
		minText : "Les dates contenues dans ce champ doivent être égales ou postérieures au {0}",
		maxText : "Les dates contenues dans ce champ doivent être égales ou antérieures au {0}",
		reverseText : "La date de fin doit être postérieure à la date de début",
		notEqualText : "Les dates de début et de fin ne peuvent être égales"
	});
}
if (Genapp.form.GeometryField) {
	Ext.apply(Genapp.form.GeometryField.prototype, {
		fieldLabel : "Localisation",
		mapWindowTitle : "Dessinez la zone recherchée sur la carte :",
		mapWindowValidateButtonText : "Valider",
		mapWindowValidateAndSearchButtonText : "Valider et rechercher",
		mapWindowCancelButtonText : "Annuler"
	});
}
if (Genapp.form.NumberRangeField) {
	Ext.apply(Genapp.form.NumberRangeField.prototype, {
		minText : "La valeur minimum pour ce champ est {0}",
		maxText : "La valeur maximum pour ce champ est {0}",
		reverseText : "Le maximum doit être supérieur au minimum",
		formatText : "Les formats corrects sont",
		nanText : "'{0}' n'est pas un nombre valide"
	});
}
if (Genapp.form.TwinNumberField) {
	Ext.apply(Genapp.form.TwinNumberField.prototype, {
		minText : "La valeur minimum pour ce champ est {0}",
		maxText : "La valeur maximum pour ce champ est {0}",
		nanText : "'{0}' n'est pas un nombre valide"
	});
}
if (Genapp.ConsultationPanel) {
	Ext
			.apply(
					Genapp.ConsultationPanel.prototype,
					{
						title : 'Consultation',
						userManualLinkText : 'Manuel utilisateur',
						datasetComboBoxEmptyText : "Sélectionnez un type de données",
						datasetPanelTitle : "Type de données",
						formsPanelTitle : "Formulaires :",
						exportButtonText : "Export",
						csvExportMenuItemText : "Export CSV",
						kmlExportMenuItemText : "Export KML",
						printMapButtonText : "Imprimer la carte",
						gridViewEmptyText : "Pas de résultat...",
						gridPanelTitle : "Résultats",
						gridPanelTabTip : "Les résultats de la requête",
						centerPanelTitle : "Onglet des résultats",
						queryPanelTitle : "Requêteur",
						queryPanelPinToolQtip : "Annuler la fermeture automatique de l'onglet",
						queryPanelUnpinToolQtip : "Activer la fermeture automatique de l'onglet",
						queryPanelCancelButtonText : "Annuler",
						queryPanelPredefinedRequestSaveButtonText : "Sauvegarder la requête",
						queryPanelResetButtonText : "Réinitialiser",
						queryPanelSearchButtonText : "Rechercher",
						queryPanelCancelButtonTooltip : "Annuler la requête",
						queryPanelPredefinedRequestSaveButtonTooltip : "Ajouter la requête courante aux requêtes sauvegardées",
						queryPanelResetButtonTooltip : "Réinitialiser la requête",
						queryPanelSearchButtonTooltip : "Lancer la requête",
						detailsPanelCtTitle : "Détails",
						detailsPanelCtPinToolQtip : "Annuler la fermeture automatique de l'onglet",
						detailsPanelCtUnpinToolQtip : "Activer la fermeture automatique de l'onglet",
						featuresInformationPanelCtTitle : "Tableau(x) détaillé(s)",
						mapMaskMsg : "Chargement...",
						alertErrorTitle : "Erreur :",
						alertRequestFailedMsg : "Désolé, la requête a échoué...",
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
						openGridDetailsButtonTitle : "Voir les détails",
						openGridDetailsButtonTip : "Affiche les informations détaillées dans l'onglet des détails.",
						seeOnMapButtonTitle : "Voir sur la carte",
						seeOnMapButtonTip : "Affiche la carte, puis zoom et centre sur la localisation.",
						editDataButtonTitle : "Editer les données",
						editDataButtonTip : "Ouvre la page d'édition pour éditer les données.",
						cannotEditTip : "Vous n'avez pas le droit d'éditer cette donnée.",
						exportAsPdfButtonText: "Exporter en pdf"
					});
}
if (Genapp.form.picker.DateRangePicker) {
	Ext.apply(Genapp.form.picker.DateRangePicker.prototype, {
		tbarStartDateButtonText : "Date de début ...",
		tbarRangeDateButtonText : "Intervalle",
		tbarEndDateButtonText : "... Date de fin",
		fbarOkButtonText : "ok"
	});
}
if (Genapp.DetailsPanel) {
	Ext.apply(Genapp.DetailsPanel.prototype, {
		loadingMsg : "Cgmt...",
	    seeChildrenButtonTitleSingular : 'Voir l\'unique enfant',
	    seeChildrenButtonTitlePlural : 'Voir les enfants',
		seeChildrenButtonTip : 'Afficher les enfants dans le tableau des détails.',
        editLinkButtonTitle : 'Editer les données',
        editLinkButtonTip : 'Ouvre la page d\'édition pour éditer les données.'
	});
}
if (Genapp.CardGridDetailsPanel) {
	Ext.apply(Genapp.CardGridDetailsPanel.prototype, {
		loadingMsg : "Cgmt...",
		cardGridDetailsPanelTitle : "Sélection"
	});
}
if (Genapp.GridDetailsPanel) {
	Ext.apply(Genapp.GridDetailsPanel.prototype, {
		loadingMsg : "Cgmt...",
		openDetailsButtonTitle : 'Afficher les détails',
		openDetailsButtonTip : 'Affiche la fiche détaillée dans l\'onglet des fiches détaillées.',
		getChildrenButtonTitle : 'Descendre un niveau en dessous',
		getChildrenButtonTip : 'Afficher les enfants de l\'enregistrement.',
		getParentButtonTitle : 'Remonter un niveau au dessus',
		getParentButtonTip : 'Réafficher le parent des enregistrements.'
	});
}
if (Genapp.FieldForm) {
	Ext.apply(Genapp.FieldForm.prototype, {
		criteriaPanelTbarLabel : "Critères",
		criteriaPanelTbarComboEmptyText : "Sélectionner...",
		criteriaPanelTbarComboLoadingText : "Recherche en cours...",
		columnsPanelTbarLabel : "Colonnes",
		columnsPanelTbarComboEmptyText : "Sélectionner...",
		columnsPanelTbarComboLoadingText : "Recherche en cours...",
		columnsPanelTbarAddAllButtonTooltip : "Ajouter toutes les colonnes",
		columnsPanelTbarRemoveAllButtonTooltip : "Supprimer toutes les colonnes"
	});
}
if (Genapp.GeoPanel) {
	Ext.apply(Genapp.GeoPanel.prototype, {
		title : "Carte",
		popupTitle : 'Information(s) sur la géométrie',
		tabTip : "La carte avec les localisations des résultats de la requête",
		layerPanelTitle : "Couches",
		layerPanelTabTip : "L'arbre de sélection des couches",
		legendPanelTitle : "Légendes",
		legendPanelTabTip : "Les legendes des couches",
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
		locationInfoControlTitle : "Voir les informations sur le point",
		selectFeatureControlTitle : "Selectionner un contour de sur la couche sélectionnée",
		featureInfoControlTitle : "Voir les informations sur la couche sélectionnée",
		legalMentionsLinkText : "Mentions légales",
		addGeomCriteriaButtonText : "Sélectionner une zone géographique"
	});
}
if (Genapp.tree.ContextMenuPlugin) {
	Ext.apply(Genapp.tree.ContextMenuPlugin.prototype, {
		deleteLayerText : 'Supprimer la couche',
		deleteLayerConfirmationText : 'Etes-vous sur de vouloir supprimer cette couche ?',
		changeOpacityText : 'Modifier la transparence'
	});
}
if (Genapp.form.picker.NumberRangePicker) {
	Ext.apply(Genapp.form.picker.NumberRangePicker.prototype, {
		minFieldLabel : "Min",
		maxFieldLabel : "Max",
		okButtonText : "ok"
	});
}
if (typeof (OpenLayers) !== "undefined") {
    if (OpenLayers.Control.FeatureInfoControl.prototype) {
        Ext.apply(OpenLayers.Control.FeatureInfoControl.prototype, {
            popupTitle : "Information(s) sur la géométrie"
        });
    }
	if (OpenLayers.Handler.FeatureInfo.prototype) {
		Ext.apply(OpenLayers.Handler.FeatureInfo.prototype, {
			alertErrorTitle : "Erreur :",
			alertRequestFailedMsg : "Désolé, la demande d'informations sur la géométrie a échoué..."
		});
	}
    if (OpenLayers.Handler.GetFeature.prototype) {
        Ext.apply(OpenLayers.Handler.GetFeature.prototype, {
            alertErrorTitle : "Erreur :",
            alertRequestFailedMsg : "Désolé, la demande d'informations sur la géométrie a échoué..."
        });
    }
    if (OpenLayers.Handler.LocationInfo.prototype) {
        Ext.apply(OpenLayers.Handler.LocationInfo.prototype, {
            alertErrorTitle : "Erreur :",
            alertRequestFailedMsg : "Désolé, la demande d'informations sur la géométrie a échoué..."
        });
    }
}
if (Genapp.PredefinedRequestPanel) {
	Ext.apply(Genapp.PredefinedRequestPanel.prototype, {
		title : "Page découverte",
		consultationButtonText : "Consultation",
		consultationButtonTooltip : "Ouvre la page de consultation",
		descriptionTitle : "",
		nameColumnHeader : "Identifiant",
		labelColumnHeader : "Libellé",
		descriptionColumnHeader : "Description",
		dateColumnHeader : "Date",
		clickColumnHeader : "Clique(s)",
		positionColumnHeader : "Classement",
		groupNameColumnHeader : "Nom du Groupe",
		groupLabelColumnHeader : "Libellé du Groupe",
		groupPositionColumnHeader : "Classement du Groupe",
		resetButtonText : "Annuler",
		resetButtonTooltip : "Réinitialise le formulaire avec les valeurs par défaut",
		launchRequestButtonText : "OK",
		launchRequestButtonTooltip : "Lance la requête dans la page de consultation",
		loadingText : "Chargement...",
		defaultCardPanelText : "Veuillez sélectionner une requête...",
		defaultErrorCardPanelText : "Désolé, le chargement a échoué...",
		criteriaPanelTitle : "Indiquez votre choix :"
	});
}
if (Genapp.form.picker.TreePicker) {
	Ext.apply(Genapp.form.picker.TreePicker.prototype, {
		okButtonText : "ok"
	});
}
if (Genapp.EditionPanel) {
	Ext.apply(Genapp.EditionPanel.prototype, {
		title : 'Edition',
		unsavedChangesMessage : 'Vous avez des modifications non sauvegardées',
		parentsFSTitle : 'Parents',
		dataEditFSDeleteButtonText : 'Supprimer',
		dataEditFSDeleteButtonTooltip : 'Supprimer la donnée',
		dataEditFSDeleteButtonConfirm : 'Voulez-vous vraiment effacer cette donnée ?',
		dataEditFSDeleteButtonDisabledTooltip : 'La donnée ne peut pas être supprimée (des enfants existent)',
		dataEditFSValidateButtonText : 'Valider',
		dataEditFSValidateButtonTooltip : 'Sauvegarder les modifications',
		dataEditFSSavingMessage : 'Sauvegarde en cours ...',
		dataEditFSLoadingMessage : 'Chargement ...',
		dataEditFSValidateButtonDisabledTooltip : 'La donnée ne peut pas être éditée (droits manquants)',
		childrenFSTitle : 'Enfants',
		childrenFSAddNewChildButtonText : 'Ajouter',
		childrenFSAddNewChildButtonTooltip : 'Ajouter un nouvel enfant',
		contentTitleAddPrefix : 'Ajout d\'un(e)',
		contentTitleEditPrefix : 'Edition d\'un(e)',
		tipEditPrefix : 'Editer le/la/l\'',
		geoMapWindowTitle : 'Saisir la localisation'
	});
}
if (Genapp.form.ImageField) {
	Ext.apply(Genapp.form.ImageField.prototype, {
		emptyImageUploadFieldTest : 'Sélectionner une image'
	});
}
if (Genapp.map.LayerSelector) {
	Ext.apply(Genapp.map.LayerSelector.prototype, {
		layerSelectorButtonLabel : 'Choisir une couche'
	});
}
if (Genapp.DocSearchPage) {
    Ext.apply(Genapp.DocSearchPage.prototype, {
        title : 'Documents',
        centerPanelTitle : 'Document'
    });
}
if (Genapp.DocSearchRequestPanel) {
    Ext.apply(Genapp.DocSearchRequestPanel.prototype, {
        title : 'Filtre(s)',
        textFieldLabel: 'Recherche dans le corps du document',
        alertErrorTitle: 'Une erreur est apparue',
        alertRequestFailedMsg : 'Désolé, la requête a échoué',
        resetButtonText: 'Effacer les filtres',
        filterButtonText: 'Filtrer',
        fieldLabels: {
            'Title' : 'Titre',
            'Author' : 'Auteur',
            'Subject' : 'Sujet',
            'Parution' : 'Parution',
            'Publication' : 'Publication',
            'SmallFileName' : 'Référence'
        }
    });
}
if (Genapp.DocSearchResultPanel) {
    Ext.apply(Genapp.DocSearchResultPanel.prototype, {
        title : 'Resultat(s)',
        columnLabels: {
            'id' : 'Identifiant',
            'score' : 'Score',
            'url' : 'Url',
            'Title' : 'Titre',
            'Author' : 'Auteur',
            'Subject' : 'Sujet',
            'Parution' : 'Parution',
            'Publication' : 'Publication',
            'SmallFileName' : 'Référence'
        }
    });
}
if (Genapp.PDFComponent) {
    Ext.apply(Genapp.PDFComponent.prototype, {
        defaultMessage : 'Veuillez selectionner un document...',
        defaultHtml: '<h4>Le contenu de cette page requiert Adobe Acrobat Reader.</h4> \
            <p>Vous devez avoir Adobe Acrobat Reader installé sur votre ordinateur \
            afin de pouvoir lire les documents de type &quot;PDF&quot;. \
            <p>Télécharger <a href="http://www.adobe.com/products/acrobat/readstep2.html"> \
            Adobe Acrobat Reader</a>.</p> \
            <p><a href="http://www.adobe.com/products/acrobat/readstep2.html">\
            <img src="http://www.adobe.com/images/shared/download_buttons/get_adobe_reader.gif" \
            width="88" height="31" border="0" alt="Télécharger Adobe Acrobat Reader." />'
    });
}
if (Genapp.util.indexationPage) {
    Ext.apply(Genapp.util.indexationPage, {
        defaultErrorMsg: 'Une erreur est apparue.',
        progressBarInitMsg: 'Initialisation...',
        progressBarLoadingMsg: 'Chargement du fichier {0} sur {1}...'
    });
}
