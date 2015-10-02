#!/usr/bin/env bash

#Install postgres and postgis
apt-get install -y postgresql-9.4 postgresql-9.4-postgis-2.1 postgresql-contrib

echo "include 'myextrapostgresql.conf'" >> /etc/postgresql/9.4/main/postgresql.conf

cp /vagrant/ogam/vagrant_config/conf/postgres/*.conf /etc/postgresql/9.4/main/ 

sudo /etc/init.d/postgresql restart
