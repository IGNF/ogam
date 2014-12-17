--
-- Chargement du référentiel TAXREF v4 en base:
-- ---------------------------------------------  
-- 1/ Création du schéma referentiels et import dans taxref
-- 2/ Quelques statistiques
-- 3/ mise à jour de la table metadata.mode_taxref
--
-- REMARQUES:
-- Le fichier en entrée est supposé être en Latin-1 => corriger le client-encoding si ce n'est pas le cas
-- ------------------------------------------------------------------------------------------

-- Création d'un schéma pour les référentiels
CREATE SCHEMA referentiels;

set search_path = referentiels, metadata;

-- Création d'une table pour le référentiel taxonomique
-- drop table taxref;
create table taxref (
REGNE				VARCHAR(50)          null,
PHYLUM				VARCHAR(50)          null,
CLASSE				VARCHAR(50)          null,
ORDRE				VARCHAR(50)          null,
FAMILLE				VARCHAR(50)          null,
GROUP1_INPN			VARCHAR(50)          null,
GROUP2_INPN			VARCHAR(50)          null,
CD_NOM				VARCHAR(50)          not null, -- identifiant unique du taxon
CD_TAXSUP			VARCHAR(50)          not null, -- identifiant du parent
CD_REF				VARCHAR(50)          not null, -- synonymes
RANG				VARCHAR(50)          null,
LB_NOM				VARCHAR(500)         null,
LB_AUTEUR			VARCHAR(500)         null,
NOM_COMPLET			VARCHAR(500)         null,
NOM_COMPLET_HTML	VARCHAR(1000)         null,
NOM_VALIDE			VARCHAR(500)         null,
NOM_VERN			VARCHAR(1000)         null,
NOM_VERN_ENG		VARCHAR(1000)         null,
HABITAT				VARCHAR(50)          null,
FR					VARCHAR(50)          null,
GF					VARCHAR(50)          null,
MAR					VARCHAR(50)          null,
GUA					VARCHAR(50)          null,
SM					VARCHAR(50)          null,
SB  	 			VARCHAR(50)          null,
SPM					VARCHAR(50)          null,
MAY					VARCHAR(50)          null,
EPA					VARCHAR(50)          null,
REU					VARCHAR(50)          null,
TAAF				VARCHAR(50)          null,
PF					VARCHAR(50)          null,
NC					VARCHAR(50)          null,
WF					VARCHAR(50)          null,
CLI					VARCHAR(50)          null,
URL                 VARCHAR(50)          null,
constraint PK_taxref primary key (CD_NOM)
);

COMMENT ON COLUMN taxref.REGNE IS 'Règne auquel le taxon appartient (champ calculé à partir du CD_TAXSUP)';
COMMENT ON COLUMN taxref.PHYLUM IS 'Embranchement auquel le taxon appartient (champ calculé à partir du CD_TAXSUP)';
COMMENT ON COLUMN taxref.CLASSE IS 'Classe à laquelle le taxon appartient (champ calculé à partir du CD_TAXSUP)';
COMMENT ON COLUMN taxref.ORDRE IS 'Ordre auquel le taxon appartient (champ calculé à partir du CD_TAXSUP)';
COMMENT ON COLUMN taxref.FAMILLE IS 'Famille à laquelle le taxon appartient (champ calculé à partir du CD_TAXSUP)';
COMMENT ON COLUMN taxref.CD_NOM IS 'Identifiant unique du nom scientifique';
COMMENT ON COLUMN taxref.CD_TAXSUP IS 'Identifiant (CD_NOM) du taxon supérieur';
COMMENT ON COLUMN taxref.CD_REF IS 'Identifiant (CD_NOM) du taxon de référence (nom retenu)';
COMMENT ON COLUMN taxref.RANG IS 'Rang taxonomique (lien vers TAXREF_RANG) ';
COMMENT ON COLUMN taxref.LB_NOM IS 'Nom scientifique du taxon';
COMMENT ON COLUMN taxref.LB_AUTEUR IS 'Autorité du taxon (Auteur, année, gestion des parenthèses)';
COMMENT ON COLUMN taxref.NOM_COMPLET IS 'Nom scientifique complet du taxon (généralement LB_NOM + LB_AUTEUR)';
COMMENT ON COLUMN taxref.NOM_VALIDE IS 'Le NOM_COMPLET du CD_REF';
COMMENT ON COLUMN taxref.CD_REF IS 'Renvoi au CD_NOM du taxon de référence';
COMMENT ON COLUMN taxref.NOM_VERN IS 'Nom vernaculaire du taxon en français';
COMMENT ON COLUMN taxref.NOM_VERN_ENG IS 'Nom vernaculaire du taxon en anglais';
COMMENT ON COLUMN taxref.FR IS 'Statut biogéographique en France métropolitaine';
COMMENT ON COLUMN taxref.GF IS 'Statut biogéographique en Guyane française';
COMMENT ON COLUMN taxref.MAR IS 'Statut biogéographique en Martinique';
COMMENT ON COLUMN taxref.GUA IS 'Statut biogéographique en Guadeloupe';
COMMENT ON COLUMN taxref.SM IS 'Statut biogéographique à Saint-Martin';
COMMENT ON COLUMN taxref.SB IS 'Statut biogéographique à Saint-Barthélémy';
COMMENT ON COLUMN taxref.SPM IS 'Statut biogéographique à Saint-Pierre et Miquelon';
COMMENT ON COLUMN taxref.MAY IS 'Statut biogéographique à Mayotte';
COMMENT ON COLUMN taxref.EPA IS 'Statut biogéographique aux Iles Eparses';
COMMENT ON COLUMN taxref.REU IS 'Statut biogéographique à la Réunion';
COMMENT ON COLUMN taxref.TAAF IS 'Statut biogéographique aux Terres australes et antarctiques françaises';
COMMENT ON COLUMN taxref.NC IS 'Statut biogéographique en Nouvelle-Calédonie';
COMMENT ON COLUMN taxref.WF IS 'Statut biogéographique à Wallis et Futuna';
COMMENT ON COLUMN taxref.PF IS 'Statut biogéographique en Polynésie française';
COMMENT ON COLUMN taxref.CLI IS 'Statut biogéographique à Clipperton';
COMMENT ON COLUMN taxref.URL IS 'Permalien INPN = ‘http://inpn.mnhn.fr/espece/cd_nom/’ + CD_NOM';


-- Le fichier est en encodage européen
SET client_encoding = 'ISO-8859-1';

-- Copie des données dans la table temporaire
-- DELETE FROM taxref;


-- remplacer C:\workspace\demo-sinp\database/Referentiels/TAXREFv8.0/TAXREFv80.txt par le chemin complet vers le fichier TAXREFv8.0.txt
COPY taxref FROM 'C:\ms4w\apps\ogam\database/Referentiels/TAXREFv8.0/TAXREFv80.txt' with null '';

SET client_encoding = 'UTF-8';


-- Suppression de la ligne de titre ...
DELETE FROM taxref where CD_NOM = 'CD_NOM';


-- Ajout de la définition des rangs
-- DROP TABLE taxref_rang;
create table taxref_rang (
RANG				VARCHAR(50)         not null,
DETAIL				VARCHAR(50)          null,
constraint PK_taxref_rang primary key (RANG)
);

INSERT INTO taxref_rang (rang, detail) VALUES ('KD','Règne');
INSERT INTO taxref_rang (rang, detail) VALUES ('PH','Embranchement'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('CL','Classe');
INSERT INTO taxref_rang (rang, detail) VALUES ('OR','Ordre');
INSERT INTO taxref_rang (rang, detail) VALUES ('FM','Famille'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('GN','Genre'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('AGES','Agrégat'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('ES','Espèce'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('SSES','Sous-espèce'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('HYB','Hybride');
INSERT INTO taxref_rang (rang, detail) VALUES ('CVAR','Convariété'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('VAR','Variété'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('FO','Forme');
INSERT INTO taxref_rang (rang, detail) VALUES ('SSFO','Sous-Forme'); 
INSERT INTO taxref_rang (rang, detail) VALUES ('RACE','Race'); 


-- Ajout de la définition des statuts
-- DROP TABLE taxref_statut;
create table taxref_statut (
statut		  		VARCHAR(50)         not null,
description			VARCHAR(50)          null,
constraint PK_taxref_statut primary key (statut)
);


INSERT INTO taxref_statut (statut, description) VALUES ('A','Absente'); 
INSERT INTO taxref_statut (statut, description) VALUES ('B','Accidentelle / Visiteuse'); 
INSERT INTO taxref_statut (statut, description) VALUES ('C','Cryptogène'); 
INSERT INTO taxref_statut (statut, description) VALUES ('D','Douteux'); 
INSERT INTO taxref_statut (statut, description) VALUES ('E','Endémique'); 
INSERT INTO taxref_statut (statut, description) VALUES ('F','Trouvé en fouille'); 
INSERT INTO taxref_statut (statut, description) VALUES ('I','Introduite'); 
INSERT INTO taxref_statut (statut, description) VALUES ('J','Introduite envahissante'); 
INSERT INTO taxref_statut (statut, description) VALUES ('M','Domestique / Introduite non établie'); 
INSERT INTO taxref_statut (statut, description) VALUES ('P','Présente'); 
INSERT INTO taxref_statut (statut, description) VALUES ('S','Subendémique'); 
INSERT INTO taxref_statut (statut, description) VALUES ('W','Disparue'); 
INSERT INTO taxref_statut (statut, description) VALUES ('X','Eteinte'); 
INSERT INTO taxref_statut (statut, description) VALUES ('Y','Introduite éteinte'); 
INSERT INTO taxref_statut (statut, description) VALUES ('Z','Endémique éteinte'); 






-- 
-- Quelques statistiques
--
select count(*) from taxref; -- 315 225 taxons

select count(*) from taxref where cd_nom = cd_ref; -- 147 452 taxons de référence
select count(*) from taxref where cd_nom <> cd_ref; -- 167 773 synonymes



-- 5 Taxons de type "KINGDOM" (ils ont comme parent le taxon 349525 mais celui-ci n'existe pas) 

-- Sinon, il n'y a pas de taxon qui n'a pas de parent.
select *
from taxref where cd_taxsup IS NULL;

-- Insertion d'une racine commune
-- INSERT INTO taxref (regne, cd_nom, cd_taxsup, cd_ref, LB_NOM) VALUES ('V',349525,'*',349525, 'Vivant');
-- DELETE FROM taxref WHERE cd_nom = '349525';
--UPDATE taxref SET cd_taxsup = '*' WHERE cd_nom IN ('183716','187079','187496');


-- Création d'index
--CREATE INDEX cd_ref_ix ON taxref USING btree (cd_ref);
--CREATE INDEX lb_nom_ix ON taxref USING btree (lb_nom);
--CREATE INDEX nom_complet_ix ON taxref USING btree (nom_complet);


--
-- Suppression des branches autres que Anymalia, Plantae et Fungi
--
/*
DELETE FROM taxref 
where cd_nom in (
	SELECT cd_nom
	FROM (
	WITH RECURSIVE node_list( cd_nom, cd_taxsup, lb_nom, nom_vern, is_leaf, level) AS ( 	    
		SELECT cd_nom, cd_taxsup, lb_nom, nom_vern, is_leaf, 1 		
		FROM taxref 				
		WHERE cd_nom in ('187502', -- bacteria
			 '436946', -- chromista
			 '187545', -- "Protozoa"
			 '187501', -- "Bacteria"
			 '524110', -- "Chromista"
			 '187538')  --"Protozoa"
		
		UNION 		
		
		SELECT child.cd_nom, child.cd_taxsup, child.lb_nom, child.nom_vern, child.is_leaf, level + 1 		
		FROM taxref child 		
		INNER JOIN node_list on child.cd_taxsup = node_list.cd_nom 		
	) 	
	SELECT * 	
	FROM node_list 	
	) as foo
)
*/

-- Exemple de requête récursive
/*WITH RECURSIVE node_list( cd_nom, cd_taxsup, lb_nom, nom_vern, is_leaf, level) AS ( 	    
	SELECT cd_nom, cd_taxsup, lb_nom, nom_vern, is_leaf, 1 		
	FROM taxref 				
	WHERE cd_taxsup = '*'	
	
	UNION 		
	
	SELECT child.cd_nom, child.cd_taxsup, child.lb_nom, child.nom_vern, child.is_leaf, level + 1 		
	FROM taxref child 		
	INNER JOIN node_list on child.cd_taxsup = node_list.cd_nom 		
	WHERE level < 1 	
) 	
SELECT * 	
FROM node_list 	
ORDER BY level, cd_taxsup, cd_nom, lb_nom
*/


--
-- Recopie de la table referentiels.taxref vers la table metadata.mode_taxref 
--
INSERT INTO metadata.mode_taxref (unit, code, parent_code, "name", complete_name, vernacular_name, is_leaf, is_reference)
SELECT 'ID_TAXON', cd_nom,  cd_taxsup, lb_nom, nom_complet, nom_vern, '0', case when (cd_nom = cd_ref) then 1 else 0 end
FROM referentiels.taxref;


-- Marquage des feuilles
update metadata.mode_taxref set is_leaf = '1' where code not in (select distinct parent_code from metadata.mode_taxref);

