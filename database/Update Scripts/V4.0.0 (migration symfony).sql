
--
-- On liste ici les modifications effectuées sur la base de donnée suite à la migration symfony 

--Il y avait des incohérences entre les entités (les objets) et la base de données (colonnes non mappées ou attributs non sauvegardés).
--Il faudra essayer de les corriger.

-- Ajout du champ "position" dans la table "mode_taxref"
ALTER TABLE metadata.mode_taxref ADD column "position" integer;

-- Renommage de "name" en "label" dans la table "mode_taxref"
ALTER TABLE metadata.mode_taxref RENAME name  TO label;


-- TODO : Le champ "position" dans les fields et les formats pourrait être remonté au niveau de la classe parente.

-- TODO : Passage de char(1) à boolean pour les attributs booléens.


-- TODO :
-- On avait des objets "TreeNode" et "TaxrefNode" qui représentairent un noeud d'un arbre avec ses enfants (attribut children).
-- Alors qu'en base on a la vision inverse, on a une entité "ModeTree" avec un lien vers son parent.
-- La conversion était faite dans le modèle par un appel récursif de fonction.


-- TODO : Renommer la table "mapping.layer_tree" (l'entité s'appelle LegendItem)
-- TODO : Changer le type de "mapping.layer_tree.parent_id" en integer (l'id du parent est de type varchar et on référence un integer)   

