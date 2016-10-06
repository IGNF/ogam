<?php

namespace OGAMBundle\Entity\Mapping;

/**
 * Represent an object containing a coordinate and a zoom level
 */
class CenterAndZoomLevel {

	/**
	 * The x position of the center of the map.
	 *
	 * @var Numeric
	 */
	private $x;

	/**
	 * The y position of the center of the map.
	 *
	 * @var Numeric
	 */
	private $y;

	/**
	 * The default zoom level.
	 *
	 * @var Integer
	 */
	private $zoomLevel;

    /**
     *
     * @return the Numeric
     */
    public function getX()
    {
        return $this->x;
    }

    /**
     *
     * @param
     *            $x
     */
    public function setX($x)
    {
        $this->x = $x;
        return $this;
    }

    /**
     *
     * @return the Numeric
     */
    public function getY()
    {
        return $this->y;
    }

    /**
     *
     * @param
     *            $y
     */
    public function setY($y)
    {
        $this->y = $y;
        return $this;
    }

    /**
     *
     * @return the Integer
     */
    public function getZoomLevel()
    {
        return $this->zoomLevel;
    }

    /**
     *
     * @param Integer $zoomLevel            
     */
    public function setZoomLevel(Integer $zoomLevel)
    {
        $this->zoomLevel = $zoomLevel;
        return $this;
    }
}