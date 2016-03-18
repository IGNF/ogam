set search_path = metadata;

-- Chargement des codes
INSERT INTO MODE_TREE (unit, code, position, label, definition)
SELECT *
FROM MODE
WHERE UNIT = 'SPECIES_CODE'


-- Création de l'arborescence
UPDATE MODE_TREE
SET PARENT_CODE = substring(CODE from 0 for 8) || '.999'
WHERE CODE NOT LIKE '%.999'

UPDATE MODE_TREE
SET PARENT_CODE = substring(CODE from 0 for 4) || '.999.999'
WHERE CODE LIKE '%.999'

-- Ajout des codes manquants
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '001', '-1', 1, 'Broadleaves', 'Broadleaves');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '002', '-1', 2, 'Conifers', 'Conifers');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '003', '-1', 3, 'Shrubs', 'Shrubs');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '095.999.999', '001', 1, 'Aceraceae', 'Aceraceae');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '034.999.999', '001', 2, 'Betulaceae', 'Betulaceae');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '080.999.999', '001', 3, 'Amelanchier', 'Amelanchier');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '035.999.999', '001', 4, 'Carpinus', 'Carpinus');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '026.999.999', '002', 1, 'Pinaceae', 'Pinaceae');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '081.999.999', '002', 2, 'Acacia', 'Acacia');
INSERT INTO MODE_TREE (unit, code, parent_code, position, label, definition) VALUES ('SPECIES_CODE', '028.999.999', '002', 3, 'Cupressus', 'Cupressus');

UPDATE MODE_TREE SET PARENT_CODE = '001', POSITION=99 WHERE CODE = '999';
UPDATE MODE_TREE SET PARENT_CODE = '002', POSITION=99 WHERE CODE = '998';
UPDATE MODE_TREE SET PARENT_CODE = '003', POSITION=99 WHERE CODE = '997';

-- Marque les noeuds qui sont une feuille
UPDATE mode_tree SET __is_leaf = '1';
UPDATE mode_tree SET __is_leaf = '0' WHERE code IN (SELECT distinct parent_code from mode_tree);


--
-- Requêtes de sélection
--

-- Sélection de la racine
SELECT *
FROM MODE_TREE
WHERE PARENT_CODE = '-1'

-- Sélection des éléments fils juste sous un code donné
SELECT *
FROM MODE_TREE
WHERE PARENT_CODE = '001'
ORDER BY POSITION


-- Sélection de TOUS les éléments fils sous un code donné (requête récursive)
WITH RECURSIVE nodes (unit, code, parent_code, position, label, definition, __is_leaf, __level, __path) AS (
    SELECT unit, code, parent_code, position, label, definition, __is_leaf, 0, '-1'
    FROM mode_tree
    WHERE parent_code = '-1'

    
    UNION ALL
    
    SELECT m.unit, m.code, m.parent_code, m.position, m.label, m.definition, m.__is_leaf, nodes.__level + 1, nodes.__path || ' -> ' || m.code
    FROM mode_tree m
    INNER JOIN nodes ON m.parent_code = nodes.code
    

)
SELECT *
FROM nodes 
 