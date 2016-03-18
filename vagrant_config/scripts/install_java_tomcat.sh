#!/usr/bin/env bash


#----------------------------------------------------------------
# Installation Java
#----------------------------------------------------------------
echo "Install Java"

# Suppression d'un warning "dpkg-preconfigure: unable to re-open stdin"
export DEBIAN_FRONTEND=noninteractive

sudo apt-get install -y openjdk-7-jdk

#----------------------------------------------------------------
# Installation ANT
#----------------------------------------------------------------
echo "Install ANT"

apt-get install -y ant

#----------------------------------------------------------------
# Installation Tomcat
#----------------------------------------------------------------

echo "Install Tomcat7"

apt-get install -y  tomcat7

apt-get install -y tomcat7-admin tomcat7-docs tomcat7-examples

apt-get install -y libpostgresql-jdbc-java

apt-get install -y libgnumail-java


#----------------------------------------------------------------
# Config Tomcat
#----------------------------------------------------------------
echo "config java tomcat"
TOMCAT_LIB=/usr/share/tomcat7/lib
ln -fs  /usr/share/java/gnumail.jar  $TOMCAT_LIB/javax.mail.jar

ln -fs  /usr/share/java/postgresql-jdbc4.jar $TOMCAT_LIB/postgresql-jdbc4.jar

cp /vagrant/ogam/vagrant_config/conf/tomcat/tomcat-users.xml /etc/tomcat7/tomcat-users.xml



#----------------------------------------------------------------
# Modification des droits
#----------------------------------------------------------------

# Pour les logs
sudo -n usermod -G tomcat7 -a vagrant
sudo -n chmod 774 /var/log/tomcat7
sudo -n chown tomcat7:tomcat7 /var/log/tomcat7

# Pour le déploiement
mkdir /var/lib/tomcat7/staging 
chmod 775 /var/lib/tomcat7/staging/
chown tomcat7:tomcat7 /var/lib/tomcat7/staging/



#----------------------------------------------------------------
# Redémarrage Tomcat
#----------------------------------------------------------------
sudo /etc/init.d/tomcat7 restart
