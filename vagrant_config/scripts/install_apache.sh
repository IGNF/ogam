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
echo " Install Apache "
echo "--------------------------------------------------"

website_dir='/vagrant/ogam/website/htdocs'

#----------------------------------------------------------------
# Installation des paquets Apache et PHP
#----------------------------------------------------------------

# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

apt-get install -y --force-yes apache2 php5-common libapache2-mod-php5 php5-cli php5-pgsql php5-gd php5-xdebug

# Pour le cache de symfony
sudo apt-get install -y --force-yes php-apc

# Pour phpdoc
sudo apt-get install -y --force-yes php5-intl graphviz php5-xsl  

# Ajout du user vagrant au groupe "www-data"
sudo usermod -G www-data -a vagrant

# Acces aux logs
sudo chown www-data:www-data /var/log/apache2 
sudo -n chmod 774 /var/log/apache2

# Modification du fichier de conf Apache
echo " 
ServerName localhost
" >> /etc/apache2/apache2.conf

# Activation des modules Apache utilises
sudo a2enmod rewrite
sudo a2enmod expires
sudo a2enmod cgi
sudo a2enmod cgid

# Mise a jour de la timezone dans les fichiers de conf PHP
sed -i 's/\;date\.timezone\ \=/date\.timezone\ \=\ Europe\/Paris/g' /etc/php5/cli/php.ini
sed -i 's/\;date\.timezone\ \=/date\.timezone\ \=\ Europe\/Paris/g' /etc/php5/apache2/php.ini
sed -i "s/allow_url_fopen = .*/allow_url_fopen = On/" /etc/php5/apache2/php.ini

# Pour le developpement
sed -i "s/error_reporting = .*/error_reporting = E_ALL/" /etc/php5/apache2/php.ini
sed -i "s/display_errors = .*/display_errors = On/" /etc/php5/apache2/php.ini

#----------------------------------------------------------------
# Creation des repertoires de log et d'upload et mise a jour des droits
#----------------------------------------------------------------

# Logs Apache
chown www-data $website_dir/logs && chgrp www-data $website_dir/logs
chmod -R 0777 $website_dir/logs

# Logs Symfony
chown -R www-data  $website_dir && chgrp -R www-data $website_dir && chmod g+s $website_dir
chown www-data $website_dir && chgrp www-data $website_dir
chmod -R 0777 $website_dir/server/ogamServer/var/logs $website_dir/server/ogamServer/var/sessions $website_dir/server/ogamServer/var/upload

# Répertoires d'upload
mkdir -p $website_dir/server/ogamServer/var/upload/images 
chmod 0777 $website_dir/server/ogamServer/var/upload/images
chown www-data $website_dir/server/ogamServer/var/upload/images && chgrp www-data $website_dir/server/ogamServer/var/upload/images 

#----------------------------------------------------------------
# Copie du fichier de conf Apache et activation du site
#----------------------------------------------------------------

ln -fs /vagrant/ogam/vagrant_config/conf/apache/httpd_ogam.conf /etc/apache2/sites-available/httpd_ogam.conf

/usr/sbin/a2ensite httpd_ogam.conf
/usr/sbin/a2dissite 000-default

#----------------------------------------------------------------
# Redemarrage d'Apache
#----------------------------------------------------------------

service apache2 restart