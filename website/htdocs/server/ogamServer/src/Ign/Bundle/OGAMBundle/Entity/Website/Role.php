<?php
namespace Ign\Bundle\OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\Role\RoleInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Ign\Bundle\OGAMBundle\Entity\Metadata\Dataset;
use Ign\Bundle\OGAMBundle\Entity\Metadata\TableSchema;

/**
 * Role
 *
 * @ORM\Table(name="website.role")
 * @ORM\Entity(repositoryClass="Ign\Bundle\OGAMBundle\Repository\Website\RoleRepository")
 */
class Role implements RoleInterface, \Serializable {

	/**
	 * The code.
	 *
	 * @var string @Assert\Length(max=36)
	 *      @Assert\NotBlank()
	 *      @ORM\Column(name="role_code", type="string", length=36, nullable=false, unique=true)
	 *      @ORM\Id
	 */
	private $code;

	/**
	 * The label.
	 *
	 * @var string @Assert\Length(max=100)
	 *      @ORM\Column(name="role_label", type="string", length=100, nullable=true)
	 */
	private $label;

	/**
	 * The definition.
	 *
	 * @var string @Assert\Length(max=255)
	 *      @ORM\Column(name="role_definition", type="string", length=255, nullable=true)
	 */
	private $definition;

	/**
	 * The role permissions.
	 *
	 * A list of codes corresponding to authorised actions.
	 *
	 * @var array[String] @ORM\ManyToMany(targetEntity="Permission", fetch="EAGER")
	 *      @ORM\JoinTable(name="permission_per_role",
	 *      joinColumns={@ORM\JoinColumn(name="role_code", referencedColumnName="role_code")},
	 *      inverseJoinColumns={@ORM\JoinColumn(name="permission_code", referencedColumnName="permission_code")}
	 *      )
	 */
	private $permissions;

	/**
	 * The database schemas the role can access.
	 *
	 * A list of schemas names.
	 *
	 * @var array[String] @ORM\ManyToMany(targetEntity="Ign\Bundle\OGAMBundle\Entity\Metadata\TableSchema")
	 *      @ORM\JoinTable(name="role_to_schema",
	 *      joinColumns={@ORM\JoinColumn(name="role_code", referencedColumnName="role_code")},
	 *      inverseJoinColumns={@ORM\JoinColumn(name="schema_code", referencedColumnName="schema_code")}
	 *      )
	 */
	private $schemas;
	
	/**
	 * The role datasets.
	 *
	 * A list of codes corresponding to authorised datasets.
	 *
	 * @var array[String] @ORM\ManyToMany(targetEntity="Ign\Bundle\OGAMBundle\Entity\Metadata\Dataset")
	 *      @ORM\JoinTable(name="dataset_role_restriction",
	 *      joinColumns={@ORM\JoinColumn(name="role_code", referencedColumnName="role_code")},
	 *      inverseJoinColumns={@ORM\JoinColumn(name="dataset_id", referencedColumnName="dataset_id")}
	 *      )
	 */
	private $datasets;

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->permissions = new \Doctrine\Common\Collections\ArrayCollection();
		$this->schemas = new \Doctrine\Common\Collections\ArrayCollection();
		$this->datasets = new \Doctrine\Common\Collections\ArrayCollection();
	}

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
	 * Get permissions.
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getPermissions() {
		return $this->permissions;
	}

	/**
	 * Get the schemas.
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getSchemas() {
		return $this->schemas;
	}

	/**
	 * Get the datasets.
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getDatasets() {
	    return $this->datasets;
	}
	
	/**
	 * Indicate if the role is allowed for a permission.
	 *
	 * @param String $permissionName
	 *        	The permission
	 * @return Boolean
	 */
	function isAllowed($permissionName) {
		/*
		 * global $kernel;
		 * if ('AppCache' == get_class($kernel)) {
		 * $kernel = $kernel->getKernel();
		 * }
		 * $logger = $kernel->getContainer()->get('logger');
		 * $logger->info('role isAllowed ' . $permissionName);
		 *
		 * $logger->info('role ' . \Doctrine\Common\Util\Debug::dump($this,3, true, false));
		 */
		foreach ($this->getPermissions() as $permission) {

			if ($permission->getCode() == $permissionName) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Indicate if the role is allowed for a schema.
	 *
	 * @param String $schemaCode
	 *        	The schema code
	 * @return Boolean
	 */
	function isSchemaAllowed($schemaCode) {
		/*
		 * global $kernel;
		 * if ('AppCache' == get_class($kernel)) {
		 * $kernel = $kernel->getKernel();
		 * }
		 * $logger = $kernel->getContainer()->get('logger');
		 * $logger->info('role isSchemaAllowed ' . $schemaCode);
		 *
		 * $logger->info('role ' . \Doctrine\Common\Util\Debug::dump($this,3, true, false));
		 */
		foreach ($this->getSchemas() as $schema) {

			if ($schema->getCode() == $schemaCode) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Required to implement RoleInterface.
	 *
	 * {@inheritdoc}
	 *
	 * @see \Symfony\Component\Security\Core\Role\RoleInterface::getRole()
	 */
	public function getRole() {
		return $this->getCode();
	}

	/**
	 * add a permission
	 *
	 * @param Permission $perm
	 * @return Role
	 */
	public function addPermission(Permission $perm) {
		$this->permissions->add($perm);
		return $this;
	}

	/**
	 * remove a permission
	 *
	 * @param Permission $perm
	 * @return Role
	 */
	public function removePermission(Permission $perm) {
		$this->permissions->removeElement($perm);
		return $this;
	}
	
	/**
	 * add a schema
	 *
	 * @param TableSchema $schema
	 * @return Role
	 */
	public function addSchema(TableSchema $schema) {
	    $this->schemas->add($schema);
	    return $this;
	}
	
	/**
	 * remove a schema
	 *
	 * @param TableSchema $schema
	 * @return Role
	 */
	public function removeSchema(TableSchema $schema) {
	    $this->schemas->removeElement($schema);
	    return $this;
	}
	
	/**
	 * add a dataset
	 *
	 * @param Dataset $dataset
	 * @return Role
	 */
	public function addDataset(Dataset $dataset) {
	    $this->datasets->add($dataset);
	    return $this;
	}
	
	/**
	 * remove a dataset
	 *
	 * @param Datasets $datasets
	 * @return Role
	 */
	public function removeDataset(Dataset $dataset) {
	    $this->datasets->removeElement($dataset);
	    return $this;
	}

	/**
	 *
	 * @see \Serializable::serialize()
	 */
	public function serialize() {
		return serialize(array(
			$this->code,
			$this->label,
			$this->definition,
			$this->permissions
		));
	}

	/**
	 *
	 * @see \Serializable::unserialize()
	 */
	public function unserialize($serialized) {
		list ($this->code, $this->label, $this->definition, $this->permissions) = unserialize($serialized);
	}
}
