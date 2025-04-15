const
    STICKY_THEAD_CLASS = 'ext-bigtable-sticky-thead',
    EXCLUSION_CLASS = 'nosticky',
    FORCE_CLASS = 'forcesticky',
    MIN_ROWS_FOR_STICKY = 6;


const tables = [];
let lastStickyTheadRows = [];


const updateStickyTheads = mw.util.debounce(
    () => {
        if ( lastStickyTheadRows !== null ) {
            for ( const row of lastStickyTheadRows ) {
                row.classList.remove( STICKY_THEAD_CLASS );
            }
            lastStickyTheadRows = null;
        }

        tables.some( ( { table, stickyRows } ) => {
            const bounds = table.getBoundingClientRect(),
                tableBottom = bounds.top + bounds.height;

            if ( bounds.top <= 0 && tableBottom >= 0 ) {
                const firstRowBounds = stickyRows[ 0 ].getBoundingClientRect(),
                    headerOffset = `${0 - firstRowBounds.top - 1}px`;

                if ( tableBottom - firstRowBounds.height * 3 >= 0 ) {
                    for ( const row of stickyRows ) {
                        row.style.setProperty( '--table-header-offset', headerOffset );
                        row.classList.add( STICKY_THEAD_CLASS );
                    }

                    lastStickyTheadRows = stickyRows;
                    return true;
                }
            }
        } );
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
        // skip if the table contains the exclusion class or doesn't have enough rows, unless it has the force class
        if (
            !tableElement.classList.contains( FORCE_CLASS )
            && ( tableElement.classList.contains( EXCLUSION_CLASS ) || tableElement.rows.length < MIN_ROWS_FOR_STICKY )
        ) {
            return;
        }

        let stickyRows = null;

        if ( tableElement.tHead ) {
            stickyRows = [ tableElement.tHead ];
        } else {
            stickyRows = [];
            for ( const row of tableElement.rows ) {
                let hasOnlyTh = true;
                for ( const child of row.children ) {
                    if ( child.tagName !== 'TH' ) {
                        hasOnlyTh = false;
                        break;
                    }
                }

                if ( hasOnlyTh ) {
                    stickyRows.push( row );
                }
            }
        }

        if ( stickyRows && stickyRows.length ) {
            tables.push( {
                table: tableElement,
                stickyRows,
            } );
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
