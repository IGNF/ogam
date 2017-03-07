<?php
namespace Ign\Bundle\OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

/**
 * User.
 *
 * @ORM\Table(name="users", schema="website")
 * @ORM\Entity
 * @UniqueEntity(fields="login", message="Login already taken")
 * @UniqueEntity(fields="email", message="Email already taken")
 */
class User implements UserInterface, \Serializable {

	/**
	 * The login.
	 *
	 * @var string @Assert\Length(max=50)
	 *      @Assert\NotBlank()
	 *      @ORM\Column(name="user_login", type="string", length=50, nullable=false, unique=true)
	 *      @ORM\Id
	 */
	private $login;

	/**
	 * The user name.
	 *
	 * @var string @ORM\Column(name="user_name", type="string", length=50, nullable=true)
	 *      @Assert\Length(max=50)
	 */
	private $username;

	/**
	 * The plain password, used only for the user creation form.
	 * Not mapped with the database.
	 *
	 * @Assert\Length(max=50)
	 */
	private $plainPassword;

	/**
	 * The encrypted password, stored in database.
	 *
	 * @var string @ORM\Column(name="user_password", type="string", length=50, nullable=true)
	 */
	private $password;

	/**
	 * The provider.
	 *
	 * @var string @ORM\ManyToOne(targetEntity="Provider")
	 *      @ORM\JoinColumn(name="provider_id", referencedColumnName="id")
	 */
	private $provider;

	/**
	 * The email.
	 *
	 * @var string @ORM\Column(name="email", type="string", length=255, nullable=true)
	 *      @Assert\Length(max=50)
	 *      @Assert\Email()
	 */
	private $email;

	/**
	 * @ORM\ManyToMany(targetEntity="Role")
	 * @ORM\JoinTable(name="role_to_user",
	 * joinColumns={@ORM\JoinColumn(name="user_login", referencedColumnName="user_login")},
	 * inverseJoinColumns={@ORM\JoinColumn(name="role_code", referencedColumnName="role_code")}
	 * )
	 */
	private $roles = array();

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->roles = new \Doctrine\Common\Collections\ArrayCollection();
	}

	/**
	 * Set login
	 *
	 * @param string $login        	
	 *
	 * @return User
	 */
	public function setLogin($login) {
		$this->login = $login;
		
		return $this;
	}

	/**
	 * Get login
	 *
	 * @return string
	 */
	public function getLogin() {
		return $this->login;
	}

	/**
	 * Set username
	 *
	 * @param string $username        	
	 *
	 * @return User
	 */
	public function setUsername($username) {
		$this->username = $username;
		
		return $this;
	}

	/**
	 * Set password
	 *
	 * @param string $password        	
	 *
	 * @return User
	 */
	public function setPassword($password) {
		$this->password = $password;
		
		return $this;
	}

	public function getPlainPassword() {
		return $this->plainPassword;
	}

	public function setPlainPassword($password) {
		$this->plainPassword = $password;
		
		return $this;
	}

	/**
	 * Set email
	 *
	 * @param string $email        	
	 *
	 * @return User
	 */
	public function setEmail($email) {
		$this->email = $email;
		
		return $this;
	}

	/**
	 * Get email
	 *
	 * @return string
	 */
	public function getEmail() {
		return $this->email;
	}

	/**
	 * Indicate if the user is allowed for a permission.
	 *
	 * @param String $permissionName
	 *        	The permission
	 * @param String $schemaCode
	 *        	The schema
	 * @return Boolean
	 */
	function isAllowed($permissionName, $schemaCode = null) {
		/*
		 * global $kernel;
		 * if ('AppCache' == get_class($kernel)) {
		 * $kernel = $kernel->getKernel();
		 * }
		 * $logger = $kernel->getContainer()->get('logger');
		 * $logger->info('isAllowed ' . $permissionName);
		 */
		// The user is allowed if one of its role is.
		foreach ($this->roles as $role) {
			
			if ($role->isAllowed($permissionName)) {
				if ($schemaCode === null) {
					return true;
				} elseif ($role->isSchemaAllowed($schemaCode)) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Indicate if the user is allowed for a schema.
	 *
	 * @param String $schemaCode
	 *        	The schema
	 * @return Boolean
	 */
	function isSchemaAllowed($schemaCode) {
		// The user is allowed if one of its role is.
		/*
		 * global $kernel;
		 * if ('AppCache' == get_class($kernel)) {
		 * $kernel = $kernel->getKernel();
		 * }
		 * $logger = $kernel->getContainer()->get('logger');
		 * $logger->info('isSchemaAllowed ' . $schemaCode);
		 */
		// The user is allowed if one of its role is.
		foreach ($this->roles as $role) {
			
			if ($role->isSchemaAllowed($schemaCode)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Add role
	 *
	 * @param Role $role
	 *
	 * @return User
	 */
	public function addRole(Role $role) {
		$this->roles[] = $role;
		
		return $this;
	}

	/**
	 * Remove role
	 *
	 * @param Role $role
	 */
	public function removeRole(Role $role) {
		$this->roles->removeElement($role);
	}

	/**
	 * Set provider
	 *
	 * @param Provider $provider
	 *
	 * @return User
	 */
	public function setProvider(Provider $provider = null) {
		$this->provider = $provider;
		
		return $this;
	}

	/**
	 * Get provider
	 *
	 * @return Provider
	 */
	public function getProvider() {
		return $this->provider;
	}

	/**
	 * Get roles.
	 * Méthode à implémenter pour respecter UserInterface.
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getRoles() {
		return $this->roles->toArray();
	}

	/**
	 * Get password.
	 * Méthode à implémenter pour respecter UserInterface.
	 *
	 * @return string
	 */
	public function getPassword() {
		return $this->password;
	}

	/**
	 * Get username
	 * Méthode à implémenter pour respecter UserInterface.
	 *
	 * @return string
	 */
	public function getUsername() {
		return $this->username;
	}

	/**
	 * Méthode à implémenter pour respecter UserInterface.
	 */
	public function getSalt() {
		// The algorithm doesn't require a separate salt.
		// You *may* need a real salt if you choose a different encoder.
		return null;
	}

	/**
	 * Méthode à implémenter pour respecter UserInterface.
	 */
	public function eraseCredentials() {}

	/**
	 *
	 * @see \Serializable::serialize()
	 */
	public function serialize() {
		return serialize(array(
			$this->login,
			$this->email,
			$this->username,
			$this->password
		));
	}

	/**
	 *
	 * @see \Serializable::unserialize()
	 */
	public function unserialize($serialized) {
		list ($this->login, $this->email, $this->username, $this->password) = unserialize($serialized);
	}
}
