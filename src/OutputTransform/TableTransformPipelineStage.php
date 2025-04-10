<?php

namespace MediaWiki\Extension\BigTable\OutputTransform;

use MediaWiki\OutputTransform\ContentDOMTransformStage;
use MediaWiki\Parser\ParserOptions;
use MediaWiki\Parser\ParserOutput;
use Wikimedia\Parsoid\DOM\Document;

class TableTransformPipelineStage extends ContentDOMTransformStage {
	public function shouldRun( ParserOutput $po, ?ParserOptions $popts, array $options = [] ): bool {
        // TODO: don't run if no bigtable in the page
		return true;
	}

	public function transformDOM( Document $dom, ParserOutput $po, ?ParserOptions $popts, array &$options ): Document {
        // TODO: implement
        return $dom;
    }
}
