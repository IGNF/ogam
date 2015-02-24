#!/bin/bash

logfile=GENERATE_DB.log
if [ -f $logfile  ]; then
   rm $logfile
fi

# Config par défaut :
server=localhost
database=ogam
port=5432
username=postgres

while [ "x$1" != "x"  ]
do
  case "$1" in
      "--host" | "-H" )
          shift
          server=$1
          shift
          ;;
      "--username" | "-U" )
          shift
          username=$1
          shift
          ;;
      "--port" | "-p" )
          shift
          port=$1
          shift
          ;;
      "--dbname" | "-d" )
          shift
          database=$1
          shift
          ;;
      "--help" | "-h" | * )
          echo "$(basename $0) : Generate a default OGAM database"
          echo "  Usage : $(basename $0) [options]"
          echo "    Options :"
          echo "      -H, --host=HOTE                  : hôte du serveur de bases de données 
                                         ou répertoire des sockets (par défaut : « $server »)"
          echo "      -U, --username=NOMUTILISATEUR    : nom d'utilisateur pour la connexion (par défaut : « $username »)"
	   echo "      -p, --port=PORT                  : port du serveur de bases de données (par défaut : « $port »)"
	   echo "      -d, --dbname=NOM_BASE            : indique le nom de la base de données à 
                                         laquelle se connecter (par défaut : « $database »)"
          echo "      -h, --help                       : affiche cette aide, puis quitte"
          exit
          ;;
  esac
done

echo "Création de la base de donnée par défaut d'OGAM avec la configuration suivante :"
echo "Host : $server"
echo "User name : $username"
echo "Port : $port"
echo "Database : $database"

echo "****** Drop the old database if exist after an user validation ******"
dropdb -h $server -U $username -p $port -i $database

echo "****** UTF8 Database creation ******"
createdb -h $server -U $username -p $port -O $username -E UTF8 $database

echo "****** Addition of postgis ******"
psql -c "CREATE EXTENSION postgis" -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Create harmonized data schema ******"
psql -f 1-Create_harmonized_data_schema.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Create mapping schema ******"
psql -f 1-Create_mapping_schema.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Create metadata schema ******"
psql -f 1-Create_metadata_schema.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Create raw data schema ******"
psql -f 1-Create_raw_data_schema.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Create referentiels schema ******"
psql -f 1-Create_referentiels_schema.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Create website schema ******"
psql -f 1-Create_website_schema.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Import ModTaxRef v8.0 ******"
psql -f 2-Import_ModTaxRef-v8.0.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Populate mapping schema ******"
psql -f 2-Populate_mapping_schema.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Populate mapping schema (communes) ******"
psql -f Referentiels/communes.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Populate mapping schema (departements) ******"
psql -f Referentiels/legacy_gist.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
psql -f Referentiels/departements.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Populate mapping schema (pays) ******"
psql -f Referentiels/nuts_0.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Populate metadata schema ******"
psql -f Metadata/import_from_csv.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Populate website schema ******"
psql -f 2-Populate_website_schema.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Checks ******"
psql -f 3-Checks.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Processing ******"
psql -f 4-Processing.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "****** Create user ******"
psql -f 5-Create_user.sql -h $server -U $username -d $database -p $port >> GENERATE_DB.log
echo "Appuyer la touche <Entrée> pour continuer..."
read touche

echo "Création réussie !"
exit