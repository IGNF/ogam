#!/usr/bin/env bash

# ---------------------------------------------------------------
# Installation des paquets pour PostgreSQL
# ---------------------------------------------------------------

# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

apt-get install -y postgresql-9.4 postgresql-9.4-postgis-2.1 postgresql-contrib
#libgdal1h

# Modification de la configuration par d�faut
echo "include 'myextrapostgresql.conf'" >> /etc/postgresql/9.4/main/postgresql.conf

cp /vagrant/ogam/vagrant_config/conf/postgres/*.conf /etc/postgresql/9.4/main/ 

#----------------------------------------------------------------
# Red�marrage PostgreSQL
#----------------------------------------------------------------
sudo /etc/init.d/postgresql restart