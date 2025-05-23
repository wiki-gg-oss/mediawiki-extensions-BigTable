<?php

namespace MediaWiki\Extension\BigTable;

use MediaWiki\Output\OutputPage;
use MediaWiki\Parser\ParserOutput;
use Wikimedia\Parsoid\DOM\Document;
use Wikimedia\Parsoid\Utils\ContentUtils;
use Wikimedia\Parsoid\Utils\DOMCompat;
use Wikimedia\Parsoid\Utils\DOMUtils;

final class DomHydration {
    private const ALTERNATIVE_CLASS_REGEX = '/\b(?:article-table)\b/';
    private const CLASS_REGEX = '/\b(?:bigtable|article-table)\b/';

	public static function assessHtmlString( string $text ): bool {
		return str_contains( $text, '</table>' ) && preg_match( self::CLASS_REGEX, $text );
	}

	public static function transformString( string $text, ParserOutput|OutputPage $metadataHolder ): string {
		$doc = DOMUtils::parseHTML( $text );
		self::transformDOM( $doc, $metadataHolder );
		return ContentUtils::toXML( DOMCompat::getBody( $doc ), [
			'innerXML' => true,
		] );
    }

	public static function transformDOM( Document $dom, ParserOutput|OutputPage $metadataHolder ): void {
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
            $metadataHolder->addModuleStyles( [ 'ext.bigtable.styles' ] );
            $metadataHolder->addModules( [ 'ext.bigtable' ] );
        }
    }
}
