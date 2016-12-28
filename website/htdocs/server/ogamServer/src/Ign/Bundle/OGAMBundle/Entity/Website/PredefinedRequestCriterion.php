<?php
namespace Ign\Bundle\OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;
use Ign\Bundle\OGAMBundle\Entity\Metadata\FormField;

/**
 * PredefinedRequestCriteria
 *
 * @ORM\Table(name="website.predefined_request_criterion")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Website\PredefinedRequestCriterionRepository")
 */
class PredefinedRequestCriterion {

	/**
	 *
	 * @var PredefinedRequest @ORM\Id
	 *      @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Website\PredefinedRequest")
	 *      @ORM\JoinColumn(name="request_name", referencedColumnName="name")
	 */
	private $requestName;

	/**
	 *
	 * @var Format @ORM\Id
	 *      @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Metadata\Format")
	 *      @ORM\JoinColumns({@ORM\JoinColumn(name="format", referencedColumnName="format")})
	 */
	private $format;

	/**
	 *
	 * @var Data @ORM\Id
	 *      @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Metadata\Data")
	 *      @ORM\JoinColumns({@ORM\JoinColumn(name="data", referencedColumnName="data")})
	 */
	private $data;

	/**
	 *
	 * @var string @ORM\Column(name="value", type="string", length=500)
	 */
	private $value;

	/**
	 *
	 * @var bool @ORM\Column(name="fixed", type="boolean")
	 */
	private $fixed;

	/**
	 *
	 * @var FormField @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Metadata\FormField")
	 *      @ORM\JoinColumns({@ORM\JoinColumn(name="data", referencedColumnName="data"),@ORM\JoinColumn(name="format", referencedColumnName="format")})
	 */
	private $formField;

	/**
	 * Get id
	 *
	 * @return string
	 */
	public function getId() {
		return $this->format->getFormat() . '__' . $this->data->getData();
	}

	/**
	 * Set requestName
	 *
	 * @param string $requestName        	
	 *
	 * @return PredefinedRequestCriteria
	 */
	public function setRequestName($requestName) {
		$this->requestName = $requestName;
		
		return $this;
	}

	/**
	 * Get requestName
	 *
	 * @return string
	 */
	public function getRequestName() {
		return $this->requestName;
	}

	/**
	 * Set format
	 *
	 * @param string $format        	
	 *
	 * @return PredefinedRequestCriteria
	 */
	public function setFormat($format) {
		$this->format = $format;
		
		return $this;
	}

	/**
	 * Get format
	 *
	 * @return string
	 */
	public function getFormat() {
		return $this->format;
	}

	/**
	 * Set data
	 *
	 * @param string $data        	
	 *
	 * @return PredefinedRequestCriteria
	 */
	public function setData($data) {
		$this->data = $data;
		
		return $this;
	}

	/**
	 * Get data
	 *
	 * @return string
	 */
	public function getData() {
		return $this->data;
	}

	/**
	 * Set value
	 *
	 * @param string $value        	
	 *
	 * @return PredefinedRequestCriteria
	 */
	public function setValue($value) {
		$this->value = $value;
		
		return $this;
	}

	/**
	 * Get value
	 *
	 * @return string
	 */
	public function getValue() {
		return $this->value;
	}

	/**
	 * Set fixed
	 *
	 * @param boolean $fixed        	
	 *
	 * @return PredefinedRequestCriteria
	 */
	public function setFixed($fixed) {
		$this->fixed = $fixed;
		
		return $this;
	}

	/**
	 * Get fixed
	 *
	 * @return bool
	 */
	public function getFixed() {
		return $this->fixed;
	}

	/**
	 *
	 * @return the FormField
	 */
	public function getFormField() {
		return $this->formField;
	}

	/**
	 *
	 * @param FormField $formField        	
	 */
	public function setFormField(FormField $formField) {
		$this->formField = $formField;
		return $this;
	}
}

