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
        // TODO: for performance and multi-thead support, we absolutely want everything here to be orchestrated by an
        // IntersectionObserver, and then just pile on theads as they scroll into view (and disable when the table
        // scrolls out)

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

            // Control var; set this to true when the first, contiguous TH block ends - then if we find another all TH
            // row and this var is true, we can interrupt the setup entirely as we do not support that scenario at the
            // moment. This flag does not accurately reflect whether the block has actually been found after the loop
            // ends (for example, there are no TD rows or the TH row is the last row in the table).
            // Scenario visualiser:
            //  TR
            //    TH TH TH
            //  TR
            //    TD TD TD
            //  TR
            //    TH TH TH
            //  TR
            //    TD TD TD
            let foundFirstThBlock = false;

            // Note, we also do not support the following scenario with a "late" TH block:
            //  TR
            //    TD TD TD
            //  TR
            //    TH TH TH
            //  TR
            //    TD TD TD

            // TODO: for Rail or Mr Pie

            for ( const row of tableElement.rows ) {
                let hasOnlyTh = true;
                for ( const child of row.children ) {
                    if ( child.tagName !== 'TH' ) {
                        hasOnlyTh = false;
                        break;
                    }
                }

                // Flag tripped due to multiple TH blocks, do not activate the sticky header or bad things happen
                if ( hasOnlyTh && foundFirstThBlock ) {
                    return;
                }

                if ( hasOnlyTh ) {
                    stickyRows.push( row );
                    totalTheadHeightCache += row.getBoundingClientRect().height;
                } else {
                    foundFirstThBlock = true;
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
