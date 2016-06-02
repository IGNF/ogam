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
echo " Install Gradle "
echo "--------------------------------------------------"

# ---------------------------------------------------------------
# Change the install directory
# ---------------------------------------------------------------
export GRADLE_USER_HOME=/vagrant/ogam/gradle

# ---------------------------------------------------------------
# Launch gradlew to install gradle
# ---------------------------------------------------------------
cd /vagrant/ogam/ 
chmod a+x gradlew 
./gradlew

# ---------------------------------------------------------------
# Configure the PATH for the vagrant user
# ---------------------------------------------------------------
if [ -z "$GRADLE_HOME" ] || [ "$GRADLE_HOME" != "/vagrant/ogam/gradle/wrapper/dists/gradle-2.5-bin/7mk8vyobxfh3eazpg3pi2y9mv/gradle-2.5" ]; then
echo " 
# Ajout de la commande gradle au PATH
export GRADLE_HOME="/vagrant/ogam/gradle/wrapper/dists/gradle-2.5-bin/7mk8vyobxfh3eazpg3pi2y9mv/gradle-2.5"
export PATH="\$PATH:\$GRADLE_HOME/bin"
" >> /home/vagrant/.profile
fi

# ---------------------------------------------------------------
# Enable the daemon
# ---------------------------------------------------------------
sudo mkdir -p /home/vagrant/.gradle/
sudo chown vagrant:vagrant /home/vagrant/.gradle/
sudo chmod 775 /home/vagrant/.gradle/
touch /home/vagrant/.gradle/gradle.properties && echo "org.gradle.daemon=true" >> /home/vagrant/.gradle/gradle.properties