#!/usr/bin/env bash

# ---------------------------------------------------------------
# Change the install directory
# ---------------------------------------------------------------
export GRADLE_USER_HOME=/vagrant/ogam/gradle

# ---------------------------------------------------------------
# Launch gradlew to install gradle
# ---------------------------------------------------------------
cd /vagrant/ogam/ 
chmod a+x gradlew 
bash gradlew

# ---------------------------------------------------------------
# Configure the PATH for the vagrant user
# ---------------------------------------------------------------
echo " 
# Ajout de la commande gradle au PATH
export GRADLE_HOME="/vagrant/ogam/gradle/wrapper/dists/gradle-2.5-bin/7mk8vyobxfh3eazpg3pi2y9mv/gradle-2.5"
export PATH="\$PATH:\$GRADLE_HOME/bin"
" >> /home/vagrant/.bashrc