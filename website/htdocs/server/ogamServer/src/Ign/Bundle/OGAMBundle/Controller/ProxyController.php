<?php
namespace Ign\Bundle\OGAMBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * @Route("/proxy")
 */
class ProxyController extends Controller {

	/**
	 * @Route("/", name = "proxy_home")
	 */
	public function indexAction() {
		return $this->redirectToRoute('homepage');
	}

	/**
	 * Simulate a GET.
	 *
	 * Not private because can be used by custom controllers.
	 *
	 * @param String $url
	 *        	the url to call
	 * @return The content of the response
	 * @throws Exception
	 */
	protected function sendGET($url) {
		$logger = $this->get('logger');
		$logger->debug('sendGET : ' . $url);

		$result = "";
		$handle = fopen($url, "rb");
		$result = stream_get_contents($handle);
		fclose($handle);

		return $result;
	}

	/**
	 * Simulate a POST.
	 *
	 * Not private because can be used by custom controllers.
	 *
	 * @param String $url
	 *        	the url to call
	 * @param Array $data
	 *        	the post data
	 * @return The content of the response
	 * @throws Exception
	 */
	protected function sendPOST($url, $data) {
		$logger = $this->get('logger');
		$logger->debug('sendPOST : ' . $url . " data : " . $data);

		$contentType = "application/xml";

		$opts = array(
			'http' => array(
				'method' => "POST",
				'header' => "Content-Type: " . $contentType . "\r\n" . "Content-length: " . strlen($data) . "\r\n",
				'content' => $data
			)
		);
		ini_set('user_agent', $_SERVER['HTTP_USER_AGENT']);
		$context = stream_context_create($opts);
		$fp = fopen($url, 'r', false, $context);
		$result = "";
		if ($fp) {
			while ($str = fread($fp, 1024)) {
				$result .= $str;
			}
			fclose($fp);
		} else {
			return "Error opening url : " . $url;
		}

		return $result;
	}
}
