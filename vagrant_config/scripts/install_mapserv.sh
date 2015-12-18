#!/usr/bin/env bash


#----------------------------------------------------------------
# Installation des paquets pour Mapserv
#----------------------------------------------------------------

# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

apt-get install -y cgi-mapserver mapserver-bin mapserver-doc php5-mapscript libapache2-mod-fcgid

#----------------------------------------------------------------
# Activation du mod FCGI
#----------------------------------------------------------------

# mapserv is a fcgi compatible, use default config sethandler with .fcgi
ln /usr/lib/cgi-bin/mapserv /usr/lib/cgi-bin/mapserv.fcgi
sudo a2enmod fcgid


#----------------------------------------------------------------
# Red�marrage Apache
#----------------------------------------------------------------
service apache2 restart