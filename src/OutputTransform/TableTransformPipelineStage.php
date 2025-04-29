<?php

namespace MediaWiki\Extension\BigTable\OutputTransform;

use MediaWiki\OutputTransform\ContentDOMTransformStage;
use MediaWiki\Parser\ParserOptions;
use MediaWiki\Parser\ParserOutput;
use Wikimedia\Parsoid\DOM\Document;

class TableTransformPipelineStage extends ContentDOMTransformStage {
    private const ALTERNATIVE_CLASS_REGEX = '/\b(?:article-table)\b/';
    private const CLASS_REGEX = '/\b(?:bigtable|article-table)\b/';

	public function shouldRun( ParserOutput $po, ?ParserOptions $popts, array $options = [] ): bool {
        $text = $po->getContentHolderText();
		return str_contains( $text, '</table>' ) && preg_match( self::CLASS_REGEX, $text );
	}

	public function transformDOM( Document $dom, ParserOutput $po, ?ParserOptions $popts, array &$options ): Document {
        $hasBigTable = false;

        foreach ( $dom->getElementsByTagName( 'table' ) as $tableElement ) {
            $className = $tableElement->getAttribute( 'class' );
            if ( $className === '' ) {
                continue;
            }

            if ( preg_match( self::ALTERNATIVE_CLASS_REGEX, $className ) ) {
                $className = "$className bigtable";
                $tableElement->setAttribute( 'class', $className );
            }

            if ( !preg_match( '/\bbigtable\b/', $className ) ) {
                continue;
            }

            $hasBigTable = true;

            $innerWrapElement = $dom->createElement( 'div' );
            $innerWrapElement->setAttribute( 'class', 'ext-bigtable-wrapper__inner' );
            $innerWrapElement->setAttribute( 'data-mw-bigtable', 'true' );

            $outerWrapElement = $dom->createElement( 'div' );
            $outerWrapElement->setAttribute( 'class', 'ext-bigtable-wrapper' );
            $outerWrapElement->setAttribute( 'data-mw-bigtable', 'true' );
            $outerWrapElement->append( $innerWrapElement );

            // Move the table into the outer wrapper
            $tableElement->replaceWith( $outerWrapElement );
            $innerWrapElement->append( $tableElement );
        }

        if ( $hasBigTable ) {
            $po->addModuleStyles( [ 'ext.bigtable.styles' ] );
            $po->addModules( [ 'ext.bigtable' ] );
        }

        return $dom;
    }
}
