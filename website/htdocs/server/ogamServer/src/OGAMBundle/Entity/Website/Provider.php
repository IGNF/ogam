<?php
namespace OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Provider
 *
 * @ORM\Table(name="website.providers")
 * @ORM\Entity
 */
class Provider {

	/**
	 *
	 * @var string
	 * @ORM\Column(name="id", type="string")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 * @ORM\SequenceGenerator(sequenceName="website.provider_id_seq")
	 */
	private $id;

	/**
	 *
	 * @var string
	 * @Assert\NotBlank()
	 * @ORM\Column(name="label", type="string", nullable=true)
	 */
	private $label;

	/**
	 *
	 * @var string
	 * @ORM\Column(name="definition", type="string", nullable=true)
	 */
	private $definition;

	/**
	 * Get id
	 *
	 * @return string
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Set label
	 *
	 * @param string $label
	 *
	 * @return Provider
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
	 * @return Provider
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
}
