SET client_encoding TO 'UTF8';
set search_path = metadata;


--
--  Clean previous eventlisteners
-- 
delete from metadata.eventlistener;

----------------------------------
-- Add a demo event listener
----------------------------------
INSERT INTO metadata.eventlistener(listener_id, classname)
VALUES ('DemoListener', 'fr.ifn.ogam.integration.business.SimpleEventLogger');

