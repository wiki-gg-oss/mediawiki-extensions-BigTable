const tableFeatures = [
    require( './features/columnHover.js' ),
    require( './features/scrollOverlay.js' ),
    require( './features/stickyHeader.js' ),
];


mw.hook( 'wikipage.content' ).add( $content => {
    for ( const tableFeature of tableFeatures ) {
        tableFeature.setup();
    }

    for ( const wrapperElement of $content.find( '.ext-bigtable-wrapper[ data-mw-bigtable ]' ) ) {
        const tableElement = wrapperElement.querySelector( ':scope > .ext-bigtable-wrapper__inner > table.bigtable' );
        for ( const tableFeature of tableFeatures ) {
            tableFeature.init( wrapperElement, tableElement );
        }
    }

    for ( const tableFeature of tableFeatures ) {
        tableFeature.post();
    }
} );
