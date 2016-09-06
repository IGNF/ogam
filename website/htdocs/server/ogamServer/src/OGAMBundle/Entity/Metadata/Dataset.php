<?php
namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * Dataset.
 *
 * @ORM\Table(name="metadata.dataset")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Metadata\DatasetRepository")
 */
class Dataset {

	/**
	 * The identifier of the dataset.
	 *
	 * @var string @ORM\Column(name="dataset_id", type="string", length=36, nullable=false)
	 *      @ORM\Id
	 *      @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * The label.
	 *
	 * @var string
	 * @ORM\Column(name="label", type="string", length=255, nullable=true)
	 * @Assert\NotBlank(message="dataset.label.notBlank")
	 * @Assert\Length(max="255", maxMessage="dataset.label.maxLength")
	 */
	private $label;

	/**
	 * Indicate if the dataset is displayed by default.
	 *
	 * @var bool
	 * @ORM\Column(name="is_default", type="boolean", nullable=true)
	 */
	private $isDefault;

	/**
	 * The definition.
	 *
	 * @var string @ORM\Column(name="definition", type="string", length=512, nullable=true)
	 */
	private $definition;

	/**
	 * The list of files linked to this dataset.
	 *
	 * @ORM\ManyToMany(targetEntity="FileFormat")
	 * @ORM\OrderBy({"position" = "ASC"})
	 * @ORM\JoinTable(name="dataset_files",
	 * joinColumns={@ORM\JoinColumn(name="dataset_id", referencedColumnName="dataset_id")},
	 * inverseJoinColumns={@ORM\JoinColumn(name="format", referencedColumnName="format")}
	 * )
	 */
	private $files;

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
	 * @return Dataset
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
	 * Set isDefault
	 *
	 * @param boolean $isDefault
	 *
	 * @return Dataset
	 */
	public function setIsDefault($isDefault) {
		$this->isDefault = $isDefault;

		return $this;
	}

	/**
	 * Get isDefault
	 *
	 * @return bool
	 */
	public function getIsDefault() {
		return $this->isDefault;
	}

	/**
	 * Set definition
	 *
	 * @param string $definition
	 *
	 * @return Dataset
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
	 * Serialize the object as a JSON string
	 *
	 * @return a JSON string
	 */
	public function toJSON() {
		$json = '"id":' . json_encode($this->id);
		$json .= ',"label":' . json_encode($this->label);
		$json .= ',"definition":' . json_encode($this->definition);
		$json .= ',"is_default":' . json_encode($this->isDefault);

		return $json;
	}

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->files = new \Doctrine\Common\Collections\ArrayCollection();
	}

	/**
	 * Add file
	 *
	 * @param \OGAMBundle\Entity\Metadata\FileFormat $file
	 *
	 * @return Dataset
	 */
	public function addFile(\OGAMBundle\Entity\Metadata\FileFormat $file) {
		$this->files[] = $file;

		return $this;
	}

	/**
	 * Remove file
	 *
	 * @param \OGAMBundle\Entity\Metadata\FileFormat $file
	 */
	public function removeFile(\OGAMBundle\Entity\Metadata\FileFormat $file) {
		$this->files->removeElement($file);
	}

	/**
	 * Get files
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getFiles() {
		return $this->files;
	}
}
