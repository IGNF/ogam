--
-- Définition des requêtes prédéfinies
--

set search_path = website;

DELETE FROM predefined_request_group_asso;
DELETE FROM predefined_request_group;
DELETE FROM predefined_request_criteria;
DELETE FROM predefined_request_result;
DELETE FROM predefined_request;

-- Création d'un thème (groupe de requêtes)
INSERT INTO predefined_request_group(group_name, label, definition, position) VALUES ('SPECIES', 'Distribution par espèce', 'Distribution par espèce', 1);

-- Création d'une requête prédéfinie
INSERT INTO predefined_request (request_name, schema_code, dataset_id, label, definition, date) VALUES ('SPECIES', 'RAW_DATA', 'SPECIES', 'Distribution par espèce', 'Distribution par espèce en forêt', now());
INSERT INTO predefined_request (request_name, schema_code, dataset_id, label, definition, date) VALUES ('DEP', 'RAW_DATA', 'SPECIES', 'Espèces par département', 'Espèces par département', now());


-- Configuration des requêtes prédéfinies
INSERT INTO predefined_request_criteria (request_name, format, data, value, fixed) VALUES ('SPECIES', 'SPECIES_FORM', 'SPECIES_CODE', '026.001.006', NULL);
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'PLOT_CODE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'CYCLE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'INV_DATE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'PLOT_FORM', 'IS_FOREST_PLOT');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'SPECIES_FORM', 'SPECIES_CODE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('SPECIES', 'SPECIES_FORM', 'BASAL_AREA');

INSERT INTO predefined_request_criteria (request_name, format, data, value, fixed) VALUES ('DEP', 'LOCATION_FORM', 'DEPARTEMENT', '45', NULL);
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'PLOT_CODE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'CYCLE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'INV_DATE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'PLOT_FORM', 'IS_FOREST_PLOT');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'SPECIES_FORM', 'SPECIES_CODE');
INSERT INTO predefined_request_result (request_name, format, data) VALUES ('DEP', 'SPECIES_FORM', 'BASAL_AREA');


-- Rattachement de la requête prédéfinies au thème
INSERT INTO website.predefined_request_group_asso(group_name, request_name, position) VALUES ('SPECIES', 'SPECIES', 1);
INSERT INTO website.predefined_request_group_asso(group_name, request_name, position) VALUES ('SPECIES', 'DEP', 2);
