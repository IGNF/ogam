#!/usr/bin/env bash

port=5432
host=localhost
user=admin
password=secret
db=sinp

log='/vagrant/install_db.log'

if [ -f $log ]; then
   rm $log
fi


database_path='/vagrant/ogam/database/'
ogam_sql_path=${database_path}scripts/
ref_path="/vagrant/ogam/database/referentiels/"
pg_path="/usr/share/postgresql/9.1/"
pg_contrib=${pg_path}contrib/
postgis_path=${pg_contrib}postgis-1.5/


#Set local environment variable so we don't pass it in 'psql' and it will not ask for password
export PGDATABASE=${db}
export PGUSER=${user}
export PGHOST=${localhost}
export PGPORT=${port}
export PGPASSWORD=${password}

> "$log"

createdb  $db

files=(
${postgis_path}"postgis"
${postgis_path}"spatial_ref_sys"
${pg_contrib}"postgis_comments"
${ogam_sql_path}"0-Create_user"
${ogam_sql_path}"1-1-Create_metadata_schema"
${ogam_sql_path}"1-2-Create_mapping_schema"
${ogam_sql_path}"1-3-Create_website_schema"
${ogam_sql_path}"1-4-Create_raw_data_schema"
${ogam_sql_path}"1-5-Create_FLORE_IGN_DATA_TABLE"
${ogam_sql_path}"1-6-Create_OBSERVATION_table"
${ogam_sql_path}"1-7-Create_harmonized_data_schema"
${ogam_sql_path}"3-0-Create_referentiels_schema"
"$ref_path""communes"
"$ref_path""regions"
"$ref_path""departements"
"$ref_path""grille"
"$ref_path""EN_INPN_v20141203"
${ogam_sql_path}"2-Ogam_permissions"
${ogam_sql_path}"3-Init_roles"
${ogam_sql_path}"2-Set_search_path"
)

for ((i=0; i < ${#files[@]}; i++))
do
 echo "Run script : ${files[$i]}.sql" >> "$log"
 echo "\n" >> "$log"
 psql -d $db -f ${files[$i]}.sql >> "$log"
 echo "\n" >> "$log"
done

ant -f ${database_path}build.xml UpdateApplicationParameters
ant -f ${database_path}build.xml UpdateMapping
ant -f ${database_path}build.xml UpdatePredefinedRequests
ant -f ${database_path}build.xml UpdateMetadata
ant -f ${database_path}build.xml ImportTaxRef8
