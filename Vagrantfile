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
      v.memory = 3072
      v.cpus = 3
      v.name = "ogam_dev"
   end

  config.vm.network "private_network", ip: "192.168.50.4"
  config.vm.hostname = "ogam.ign.fr"
  config.vm.network :forwarded_port, host: 8081, guest: 8080,auto_correct: true
  config.vm.network :forwarded_port, host: 5433, guest: 5432,auto_correct: true
  config.vm.network :forwarded_port, host: 8000, guest: 80,auto_correct: true

   
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
  #config.ssh.shell = "bash -c 'BASH_ENV=/etc/profile exec bash'"
  # config.ssh.pty = true

  #
  # Configure provisionners on the machine to automatically install softwares etc.
  #
  
  #
  # Middleware installation
  # The following provisions are executed as "root" 
  #

  config.vm.provision "bootstrap", type: "shell" do |s|
    s.path = "vagrant_config/scripts/bootstrap.sh"
  end 

  config.vm.provision "install_java_tomcat", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_java_tomcat.sh"
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
    s.path = "vagrant_config/scripts/install_db.sh"
  end
    
  config.vm.provision "install_gradle", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_gradle.sh"
  end
 
  config.vm.provision "install_sencha_cmd_6", type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_sencha_cmd_6.sh"
  end
  
  config.vm.provision "install_dev_tools", type: "shell" do |s|
    	s.path = "vagrant_config/scripts/install_dev_tools.sh"
  end
  
 
  #
  # Application deployment
  # The following provisions are executed as "vagrant" 
  #
    
  config.vm.provision "install_ogam_services", privileged: false, type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_ogam_services.sh"
  end
  
  config.vm.provision "build_ogam_desktop", privileged: false, type: "shell" do |s|
    s.path = "vagrant_config/scripts/build_ogam_desktop.sh"
  end
  
  config.vm.provision "install_composer_libraries", privileged: false, type: "shell" do |s|
    s.path = "vagrant_config/scripts/install_composer_libraries.sh"
  end
  
  #
  # The following provisions are only run when called explicitly 
  #
    
  if ARGV.include? '--provision-with'
    config.vm.provision "build_phpdoc", privileged: false, type: "shell" do |s|
      s.path = "vagrant_config/scripts/build_phpdoc.sh"
    end
  end
  
  if ARGV.include? '--provision-with'
    config.vm.provision "build_jsdoc", privileged: false, type: "shell" do |s|
      s.path = "vagrant_config/scripts/build_jsdoc.sh"
    end
  end
  
  if ARGV.include? '--provision-with'
    config.vm.provision "run_phpunit", privileged: false, type: "shell" do |s|
      s.path = "vagrant_config/scripts/run_phpunit.sh"
    end
  end
  
  if ARGV.include? '--provision-with'
    config.vm.provision "run_phpcheckstyle", privileged: false, type: "shell" do |s|
      s.path = "vagrant_config/scripts/run_phpcheckstyle.sh"
    end
  end
  
  # Always restart Apache
  config.vm.provision "shell", inline: "service apache2 restart", run: "always"
end
