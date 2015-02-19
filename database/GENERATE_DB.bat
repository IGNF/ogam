@echo off

IF EXIST "GENERATE_DB.log" DEL "GENERATE_DB.log"

:: chcp 1252 (West European Latin) need to display correctly the message
chcp 1252

@echo In order for chcp 65001 (UTF-8) to work, you must be using a TrueType font in the command prompt. One such font is Lucida Console.  
@echo To use Lucida Console:
@echo - Right click on the window title bar
@echo - Select Properties
@echo - Select the tab Font
@echo - Select Lucida Console
@echo - Press OK

SET server=localhost
SET /P server="Server [%server%]: "

SET database=ogam
SET /P database="Database [%database%]: "

SET port=5432
SET /P port="Port [%port%]: "

SET username=postgres
SET /P username="Username [%username%]: "

@echo ****** Drop the old database if exist after an user validation ******
dropdb -h %server% -U %username% -p %port% -i --if-exists %database%
@echo ****** Database creation with postgis ******
createdb -h %server% -U %username% -p %port% -O %username% -E UTF8 -T postgis_21_sample %database%

:: The scripts encoding must be UTF-8 (without BOM)
:: The chcp 65001 (UTF-8) is not realy necessary and not display correctly the error messages
:: chcp 65001

@echo ****** Dropping of the sample schemas : ******
psql -c "DROP SCHEMA tiger CASCADE;DROP SCHEMA topology CASCADE;" -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Create harmonized data schema : ******
psql -f 1-Create_harmonized_data_schema.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Create mapping schema : ******
psql -f 1-Create_mapping_schema.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Create metadata schema : ******
psql -f 1-Create_metadata_schema.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Create raw data schema : ******
psql -f 1-Create_raw_data_schema.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Create referentiels schema : ******
psql -f 1-Create_referentiels_schema.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Create website schema : ******
psql -f 1-Create_website_schema.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Import ModTaxRef v8.0 : ******
psql -f 3-Import_ModTaxRef-v8.0.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Populate mapping schema : ******
psql -f 3-Populate_mapping_schema.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Populate mapping schema (communes) : ******
psql -f Referentiels\communes.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Populate mapping schema (departements) : ******
psql -f Referentiels\legacy_gist.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
psql -f Referentiels\departements.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Populate mapping schema (pays) : ******
psql -f Referentiels\nuts_0.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Populate metadata schema : ******
psql -f Metadata\import_from_csv.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Populate website schema : ******
psql -f 3-Populate_website_schema.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Checks : ******
psql -f 4-Checks.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Processing : ******
psql -f 5-Processing.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
@echo ****** Create user : ******
psql -f 2-Create_user.sql -h %server% -U %username% -d %database% -p %port% >> GENERATE_DB.log
pause
