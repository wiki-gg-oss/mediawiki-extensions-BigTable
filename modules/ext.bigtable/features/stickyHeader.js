const
    STICKY_THEAD_CLASS = 'ext-bigtable-sticky-thead',
    LAST_STICKY_THEAD_CLASS = 'ext-bigtable-sticky-thead--last',
    EXCLUSION_CLASS = 'nosticky',
    FORCE_CLASS = 'forcesticky',
    MIN_ROWS_FOR_STICKY = 6;


const tables = [];
let lastStickyTheadRows = [];


const animationFrameDebounce = fn => {
    let rafId = null;
    return ( ...args ) => {
        if ( rafId !== null ) {
            cancelAnimationFrame( rafId );
        }

        rafId = requestAnimationFrame( () => fn( ...args ) );
    };
};


const updateStickyTheads = animationFrameDebounce(
    () => {
        const previousStickyTheadRows = lastStickyTheadRows;

        const wasSuccess = tables.some( ( { table, stickyRows, totalTheadHeightCache } ) => {
            const bounds = table.getBoundingClientRect(),
                tableBottom = bounds.top + bounds.height,
                headerOffset = `${0 - bounds.top - 1}px`;

            if ( bounds.top <= 0 && tableBottom >= 0 ) {
                if ( tableBottom - totalTheadHeightCache * 3 >= 0 ) {
                    for ( const row of stickyRows ) {
                        row.style.setProperty( '--table-header-offset', headerOffset );
                        row.classList.add( STICKY_THEAD_CLASS );
                    }

                    stickyRows[ stickyRows.length - 1 ].classList.add( LAST_STICKY_THEAD_CLASS );

                    lastStickyTheadRows = stickyRows;
                    return true;
                }
            }
        } );

        if ( previousStickyTheadRows !== null && ( lastStickyTheadRows !== previousStickyTheadRows || !wasSuccess ) ) {
            for ( const row of lastStickyTheadRows ) {
                row.classList.remove( STICKY_THEAD_CLASS );
            }

            if ( !wasSuccess ) {
                lastStickyTheadRows = null;
            }
        }
    }
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

        let stickyRows = null,
            totalTheadHeightCache = 0;

        if ( tableElement.tHead ) {
            stickyRows = [ tableElement.tHead ];
            totalTheadHeightCache += tableElement.tHead.height;
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
                    totalTheadHeightCache += row.getBoundingClientRect().height;
                }
            }
        }

        if ( stickyRows && stickyRows.length ) {
            tables.push( {
                table: tableElement,
                stickyRows,
                totalTheadHeightCache,
            } );
        }
    },


    post() {
        if ( !tables.length ) {
            return;
        }

        updateStickyTheads();

        window.addEventListener( 'scroll', updateStickyTheads, { passive: true } );
        window.addEventListener( 'resize', updateStickyTheads, { passive: true } );
    },
};
