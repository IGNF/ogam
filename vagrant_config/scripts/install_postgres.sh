#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "root"
# ---------------------------------------------------------------

#
# Set environment variables
#
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $DIR/setenv.sh



echo "--------------------------------------------------" 
echo " Install PostgreSQL "
echo "--------------------------------------------------"

# ---------------------------------------------------------------
# Installation des paquets pour PostgreSQL
# ---------------------------------------------------------------

# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

apt-get install -y --force-yes postgresql-9.4 postgresql-9.4-postgis-2.1 postgresql-contrib-9.4

# Modification de la configuration par d�faut
echo "include 'myextrapostgresql.conf'" >> /etc/postgresql/9.4/main/postgresql.conf

cp /vagrant/ogam/vagrant_config/conf/postgres/*.conf /etc/postgresql/9.4/main/ 

#----------------------------------------------------------------
# Red�marrage PostgreSQL
#----------------------------------------------------------------
sudo /etc/init.d/postgresql restart