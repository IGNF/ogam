#!/usr/bin/env bash

# ---------------------------------------------------------------
# This provision is executed as "root"
# ---------------------------------------------------------------

echo "--------------------------------------------------" 
echo " Install Tilecache "
echo "--------------------------------------------------"

# ---------------------------------------------------------------
# Installation des paquets pour tilecache
# ---------------------------------------------------------------

# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

apt-get install -y tilecache python-flup python-paste python-imaging


# ---------------------------------------------------------------
# Recopie de la configuration
# ---------------------------------------------------------------
cp -b /vagrant/ogam/vagrant_config/conf/tilecache/tilecache.cfg /etc/tilecache.cfg

# ---------------------------------------------------------------
# Cr�ation du r�pertoire pour stocker le cache
# ---------------------------------------------------------------

mkdir /var/www/tilecache
cd /var/www/tilecache 
mkdir cache 
chown root:www-data -R cache
chmod 775 -R cache/


# ---------------------------------------------------------------
# Correction d'un bug dans la version par d�faut de tilecache
# ---------------------------------------------------------------

# the file tilecache/Layer.py revision2.11 have a buggus in getCell function (since 2.1 ?). this failed get tile in some corner situation.
# the file correct is the revision 2.11 (debian depot + fix/rollback on the ligne x:= int(x0) => x:=int(round(x0))) and the same for the line y /y0

tilecacheDir='/usr/share/pyshared/TileCache'
tilecacheLayer="${tilecacheDir}/Layer.py"
vagrantFixDir=/vagrant/ogam/vagrant_config/conf/tilecache

if [ -f $tilecacheLayer ] ; then
   cp -b "${vagrantFixDir}/Layer.py" $tilecacheLayer 
else
   echo "tilecache Layer.py not found, fix manualy..."
fi