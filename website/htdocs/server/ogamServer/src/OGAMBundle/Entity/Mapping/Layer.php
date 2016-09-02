<?php

namespace OGAMBundle\Entity\Mapping;

use Doctrine\ORM\Mapping as ORM;

/**
 * Layer
 *
 * @ORM\Table(name="mapping.layer")
 * @ORM\Entity(repositoryClass="OGAMBundle\Repository\Mapping\LayerRepository")
 */
class Layer
{

    /**
     * The logical name of the layer.
     * @var string
     *
     * @ORM\Id
     * @ORM\Column(name="layer_name", type="string", length=50, unique=true, options={"comment"="Logical name of the layer"})
     */
    private $layerName;

    /**
	 * The label of the layer.
	 * @var string
     *
     * @ORM\Column(name="layer_label", type="string", length=100, nullable=true, options={"comment"="Label of the layer"})
     */
    private $layerLabel;

    /**
     * The name of the service layer composing this logical layer.
     * @var string
     *
     * @ORM\Column(name="service_layer_name", type="string", length=500)
     */
    private $serviceLayerName;

    /**
     * Indicate if the layer is transparent.
     * @var bool
     *
     * @ORM\Column(name="istransparent", type="boolean", nullable=true)
     */
    private $isTransparent;

    /**
     * Default value of layer opacity : 0 to 100, default value = 100.
     * @var int
     *
     * @ORM\Column(name="default_opacity", type="integer", nullable=true)
     */
    private $defaultOpacity;

    /**
     * Indicate if the layer is a base layer.
     * @var bool
     *
     * @ORM\Column(name="isbaselayer", type="boolean", nullable=true)
     */
    private $isBaseLayer;

    /**
     * Force OpenLayer to request one image each time.
     * @var bool
     *
     * @ORM\Column(name="isuntiled", type="boolean", nullable=true)
     */
    private $isUntiled;

    /**
     * The max scale of apparition of the layer.
     * @var int
     *
     * @ORM\Column(name="maxscale", type="integer", nullable=true)
     */
    private $maxScale;

    /**
     * The min scale of apparition of the layer.
     * @var int
     *
     * @ORM\Column(name="minscale", type="integer", nullable=true)
     */
    private $minScale;

    /**
     * Indicate if the layer has a Legend available.
     * @var bool
     *
     * @ORM\Column(name="has_legend", type="boolean", nullable=true)
     */
    private $hasLegend;

    /**
     * If empty, the layer can be seen by any country, if not it is limited to one country.
     * @var string
     *
     * @ORM\Column(name="provider_id", type="string", length=36, nullable=true)
     */
    private $providerId;

    /**
     * If the layer is activated by an event, defines the category of event that will activate this layer.
	 * Possible values are : NONE, REQUEST, AGGREGATION, HARMONIZATION.
	 *
	 * @var string
     *
     * @ORM\Column(name="activate_type", type="string", length=36, nullable=true)
     */
    private $activateType;

    /**
     * Indicates the service for displaying the layers in the map panel.
     * @var string
     *
     * @ORM\Column(name="view_service_name", type="string", length=50, nullable=true)
     */
    private $viewServiceName;

    /**
     * Indicates the service to call for displaying legend.
     * @var string
     *
     * @ORM\Column(name="legend_service_name", type="string", length=50, nullable=true)
     */
    private $legendServiceName;

    /**
     * Indicates the service to call for detail panel.
     * @var string
     *
     * @ORM\Column(name="detail_service_name", type="string", length=50, nullable=true)
     */
    private $detailServiceName;

    /**
     * Indicates the service to call for wfs menu.
     * @var string
     *
     * @ORM\Column(name="feature_service_name", type="string", length=50, nullable=true)
     */
    private $featureServiceName;


    /**
     * Set layerName
     *
     * @param string $layerName
     *
     * @return Layer
     */
    public function setLayerName($layerName)
    {
        $this->layerName = $layerName;

        return $this;
    }

    /**
     * Get layerName
     *
     * @return string
     */
    public function getLayerName()
    {
        return $this->layerName;
    }

    /**
     * Set layerLabel
     *
     * @param string $layerLabel
     *
     * @return Layer
     */
    public function setLayerLabel($layerLabel)
    {
        $this->layerLabel = $layerLabel;

        return $this;
    }

    /**
     * Get layerLabel
     *
     * @return string
     */
    public function getLayerLabel()
    {
        return $this->layerLabel;
    }

    /**
     * Set serviceLayerName
     *
     * @param string $serviceLayerName
     *
     * @return Layer
     */
    public function setServiceLayerName($serviceLayerName)
    {
        $this->serviceLayerName = $serviceLayerName;

        return $this;
    }

    /**
     * Get serviceLayerName
     *
     * @return string
     */
    public function getServiceLayerName()
    {
        return $this->serviceLayerName;
    }

    /**
     * Set isTransparent
     *
     * @param boolean $isTransparent
     *
     * @return Layer
     */
    public function setIsTransparent($isTransparent)
    {
        $this->isTransparent = $isTransparent;

        return $this;
    }

    /**
     * Get isTransparent
     *
     * @return bool
     */
    public function getIsTransparent()
    {
        return $this->isTransparent;
    }

    /**
     * Set defaultOpacity
     *
     * @param integer $defaultOpacity
     *
     * @return Layer
     */
    public function setDefaultOpacity($defaultOpacity)
    {
        $this->defaultOpacity = $defaultOpacity;

        return $this;
    }

    /**
     * Get defaultOpacity
     *
     * @return int
     */
    public function getDefaultOpacity()
    {
        return $this->defaultOpacity;
    }

    /**
     * Set isBaseLayer
     *
     * @param boolean $isBaseLayer
     *
     * @return Layer
     */
    public function setIsBaseLayer($isBaseLayer)
    {
        $this->isBaseLayer = $isBaseLayer;

        return $this;
    }

    /**
     * Get isBaseLayer
     *
     * @return bool
     */
    public function getIsBaseLayer()
    {
        return $this->isBaseLayer;
    }

    /**
     * Set isUntiled
     *
     * @param boolean $isUntiled
     *
     * @return Layer
     */
    public function setIsUntiled($isUntiled)
    {
        $this->isUntiled = $isUntiled;

        return $this;
    }

    /**
     * Get isUntiled
     *
     * @return bool
     */
    public function getIsUntiled()
    {
        return $this->isUntiled;
    }

    /**
     * Set maxScale
     *
     * @param integer $maxScale
     *
     * @return Layer
     */
    public function setMaxScale($maxScale)
    {
        $this->maxScale = $maxScale;

        return $this;
    }

    /**
     * Get maxScale
     *
     * @return int
     */
    public function getMaxScale()
    {
        return $this->maxScale;
    }

    /**
     * Set minScale
     *
     * @param integer $minScale
     *
     * @return Layer
     */
    public function setMinScale($minScale)
    {
        $this->minScale = $minScale;

        return $this;
    }

    /**
     * Get minScale
     *
     * @return int
     */
    public function getMinScale()
    {
        return $this->minScale;
    }

    /**
     * Set hasLegend
     *
     * @param boolean $hasLegend
     *
     * @return Layer
     */
    public function setHasLegend($hasLegend)
    {
        $this->hasLegend = $hasLegend;

        return $this;
    }

    /**
     * Get hasLegend
     *
     * @return bool
     */
    public function getHasLegend()
    {
        return $this->hasLegend;
    }

    /**
     * Set providerId
     *
     * @param string $providerId
     *
     * @return Layer
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
     * Set activateType
     *
     * @param string $activateType
     *
     * @return Layer
     */
    public function setActivateType($activateType)
    {
        $this->activateType = $activateType;

        return $this;
    }

    /**
     * Get activateType
     *
     * @return string
     */
    public function getActivateType()
    {
        return $this->activateType;
    }

    /**
     * Set viewServiceName
     *
     * @param string $viewServiceName
     *
     * @return Layer
     */
    public function setViewServiceName($viewServiceName)
    {
        $this->viewServiceName = $viewServiceName;

        return $this;
    }

    /**
     * Get viewServiceName
     *
     * @return string
     */
    public function getViewServiceName()
    {
        return $this->viewServiceName;
    }

    /**
     * Set legendServiceName
     *
     * @param string $legendServiceName
     *
     * @return Layer
     */
    public function setLegendServiceName($legendServiceName)
    {
        $this->legendServiceName = $legendServiceName;

        return $this;
    }

    /**
     * Get legendServiceName
     *
     * @return string
     */
    public function getLegendServiceName()
    {
        return $this->legendServiceName;
    }

    /**
     * Set detailServiceName
     *
     * @param string $detailServiceName
     *
     * @return Layer
     */
    public function setDetailServiceName($detailServiceName)
    {
        $this->detailServiceName = $detailServiceName;

        return $this;
    }

    /**
     * Get detailServiceName
     *
     * @return string
     */
    public function getDetailServiceName()
    {
        return $this->detailServiceName;
    }

    /**
     * Set featureServiceName
     *
     * @param string $featureServiceName
     *
     * @return Layer
     */
    public function setFeatureServiceName($featureServiceName)
    {
        $this->featureServiceName = $featureServiceName;

        return $this;
    }

    /**
     * Get featureServiceName
     *
     * @return string
     */
    public function getFeatureServiceName()
    {
        return $this->featureServiceName;
    }
}
