var mine = {
  // (A) PROPERTIES
  // (A1) GAME SETTINGS
  total: 15, // TOTAL NUMBER OF MINES
  height: 15, // NUMBER OF ROWS
  width: 15, // NUMBER OF COLUMNS
  lives: 3, // NUMBER OF LIVES PLAYER HAS
  // (A2) GAME FLAGS
  board: [], // CURRENT GAME BOARD
  rCell: 0, // NUMBER OF REMAINING HIDDEN CELLS
  // typesOfTurns: ['open', 'mark'],
  computerTurnRound: [3, 6], //ROUNDS IN WHICH COMPUTER TAKES CONTROL
  bombsFoundByComp: 2, //TOTAL bombs that can be found by COMPUTER in a turn
  ongoingRound: 0,
  toReveal: [], // ALL CELLS TO REVEAL
  toCheck: [], // ALL CELLS TO CHECK
  checked: [], // ALL CELL THAT HAVE ALREADY BEEN CHECKED
  // (B) RESET & INITIALIZE GAME
  reset: function () {
    // (B1) RESET GAME FLAGS
    mine.board = [];
    mine.rCell = mine.height * mine.width;
    mine.lives = 3;
    mine.bombsFoundByComp = 2;
    mine.ongoingRound = 0;
    mine.toReveal = [];
    mine.toCheck = [];
    mine.checked = [];
    document.getElementById('ongoingTurn').textContent = mine.ongoingRound;
    document.getElementById('lives').textContent = mine.lives;
    // (B2) GET + RESET HTML WRAPPER
    let wrap = document.getElementById("mine-wrap"),
      cssWidth = 100 / mine.width;
    wrap.innerHTML = "";

    // (B3) LOOP THROUGH ROWS & COLUMNS - GENERATE CELLS
    for (let row = 0; row < mine.height; row++) {
      mine.board.push([]);
      for (let col = 0; col < mine.width; col++) {
        // ADD CELL TO MINE.BOARD[]
        mine.board[row].push({
          r: false, // CELL IS REVEALED?
          x: false, // CELL IS MARKED?
          m: false, // CELL HAS A MINE?
          a: 0, // NUMBER OF MINES IN ADJACENT CELLS
          c: document.createElement("div") // HTML REFERENCE
        });

        // ADD CELL TO HTML <DIV>
        let cell = mine.board[row][col].c;
        cell.classList.add("cell");
        cell.id = "mine-" + row + "-" + col;
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener("click", mine.open);
        cell.addEventListener("contextmenu", mine.mark);
        cell.style.width = cssWidth + "%";
        cell.innerHTML = "&nbsp;";
        wrap.appendChild(cell);
      }
    }

    // (B4) RANDOMLY LAY MINES
    let mRow = mine.height - 1,
      mCol = mine.width - 1,
      mToLay = mine.total;
    while (mToLay > 0) {
      let row = Math.floor(Math.random() * mRow);
      let col = Math.floor(Math.random() * mCol);
      if (!mine.board[row][col].m) {
        mine.board[row][col].m = true;
        // CHEAT - SHOW MINE ON THE BOARD
        // mine.board[row][col].c.innerHTML = "*";
        mToLay--;
      }
    }

    // (B5) CALCULATE NUMBER OF ADJACENT MINES FOR EACH CELL
    // LOOP THROUGH ROW-BY-ROW
    for (let row = 0; row < mine.height; row++) {
      let lastRow = row - 1,
        nextRow = row + 1;
      if (nextRow == mine.height) { nextRow = -1; }

      // LOOP THROUGH CELLS OF EACH ROW
      for (let col = 0; col < mine.width; col++) {
        let lastCol = col - 1,
          nextCol = col + 1;
        if (nextCol == mine.width) { nextCol = -1; }

        // CALCULATE ONLY IF CELL DOES NOT CONTAIN MINE
        if (!mine.board[row][col].m) {
          // ADD NUMBER OF MINES IN LAST ROW
          if (lastRow != -1) {
            if (lastCol != -1) { if (mine.board[lastRow][lastCol].m) { mine.board[row][col].a++; } }
            if (mine.board[lastRow][col].m) { mine.board[row][col].a++; }
            if (nextCol != -1) { if (mine.board[lastRow][nextCol].m) { mine.board[row][col].a++; } }
          }

          // ADD NUMBER OF MINES IN CURRENT ROW
          if (lastCol != -1) { if (mine.board[row][lastCol].m) { mine.board[row][col].a++; } }
          if (nextCol != -1) { if (mine.board[row][nextCol].m) { mine.board[row][col].a++; } }

          // ADD NUMBER OF MINES IN NEXT ROW
          if (nextRow != -1) {
            if (lastCol != -1) { if (mine.board[nextRow][lastCol].m) { mine.board[row][col].a++; } }
            if (mine.board[nextRow][col].m) { mine.board[row][col].a++; }
            if (nextCol != -1) { if (mine.board[nextRow][nextCol].m) { mine.board[row][col].a++; } }
          }
        }

        // CHEAT - SHOW NUMBER OF ADJACENT MINES ON BOARD
        // if (mine.board[row][col].a != 0) { mine.board[row][col].c.innerHTML = mine.board[row][col].a ; }
      }
    }
  },

  // (C) RIGHT CLICK TO MARK CELL
  mark: function (evt) {
    // (C1) GET COORDS OF SELECTED CELL
    let row = this.dataset.row,
      col = this.dataset.col;
    mine.ongoingRound++;
    document.getElementById('ongoingTurn').textContent = mine.ongoingRound;
    // (C2) MARK/UNMARK ONLY IF CELL IS STILL HIDDEN
    if (!mine.board[row][col].r) {
      this.classList.toggle("mark");


      mine.board[row][col].x = !mine.board[row][col].x;
    }
    mine.computerTurnRound.forEach(elem => {
      if (mine.ongoingRound == elem) {
        mine.autoplay();
      }
    })
    // (C3) PREVENT CONTEXT MENU FROM OPENING
    evt.preventDefault();
  },



  // (D) LEFT CLICK TO OPEN CELL
  open: function () {

    // (D1) GET COORDS OF SELECTED CELL
    let row = this.dataset.row,
      col = this.dataset.col;

    if (mine.board[row][col].r || mine.board[row][col].x) { }
    else {
      mine.ongoingRound++;
    }

    if (!mine.board[row][col].x && mine.board[row][col].m) {
      this.classList.add("boom");
      mine.lives--;
      document.getElementById('ongoingTurn').textContent = mine.ongoingRound;
      document.getElementById('lives').textContent = mine.lives;
      // Check if player lost all three lives
      if (mine.lives == 0) {
        setTimeout(function () {
          alert("Oops. You lost.");
          mine.reset();
        }, 1);
      }

    }
    // (D3) REVEAL SELECTED CELL + ALL EMPTY ADJACENT CELLS
    else {
      // (D3A) FLAGS - WHICH CELLS SHOULD WE AUTOMATICALLY REVEAL?


      document.getElementById('ongoingTurn').textContent = mine.ongoingRound;
      mine.toReveal = [], // ALL CELLS TO REVEAL
        mine.toCheck = [], // ALL CELLS TO CHECK
        mine.checked = [];


      for (let i = 0; i < mine.height; i++) { mine.checked.push({}); }
      mine.toCheck.push([row, col]);

      // (D3B) LOOP & CHECK - ADD CELLS TO REVEAL
      while (mine.toCheck.length > 0) {
        // CURRENT "CHECK CELL" COORDINATES
        let thisRow = parseInt(mine.toCheck[0][0]),
          thisCol = parseInt(mine.toCheck[0][1]);

        // HAS MINE, ALREADY REVEALED, MARKED - DO NOTHING
        if (mine.board[thisRow][thisCol].m || mine.board[thisRow][thisCol].r || mine.board[thisRow][thisCol].x) { }
        else {
          // ADD CELL TO REVEAL
          if (!mine.checked[thisRow][thisCol]) { mine.toReveal.push([thisRow, thisCol]); }

          // CELL DOES NOT HAVE ADJ MINES - CHECK NEIGHBOURS
          if (mine.board[thisRow][thisCol].a == 0) {
            // PREVIOUS & NEXT CELL COORDINATES
            let lastRow = thisRow - 1,
              nextRow = thisRow + 1,
              lastCol = thisCol - 1,
              nextCol = thisCol + 1;
            if (nextRow == mine.height) { nextRow = -1; }
            if (nextCol == mine.width) { nextCol = -1; }

            // LAST ROW
            if (lastRow != -1) {
              if (lastCol != -1 && !mine.checked[lastRow][lastCol]) { mine.toCheck.push([lastRow, lastCol]); }
              if (!mine.checked[lastRow][thisCol]) { mine.toCheck.push([lastRow, thisCol]); }
              if (nextCol != -1 && !mine.checked[lastRow][nextCol]) { mine.toCheck.push([lastRow, nextCol]); }
            }

            // CURRENT ROW
            if (lastCol != -1 && !mine.checked[thisRow][lastCol]) { mine.toCheck.push([thisRow, lastCol]); }
            if (nextCol != -1 && !mine.checked[thisRow][nextCol]) { mine.toCheck.push([thisRow, nextCol]); }

            // NEXT ROW
            if (nextRow != -1) {
              if (lastCol != -1 && !mine.checked[nextRow][lastCol]) { mine.toCheck.push([nextRow, lastCol]); }
              if (!mine.checked[nextRow][thisCol]) { mine.toCheck.push([nextRow, thisCol]); }
              if (nextCol != -1 && !mine.checked[nextRow][nextCol]) { mine.toCheck.push([nextRow, nextCol]); }
            }
          }
        }

        // MOVE ON - CHECK NEXT CELL
        mine.checked[thisRow][thisCol] = true;
        mine.toCheck.shift();
      }

      // (D3C) AUTOMATICALLY REVEAL CELLS (IF ANY)
      if (mine.toReveal.length > 0) {
        for (let cell of mine.toReveal) {
          let thisRow = parseInt(cell[0]);
          let thisCol = parseInt(cell[1]);
          mine.board[thisRow][thisCol].r = true;
          if (mine.board[thisRow][thisCol].a != 0) {
            mine.board[thisRow][thisCol].c.innerHTML = mine.board[thisRow][thisCol].a;
          }
          mine.board[thisRow][thisCol].c.classList.add("reveal");

          mine.rCell = mine.rCell - 1;
        }
      }
      console.log("OPEN", "mine.rCell: ", mine.rCell, "mine.total", mine.total); 1
      // (D3D) NO CELLS LEFT TO OPEN - WIN!
      if (mine.rCell == mine.total) {
        alert("YOU WIN!");
        mine.reset();
      }




    }
    mine.computerTurnRound.forEach(elem => {

      if (mine.ongoingRound == elem) {
        mine.autoplay();
      }
    });
  },

  // (D) LEFT CLICK TO OPEN CELL
  openComp: function (row, col) {
    // (D1) GET COORDS OF SELECTED CELL
    let cell = document.getElementById('mine-' + row + '-' + col);
    console.log("Fron opencomp", row, col);
    // (D2) SELECTED CELL HAS MINE = LOSE
    if (!mine.board[row][col].x && mine.board[row][col].m) {
      if (cell.classList.contains('boom')) {
        mine.bombsFoundByComp += 1;
      }
      cell.classList.add("mark");
      mine.board[row][col].x = !mine.board[row][col].x;
      mine.bombsFoundByComp -= 1;
    }
    // (D3) REVEAL SELECTED CELL + ALL EMPTY ADJACENT CELLS
    else {
      mine.toReveal = [], // ALL CELLS TO REVEAL
        mine.toCheck = [], // ALL CELLS TO CHECK
        mine.checked = [];
      for (let i = 0; i < mine.height; i++) { mine.checked.push({}); }
      mine.toCheck.push([row, col]);

      // (D3B) LOOP & CHECK - ADD CELLS TO REVEAL
      while (mine.toCheck.length > 0) {
        // CURRENT "CHECK CELL" COORDINATES
        let thisRow = parseInt(mine.toCheck[0][0]),
          thisCol = parseInt(mine.toCheck[0][1]);

        // HAS MINE, ALREADY REVEALED, MARKED - DO NOTHING
        if (mine.board[thisRow][thisCol].m || mine.board[thisRow][thisCol].r || mine.board[thisRow][thisCol].x) { }
        else {
          // ADD CELL TO REVEAL
          if (!mine.checked[thisRow][thisCol]) { mine.toReveal.push([thisRow, thisCol]); }

          // CELL DOES NOT HAVE ADJ MINES - CHECK NEIGHBOURS
          if (mine.board[thisRow][thisCol].a == 0) {
            // PREVIOUS & NEXT CELL COORDINATES
            let lastRow = thisRow - 1,
              nextRow = thisRow + 1,
              lastCol = thisCol - 1,
              nextCol = thisCol + 1;
            if (nextRow == mine.height) { nextRow = -1; }
            if (nextCol == mine.width) { nextCol = -1; }

            // LAST ROW
            if (lastRow != -1) {
              if (lastCol != -1 && !mine.checked[lastRow][lastCol]) { mine.toCheck.push([lastRow, lastCol]); }
              if (!mine.checked[lastRow][thisCol]) { mine.toCheck.push([lastRow, thisCol]); }
              if (nextCol != -1 && !mine.checked[lastRow][nextCol]) { mine.toCheck.push([lastRow, nextCol]); }
            }

            // CURRENT ROW
            if (lastCol != -1 && !mine.checked[thisRow][lastCol]) { mine.toCheck.push([thisRow, lastCol]); }
            if (nextCol != -1 && !mine.checked[thisRow][nextCol]) { mine.toCheck.push([thisRow, nextCol]); }

            // NEXT ROW
            if (nextRow != -1) {
              if (lastCol != -1 && !mine.checked[nextRow][lastCol]) { mine.toCheck.push([nextRow, lastCol]); }
              if (!mine.checked[nextRow][thisCol]) { mine.toCheck.push([nextRow, thisCol]); }
              if (nextCol != -1 && !mine.checked[nextRow][nextCol]) { mine.toCheck.push([nextRow, nextCol]); }
            }
          }
        }

        // MOVE ON - CHECK NEXT CELL
        mine.checked[thisRow][thisCol] = true;
        mine.toCheck.shift();
      }

      // (D3C) AUTOMATICALLY REVEAL CELLS (IF ANY)
      if (mine.toReveal.length > 0) {
        for (let cell1 of mine.toReveal) {
          let thisRow = parseInt(cell1[0]);
          let thisCol = parseInt(cell1[1]);
          mine.board[thisRow][thisCol].r = true;
          if (mine.board[thisRow][thisCol].a != 0) {
            mine.board[thisRow][thisCol].c.innerHTML = mine.board[thisRow][thisCol].a;
          }
          mine.board[thisRow][thisCol].c.classList.add("reveal");

          mine.rCell = mine.rCell - 1;
        }
      }

      // (D3D) NO CELLS LEFT TO OPEN - WIN!
      console.log("mine.rCell: ", mine.rCell, "mine.total", mine.total);
      if (mine.rCell == mine.total) {
        alert("YOU WIN!");
        mine.reset();
        return;
      }



    }
  },

  autoplay: function () {
    // let randomIndex = Math.floor((Math.random() * mine.typesOfTurns.length));
    // let randomItem = mine.typesOfTurns[randomIndex];
    var modal = document.getElementById("myModal");

    var span = document.getElementsByClassName("close")[0];



    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    modal.style.display = "block";
    for (let row = 0; row < mine.height; row++) {
      for (let col = 0; col < mine.width; col++) {
        if (mine.bombsFoundByComp != 0) {

          mine.openComp(row, col)


        }
        else {
          setInterval(() => modal.style.display = "none", 4000)

          mine.bombsFoundByComp = 2;
          return;
        }

      }

    }
    // }
  }

};



window.addEventListener("DOMContentLoaded", mine.reset);

