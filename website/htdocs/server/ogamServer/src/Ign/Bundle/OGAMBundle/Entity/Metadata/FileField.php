<?php
namespace Ign\Bundle\OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;

/**
 * FileField
 *
 * @ORM\Table(name="metadata.file_field")
 * @ORM\Entity(repositoryClass="Ign\Bundle\OGAMBundle\Repository\Metadata\FileFieldRepository")
 */
class FileField extends Field {

	/**
	 *
	 * @var int @ORM\Column(name="is_mandatory", type="integer", nullable=true)
	 */
	private $isMandatory;

	/**
	 *
	 * @var string @ORM\Column(name="mask", type="string", length=100, nullable=true)
	 */
	private $mask;

	/**
	 *
	 * @var int @ORM\Column(name="position", type="integer", nullable=true)
	 */
	private $position;

	/**
	 * Set isMandatory
	 *
	 * @param integer $isMandatory        	
	 *
	 * @return FileField
	 */
	public function setIsMandatory($isMandatory) {
		$this->isMandatory = $isMandatory;
		
		return $this;
	}

	/**
	 * Get isMandatory
	 *
	 * @return int
	 */
	public function getIsMandatory() {
		return $this->isMandatory;
	}

	/**
	 * Set mask
	 *
	 * @param string $mask        	
	 *
	 * @return FileField
	 */
	public function setMask($mask) {
		$this->mask = $mask;
		
		return $this;
	}

	/**
	 * Get mask
	 *
	 * @return string
	 */
	public function getMask() {
		return $this->mask;
	}

	/**
	 * Set position
	 *
	 * @param integer $position        	
	 *
	 * @return FileField
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

	/**
	 * Serialize the object as a JSON string
	 *
	 * @return a JSON string
	 */
	public function toJSON() {
		$json = '"name":' . json_encode($this->getName());
		$json .= ',"format":' . json_encode($this->format);
		$json .= ',"label":' . json_encode($this->label);
		$json .= ',"isMandatory":' . json_encode($this->isMandatory);
		$json .= ',"definition":' . json_encode($this->definition);
		$json .= ',"mask":' . json_encode($this->mask);
		
		return $json;
	}
}

