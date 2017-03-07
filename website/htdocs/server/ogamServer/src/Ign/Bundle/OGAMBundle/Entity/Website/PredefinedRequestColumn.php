<?php
namespace Ign\Bundle\OGAMBundle\Entity\Website;

use Doctrine\ORM\Mapping as ORM;
use Ign\Bundle\OGAMBundle\Entity\Metadata\FormField;

/**
 * PredefinedRequestColumn
 *
 * @ORM\Table(name="website.predefined_request_column")
 * @ORM\Entity(repositoryClass="Ign\Bundle\OGAMBundle\Repository\Website\PredefinedRequestColumnRepository")
 */
class PredefinedRequestColumn {

	/**
	 *
	 * @var PredefinedRequest @ORM\Id
	 *      @ORM\ManyToOne(targetEntity="PredefinedRequest")
	 *      @ORM\JoinColumn(name="request_name", referencedColumnName="name")
	 */
	private $requestName;

	/**
	 *
	 * @var Format @ORM\Id
	 *      @ORM\ManyToOne(targetEntity="Ign\Bundle\OGAMBundle\Entity\Metadata\Format")
	 *      @ORM\JoinColumns({@ORM\JoinColumn(name="format", referencedColumnName="format")})
	 */
	private $format;

	/**
	 *
	 * @var Data @ORM\Id
	 *      @ORM\ManyToOne(targetEntity="Ign\Bundle\OGAMBundle\Entity\Metadata\Data")
	 *      @ORM\JoinColumns({@ORM\JoinColumn(name="data", referencedColumnName="data")})
	 */
	private $data;

	/**
	 *
	 * @var FormField
	 * @ORM\ManyToOne(targetEntity="Ign\Bundle\OGAMBundle\Entity\Metadata\FormField")
	 * @ORM\JoinColumns({@ORM\JoinColumn(name="data", referencedColumnName="data"),@ORM\JoinColumn(name="format", referencedColumnName="format")})
	 */
	private $formField;

	/**
	 * Get id
	 *
	 * @return int
	 */
	public function getId() {
		return $this->format->getFormat() . '__' . $this->data->getData();
	}

	/**
	 * Set requestName
	 *
	 * @param string $requestName
	 *
	 * @return PredefinedRequestColumn
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
	 * @return PredefinedRequestColumn
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
	 * @return PredefinedRequestColumn
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
	 * Return the form fields
	 *
	 * @return FormField
	 */
	public function getFormField() {
		return $this->formField;
	}

	/**
	 * Set the form fields
	 *
	 * @param FormField $formField
	 */
	public function setFormField(FormField $formField) {
		$this->formField = $formField;
		return $this;
	}
}
