#!/usr/bin/env bash

ogam_folder='/vagrant/ogam'

#sans proxy
cat /vagrant/ogam/vagrant_config/conf/sources.list >>/etc/apt/sources.list

# configuration du proxy IGN / dépots apt
#cp /vagrant/ogam/vagrant_config/conf/sources.list /etc/apt/sources.list
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
  
apt-get update && apt-get upgrade 
apt-get install -y git bash-completion 

#FIXME: git clone fails => auth problem
#Add gitlab repository to Vagrant VM known hosts
#ssh-keyscan del-9323972.ign.fr >> /etc/ssh/ssh_known_hosts
#
#if [ ! -d "$ogam_folder" ]; then
#  git clone -b develop --single-branch  git@del-9323972.ign.fr:sinp/demo-sinp.git
#  exit 1
#fi




# echo '
# # enable bash completion in interactive shells
# if [ -f /etc/bash_completion ] && ! shopt -oq posix; then
    # . /etc/bash_completion
# fi
# ' >> ~/.profile >> /home/vagrant/.profile



# echo '
# syntax on
# set number
# ' >> ~/.vimrc

#bash /vagrant/update_hosts.sh
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

# Replace DNS sinp.ign.fr to vmogamv21.ign.fr 
# sed -i 's/http:\/\/sinp.ign.fr/http:\/\/vmogamv21.ign.fr/g' /vagrant/ogam/database/build.ppts
