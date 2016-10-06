<?php

namespace OGAMBundle\Entity\Mapping;

/**
 * Represent a bounding box.
 */
class BoundingBox {
	/**
	 * The xmin coordinate of the bounding box.
	 *
	 * @var Numeric
	 */
	private $xmin = 0;
	
	/**
	 * The ymin coordinate of the bounding box.
	 *
	 * @var Numeric
	 */
	private $ymin = 0;
	
	/**
	 * The xmax coordinate of the bounding box.
	 *
	 * @var Numeric
	 */
	private $xmax = 0;
	
	/**
	 * The ymax coordinate of the bounding box.
	 *
	 * @var Numeric
	 */
	private $ymax = 0;

    /**
     *
     * @return the Numeric
     */
    public function getXmin()
    {
        return $this->xmin;
    }

    /**
     *
     * @param
     *            $xmin
     */
    public function setXmin($xmin)
    {
        $this->xmin = $xmin;
        return $this;
    }

    /**
     *
     * @return the Numeric
     */
    public function getYmin()
    {
        return $this->ymin;
    }

    /**
     *
     * @param
     *            $ymin
     */
    public function setYmin($ymin)
    {
        $this->ymin = $ymin;
        return $this;
    }

    /**
     *
     * @return the Numeric
     */
    public function getXmax()
    {
        return $this->xmax;
    }

    /**
     *
     * @param
     *            $xmax
     */
    public function setXmax($xmax)
    {
        $this->xmax = $xmax;
        return $this;
    }

    /**
     *
     * @return the Numeric
     */
    public function getYmax()
    {
        return $this->ymax;
    }

    /**
     *
     * @param
     *            $ymax
     */
    public function setYmax($ymax)
    {
        $this->ymax = $ymax;
        return $this;
    }
}
