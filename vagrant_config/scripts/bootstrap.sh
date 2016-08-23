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


# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

  
apt-get update -y && apt-get upgrade -y 


echo " 
# Ajout d'un alias pour PHPUnit
alias phpunit='/vagrant/ogam/website/htdocs/server/phpunit.sh'
" >> /home/vagrant/.profile