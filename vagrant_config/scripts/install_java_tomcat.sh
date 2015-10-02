#!/usr/bin/env bash
echo "instal java"
#----------------------------------------------------------------
sudo apt-get install -y openjdk-7-jdk

#----------------------------------------------------------------
echo "instal ant"
apt-get install -y ant

#----------------------------------------------------------------
echo "instal tomcat"
apt-get install -y  tomcat7

apt-get install -y tomcat7-admin tomcat7-docs tomcat7-examples

apt-get install -y libpostgresql-jdbc-java

apt-get install -y libgnumail-java
echo "config java tomcat"
TOMCAT_LIB=/usr/share/tomcat7/lib
ln -fs  /usr/share/java/gnumail.jar  $TOMCAT_LIB/javax.mail.jar

ln -fs  /usr/share/java/postgresql-jdbc4.jar $TOMCAT_LIB/postgresql-jdbc4.jar

cp /vagrant/ogam/vagrant_config/conf/tomcat/tomcat-users.xml /etc/tomcat7/tomcat-users.xml

/etc/init.d/tomcat7 restart
echo "restart tomcat"