( function () {
    if(document.getElementsByClassName('bigtable').length === 0) { return }; // early return if no bigtables

    const HOVER_CLASS = 'bigtable-cell-hovered';
    const EXCLUSION_CLASS = 'nohover';
    let hovered;

    function updateColumnHover(cell){
        if(!(cell && cell.nodeName === 'TD')){ return } // skip if cell is null or not a td

        const 
            column = cell.cellIndex,
            table = cell.closest('table');

        if(hovered){
            for (let cell of hovered) {
                cell.classList.remove(HOVER_CLASS);
            };
        }

        hovered = Array.prototype.map.call(
            table.rows, (row) => {
                var i = column;
                while (!cell && i >= 0) {
                    var cell = row.cells[i];
                    i -= 1;
                }
                return cell;
            }
        );
        console.log(hovered)

        for (let cell of hovered) {
            if(cell.nodeName === 'TD'){ // && cell.cellIndex === column
                cell.classList.add(HOVER_CLASS);
            }
        };

    }

    for(const table of document.querySelectorAll( '.bigtable-container > .bigtable' )) {
        if(table.classList.contains(EXCLUSION_CLASS)){return}
        
        table.addEventListener('mouseover', (event) => {
            updateColumnHover(event.target);
        });

    }
})();