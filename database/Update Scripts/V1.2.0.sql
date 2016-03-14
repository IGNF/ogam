
--
-- OGAM-202 : Création de couches de résultats pour les représentations géométriques éventuelles des autres tables que la table des localisations
--

SET SEARCH_PATH = mapping;

DELETE FROM RESULT_LOCATION; -- Pour être sur que tout est null
alter table RESULT_LOCATION DROP COLUMN PLOT_CODE; -- intégré à la clé
alter table RESULT_LOCATION DROP COLUMN PROVIDER_ID; -- intégré à la clé
alter table RESULT_LOCATION ADD COLUMN FORMAT VARCHAR(36) not null;
alter table RESULT_LOCATION ADD COLUMN PK VARCHAR(100) not null;

COMMENT ON COLUMN RESULT_LOCATION.FORMAT IS 'The identifier of the table containing the geometry';
COMMENT ON COLUMN RESULT_LOCATION.PK IS 'The primary key of the line containing the geometry';
