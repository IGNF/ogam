-- Diff position dans metadata.table_field :

select 
t.table_name,a.tablename as sys_tablename,f.column_name,a.attname as sys_columnname,position,a.classe as sys_position 
from metadata.table_format t 
inner join metadata.table_field f on t.format=f.format
inner join 
(select upper(schemaname),upper(t.tablename) as tablename,upper(a.attname) as attname,a.attnum as classe
from pg_tables t 
inner join pg_class c on t.tablename=c.relname
inner join pg_attribute a on a.attrelid=c.oid
where schemaname='raw_data' and a.attnum>0) as a on t.table_name=a.tablename and f.column_name=a.attname
where not position=a.classe
order by 1,position
