<?php

namespace OGAMBundle\Entity\Mapping;

use Doctrine\ORM\Mapping as ORM;

/**
 * BoundingBox
 *
 * @ORM\Table(name="mapping.provider_map_params")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Mapping\ProviderMapParametersRepository")
 */
class ProviderMapParameters
{
    /**
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="provider_id", type="string", length=255, unique=true)
     */
    private $providerId;

    /**
     * @var float
     *
     * @ORM\Column(name="bb_xmin", type="float", nullable=true)
     */
    private $xmin = 0;

    /**
     * @var float
     *
     * @ORM\Column(name="bb_ymin", type="float", nullable=true)
     */
    private $ymin = 0;

    /**
     * @var float
     *
     * @ORM\Column(name="bb_xmax", type="float", nullable=true)
     */
    private $xmax = 0;

    /**
     * @var float
     *
     * @ORM\Column(name="bb_ymax", type="float", nullable=true)
     */
    private $ymax = 0;

    /**
     * Zoom Level (optional).
     * @var int
     *
     * @ORM\ManyToOne(targetEntity="OGAMBundle\Entity\Mapping\ZoomLevel")
     * @ORM\JoinColumn(name="zoom_level", referencedColumnName="zoom_level")
     */
    private $zoomLevel = 1;


    /**
     * Set providerId
     *
     * @param string $providerId
     *
     * @return BoundingBox
     */
    public function setProviderId($providerId)
    {
        $this->providerId = $providerId;

        return $this;
    }

    /**
     * Get providerId
     *
     * @return string
     */
    public function getProviderId()
    {
        return $this->providerId;
    }

    /**
     * Set xmin
     *
     * @param string $xmin
     *
     * @return BoundingBox
     */
    public function setXmin($xmin)
    {
        $this->xmin = $xmin;

        return $this;
    }

    /**
     * Get xmin
     *
     * @return string
     */
    public function getXmin()
    {
        return $this->xmin;
    }

    /**
     * Set ymin
     *
     * @param string $ymin
     *
     * @return BoundingBox
     */
    public function setYmin($ymin)
    {
        $this->ymin = $ymin;

        return $this;
    }

    /**
     * Get ymin
     *
     * @return string
     */
    public function getYmin()
    {
        return $this->ymin;
    }

    /**
     * Set xmax
     *
     * @param string $xmax
     *
     * @return BoundingBox
     */
    public function setXmax($xmax)
    {
        $this->xmax = $xmax;

        return $this;
    }

    /**
     * Get xmax
     *
     * @return string
     */
    public function getXmax()
    {
        return $this->xmax;
    }

    /**
     * Set ymax
     *
     * @param string $ymax
     *
     * @return BoundingBox
     */
    public function setYmax($ymax)
    {
        $this->ymax = $ymax;

        return $this;
    }

    /**
     * Get ymax
     *
     * @return string
     */
    public function getYmax()
    {
        return $this->ymax;
    }

    /**
     * Set zoomLevel
     *
     * @param integer $zoomLevel
     *
     * @return BoundingBox
     */
    public function setZoomLevel($zoomLevel)
    {
        $this->zoomLevel = $zoomLevel;

        return $this;
    }

    /**
     * Get zoomLevel
     *
     * @return int
     */
    public function getZoomLevel()
    {
        return $this->zoomLevel;
    }



    /**
     * Create a new BoundingBox object with default values.
     *
     * @return Application_Object_Mapping_BoundingBox the BoundingBox
     */
    public static function createDefaultBoundingBox() {

    	// TODO : Get the parameters from configuration file

//     	$configuration = Zend_Registry::get("configuration");

//     	$xMin = $configuration->getConfig('bbox_x_min');
//     	$xMax = $configuration->getConfig('bbox_x_max');
//     	$yMin = $configuration->getConfig('bbox_y_min');
//     	$yMax = $configuration->getConfig('bbox_y_max');

//     	return BoundingBox::createBoundingBox($xMin, $xMax, $yMin, $yMax);
    }

    /**
     * Create a new BoundingBox object, making sure that the Box is square.
     *
     * @param Integer $xmin
     *        	x min position
     * @param Integer $xmax
     *        	x max position
     * @param Integer $ymin
     *        	y min position
     * @param Integer $ymax
     *        	y max position
     * @param Integer $minSize
     *        	min size (default to 10 000)
     * @return BoundingBox A BoundingBox object
     */
    public static function createBoundingBox($xmin, $xmax, $ymin, $ymax, $minSize = 10000) {
    	$diffX = abs($xmax - $xmin);
    	$diffY = abs($ymax - $ymin);

    	// Enlarge the bb if it's too small (like for the point)
    	if ($diffX < $minSize) {
    		$addX = ($minSize - $diffX) / 2;
    		$xmin = $xmin - $addX;
    		$xmax = $xmax + $addX;
    		$diffX = $minSize;
    	}
    	if ($diffY < $minSize) {
    		$addY = ($minSize - $diffY) / 2;
    		$ymin = $ymin - $addY;
    		$ymax = $ymax + $addY;
    		$diffY = $minSize;
    	}

    	// Setup the bb like a square
    	$diffXY = $diffX - $diffY;

    	if ($diffXY < 0) {
    		// The bb is highter than large
    		$xmin = $xmin + $diffXY / 2;
    		$xmax = $xmax - $diffXY / 2;
    	} else if ($diffXY > 0) {
    		// The bb is larger than highter
    		$ymin = $ymin - $diffXY / 2;
    		$ymax = $ymax + $diffXY / 2;
    	}

    	$bb = new BoundingBox();
    	$bb->setXmin($xmin);
    	$bb->setYmin($ymin);
    	$bb->setXmax($xmax);
    	$bb->setYmax($ymax);

    	return $bb;
    }
    
    /**
     * Get the center and defaut zoom level
     * @return CenterAndZoomLevel A CenterAndZoomLevel Object
     */
    function getCenterAndZoomLevel() {
    	$cazl= new CenterAndZoomLevel();
    	$cazl->setX(($this->getXmin() + $this->getXmax()) / 2);
    	$cazl->setY(($this->getYmin() + $this->getYmax()) / 2);
    	$cazl->setZoomLevel($this->getZoomLevel());
    	return $cazl;
    }
}

