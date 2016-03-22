#!/usr/bin/env bash

# Config par défaut :
database=ogam
username=postgres

echo "Création de la base de donnée par défaut d'OGAM avec la configuration suivante :"
echo "User name : $username"
echo "Database : $database"
database_path="/vagrant/ogam/database"

cd "${database_path}"

logfile=GENERATE_DB.log
if [ -f $logfile  ]; then
   rm $logfile
fi

echo "****** Drop the old database if exist after an user validation ******"
# Kills the connections for dropdb
service postgresql restart 
sudo -n -u postgres dropdb --if-exists $database

echo "****** UTF8 Database creation ******"
sudo -n -u postgres createdb -O $username -E UTF8 $database

echo "****** Addition of postgis ******"
sudo -n -u $username psql -c "CREATE EXTENSION postgis;" -d $database &>> $logfile
#sudo -n -u $username psql -f Legacy/legacy_gist_v2.1.sql -d $database &>> $logfile
#sudo -n -u postgres psql -f Legacy/legacy_minimal_v2.1.sql -d $database &>> $logfile

echo "****** Create harmonized data schema ******"
sudo -n -u $username psql -f 1-Create_harmonized_data_schema.sql -d $database &>> $logfile

echo "****** Create mapping schema ******"
sudo -n -u $username psql -f 1-Create_mapping_schema.sql -d $database &>> $logfile

echo "****** Create metadata schema ******"
sudo -n -u $username psql -f 1-Create_metadata_schema.sql -d $database &>> $logfile

echo "****** Create raw data schema ******"
sudo -n -u $username psql -f 1-Create_raw_data_schema.sql -d $database &>> $logfile

echo "****** Create referentiels schema ******"
sudo -n -u $username psql -f 1-Create_referentiels_schema.sql -d $database &>> $logfile

echo "****** Create website schema ******"
sudo -n -u $username psql -f 1-Create_website_schema.sql -d $database  &>> $logfile

echo "****** Import ModTaxRef v8.0 ******"
sudo -n -u postgres psql -f 2-Import_ModTaxRef-v8.0.sql -d $database &>> $logfile

#echo "****** Populate mapping schema ******"
sudo -n -u $username psql -f 2-Populate_mapping_schema.sql  -d $database &>> $logfile

echo "****** Populate mapping schema (communes) ******"
sudo -n -u $username psql -f Referentiels/communes.sql -d $database &>> $logfile

echo "****** Populate mapping schema (departements) ******"
sudo -n -u $username psql -f Referentiels/departements.sql -d $database &>> $logfile

echo "****** Populate mapping schema (pays) ******"
sudo -n -u $username psql -f Referentiels/nuts_0.sql -d $database &>> $logfile

echo "****** Populate metadata schema ******"
sudo -n -u postgres psql -f 2-Import_Metadata.sql -d $database &>> $logfile


echo "****** Populate website schema ******"
sudo -n -u $username psql -f 2-Populate_website_schema.sql -d $database &>> $logfile

echo "****** Checks ******"
sudo -n -u $username psql -f 3-Checks.sql -d $database &>> $logfile

echo "****** Processing ******"
sudo -n -u $username psql -f 4-Processing.sql -d $database &>> $logfile


echo "****** Create user ******"
sudo -n -u $username psql -f 5-Create_user.sql -d $database  &>> $logfile

echo "****** Overriding defaut config values ******"
sudo -n -u $username psql -d $database -c "UPDATE website.application_parameters SET value = '/var/tmp/ogam_upload' WHERE name = 'UploadDirectory';"  &>> $logfile
sudo -n -u $username psql -d $database -c "UPDATE website.application_parameters SET value = '/vagrant/ogam/website/htdocs/server/ogamServer/upload' WHERE name = 'uploadDir';"  &>> $logfile
sudo -n -u $username psql -d $database -c "UPDATE website.application_parameters SET value = '/vagrant/ogam/website/htdocs/server/ogamServer/upload/images/' WHERE name = 'image_upload_dir';"  &>> $logfile

#sudo -n -u $username psql -d $database -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost:8000/mapProxy.php?\"],\"params\":{\"SERVICE\":\"WMS\",\"VERSION\":\"1.1.1\",\"REQUEST\":\"GetMap\"}}' WHERE service_name = 'local_mapProxy';"  &>> $logfile
sudo -n -u $username psql -d $database -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost/mapserv-ogam?\"],\"params\":{\"SERVICE\":\"WMS\",\"VERSION\":\"1.1.1\",\"REQUEST\":\"GetMap\"}}' WHERE service_name = 'local_mapserver';"  &>> $logfile
#sudo -n -u $username psql -d $database -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost:8000/cgi-bin/tilecache.fcgi?\"],\"params\":{\"SERVICE\":\"WMS\",\"VERSION\":\"1.0.0\",\"REQUEST\":\"GetMap\"}}' WHERE service_name = 'local_tilecache';"  &>> $logfile

echo "Création réussie !"
exit