<?php

namespace MediaWiki\Extension\BigTable\OutputTransform;

use MediaWiki\OutputTransform\ContentDOMTransformStage;
use MediaWiki\Parser\ParserOptions;
use MediaWiki\Parser\ParserOutput;
use Wikimedia\Parsoid\DOM\Document;

class TableTransformPipelineStage extends ContentDOMTransformStage {
	public function shouldRun( ParserOutput $po, ?ParserOptions $popts, array $options = [] ): bool {
        $text = $po->getContentHolderText();
		return str_contains( $text, '</table>' ) && str_contains( $text, 'bigtable' );
	}

	public function transformDOM( Document $dom, ParserOutput $po, ?ParserOptions $popts, array &$options ): Document {
        // TODO: implement
        return $dom;
    }
}
