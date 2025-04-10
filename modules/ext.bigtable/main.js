const tableFeatures = [
    require( './features/columnHover.js' ),
    require( './features/stickyHeader.js' ),
];


mw.hook( 'wikipage.content' ).add( $content => {
    for ( const tableFeature of tableFeatures ) {
        tableFeature.setup();
    }

    for ( const wrapperElement of $content.find( '[ data-mw-bigtable ]' ) ) {
        const tableElement = wrapperElement.children[ 0 ];
        for ( const tableFeature of tableFeatures ) {
            tableFeature.init( wrapperElement, tableElement );
        }
    }

    for ( const tableFeature of tableFeatures ) {
        tableFeature.post();
    }
} );
