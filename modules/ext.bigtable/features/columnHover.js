const
    HOVER_CLASS = 'ext-bigtable-cell-hovered',
    EXCLUSION_CLASS = 'nohover',
    MIN_ROW_COUNT = 8;


function clearHoverFromBody() {
    for ( const cellElement of document.body.querySelectorAll( `td.${HOVER_CLASS}` ) ) {
        cellElement.classList.remove( HOVER_CLASS );
    }
}


const updateColumnHover = mw.util.debounce(
    ( tableElement, eventTarget ) => {
        // Event target is gone due to the mouse leaving an eligible column; clear hover state and bail
        if ( !eventTarget ) {
            clearHoverFromBody();
            return;
        }

        // Bail on non-body cells or if the event target is already in our hover state
        if ( eventTarget.nodeName !== 'TD' || eventTarget.classList.contains( HOVER_CLASS ) ) {
            return;
        }

        clearHoverFromBody();

        const column = eventTarget.cellIndex;

        let hovered = Array.prototype.map.call( tableElement.rows, row => {
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
