#!/usr/bin/env bash

services_dir='/vagrant/ogam/'
services_config_dir='/vagrant/ogam/services_configs'


# ---------------------------------------------------------------
# Déploiement des services par Gradle
# ---------------------------------------------------------------

echo "Deploying all OGAM services"


sudo -n mkdir /var/tmp/ogam_upload
sudo -n chmod 774 /var/tmp/ogam_upload
sudo -n chown tomcat7:tomcat7 /var/tmp/ogam_upload



service tomcat7 stop
cd /vagrant/ogam/ && chmod a+x gradlew && bash gradlew -Dhttps.proxyHost=proxy.ign.fr -Dhttps.proxyPort=3128 && bash gradlew deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM' -Dhttps.proxyHost=proxy.ign.fr -Dhttps.proxyPort=3128
service tomcat7 start