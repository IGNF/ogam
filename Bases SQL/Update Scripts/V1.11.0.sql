--
-- Ajout de la table des providers
--

CREATE SEQUENCE website.provider_id_seq;
CREATE TABLE website.providers
(
  id character varying NOT NULL DEFAULT nextval('website.provider_id_seq'::text),
  label character varying,
  definition character varying,
  CONSTRAINT pk_provider PRIMARY KEY (id)
);
ALTER TABLE website.providers OWNER TO ogam;
ALTER SEQUENCE website.provider_id_seq OWNER TO ogam;   

-- Ajout d'un provider par défaut
INSERT INTO website.providers(id, label, definition) VALUES ('1', 'Defaut', 'Organisme par défaut');
ALTER sequence website.provider_id_seq restart with 2;

-- Rajout d'un dynamode
INSERT INTO metadata.dynamode (unit, sql) VALUES ('PROVIDER_ID', 'SELECT id as code, label FROM website.providers ORDER BY label');

-- Ajout dans la table UNIT
UPDATE metadata.unit SET subtype = 'DYNAMIC' WHERE unit = 'PROVIDER_ID';


--
-- Modification de la table layers, ajout d'un flag pour les couches vectorielles
--
ALTER TABLE mapping.layer ADD COLUMN isvector integer;
COMMENT ON COLUMN mapping.layer.isvector IS 'Indicate if the layer is vector-based (1 for an layer with geometry, 0 for a raster)';

UPDATE mapping.layer SET isvector = 1 where layer_name = 'result_locations';
UPDATE mapping.layer SET isvector = 1 where layer_name = 'all_locations';