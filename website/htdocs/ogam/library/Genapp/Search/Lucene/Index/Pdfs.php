<?php
class Genapp_Search_Lucene_Index_Pdfs
{
	/**
	 * Extract data from a PDF document and add this to the Lucene index.
	 *
	 * @param string $pdfPath                       The path to the PDF document.
	 * @param Zend_Search_Lucene_Proxy $luceneIndex The Lucene index object.
	 * @return Zend_Search_Lucene_Proxy
	 */
	public static function index($pdfPath, $luceneIndex, $filesMetadata, $filesCharset)
	{
		// Load the PDF document.
		$pdf = Zend_Pdf::load($pdfPath);
		$key = md5($pdfPath);

		/**
		 * Set up array to contain the document index data.
		 * The Filename will be used to retrive the document if it is found in
		 * the search resutls.
		 * The Key will be used to uniquely identify the document so we can
		 * delete it from the search index when adding it.
		 */
		$indexValues = array(
				'Filename'     => $pdfPath,
				'Key'          => $key
		);

		$splitedFilename = preg_split("/[\\/\\\\]+/",$pdfPath);

		// URL
		$i = count($splitedFilename) - 1;
		$url = '';
		while($splitedFilename[$i] !== 'public'){
			$url = '/'.$splitedFilename[$i--].$url;
			if($i === -1){
				throw new Exception('No \'public\' directory found in the pdf(s) path. The pdf(s) must be placed into the public directory.');
			}
		}
		$indexValues['url'] = $url;

		// Short File name
		$shortFileName = $splitedFilename[count($splitedFilename)- 1];

		// Small file name and Extension
		$smallFilename	= preg_split("/[\\.]+/",$shortFileName);
		$extension = array_pop($smallFilename);
		$smallFilename = implode(".", $smallFilename);

		// Set the 'FileName', 'ShortFileName', 'Extension'
		if(in_array('ShortFileName', $filesMetadata)){
			$indexValues['ShortFileName'] = $shortFileName;
		}
		if(in_array('SmallFileName', $filesMetadata)){
			$indexValues['SmallFileName'] = $smallFilename;
		}
		if(in_array('Extension', $filesMetadata)){
			$indexValues['Extension'] = $extension;
		}

		// Go through each meta data item and add to index array.
		foreach ($pdf->properties as $meta => $metaValue) {
			switch ($meta) {
				default:
					if(in_array($meta, $filesMetadata)){
						$indexValues[$meta] = $pdf->properties[$meta];
					}
					break;
			}
		}

		/**
		 * Parse the contents of the PDF document and pass the text to the
		 * contents item in the $indexValues array.
		 */
		$pdfParse                = new Genapp_Search_Helper_PdfParser();
		$indexValues['Contents'] = $pdfParse->pdf2txt($pdf->render(), $filesCharset, 'UTF-8');
		if(is_null($indexValues['Contents'])){
			throw new Exception('No content found or the content is not readable.');
		}
		$pdfParse = NULL;
	    unset($pdfParse);// for memory release
		$pdf = NULL;
		unset($pdf);// for memory release


		// Create the document using the values
		$doc = new Genapp_Search_Lucene_Document($indexValues, $filesCharset);
		$indexValues = NULL;
		unset($indexValues);// for memory release

		if ($doc !== false) {
			// If the document creation was sucessful then add it to our index.
			$luceneIndex->addDocument($doc);
			$doc = NULL;
			unset($doc);// for memory release
		}

		// Return the Lucene index object.
		return $luceneIndex;
	}
}