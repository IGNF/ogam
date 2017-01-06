<?php
namespace Ign\Bundle\OGAMBundle\Entity\Mapping;

use Doctrine\ORM\Mapping as ORM;
use Ign\Bundle\OGAMBundle\Entity\Generic\BoundingBox;

/**
 * BoundingBox
 *
 * @ORM\Table(name="mapping.provider_map_params")
 * @ORM\Entity(repositoryClass="Ign\Bundle\OGAMBundle\Repository\Mapping\ProviderMapParametersRepository")
 */
class ProviderMapParameters {

	/**
	 *
	 * @var string @ORM\Id
	 *      @ORM\Column(name="provider_id", type="string", length=255, unique=true)
	 */
	private $providerId;

	/**
	 *
	 * @var float @ORM\Column(name="bb_xmin", type="float", nullable=true)
	 */
	private $xmin = 0;

	/**
	 *
	 * @var float @ORM\Column(name="bb_ymin", type="float", nullable=true)
	 */
	private $ymin = 0;

	/**
	 *
	 * @var float @ORM\Column(name="bb_xmax", type="float", nullable=true)
	 */
	private $xmax = 0;

	/**
	 *
	 * @var float @ORM\Column(name="bb_ymax", type="float", nullable=true)
	 */
	private $ymax = 0;

	/**
	 * Zoom Level (optional).
	 * 
	 * @var int @ORM\ManyToOne(targetEntity="Ign\Bundle\OGAMBundle\Entity\Mapping\ZoomLevel")
	 *      @ORM\JoinColumn(name="zoom_level", referencedColumnName="zoom_level")
	 */
	private $zoomLevel = 1;

	/**
	 * Set providerId
	 *
	 * @param string $providerId        	
	 *
	 * @return BoundingBox
	 */
	public function setProviderId($providerId) {
		$this->providerId = $providerId;
		
		return $this;
	}

	/**
	 * Get providerId
	 *
	 * @return string
	 */
	public function getProviderId() {
		return $this->providerId;
	}

	/**
	 * Set xmin
	 *
	 * @param string $xmin        	
	 *
	 * @return ProviderMapParameters
	 */
	public function setXmin($xmin) {
		$this->xmin = $xmin;
		
		return $this;
	}

	/**
	 * Get xmin
	 *
	 * @return string
	 */
	public function getXmin() {
		return $this->xmin;
	}

	/**
	 * Set ymin
	 *
	 * @param string $ymin        	
	 *
	 * @return ProviderMapParameters
	 */
	public function setYmin($ymin) {
		$this->ymin = $ymin;
		
		return $this;
	}

	/**
	 * Get ymin
	 *
	 * @return string
	 */
	public function getYmin() {
		return $this->ymin;
	}

	/**
	 * Set xmax
	 *
	 * @param string $xmax        	
	 *
	 * @return ProviderMapParameters
	 */
	public function setXmax($xmax) {
		$this->xmax = $xmax;
		
		return $this;
	}

	/**
	 * Get xmax
	 *
	 * @return string
	 */
	public function getXmax() {
		return $this->xmax;
	}

	/**
	 * Set ymax
	 *
	 * @param string $ymax        	
	 *
	 * @return ProviderMapParameters
	 */
	public function setYmax($ymax) {
		$this->ymax = $ymax;
		
		return $this;
	}

	/**
	 * Get ymax
	 *
	 * @return string
	 */
	public function getYmax() {
		return $this->ymax;
	}

	/**
	 * Set zoomLevel
	 *
	 * @param integer $zoomLevel        	
	 *
	 * @return ProviderMapParameters
	 */
	public function setZoomLevel($zoomLevel) {
		$this->zoomLevel = $zoomLevel;
		
		return $this;
	}

	/**
	 * Get zoomLevel
	 *
	 * @return int
	 */
	public function getZoomLevel() {
		return $this->zoomLevel;
	}

	/**
	 * Returns the bounding box.
	 *
	 * @return BoundingBox
	 */
	public function getBoundingBox() {
		return new BoundingBox($this->xmin, $this->xmax, $this->ymin, $this->ymax);
	}

	/**
	 * Returns the bounding box.
	 *
	 * @return array
	 */
	public function getCenter() {
		return $this->getBoundingBox()->getCenter();
	}
}

