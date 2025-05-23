<?php

namespace MediaWiki\Extension\BigTable\OutputTransform;

use MediaWiki\Extension\BigTable\DomHydration;
use MediaWiki\OutputTransform\ContentDOMTransformStage;
use MediaWiki\Parser\ParserOptions;
use MediaWiki\Parser\ParserOutput;
use Wikimedia\Parsoid\DOM\Document;

class TableTransformPipelineStage extends ContentDOMTransformStage {
	public function shouldRun( ParserOutput $po, ?ParserOptions $popts, array $options = [] ): bool {
		return DomHydration::assessHtmlString( $po->getContentHolderText() );
	}

	public function transformDOM( Document $dom, ParserOutput $po, ?ParserOptions $popts, array &$options ): Document {
        DomHydration::transformDOM( $dom, $po );
        return $dom;
    }
}
