#!/usr/bin/env bash

ogam_folder='/vagrant/ogam'

# configuration du proxy IGN / dépots apt
# Pour la configuration du proxy pour gradlew, voir dans le script install_ogam_services.sh

cp /vagrant/ogam/vagrant_config/conf/sources.list /etc/apt/sources.list
cp /vagrant/ogam/vagrant_config/conf/apt-proxy.conf /etc/apt/apt.conf.d/proxy

echo "
http_proxy=http://proxy.ign.fr:3128
https_proxy=http://proxy.ign.fr:3128
HTTP_PROXY=http://proxy.ign.fr:3128
HTTPS_PROXY=http://proxy.ign.fr:3128
no_proxy=localhost,127.0.0.0/8,ogam.fr
" >> /etc/environment

source /etc/environment

#pour valider le depot postgres
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
  sudo apt-key add -

# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

  
apt-get update && apt-get upgrade 

#bash /vagrant/ogam/update_hosts.sh
echo '
#VM SINP
127.0.0.5 ogam
127.0.0.5 www.ogam.fr
127.0.0.5 www-1.ogam.fr
127.0.0.5 www-2.ogam.fr
127.0.0.5 www-3.ogam.fr
127.0.0.5 www-4.ogam.fr
127.0.0.5 www-5.ogam.fr
127.0.0.5 www-6.ogam.fr
127.0.0.5 www-7.ogam.fr
127.0.0.5 www-8.ogam.fr
127.0.0.5 www-9.ogam.fr
' >> /etc/hosts