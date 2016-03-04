--
-- Chargement du référentiel Faune en base de métadonnées
--


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
CD_NOM				VARCHAR(50)          not null, -- identifiant unique du taxon
CD_TAXSUP			VARCHAR(50)          not null, -- identifiant du parent
CD_REF				VARCHAR(50)          not null, -- synonymes
RANG				VARCHAR(50)          null,
LB_NOM				VARCHAR(500)         null,
LB_AUTEUR			VARCHAR(500)         null,
NOM_COMPLET			VARCHAR(500)         null,
NOM_VERN			VARCHAR(500)         null,
NOM_VERN_ENG		VARCHAR(500)         null,
HABITAT				VARCHAR(50)          null,
FR					VARCHAR(50)          null,
GF					VARCHAR(50)          null,
MAR					VARCHAR(50)          null,
GUA					VARCHAR(50)          null,
SMSB				VARCHAR(50)          null,
SPM					VARCHAR(50)          null,
MAY					VARCHAR(50)          null,
EPA					VARCHAR(50)          null,
REU					VARCHAR(50)          null,
TAAF				VARCHAR(50)          null,
NC					VARCHAR(50)          null,
WF					VARCHAR(50)          null,
PF					VARCHAR(50)          null,
CLI					VARCHAR(50)          null,
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
COMMENT ON COLUMN taxref.CD_REF IS 'Renvoi au CD_NOM du taxon de référence';
COMMENT ON COLUMN taxref.NOM_VERN IS 'Nom vernaculaire du taxon en français';
COMMENT ON COLUMN taxref.NOM_VERN_ENG IS 'Nom vernaculaire du taxon en anglais';
COMMENT ON COLUMN taxref.FR IS 'Statut biogéographique en France métropolitaine';
COMMENT ON COLUMN taxref.GF IS 'Statut biogéographique en Guyane française';
COMMENT ON COLUMN taxref.MAR IS 'Statut biogéographique en Martinique';
COMMENT ON COLUMN taxref.GUA IS 'Statut biogéographique en Guadeloupe';
COMMENT ON COLUMN taxref.SMSB IS 'Statut biogéographique à Saint-Martin et Saint-Barthélémy';
COMMENT ON COLUMN taxref.SPM IS 'Statut biogéographique à Saint-Pierre et Miquelon';
COMMENT ON COLUMN taxref.MAY IS 'Statut biogéographique à Mayotte';
COMMENT ON COLUMN taxref.EPA IS 'Statut biogéographique aux Iles Eparses';
COMMENT ON COLUMN taxref.REU IS 'Statut biogéographique à la Réunion';
COMMENT ON COLUMN taxref.TAAF IS 'Statut biogéographique aux Terres australes et antarctiques françaises';
COMMENT ON COLUMN taxref.NC IS 'Statut biogéographique en Nouvelle-Calédonie';
COMMENT ON COLUMN taxref.WF IS 'Statut biogéographique à Wallis et Futuna';
COMMENT ON COLUMN taxref.PF IS 'Statut biogéographique en Polynésie française';
COMMENT ON COLUMN taxref.CLI IS 'Statut biogéographique à Clipperton';




-- Le fichier est en encodage européen
SET client_encoding = 'ISO-8859-1';

-- Copie des données dans la table temporaire
-- DELETE FROM taxref;
\COPY taxref FROM './Referentiels/TAXREFv30.txt' with null '';




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
description				VARCHAR(50)          null,
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



SET client_encoding = 'UTF-8';


-- 
-- Quelques statistiques
--
select count(*) from taxref; -- 261 214 taxons

select count(*) from taxref where cd_nom = cd_ref; -- 134336 taxons de référence
select count(*) from taxref where cd_nom <> cd_ref; -- 126878 synonymes

select * -- 216 170 feuilles (parents sans enfants)
from mode_tree 
where code not in (select distinct parent_code from mode_tree);

select * -- enfants sans parent
from mode_tree 
where code not in (select distinct parent_code from mode_tree);

select distinct rang from taxref; -- 16 rangs

-- Rangs avec leur définition : Il manque CAR
select *
from (
select distinct rang 
from taxref -- 16 rangs
) as foo
left join taxref_rang using (rang);

select *   -- 4 taxons de règne : Animalia, Chromista, Fungi, Monera, Il manque Plantae
from taxref
where rang = 'KD';

select distinct regne   -- 5 règnes
from taxref;




--
-- Construction de l'arborescence
--


-- Import dans la table mode_taxref
-- DELETE FROM metadata.mode_taxref WHERE unit = 'ID_TAXON';
INSERT INTO metadata.mode_taxref(unit, code, parent_code, name, complete_name, vernacular_name, is_reference)
SELECT 'ID_TAXON', cd_nom, CD_TAXSUP, LB_NOM, NOM_COMPLET, nom_vern, case when cd_nom = cd_ref then '1' else '0' end as is_reference
FROM taxref; 

-- Calcul de la colonne is_leaf
update mode_taxref 
set is_leaf = '0';

update mode_taxref 
set is_leaf = '1'
where code not in (select distinct parent_code from mode_taxref);

select * -- 32000 nodes
from mode_taxref
where is_leaf = '0';





update mode_taxref
set parent_code = '*'
where unit = 'ID_TAXON' 
and parent_code = '0';

