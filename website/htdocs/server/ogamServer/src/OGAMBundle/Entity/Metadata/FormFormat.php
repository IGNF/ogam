<?php
namespace OGAMBundle\Entity\Metadata;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\Criteria;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * FormFormat
 *
 * @ORM\Table(name="metadata.form_format")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Metadata\FormFormatRepository")
 */
class FormFormat implements \JsonSerializable
{

    /** FORMAT ****************************************************************/

    /**
     * The format identifier.
     * 
     * @var string @ORM\Id
     *      @ORM\Column(name="format", type="string", length=36, unique=true)
     */
    private $format;

    /**
     * @ORM\OneToMany(targetEntity="FormField", mappedBy="format")
     */
    private $fields;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->fields = new ArrayCollection();
    }

    /**
     * Set format
     *
     * @param string $format
     *
     * @return Format
     */
    public function setFormat($format)
    {
        $this->format = $format;
        
        return $this;
    }

    /**
     * Get format
     *
     * @return string
     */
    public function getFormat()
    {
        return $this->format;
    }

    /**
     *
     * @return the unknown_type
     */
    public function getFields()
    {
        return $this->fields;
    }

    /**
     *
     * @param unknown_type $fields
     */
    public function setFields($fields)
    {
        if ($fields instanceof ArrayCollection){
            $this->fields = $fields;
        } elseif (is_array($fields)) {
            $this->fields = new ArrayCollection($fields);
        } else {
            throw new \InvalidArgumentException('Arguments must be of type Array or ArrayCollection');
        }
        return $this;
    }

    /** /FORMAT ****************************************************************/

    /**
     * The label of the form.
     * 
     * @var string @ORM\Column(name="label", type="string", length=60, nullable=true)
     */
    private $label;

    /**
     * The definition of the form.
     * 
     * @var string @ORM\Column(name="definition", type="string", length=255, nullable=true)
     */
    private $definition;

    /**
     *
     * @var int @ORM\Column(name="position", type="integer", nullable=true)
     */
    private $position;

    /**
     *
     * @var bool @ORM\Column(name="is_opened", type="boolean", nullable=true)
     */
    private $isOpened;

    /**
     * The list of result columns.
     *
     * var $resultsList = array();
     *
     * /**
     * The list of criteria columns.
     *
     * var $criteriaList = array();
     *
     *
     *
     * /**
     * Set label
     *
     * @param string $label
     *
     * @return FormFormat
     */
    public function setLabel($label)
    {
        $this->label = $label;
        
        return $this;
    }

    /**
     * Get label
     *
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * Set definition
     *
     * @param string $definition
     *
     * @return FormFormat
     */
    public function setDefinition($definition)
    {
        $this->definition = $definition;
        
        return $this;
    }

    /**
     * Get definition
     *
     * @return string
     */
    public function getDefinition()
    {
        return $this->definition;
    }

    /**
     * Set position
     *
     * @param integer $position
     *
     * @return FormFormat
     */
    public function setPosition($position)
    {
        $this->position = $position;
        
        return $this;
    }

    /**
     * Get position
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Set isOpened
     *
     * @param boolean $isOpened
     *
     * @return FormFormat
     */
    public function setIsOpened($isOpened)
    {
        $this->isOpened = $isOpened;
        
        return $this;
    }

    /**
     * Get isOpened
     *
     * @return bool
     */
    public function getIsOpened()
    {
        return $this->isOpened;
    }

    /**
     * Get criteria
     *
     * @return [OGAMBundle\Entity\Metadata\FormField]
     */
    public function getCriteria()
    {
        $criteria = Criteria::create()->where(Criteria::expr()->eq("isCriteria", true));
        return $this->getFields()->matching($criteria);
    }

    /**
     * Get columns
     *
     * @return [OGAMBundle\Entity\Metadata\FormField]
     */
    public function getColumns()
    {
        $criteria = Criteria::create()->where(Criteria::expr()->eq("isResult", true));
        return $this->getFields()->matching($criteria);
    }

    /**
     * Serialize the object as a JSON string
     *
     * @return a JSON string
     */
    public function jsonSerialize()
    {
        return [
            'id' => $this->format,
            'format' => $this->format,
            'label' => $this->label,
            'definition' => $this->definition,
            'position' => $this->position,
            'is_opened' => $this->isOpened,
            'criteria' => $this->getCriteria()->getValues(),
            'columns' => $this->getColumns()->getValues()
        ];
    }
}
