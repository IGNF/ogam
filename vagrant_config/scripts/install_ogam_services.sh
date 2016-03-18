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


sudo /etc/init.d/tomcat7 stop
cd /vagrant/ogam/ && chmod a+x gradlew && bash gradlew && bash gradlew deploy -PtomcatHome='/var/lib/tomcat7' -PapplicationName='OGAM'
sudo /etc/init.d/tomcat7 start
