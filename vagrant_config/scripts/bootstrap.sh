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
echo " Bootstrap "
echo "--------------------------------------------------"


# configuration du proxy IGN / dépots apt

cp /vagrant/ogam/vagrant_config/conf/sources.list /etc/apt/sources.list
cp /vagrant/ogam/vagrant_config/conf/apt-proxy.conf /etc/apt/apt.conf.d/proxy

echo "
[global]
http-proxy-host = proxy.ign.fr
http-proxy-port = 3128
http-proxy-compression = no
" > /home/vagrant/.subversion/servers

echo "
http_proxy=http://proxy.ign.fr:3128
https_proxy=http://proxy.ign.fr:3128
HTTP_PROXY=http://proxy.ign.fr:3128
HTTPS_PROXY=http://proxy.ign.fr:3128
no_proxy=localhost,127.0.0.0/8,ogam.fr
" >> /etc/environment

source /etc/environment

export https_proxy=proxy.ign.fr:3128 
export http_proxy=proxy.ign.fr:3128



# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

  
apt-get update -y && apt-get upgrade -y 


echo " 
# Ajout d'un alias pour PHPUnit
alias phpunit='/vagrant/ogam/website/htdocs/server/phpunit.sh'
" >> /home/vagrant/.profile