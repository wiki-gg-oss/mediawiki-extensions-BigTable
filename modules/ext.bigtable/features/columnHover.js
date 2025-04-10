const
    HOVER_CLASS = 'bigtable-cell-hovered',
    EXCLUSION_CLASS = 'nohover';


let hovered = null;


function updateColumnHover( tableElement, eventTarget ) {
    if ( !eventTarget || eventTarget.nodeName !== 'TD' ) {
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
}


module.exports = {
    setup() {},


    init( wrapperElement, tableElement ) {
        if ( tableElement.classList.contains( EXCLUSION_CLASS ) ) {
            return;
        }

        tableElement.addEventListener( 'mouseover', event => updateColumnHover( tableElement, event.target ) );
    },


    post() {},
};
