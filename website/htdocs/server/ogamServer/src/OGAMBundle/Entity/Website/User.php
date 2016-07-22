<?php
namespace OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;

/**
 * User.
 *
 * @ORM\Table(name="users", schema="website")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Website\UserRepository")
 */
class User {

	/**
	 *
	 * @var string @ORM\Column(name="user_login", type="string", length=50, nullable=false, unique=true)
	 *      @ORM\Id
	 */
	private $login;

	/**
	 *
	 * @var string @ORM\Column(name="user_name", type="string", length=50, nullable=true)
	 */
	private $username;

	/**
	 *
	 * @var string @ORM\Column(name="user_password", type="string", length=50, nullable=true)
	 */
	private $password;

	/**
	 *
	 * @var string @ORM\Column(name="provider_id", type="string", length=36, nullable=true)
	 */
	private $providerId;

	/**
	 *
	 * @var bool @ORM\Column(name="active", type="boolean", nullable=true)
	 */
	private $active;

	/**
	 *
	 * @var string @ORM\Column(name="email", type="string", length=255, nullable=true)
	 */
	private $email;

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
	 * Get username
	 *
	 * @return string
	 */
	public function getUsername() {
		return $this->username;
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

	/**
	 * Get password
	 *
	 * @return string
	 */
	public function getPassword() {
		return $this->password;
	}

	/**
	 * Set providerId
	 *
	 * @param integer $providerId
	 *
	 * @return User
	 */
	public function setProviderId($providerId) {
		$this->providerId = $providerId;

		return $this;
	}

	/**
	 * Get providerId
	 *
	 * @return int
	 */
	public function getProviderId() {
		return $this->providerId;
	}

	/**
	 * Set active
	 *
	 * @param boolean $active
	 *
	 * @return User
	 */
	public function setActive($active) {
		$this->active = $active;

		return $this;
	}

	/**
	 * Get active
	 *
	 * @return bool
	 */
	public function getActive() {
		return $this->active;
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
}

