<?php
namespace OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;

/**
 * Role
 *
 * @ORM\Table(name="website.role")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Website\RoleRepository")
 */
class Role {

	/**
	 *
	 * @var string @ORM\Column(name="role_code", type="string", length=36, unique=true)
	 *      @ORM\Id
	 */
	private $code;

	/**
	 *
	 * @var string @ORM\Column(name="role_label", type="string", length=100, nullable=true)
	 */
	private $label;

	/**
	 *
	 * @var string @ORM\Column(name="role_definition", type="string", length=255, nullable=true)
	 */
	private $definition;

	/**
	 * The role permissions.
	 *
	 * A list of codes corresponding to authorised actions.
	 *
	 * @var Array[String]
	 */
	var $permissionsList = array();

	/**
	 * Set code
	 *
	 * @param string $code
	 *
	 * @return Role
	 */
	public function setCode($code) {
		$this->code = $code;

		return $this;
	}

	/**
	 * Get code
	 *
	 * @return string
	 */
	public function getCode() {
		return $this->code;
	}

	/**
	 * Set label
	 *
	 * @param string $label
	 *
	 * @return Role
	 */
	public function setLabel($label) {
		$this->label = $label;

		return $this;
	}

	/**
	 * Get label
	 *
	 * @return string
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Set definition
	 *
	 * @param string $definition
	 *
	 * @return Role
	 */
	public function setDefinition($definition) {
		$this->definition = $definition;

		return $this;
	}

	/**
	 * Get definition
	 *
	 * @return string
	 */
	public function getDefinition() {
		return $this->definition;
	}

	/**
	 * The database schemas the role can access.
	 *
	 * A list of schemas names.
	 *
	 * @var Array[String]
	 */
	var $schemasList = array();

	/**
	 * Indicate if the role is allowed for a permission.
	 *
	 * @param String $permissionName
	 *        	The permission
	 * @return Boolean
	 */
	function isAllowed($permissionName) {
		return (!empty($this->permissionsList) && in_array($permissionName, $this->permissionsList));
	}
}
