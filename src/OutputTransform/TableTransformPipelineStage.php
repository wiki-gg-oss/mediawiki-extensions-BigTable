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
        $hasBigTable = false;

        foreach ( $dom->getElementsByTagName( 'table' ) as $tableElement ) {
            if ( !preg_match( '/\bbigtable\b/', $tableElement->getAttribute( 'class' ) ) ) {
                continue;
            }

            $hasBigTable = true;

            $wrapperElement = $dom->createElement( 'div' );
            $wrapperElement->setAttribute( 'class', 'bigtable-wrapper' );
            $wrapperElement->setAttribute( 'data-mw-bigtable', 'true' );
            $tableElement->replaceWith( $wrapperElement );
            $wrapperElement->append( $tableElement );
        }

        if ( $hasBigTable ) {
            $po->addModuleStyles( [ 'ext.bigtable.styles' ] );
            $po->addModules( [ 'ext.bigtable' ] );
        }

        return $dom;
    }
}
