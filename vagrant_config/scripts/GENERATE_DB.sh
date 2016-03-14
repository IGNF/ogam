#!/usr/bin/env bash

# Config par défaut :
server=localhost
database=ogam
username=postgres

echo "Création de la base de donnée par défaut d'OGAM avec la configuration suivante :"
echo "Host : $server"
echo "User name : $username"
echo "Port : $port"
echo "Database : $database"
database_path="/vagrant/ogam/database"

cd "${database_path}"

logfile=GENERATE_DB.log
if [ -f $logfile  ]; then
   rm $logfile
fi

echo "****** Drop the old database if exist after an user validation ******"
service postgresql restart
sudo -n -u postgres dropdb --if-exists $database

echo "****** UTF8 Database creation ******"
sudo -n -u postgres createdb -O $username -E UTF8 $database

echo "****** Addition of postgis ******"
sudo -n -u $username psql -c "CREATE EXTENSION postgis;" -d $database &>> $logfile
sudo -n -u $username psql -f Referentiels/legacy_gist.sql -d $database &>> $logfile


echo "****** Create user ******"
sudo -n -u $username psql -f "0 - Create user.sql"  -d $database  &>> $logfile


echo "****** Create harmonized data schema ******"
sudo -n -u $username psql -f "0 - Create harmonized_data schema.sql" -d $database &>> $logfile


echo "****** Create mapping schema ******"
sudo -n -u $username psql -f "0 - Create mapping schema.sql" -d $database &>> $logfile


echo "****** Create metadata schema ******"
sudo -n -u $username psql -f "0 - Create metadata schema.sql" -d $database &>> $logfile


echo "****** Create raw data schema ******"
sudo -n -u $username psql -f "0 - Create raw_data schema.sql" -d $database &>> $logfile


echo "****** Create website schema ******"
sudo -n -u $username psql -f "0 - Create website schema.sql" -d $database  &>> $logfile


echo "****** Import ModTaxRef v8.0 ******"
sudo -n -u postgres psql -f "2 - Import Référentiel Taxonomique.sql" -d $database &>> $logfile

#echo "****** Populate mapping schema ******"
sudo -n -u $username psql -f "2 - Populate mapping schema.sql"  -d $database &>> $logfile


echo "****** Populate mapping schema (communes) ******"
sudo -n -u $username psql -f Referentiels/communes_pgisv2.sql -d $database &>> $logfile


echo "****** Populate mapping schema (departements) ******"
sudo -n -u $username psql -f Referentiels/departements.sql -d $database &>> $logfile


echo "****** Populate mapping schema (pays) ******"
sudo -n -u $username psql -f Referentiels/nuts_0_pgisv2.sql -d $database &>> $logfile


echo "****** Populate metadata schema ******"
sudo -n -u postgres psql -f "2 - Import Metadata.sql" -d $database &>> $logfile 

echo "****** Populate website schema ******"
sudo -n -u $username psql -f "2 - Populate website schema.sql" -d $database &>> $logfile


echo "****** Checks ******"
sudo -n -u $username psql -f "4 - Checks.sql" -d $database &>> $logfile


echo "****** Processing ******"
sudo -n -u $username psql -f "5 - Processing.sql" -d $database &>> $logfile



echo "****** Overriding defaut config values ******"
sudo -n -u $username psql -d $database -c "UPDATE website.application_parameters SET value = '/vagrant/ogam/website/htdocs/upload/' WHERE name = 'uploadDir';"  &>> $logfile
sudo -n -u $username psql -d $database -c "UPDATE website.application_parameters SET value = '/vagrant/ogam/website/htdocs/upload/images/' WHERE name = 'image_upload_dir';"  &>> $logfile

sudo -n -u $username psql -d $database -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost:8000/mapProxy.php?\"],\"params\":{\"SERVICE\":\"WMS\",\"VERSION\":\"1.1.1\",\"REQUEST\":\"GetMap\"}}' WHERE service_name = 'local_mapProxy';"  &>> $logfile
sudo -n -u $username psql -d $database -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost:8000/cgi-bin/mapserv.fcgi?map=/vagrant/ogam/vagrant_config/conf/mapserver/ogam.map&\"],\"params\":{\"SERVICE\":\"WMS\"}}' WHERE service_name = 'local_mapserver';"  &>> $logfile
sudo -n -u $username psql -d $database -c $"UPDATE mapping.layer_service SET config = '{\"urls\":[\"http://localhost:8000/cgi-bin/tilecache.fcgi?\"],\"params\":{\"SERVICE\":\"WMS\",\"VERSION\":\"1.0.0\",\"REQUEST\":\"GetMap\"}}' WHERE service_name = 'local_tilecache';"  &>> $logfile



echo "Création réussie !"
exit