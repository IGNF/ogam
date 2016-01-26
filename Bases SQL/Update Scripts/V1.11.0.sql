--
-- Ajout de la table providers
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

-- Rajout d'un dynamode
INSERT INTO metadata.dynamode (unit, sql) VALUES ('PROVIDER_ID', 'SELECT id as code, label FROM website.providers ORDER BY label');

-- Ajout dans la table UNIT
UPDATE metadata.unit SET subtype = 'DYNAMIC' WHERE unit = 'PROVIDER_ID';
