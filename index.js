var won = false;
var mine = {
  // (A) PROPERTIES
  // (A1) GAME SETTINGS
  time: 10000,
  changesByComp: [],
  total: 15, // TOTAL NUMBER OF MINES
  height: 10, // NUMBER OF ROWS
  width: 10, // NUMBER OF COLUMNS
  lives: 3, // NUMBER OF LIVES PLAYER HAS
  // (A2) GAME FLAGS
  board: [], // CURRENT GAME BOARD
  rCell: 0, // NUMBER OF REMAINING HIDDEN CELLS
  // typesOfTurns: ['open', 'mark'],
  computerTurnRound: [3], //ROUNDS IN WHICH COMPUTER TAKES CONTROL
  bombsFoundByComp: 4, //TOTAL bombs that can be found by COMPUTER in a turn
  ongoingRound: 0,
  numFlagged: 0,
  control: false,
  toReveal: [], // ALL CELLS TO REVEAL
  toCheck: [], // ALL CELLS TO CHECK
  checked: [], // ALL CELL THAT HAVE ALREADY BEEN CHECKED
  // (B) RESET & INITIALIZE GAME
  reset: function () {
    // (B1) RESET GAME FLAGS
    mine.board = [];
    mine.numFlagged = 0;
    mine.rCell = mine.height * mine.width;
    mine.lives = 3;
    mine.bombsFoundByComp = 4;
    mine.ongoingRound = 0;
    mine.toReveal = [];
    mine.toCheck = [];
    mine.checked = [];
    document.getElementById('ongoingTurn').textContent = mine.ongoingRound;
    document.getElementById('lives').textContent = mine.lives;
    document.getElementById('flaggedCells').textContent = mine.numFlagged;
    document.getElementById('totalMines').textContent = mine.total;

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
        mine.board[row][col].c.innerHTML = "*";
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

    // If user clicked on it before OR it contains mine and marked as well, then dont update numFlagged and don't allow unmarking
    if (this.classList.contains('boom') || (mine.board[row][col].m && mine.board[row][col].x)) {
      document.getElementById('flaggedCells').textContent = mine.numFlagged;
      //Do nothing

    }


    else if (!mine.board[row][col].r) {
      // if it is NOT already marked and it contains mine 
      if (!mine.board[row][col].x) {
        this.classList.toggle("mark");
        mine.board[row][col].x = !mine.board[row][col].x;
        if (mine.board[row][col].m) {
          mine.numFlagged++;
          document.getElementById('flaggedCells').textContent = mine.numFlagged;
        }
      }
      else {
        this.classList.toggle("mark");
        mine.board[row][col].x = !mine.board[row][col].x;
      }

    }

    mine.computerTurnRound.forEach(elem => {
      if (mine.numFlagged == elem) {
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
      // console.log("OPEN", "mine.rCell: ", mine.rCell, "mine.total", mine.total);
      // (D3D) NO CELLS LEFT TO OPEN - WIN!
      if (mine.rCell == mine.total) {
        won = true;
        alert("YOU WIN!");
        mine.reset();
      }




    }
    mine.computerTurnRound.forEach(elem => {

      if (mine.numFlagged == elem) {
        mine.autoplay();
      }
    });
  },
  markComp: function (row, col) {
    let time = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
    let myPromise;
    return new Promise((resolve) => {
      setTimeout(() => {
        if (mine.bombsFoundByComp == 0) {
          return;
        }
        let cell = document.getElementById('mine-' + row + '-' + col);
        // (C2) MARK/UNMARK ONLY IF CELL IS STILL HIDDEN
        if (cell.classList.contains('boom')) {
          //  do nothing

        }
        else {
          if (!mine.board[row][col].r) {
            // if it is already marked and it contains mine 
            if (mine.board[row][col].m && mine.board[row][col].x) {
              // DO NOTHING AS IT IS ALREADY MARKED BY USER

            }
            // if it has mine but unmarked
            else if (mine.board[row][col].m && !mine.board[row][col].x) {

              mine.bombsFoundByComp--;
              mine.numFlagged++;
              document.getElementById('flaggedCells').textContent = mine.numFlagged;
              // mine.changesByComp.push(cell);
              cell.classList.toggle("mark");
              mine.board[row][col].x = !mine.board[row][col].x;

            }
          }
        }
        resolve('ok');
      }, mine.time)
    });
    return myPromise;

    // (C1) GET COORDS OF SELECTED CELL
  },
  // (D) LEFT CLICK TO OPEN CELL
  openComp: function (row, col) {

    // (D1) GET COORDS OF SELECTED CELL
    let cell = document.getElementById('mine-' + row + '-' + col);
    // (D2) SELECTED CELL HAS MINE = LOSE
    if (mine.board[row][col].m) {
      if (cell.classList.contains('boom')) {
        // mine.bombsFoundByComp += 1;
      }
      // setTimeout(() => { cell.classList.add("mark"); }, 1000)
      // mine.board[row][col].x = !mine.board[row][col].x;
      // mine.bombsFoundByComp -= 1;
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
      console.log("mine.rCell: ", mine.rCell, "mine.total", mine.total)
      if (mine.rCell == mine.total) {

        won = true;
        alert("YOU WIN!");
        mine.reset();
        return;
      }



    }
  },

  autoplay: async function () {
    mine.disableClicks();
    // mine.callModal("Now, your helper will play for a few rounds.",2000);
    // mine.callModal("Now, you are in control again",10000);
    let cells = document.getElementsByClassName('reveal');
    cells = Array.from(cells).filter((el) => {
      if (el.textContent == '1' || el.textContent == '2' || el.textContent == '3' || el.textContent == '4') {
        return el;
      }
    })
    // console.log(cells);
    let ROW, COL, NUMBER, adjacentCells, selectedCell, FLAGS, UNOPENED;

    $("#modal-text").text("Now, your helper will play for a few rounds.");
    $("#myModal").css("display", "block");
    setTimeout(() => { $("#myModal").hide() }, 3000);

    let cellIndex = 0;
    console.log("first modal", $("#modal-text").text());
    cells.forEach((el, idx) => {
      ROW = parseInt(el.dataset.row);
      COL = parseInt(el.dataset.col);
      NUMBER = parseInt(mine.board[ROW][COL].a);
      adjacentCells = [];
      selectedCell = mine.board[ROW][COL];

      // Look around in adjacent cells for Flags and unopened
      FLAGS = 0;
      UNOPENED = 0;
      let lastRow = ROW - 1,
        nextRow = ROW + 1;
      if (nextRow == mine.height) { nextRow = -1; }


      // LOOP THROUGH CELLS OF EACH ROW

      let lastCol = COL - 1,
        nextCol = COL + 1;
      if (nextCol == mine.width) { nextCol = -1; }

      // CALCULATE ONLY IF CELL DOES NOT CONTAIN MINE

      // COUNTING FLAGS IN LAST ROW
      if (lastRow != -1) {
        if (lastCol != -1) {
          adjacentCells.push(mine.board[lastRow][lastCol])
          adjacentCells.push(mine.board[ROW][COL])
          adjacentCells.push(mine.board[lastRow][nextCol])
          // console.log(mine.board[lastRow][lastCol]);
          // console.log(mine.board[ROW][COL]);
          // console.log(mine.board[lastRow][nextCol]);
          if (mine.board[lastRow][lastCol].x) {
            FLAGS++;
          }
          else if (!mine.board[lastRow][lastCol].r) {
            UNOPENED++;
          }

        }
        if (mine.board[ROW][COL].x) {
          FLAGS++;
        }
        else if (!mine.board[ROW][COL].r) {
          UNOPENED++;
        }
        if (nextCol != -1) {
          if (mine.board[lastRow][nextCol].x) {

            FLAGS++;
          }
          else if (!mine.board[lastRow][nextCol].r) {
            UNOPENED++;
          }
        }
      }

      // CURRENT ROW
      if (lastCol != -1) {
        adjacentCells.push(mine.board[ROW][lastCol])
        adjacentCells.push(mine.board[ROW][nextCol])
        // console.log(mine.board[ROW][lastCol]);
        // console.log(mine.board[ROW][nextCol]);
        if (mine.board[ROW][lastCol].x) {
          FLAGS++;
        }
        else if (!mine.board[ROW][lastCol].r) {
          UNOPENED++;
        }
      }
      if (nextCol != -1) {
        if (mine.board[ROW][nextCol].x) {
          FLAGS++;
        }
        else if (!mine.board[ROW][nextCol].r) {
          UNOPENED++;
        }
      }

      // ADD NUMBER OF MINES IN NEXT ROW
      if (nextRow != -1) {
        if (lastCol != -1) {
          adjacentCells.push(mine.board[nextRow][lastCol])
          adjacentCells.push(mine.board[nextRow][COL])
          adjacentCells.push(mine.board[nextRow][nextCol])
          // console.log(mine.board[nextRow][lastCol]);
          // console.log(mine.board[nextRow][COL]);
          // console.log(mine.board[nextRow][nextCol]);
          if (mine.board[nextRow][lastCol].x) {
            FLAGS++;
          }
          else if (!mine.board[nextRow][lastCol].r) {
            UNOPENED++;
          }
        }
        if (mine.board[nextRow][COL].x) {
          FLAGS++;
        }
        else if (!mine.board[nextRow][COL].r) {
          UNOPENED++;
        }
        if (nextCol != -1) {
          if (mine.board[nextRow][nextCol].x) {
            FLAGS++;
          }
          else if (!mine.board[nextRow][nextCol].r) {
            UNOPENED++;
          }
        }
      }
      // console.log(selectedCell, "Unopened ", UNOPENED, "FLAGS ", FLAGS);
      let diff = NUMBER - FLAGS;

      let count = 0;
      // console.log("NUMBER", NUMBER);
      // console.log("DIFFERENCE (num - flags)", diff);
      // // let ratio = NUMBER / UNOPENED
      // // console.log("Ratio of number to unopened", ratio);
      // console.log("AdjacentCells", adjacentCells);
      if (diff == UNOPENED) {
        adjacentCells.forEach((el) => {
          if (el != undefined && (mine.bombsFoundByComp != 0)) {
            let itemRow = parseInt(el.c.dataset.row),
              itemColumn = parseInt(el.c.dataset.col);
            mine.changesByComp.push(mine.markComp(itemRow, itemColumn));

          }

        })

      }

    });
    console.log(mine.bombsFoundByComp);

    for (let i = 1; i <= mine.bombsFoundByComp; i++) {
      $("#modal-text").text(i+" flag(s) found");
      $("#myModal").css("display", "block");
      await mine.sleep(mine.time / mine.bombsFoundByComp)
      $("#myModal").hide()
    }


    Promise.some(mine.changesByComp, 4).then(() => { mine.enableClicks() });
  },
  generateItem: function (arr) {

    let randomItem = arr[Math.floor(Math.random() * arr.length)];
    return randomItem;
  },

  disableClicks: function () {
    for (let row = 0; row < mine.height; row++) {
      for (let col = 0; col < mine.width; col++) {
        let cell = mine.board[row][col].c;
        cell.removeEventListener("click", mine.open);
        cell.removeEventListener("contextmenu", mine.mark);
      }
    }
  },
  enableClicks: function () {
    $("#modal-text").text("Now, you are in control again");
    $("#myModal").css("display", "block");
    setTimeout(() => { $("#myModal").hide() }, 3000);
    for (let row = 0; row < mine.height; row++) {
      for (let col = 0; col < mine.width; col++) {
        let cell = mine.board[row][col].c;
        cell.addEventListener("click", mine.open);
        cell.addEventListener("contextmenu", mine.mark);
      }
    }
  },
  sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },


};



window.addEventListener("DOMContentLoaded", mine.reset);

