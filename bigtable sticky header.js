// $( function () {
    
/*
    let viewTop, viewBottom;

    function isVisible(el){
        return (
            (el.getBoundingClientRect().bottom + window.scrollY <= viewBottom) // Bottom of element position is above window bottom position
            &&
            (el.getBoundingClientRect().top + window.scrollY >= viewTop) // Top of element position is below window top position
        );
    }

    function adjustPosition(){
        console.log('Scroll start');
        viewTop = document.documentElement.scrollTop;
        viewBottom = viewTop + window.innerHeight;
        // console.log(`Top: ${viewTop}, Bottom: ${viewBottom}`);
        for(const el of document.querySelectorAll('div.bigtable > table > tbody > tr:first-child:has(> th)')) {

            if(!isVisible(el)){ continue } // skip elements that aren't in view

            // $(this.closest('table')).position()

            // console.log(el);
            let parent = el.closest('table');
            console.log(parent);


            // $this.css({
            //     top:parent.position.top,
            // });

            el.style.position = 'fixed';
            el.style.top = Math.max(parent.getBoundingClientRect().top, 0) + 'px' ;
            console.log(parent.getBoundingClientRect());
        }

        // $('#floating-edit-button').css({
        //     top: Math.max($('#bodyContent').offset().top - $(window).scrollTop(), 100) + 'px'
        // })
        
        console.log('Scroll end');
    }

    document.addEventListener('scroll', adjustPosition);
*/

( function () {
    if(document.getElementsByClassName('bigtable').length === 0) {return}; // early return if no bigtables

    const STICKY_THEAD_CLASS = 'bigtable-sticky-thead',
        EXCLUSION_CLASS = 'nosticky',
        FORCE_CLASS = 'forcesticky',
        MIN_ROWS_FOR_STICKY = 6,
        bodyElement = document.getElementById( 'bodyContent' );
    let lastStickyThead = null,
        tables = null;


    var
        updateStickyTheads = mw.util.debounce(
            function () {
                if ( lastStickyThead !== null ) {
                    lastStickyThead.classList.remove( STICKY_THEAD_CLASS );
                }

                tables.some( function ( info ) {
                    let table = info.table,
                        thead = info.thead;
                    let bounds = table.getBoundingClientRect(),
                        tableBottom = bounds.top + bounds.height;
                    if ( bounds.top <= 0 && tableBottom >= 0 ) {
                        var theadBounds = thead.getBoundingClientRect();
                        if ( tableBottom - theadBounds.height * 3 >= 0 ) {
                            thead.style.setProperty( '--table-header-offset', ''.concat( 0 - theadBounds.top - 1, 'px' ) );
                            thead.classList.add( STICKY_THEAD_CLASS );
                            lastStickyThead = thead;
                            return true;
                        }
                    }
                } );
            },
            5
        ),
        setupStickyTheads = function ( tablesToCheck ) {
            if ( tablesToCheck == null ) {
                return;
            }

            tables = [];
            for(const table of tablesToCheck) {
                // skip if the table contains the exclusion class or doesn't have enough rows, unless it has the force class
                if ( !table.classList.contains(FORCE_CLASS) && (table.classList.contains(EXCLUSION_CLASS) || table.rows.length < MIN_ROWS_FOR_STICKY) ) {
                    continue;
                }

                if ( table.tHead ) {
                    tables.push( {
                        table: table,
                        thead: table.tHead
                    } );
                } else {
                    let firstRow = table.rows[ 0 ];
                    if ( firstRow && firstRow.querySelectorAll( ':scope > th' ).length === firstRow.children.length ) {
                        tables.push( {
                            table: table,
                            thead: firstRow
                        } );
                    }
                }
            }

            if ( tables.length > 0 ) {
                window.addEventListener( 'scroll', updateStickyTheads, {
                    passive: true
                } );
                window.addEventListener( 'resize', updateStickyTheads, {
                    passive: true
                } );
                updateStickyTheads();
            }
        };

    setupStickyTheads( bodyElement.querySelectorAll( '.bigtable-container > .bigtable' ) );
} )();


// });
