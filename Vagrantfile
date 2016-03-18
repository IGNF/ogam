# -*- mode: ruby -*-
# vi: set ft=ruby :


# Vagrantfile API/syntax version.
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "debian/jessie64"
 
   #Dev config 
   config.vm.define "ogam_dev" do |ogam_dev|
   end
   config.vm.provider "virtualbox" do |v|
      v.memory = 2048
      v.cpus = 3
      v.name = "ogam_dev"
   end

  config.vm.network "private_network", ip: "192.168.50.4"
  config.vm.hostname = "ogam.ign.fr"
  #host = guest + 50000
  #config.vm.network :forwarded_port, host: 8081, guest: 8080,auto_correct: true
  #config.vm.network :forwarded_port, host: 5433, guest: 5432,auto_correct: true
  config.vm.network :forwarded_port, host: 8000, guest: 80,auto_correct: true
  #config.vm.network :forwarded_port, host: 1842, guest: 1841
   
  #disabled le default root
  config.vm.synced_folder ".", "/vagrant", disabled: true
  #connfig with ogam name
  config.vm.synced_folder ".", "/vagrant/ogam", disabled: false, create:true
  #some rightsfix to website , TODO move into provider ?
  config.vm.synced_folder "website/htdocs",'/vagrant/ogam/website/htdocs', owner:"www-data",group: "www-data"

  #FIXME
  #config.ssh.private_key_path = ['~/.vagrant.d/insecure_private_key', '~/.ssh/id_rsa']
  #config.ssh.forward_agent = true

  # Remove warnings "stdin: is not a tty"
  config.ssh.shell = "bash -c 'BASH_ENV=/etc/profile exec bash'"
  # config.ssh.pty = true

  #
  # Configure provisionners on the machine to automatically install softwares etc.
  #

  config.vm.provision "bootstrap", type: "shell" do |s|
    s.path = "vagrant_config/scripts/bootstrap.sh"
  end 

  config.vm.provision "install_java_tomcat", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_java_tomcat.sh"
  end

  config.vm.provision "install_ogam_services", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_ogam_services.sh"
  end

  config.vm.provision "install_apache", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_apache.sh"
  end
  
  config.vm.provision "install_mapserv", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_mapserv.sh"
  end
  
  config.vm.provision "install_tilecache", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_tilecache.sh"
  end

  config.vm.provision "install_postgres", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_postgres.sh"
  end

  config.vm.provision "install_db", type: "shell" do |s|
    s.path = "vagrant_config/scripts/GENERATE_DB.sh"
  end
  
 config.vm.provision "install_sencha_cmd_6", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_sencha_cmd_6.sh"
  end

   config.vm.provision "shell", inline: "service apache2 restart", run: "always"
end
