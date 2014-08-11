-- Function: public.convert_latlon_dms2(character varying)

-- DROP FUNCTION public.convert_latlon_dms2(character varying);

CREATE OR REPLACE FUNCTION public.convert_latlon_dms2("value" character varying)
  RETURNS character varying AS
$BODY$
DECLARE
toConvert real;
degree  varchar;
minutes  varchar;
seconds  varchar;
in_degree integer;
in_minutes integer;
in_seconds integer;
signe boolean;
begin
toConvert := cast (value as real);
if (toConvert<0) then
 begin
 toConvert :=-toConvert;
 signe=true;
 end;
else
 signe =false;
end if;
in_degree := trunc(toConvert);
in_minutes := trunc ((toConvert - in_degree)*60);
in_seconds := trunc((((toConvert - in_degree) * 60) - in_minutes) * 60 );
degree = cast (in_degree as varchar);
minutes = cast (in_minutes as varchar);
seconds = cast (in_seconds as varchar); 
if (signe is false) then
 return  '+'||lpad(degree , 2, '0')|| '.' || lpad(minutes, 2, '0')  || '.' || lpad(seconds , 2, '0');
else
 return  '-'|| lpad(degree , 2, '0')|| '.' || lpad(minutes, 2, '0')  || '.' || lpad(seconds , 2, '0');
end if;
end;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
ALTER FUNCTION public.convert_latlon_dms2(character varying) OWNER TO pgsql;
