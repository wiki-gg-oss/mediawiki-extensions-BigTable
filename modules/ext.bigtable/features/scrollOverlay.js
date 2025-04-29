const
    LEFT_CLASS = 'ext-bigtable-wrapper--scrollable-left',
    RIGHT_CLASS = 'ext-bigtable-wrapper--scrollable-right';




module.exports = {
    setup() {},


    init( wrapperElement, tableElement ) {
        const innerWrapElement = wrapperElement.querySelector( ':scope > .ext-bigtable-wrapper__inner' );
        let hasLeftScroll = false, hasRightScroll = false;

        const updateSideOverlay = ( currentState, sideClass, canActivate, canDeactivate ) => {
            // Enter state:
            if ( !currentState && canActivate ) {
                wrapperElement.classList.add( sideClass );
                return true;
            }
            // Leave state:
            if ( currentState && canDeactivate ) {
                wrapperElement.classList.remove( sideClass );
                return false;
            }
            return currentState;
        };
        const updateScrollOverlays = mw.util.debounce(
            event => {
                const
                    scrollLeft = innerWrapElement.scrollLeft,
                    scrollMax = innerWrapElement.scrollLeftMax;
                hasLeftScroll = updateSideOverlay(
                    hasLeftScroll,
                    LEFT_CLASS,
                    scrollLeft > 0,
                    scrollLeft <= 0
                );
                hasRightScroll = updateSideOverlay(
                    hasRightScroll,
                    RIGHT_CLASS,
                    scrollLeft < scrollMax,
                    scrollLeft >= scrollMax
                );
            },
            5
        );

        updateScrollOverlays();
        innerWrapElement.addEventListener( 'scroll', updateScrollOverlays, { passive: true } );
    },


    post() {},
};
