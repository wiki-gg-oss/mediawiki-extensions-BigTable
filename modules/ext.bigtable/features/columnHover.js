const
    HOVER_CLASS = 'ext-bigtable-cell-hovered',
    EXCLUSION_CLASS = 'nohover',
    MIN_ROW_COUNT = 8;


let hovered = null;


const updateColumnHover = mw.util.debounce(
    ( tableElement, eventTarget ) => {
        // Clear all hover states
        if ( eventTarget === null ) {
            for ( const cellElement of tableElement.querySelectorAll( `td.${HOVER_CLASS}` ) ) {
                cellElement.classList.remove( HOVER_CLASS );
            }
        }

        if ( !eventTarget || eventTarget.nodeName !== 'TD' || eventTarget.classList.contains( HOVER_CLASS ) ) {
            return;
        }

        const column = eventTarget.cellIndex;

        if ( hovered ) {
            for ( const cellElement of hovered ) {
                cellElement.classList.remove( HOVER_CLASS );
            }
        }

        hovered = Array.prototype.map.call( tableElement.rows, row => {
            let index = column,
                cellElement = null;
            while ( !cellElement && index >= 0 ) {
                cellElement = row.cells[ index ];
                index--;
            }
            return cellElement;
        } );

        for ( const cellElement of hovered ) {
            if ( cellElement.nodeName === 'TD' ) {
                cellElement.classList.add( HOVER_CLASS );
            }
        }
    },
    5
);


module.exports = {
    setup() {},


    /**
     * @param {HTMLElement} wrapperElement
     * @param {HTMLTableElement} tableElement
     */
    init( wrapperElement, tableElement ) {
        if ( tableElement.classList.contains( EXCLUSION_CLASS ) || tableElement.rows.length < MIN_ROW_COUNT ) {
            return;
        }

        tableElement.addEventListener( 'mouseover', event => updateColumnHover( tableElement, event.target ) );
        tableElement.addEventListener( 'mouseleave', event => updateColumnHover( tableElement, null ) );
    },


    post() {},
};
