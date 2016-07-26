
--
-- On liste ici les modifications effectuées sur la base de donnée suite à la migration symfony 
-- (passage de char(1) à boolean, etc).


--Il y avait des incohérences entre les entités (les objets) et la base de données (colonnes non mappées ou attributs non sauvegardés).
--Il faudra essayer de les corriger.

--Le champ "position" dans les fields et les formats pourrait être remonté au niveau de la classe parente.

-- Ajout du champ "position" dans la table "mode_taxref"
ALTER TABLE metadata.mode_taxref ADD column "position" integer;

-- Renommage de "name" en "label" dans la table "mode_taxref"
ALTER TABLE metadata.mode_taxref RENAME name  TO label;