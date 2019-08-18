(function() {

    // the game board is 20x20
    /*
       x indexes the first component, y indexes the second component
    [0,0] [0,1] [0,2] [0,3] ... [0,19]
    [1,0] [1,1] [1,2] [1,3] ... [1,19]
    ........
    [19,0] [19,1] [19,2] [19,3] ... [19,19]


    style="background-color:black"
    */

    var dirEnum = {
      NORTH: 1,
      SOUTH: 2,
      EAST: 3,
      WEST: 4
    };

    var target_cell_x = 15;
    var target_cell_y = 15; 
    var snake_length = 5;
    var snake_head_x = 10;
    var snake_head_y = 10;
    var snake_tail_x = 10;
    var snake_tail_y = 10;
    var dir; // of type dirEnum
    var period_millis = 1000; // numer of milliseconds between successive step() cells
    var keyPressedCellsAndDirections = [[10,9,dirEnum.EAST]]; // stores elements of the form [x, y, dir]. Cells for more recently pressed keys are added to the list sooner. This list, the snake head, and the snake length define the current position of the snake


    function reverseDir(direction) {
        switch (direction) {
            case dirEnum.NORTH: return dirEnum.SOUTH;
            case dirEnum.SOUTH: return dirEnum.NORTH;
            case dirEnum.EAST: return dirEnum.WEST;
            case dirEnum.WEST: return dirEnum.EAST;
            default: return -1; 
        }
    }

    window.onload = function() {
        console.log("window has been loaded.");

        document.onkeydown = checkKey;
        window.setInterval(step, period_millis);

        //[a,b] = move(snake_head_x, snake_head_y, keyPressedCellsAndDirections[0][2]);
        //console.log("a : " + a + ", b : " + b);

        //var tdElements = document.getElementsByTagName("td");
        //for (var i=0; i<tdElements.length; ++i) {
            //console.log("row: " + tdElements[i].parentNode.rowIndex + ", col: " + tdElements[i].cellIndex);
        //    tdElements[i].addEventListener("click", myFunction.bind(null, tdElements[i]));
        //}   
    }

    // x is the td-cell element
    function myFunction(x) {
        console.log("col is: " + x.cellIndex + ", row is " + x.parentNode.rowIndex);
    }

    function checkKey(e) {
        e = e || window.event;
        if (e.keyCode == '38') {
            console.log("up arrow");
            keyPressedCellsAndDirections.push([snake_head_x,snake_head_y,dirEnum.NORTH]);
        }
        else if (e.keyCode == '40') {
            console.log("down arrow");
            keyPressedCellsAndDirections.push([snake_head_x,snake_head_y,dirEnum.SOUTH]);
        }
        else if (e.keyCode == '37') {
            console.log("left arrow");
            keyPressedCellsAndDirections.push([snake_head_x,snake_head_y,dirEnum.WEST]);
        }
        else if (e.keyCode == '39') {
            console.log("right arrow");
            keyPressedCellsAndDirections.push([snake_head_x,snake_head_y,dirEnum.EAST]);
        }
    }

    function step0() {
        console.log("step0 called...");
    }

    function step() {
        [snake_head_x, snake_head_y] = move(snake_head_x,snake_head_y,peekBack(keyPressedCellsAndDirections)[2]); //move the snake's head
        [snake_tail_x, snake_tail_y] = move(snake_tail_x,snake_tail_y,keyPressedCellsAndDirections[0][2]); // move the snake's tail
        
        if (snake_head_x == target_cell_x && snake_head_y == target_cell_y) {
            updateTargetCell();
            snake_length++;
        }

        // once the snake's tail cell leaves the oldest path component (row or column defined by the first element of keyPressedCellsAndDirections), that component is removed
        if (!trailingPathDeterminantContainsTailCell()) {
            keyPressedCellsAndDirections.shift(); //remove the trailing path determinant
        }    

        render();
    }



    function trailingPathDeterminantContainsTailCell() {
        var direction = keyPressedCellsAndDirections[0][2];
        if (direction == dirEnum.NORTH || direction == dirEnum.SOUTH) { // the path determinant defines a column
            if (snake_tail_y == keyPressedCellsAndDirections[0][1]) return true;
            else return false;
        } else { // the path determinant defines a row
            if (snake_tail_x == keyPressedCellsAndDirections[0][0]) return true;
            else return false;
        }
    }

    function render() {
        clearBoard();
        renderSnake();
        renderTargetCell();
    }

    function renderTargetCell() {
        var tdElements = document.getElementsByTagName("td");
        tdElements[20*target_cell_x  + target_cell_y].style.backgroundColor = "black"; 
    }

    function clearBoard() { 
        var tdElements = document.getElementsByTagName("td");
        for (var i=0; i<tdElements.length; ++i) {
            tdElements[i].style.backgroundColor = "white";
        }  
    }

    function renderSnake() {
        //console.log("renderSnake() being called...")
        var currentBlackCells = blackCells();
        var tdElements = document.getElementsByTagName("td");
        //console.log("current_black_cells_length: " + currentBlackCells.length);
        for (var i=0; i<currentBlackCells.length; i++) {
            [x,y] = untransformCoordinate(currentBlackCells[i]); 
            //console.log("x: " + x  + ", y: " + y);
            //console.log(tdElements);
            //console.log(tdElements[20*x+y]);
            tdElements[20*x + y].style.backgroundColor = "black";
        }
    }

    function move(curr_x, curr_y, direction) {
        switch (direction) {
            case dirEnum.NORTH: return [curr_x-1, curr_y];
            case dirEnum.SOUTH: return [curr_x+1, curr_y];
            case dirEnum.EAST: return [curr_x, curr_y+1];
            case dirEnum.WEST: return [curr_x, curr_y-1];
            default: return -1; 
        }
    }

    function peekBack(list) {
        return list[list.length-1];
    }

    // returns the coordinates in string representation "x,y" of the current black cells 
    function blackCells() {
        var black_cells = [];
        var curr_x = snake_head_x;
        var curr_y = snake_head_y;
        var curr_path_determinant_cell_x = peekBack(keyPressedCellsAndDirections)[0]; 
        var curr_path_determinant_cell_y = peekBack(keyPressedCellsAndDirections)[1]; 
        var curr_path_determinant_cell_forward_dir = peekBack(keyPressedCellsAndDirections)[2];  
        var curr_index_in_path_determinant_list = keyPressedCellsAndDirections.length-1; // start at last path determinant
        for (var i = 0; i < snake_length; i++) {
            if (curr_x == curr_path_determinant_cell_x && curr_y == curr_path_determinant_cell_y) {
                curr_index_in_path_determinant_list--;
                curr_path_determinant_cell_x = keyPressedCellsAndDirections[curr_index_in_path_determinant_list][0];
                curr_path_determinant_cell_y = keyPressedCellsAndDirections[curr_index_in_path_determinant_list][1];
                curr_path_determinant_cell_forward_dir = keyPressedCellsAndDirections[curr_index_in_path_determinant_list][2];
            }
            black_cells.push(transformCoordinate(curr_x,curr_y));
            
            var new_dir = reverseDir(curr_path_determinant_cell_forward_dir);
            //console.log("old_dir: " + curr_path_determinant_cell_forward_dir + ", new_dir: " + new_dir);
            
            [curr_x, curr_y] = move(curr_x, curr_y, new_dir);
        }
        //console.log("black_cells: " + black_cells);
        return black_cells;
    }

    // transforms the coordinate to a string
    function transformCoordinate(x,y) {
        return(x + "," + y);
    }

    // given an string representation of a coordinate [x,y], returns [x,y]
    function untransformCoordinate(str) {
        var parts = str.split(",");
        return [parseInt(parts[0]),parseInt(parts[1])];
    }

    // when the snake eats a cell, a new cell not on the snake pops up
    function updateTargetCell() {
        console.log("updateTargetCell() being called...")
        var new_target_x = target_cell_x;
        var new_target_y = target_cell_y;
        var current_black_cells = blackCells();
        console.log(current_black_cells);
        console.log("current_target: " + [new_target_x,new_target_y]);
        while (current_black_cells.includes(transformCoordinate(new_target_x,new_target_y))) {
            console.log("while loop iteration being made...")
            new_target_x = Math.floor(Math.random() * 20); //random integer between 0 and 19
            new_target_y = Math.floor(Math.random() * 20); //random integer between 0 and 19
        }
        target_cell_x = new_target_x;
        target_cell_y = new_target_y;
        console.log("TARGET_CELL_UPDATE: new_target_x:" + new_target_x + ", new_target_y: " + new_target_y);
    }

})();