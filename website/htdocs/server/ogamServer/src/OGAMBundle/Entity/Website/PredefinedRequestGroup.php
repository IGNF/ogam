<?php
namespace OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;

/**
 * PredefinedRequestGroup
 *
 * @ORM\Table(name="website.predefined_request_group")
 * @ORM\Entity
 */
class PredefinedRequestGroup {

	/**
	 *
	 * @var string @ORM\Id
	 *      @ORM\Column(name="name", type="string", length=50, unique=true)
	 */
	private $name;

	/**
	 *
	 * @var string @ORM\Column(name="label", type="string", length=50, nullable=true)
	 */
	private $label;

	/**
	 *
	 * @var string @ORM\Column(name="definition", type="string", length=250, nullable=true)
	 */
	private $definition;

	/**
	 *
	 * @var int @ORM\Column(name="position", type="integer", nullable=true)
	 */
	private $position;

	/**
	 * @ORM\OneToMany(targetEntity="OGAMBundle\Entity\Website\PredefinedRequestGroupAsso", mappedBy="groupName")
	 */
	private $requests;

	public function __construct() {
		$this->requests = new \Doctrine\Common\Collections\ArrayCollection();
	}

	/**
	 * Set name
	 *
	 * @param string $name        	
	 *
	 * @return PredefinedRequestGroup
	 */
	public function setName($name) {
		$this->name = $name;
		
		return $this;
	}

	/**
	 * Get name
	 *
	 * @return string
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Set label
	 *
	 * @param string $label        	
	 *
	 * @return PredefinedRequestGroup
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
	 * @return PredefinedRequestGroup
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
	 * Set position
	 *
	 * @param integer $position        	
	 *
	 * @return PredefinedRequestGroup
	 */
	public function setPosition($position) {
		$this->position = $position;
		
		return $this;
	}

	/**
	 * Get position
	 *
	 * @return int
	 */
	public function getPosition() {
		return $this->position;
	}
}

