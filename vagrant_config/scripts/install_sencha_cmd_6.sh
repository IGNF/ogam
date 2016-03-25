#!/usr/bin/env bash


#----------------------------------------------------------------
# Download the Sencha Cmd archive
#----------------------------------------------------------------
sudo -n apt-get install -y unzip
#export https_proxy=proxy.ign.fr:3128
#export http_proxy=proxy.ign.fr:3128

if [ ! -f "./SenchaCmd-6.0.2.14-linux-amd64.sh.zip" ]; then
	wget http://cdn.sencha.com/cmd/6.0.2.14/no-jre/SenchaCmd-6.0.2.14-linux-amd64.sh.zip
	unzip ./SenchaCmd-6.0.2.14-linux-amd64.sh.zip
fi

#----------------------------------------------------------------
# Install Sencha Cmd
# http://resources.ej-technologies.com/install4j/help/doc/index.html
#----------------------------------------------------------------
sudo mkdir -p /vagrant/ogam/website/htdocs/client/vendor/Sencha/Cmd/6.0.2.14/
sudo chown -R www-data:www-data /vagrant/ogam/website/htdocs/client/vendor
sudo chmod -R 774 /vagrant/ogam/website/htdocs/client/vendor
sudo ./SenchaCmd-6.0.2.14-linux-amd64.sh -q -dir /vagrant/ogam/website/htdocs/client/vendor/Sencha/Cmd/6.0.2.14/

# Ajout du proxy IGN à la config 
#echo '-Dhttp.proxyHost=proxy.ign.fr' >> /vagrant/ogam/website/htdocs/client/vendor/Sencha/Cmd/6.0.2.14/sencha.vmoptions
#echo '-Dhttp.proxyPort=3128' >> /vagrant/ogam/website/htdocs/client/vendor/Sencha/Cmd/6.0.2.14/sencha.vmoptions


#----------------------------------------------------------------
# Update rights
#----------------------------------------------------------------

sudo chown -R www-data:www-data /vagrant/ogam/website/htdocs/client/vendor
sudo chmod -R 774 /vagrant/ogam/website/htdocs/client/vendor

#----------------------------------------------------------------
# Sencha Cmd is automatically configured for root
# Add sencha Cmd to the vagrant profile
#----------------------------------------------------------------
echo " 
# Ajout de la commande sencha au PATH
export PATH="\$PATH:/vagrant/ogam/website/htdocs/client/vendor/Sencha/Cmd"
cd /vagrant/ogam/
" >> /home/vagrant/.bashrc

