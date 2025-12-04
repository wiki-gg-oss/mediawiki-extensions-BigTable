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

        // Because of colspan, we should count the column IDs on our own as cellIndex is not accurate across different
        // rows.
        // TODO: likely can be precached but probably not worth the effort?
        const absoluteColumnIndices = {};
        let currentColIndex = -1;
        // Determine first at the event target's level to handle cases like:
        //  a B C d
        //  a E E d   --- event target
        //  a B B d
        //  a B C d
        for ( const cellElement of eventTarget.parentNode.cells ) {
            if ( cellElement === eventTarget ) {
                for ( let iter = 0; iter < cellElement.colSpan; iter++ ) {
                    absoluteColumnIndices[ ++currentColIndex ] = true;
                }
                break;
            } else {
                currentColIndex += cellElement.colSpan;
            }
        }
        // Now walk over all other rows and try to project our column IDs onto the cells. If there's any misalignment in
        // the current colspan line, we should spread the mark. This lets us handle cases like:
        //  a B C d
        //  a E C d   --- event target
        //  a B B d
        //  a B C d
        // as without this pass, things would look more like:
        //  a B c d
        //  a E c d   --- event target
        //  a B B d
        //  a B c d
        for ( const rowElement of tableElement.rows ) {
            currentColIndex = -1;
            for ( const cellElement of rowElement.cells ) {
                currentColIndex++;
                for ( let iter = 0; iter < cellElement.colSpan; iter++ ) {
                    if ( absoluteColumnIndices[ currentColIndex + iter ] ) {
                        // Great, this cell is within our index list - let's mark its colspan range now
                        for ( iter = 0; iter < cellElement.colSpan; iter++ ) {
                            absoluteColumnIndices[ currentColIndex + iter ] = true;
                        }
                        break;
                    }
                }
                currentColIndex += cellElement.colSpan - 1;
            }
        }

        // Now determine the cells to update
        const columnsToUpdate = new Set();
        for ( const rowElement of tableElement.rows ) {
            currentColIndex = -1;
            for ( const cellElement of rowElement.cells ) {
                for ( let iter = 0; iter < cellElement.colSpan; iter++ ) {
                    if ( absoluteColumnIndices[ ++currentColIndex ] ) {
                        columnsToUpdate.add( cellElement );
                        // Don't break this loop or currentColIndex will desync!
                    }
                }
            }
        }

        for ( const cellElement of columnsToUpdate ) {
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
