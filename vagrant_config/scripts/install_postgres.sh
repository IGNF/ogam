#!/usr/bin/env bash

#Install postgres and postgis
apt-get install -y postgresql-9.4 postgresql-9.4-postgis-2.1 postgresql-contrib

# sudo -n -u postgres psql -c "CREATE USER ogam WITH PASSWORD 'ogam';"
# sudo -n -u postgres psql -c "CREATE DATABASE ogam OWNER ogam;"

# sudo -n -u postgres psql -d ogam -c "CREATE EXTENSION adminpack; CREATE EXTENSION postgis; CREATE EXTENSION postgis_topology;"

# sudo -n -u postgres psql -c "CREATE ROLE admin LOGIN ENCRYPTED PASSWORD 'secret' SUPERUSER CREATEDB CREATEROLE;"

# sudo -n -u postgres psql -c "CREATE USER vagrant WITH PASSWORD 'vagrant' SUPERUSER;"

echo "include 'myextrapostgresql.conf'" >> /etc/postgresql/9.4/main/postgresql.conf

cp /vagrant/ogam/vagrant_config/conf/postgres/*.conf /etc/postgresql/9.4/main/ 

sudo /etc/init.d/postgresql restart
