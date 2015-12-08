#!/usr/bin/env bash

# wget http://cdn.sencha.com/cmd/6.0.0.202/no-jre/SenchaCmd-6.0.0.202-linux-amd64.sh.zip
# unzip SenchaCmd-6.0.0.202-linux-amd64.sh.zip
# sh ./SenchaCmd-6.0.0.202-linux-amd64.sh

#ruby 1.8.*<= v <=2.0.* required
#java1.7 required
sudo -n apt-get install -y ruby 
sudo ./SenchaCmd-5.1.1.39-linux-x64.run --mode unattended
#sudo ./SenchaCmd-5.1.3.61-linux-x64.run --mode unattended
