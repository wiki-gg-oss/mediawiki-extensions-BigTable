const
    STICKY_THEAD_CLASS = 'bigtable-sticky-thead',
    EXCLUSION_CLASS = 'nosticky',
    FORCE_CLASS = 'forcesticky',
    MIN_ROWS_FOR_STICKY = 6;


const tables = [];
let lastStickyThead = null;


const updateStickyTheads = mw.util.debounce(
    () => {
        if ( lastStickyThead !== null ) {
            lastStickyThead.classList.remove( STICKY_THEAD_CLASS );
        }

        tables.some( ( { table, thead } ) => {
            let bounds = table.getBoundingClientRect(),
                tableBottom = bounds.top + bounds.height;
            if ( bounds.top <= 0 && tableBottom >= 0 ) {
                var theadBounds = thead.getBoundingClientRect();
                if ( tableBottom - theadBounds.height * 3 >= 0 ) {
                    thead.style.setProperty( '--table-header-offset', `${0 - theadBounds.top - 1}px` );
                    thead.classList.add( STICKY_THEAD_CLASS );
                    lastStickyThead = thead;
                    return true;
                }
            }
        } );
    },
    5
);


module.exports = {
    setup() {},


    init( wrapperElement, tableElement ) {
        // skip if the table contains the exclusion class or doesn't have enough rows, unless it has the force class
        if (
            !tableElement.classList.contains( FORCE_CLASS )
            && ( tableElement.classList.contains( EXCLUSION_CLASS ) || tableElement.rows.length < MIN_ROWS_FOR_STICKY )
        ) {
            return;
        }

        if ( tableElement.tHead ) {
            tables.push( {
                table: tableElement,
                thead: tableElement.tHead,
            } );
        } else {
            const firstRow = tableElement.rows[ 0 ];
            if ( firstRow && firstRow.querySelectorAll( ':scope > th' ).length === firstRow.children.length ) {
                tables.push( {
                    table: tableElement,
                    thead: firstRow,
                } );
            }
        }
    },


    post() {
        if ( !tables.length ) {
            return;
        }

        updateStickyTheads();

        window.addEventListener( 'scroll', updateStickyTheads, {
            passive: true
        } );
        window.addEventListener( 'resize', updateStickyTheads, {
            passive: true
        } );
    },
};
