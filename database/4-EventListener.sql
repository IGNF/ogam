SET client_encoding TO 'UTF8';
set search_path = metadata;


--
--  Clean previous eventlisteners
-- 
delete from metadata.event_listener;

----------------------------------
-- Add a demo event listener
----------------------------------
INSERT INTO metadata.event_listener(listener_id, classname)
VALUES ('DemoListener', 'fr.ifn.ogam.integration.business.SimpleEventLogger');

