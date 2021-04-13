var won = false;
var mine = {
  // (A) PROPERTIES
  // (A1) GAME SETTINGS
  result: [],
  time: 3000, // TIME between opening of cells OR placing of flags
  total: 15, // TOTAL NUMBER OF MINES
  height: 10, // NUMBER OF ROWS
  width: 10, // NUMBER OF COLUMNS
  lives: 4, // NUMBER OF LIVES PLAYER HAS

  board: [], // CURRENT GAME BOARD
  rCell: 0, // NUMBER OF REMAINING HIDDEN CELLS
  computerTurnRound: [], //ROUNDS IN WHICH COMPUTER TAKES CONTROL
  bombsFoundByComp: 0, // intermediary variable used to update the mines count
  totalBombsToIdentify: 3, // TOTAL BOMBS THAT CAN BE FOUND By THE COMPUTER
  ongoingRound: 0,
  numFlagged: 0,

  toReveal: [], // ALL CELLS TO REVEAL
  toCheck: [], // ALL CELLS TO CHECK
  checked: [], // ALL CELL THAT HAVE ALREADY BEEN CHECKED
  // (B) RESET & INITIALIZE GAME
  reset: function (computerTurnRound, totalBombsToIdentify) {
    // (B1) RESET GAME FLAGS
    mine.board = [];
    mine.computerTurnRound = computerTurnRound;
    mine.totalBombsToIdentify = totalBombsToIdentify;
    mine.numFlagged = 0;
    mine.rCell = mine.height * mine.width;
    mine.bombsFoundByComp = 0;
    mine.ongoingRound = 0;
    mine.toReveal = [];
    mine.toCheck = [];
    mine.checked = [];
    document.getElementById('ongoingTurn').textContent = mine.ongoingRound;
    document.getElementById('lives').textContent = mine.lives;
    document.getElementById('flaggedCells').textContent = mine.numFlagged;
    document.getElementById('totalMines').textContent = mine.total;
    document.getElementById('status').textContent = "You are playing.";
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
  mark: async function (evt) {
    // (C1) GET COORDS OF SELECTED CELL
    let row = this.dataset.row,
      col = this.dataset.col;
    mine.ongoingRound++;
    document.getElementById('ongoingTurn').textContent = mine.ongoingRound;
    // (C2) MARK/UNMARK ONLY IF CELL IS STILL HIDDEN

    // If  it contains mine and marked as well, then dont update numFlagged and don't allow unmarking
    if ((mine.board[row][col].m && mine.board[row][col].x)) {
      document.getElementById('flaggedCells').textContent = mine.numFlagged;
      //Do nothing

    }


    else if (!mine.board[row][col].r) {
      // if it is NOT already marked and it contains mine 
      if (!mine.board[row][col].x) {

        if (mine.board[row][col].m) {
          this.classList.toggle("mark");
          mine.board[row][col].x = !mine.board[row][col].x;
          mine.numFlagged++;
          document.getElementById('flaggedCells').textContent = mine.numFlagged;
        }
        else {
          mine.lives--;
          // mine.board[row][col].r = !mine.board[row][col].r;
          // mine.rCell--;
          await mine.displayModal("There was no mine there. You lost one life.");
          document.getElementById('lives').textContent = mine.lives;
          await mine.openComp(row, col)
          if ((mine.rCell == mine.total) && (totalFlagged == mine.total)) {
            return;
          }

        }
      }
      // else {
      //   this.classList.toggle("mark");
      //   mine.board[row][col].x = !mine.board[row][col].x;
      // }
    }
    let totalFlagged = mine.numFlagged;
    // console.log("Total Flagged", totalFlagged);
    if ((mine.rCell == mine.total) && (totalFlagged == mine.total)) {
      won = true;
      // Qualtrics.SurveyEngine.setEmbeddedData('won', won);
      // Qualtrics.SurveyEngine.setEmbeddedData('lives', mine.lives);
      alert("Congratulations! All mines have been identified. Click next to continue.");
      document.getElementById('status').textContent = "You Won!";
      // mine.reset();
      mine.disableClicks();
    }

    else if (mine.lives == 0) {
      setTimeout(function () {
        alert("You lost. Click next to continue");
        document.getElementById('status').textContent = "You Lost!";
        mine.disableClicks();
        // mine.reset();
      }, 1);
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
  open: async function () {

    // (D1) GET COORDS OF SELECTED CELL
    let row = this.dataset.row,
      col = this.dataset.col;


    if (mine.board[row][col].r || mine.board[row][col].x) { }

    if (mine.board[row][col].x && mine.board[row][col].m) {
      // user clicks on already marked bomb, do nothing

    }


    else if (!mine.board[row][col].x && mine.board[row][col].m) {
      mine.ongoingRound++;

      this.classList.add("boom");
      await mine.displayModal("This was a mine! You lost one life!")
      mine.numFlagged++;
      document.getElementById('flaggedCells').textContent = mine.numFlagged;
      mine.lives--;
      mine.board[row][col].x = !mine.board[row][col].x;
      document.getElementById('ongoingTurn').textContent = mine.ongoingRound;
      document.getElementById('lives').textContent = mine.lives;

    }
    // (D3) REVEAL SELECTED CELL + ALL EMPTY ADJACENT CELLS
    else {
      // (D3A) FLAGS - WHICH CELLS SHOULD WE AUTOMATICALLY REVEAL?
      mine.ongoingRound++;
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



    }
    let totalFlagged = mine.numFlagged;
    console.log("Total Flagged", totalFlagged);
    if ((mine.rCell == mine.total) && (totalFlagged == mine.total)) {
      won = true;
      // Qualtrics.SurveyEngine.setEmbeddedData('won', won);
      // Qualtrics.SurveyEngine.setEmbeddedData('lives', mine.lives);
      alert("Congratulations! All mines have been identified. Click next to continue.");
      document.getElementById('status').textContent = "You Won!";
      // mine.reset();
      mine.disableClicks();
    }


    else if (mine.lives == 0) {
      setTimeout(function () {
        alert("You lost. Click next to continue");
        document.getElementById('status').textContent = "You Lost!";
        mine.disableClicks();
        // mine.reset();
      }, 1);
    }

    mine.computerTurnRound.forEach(elem => {

      if (mine.numFlagged == elem) {
        mine.autoplay();
      }
    });
  },
  markComp: function (row, col) {
    let time = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;
    if (mine.bombsFoundByComp == mine.totalBombsToIdentify) {
      return [undefined, undefined];
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

          mine.bombsFoundByComp++;
          mine.numFlagged++;

          // mine.changesByComp.push(cell);
          // cell.classList.toggle("mark");
          mine.board[row][col].x = !mine.board[row][col].x;
          let result = mine.bombsFoundByComp;
          return [result, cell];
        }
      }
    }
    let totalFlagged = mine.numFlagged;
    console.log("Total Flagged", totalFlagged);
    if ((mine.rCell == mine.total) && (totalFlagged == mine.total)) {
      won = true;
      // Qualtrics.SurveyEngine.setEmbeddedData('won', won);
      // Qualtrics.SurveyEngine.setEmbeddedData('lives', mine.lives);
      alert("Congratulations! All mines have been identified. Click next to continue.");
      document.getElementById('status').textContent = "You Won!";
      // mine.reset();
      mine.disableClicks();
    }

    else if (mine.lives == 0) {
      setTimeout(function () {
        alert("You lost. Click next to continue");
        document.getElementById('status').textContent = "You Lost!";
        mine.disableClicks();
        // mine.reset();
      }, 1);
    }

    return [undefined, undefined];
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

      let totalFlagged = mine.numFlagged;
      console.log("Total Flagged", totalFlagged);
      if ((mine.rCell == mine.total) && (totalFlagged == mine.total)) {
        won = true;
        // Qualtrics.SurveyEngine.setEmbeddedData('won', won);
        // Qualtrics.SurveyEngine.setEmbeddedData('lives', mine.lives);
        alert("Congratulations! All mines have been identified. Click next to continue.");
        document.getElementById('status').textContent = "You Won!";
        // mine.reset();
        mine.disableClicks();
      }

      else if (mine.lives == 0) {
        setTimeout(function () {
          alert("You lost. Click next to continue");
          document.getElementById('status').textContent = "You Lost!";
          mine.disableClicks();
          // mine.reset();
        }, 1);
      }



    }
  },

  autoplay: async function () {
    mine.disableClicks();
    mine.computerTurnRound.shift();

    let cells = mine.getAllRevealedCells();

    // console.log(cells);
    mine.displayModal("Now, your helper will play for a few rounds.");
    // Check for adjacent Cells and place Flags routine
    document.getElementById('status').textContent = "You are being helped.";

    if (cells.length != 0) {
      await mine.checkAdjacentForFlags(cells);
    }

    // Check if all the mines are correctly identified
    //If not, then open a few cell and run the flag routine again

    while (mine.bombsFoundByComp != mine.totalBombsToIdentify) {
      // All the cells with number
      let flaggedCells = mine.getAllMarkedCells();
      await mine.checkAdjacentForOpening(flaggedCells);
      // Run the flag routine again
      // console.log("STARTING FLAG ROUTINE NOW , ", mine.bombsFoundByComp);
      console.log("BACK IN AUTOPLAYYYYYYYYYYYYYY");
      let markedCells = mine.getAllRevealedCells();
      await mine.checkAdjacentForFlags(markedCells);
    }
    document.getElementById('status').textContent = "You are playing.";
    mine.enableClicks();

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
    jQuery("#modal-text").text("Now, you are in control again");
    jQuery("#myModal").css("display", "block");
    setTimeout(() => { jQuery("#myModal").hide() }, 3000);
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
  checkAdjacentForFlags: async function (cells) {
    // console.log("TOTAL CELLS FOR FLAGS", cells);
    let ROW, COL, NUMBER, adjacentCells, selectedCell, FLAGS, UNOPENED;
    for (let i = 0; i < cells.length; i++) {
      ROW = parseInt(cells[i].dataset.row);
      COL = parseInt(cells[i].dataset.col);
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
          adjacentCells.push(mine.board[lastRow][COL])
          adjacentCells.push(mine.board[lastRow][nextCol])
          // console.log(mine.board[lastRow][lastCol]);
          // console.log(mine.board[lastRow][COL]);
          // console.log(mine.board[lastRow][nextCol]);
          if (mine.board[lastRow][lastCol].x) {
            FLAGS++;
          }
          if (!mine.board[lastRow][lastCol].r) {
            UNOPENED++;
          }

        }
        if (mine.board[lastRow][COL].x) {
          FLAGS++;
        }
        if (!mine.board[lastRow][COL].r) {
          UNOPENED++;
        }
        if (nextCol != -1) {
          if (mine.board[lastRow][nextCol].x) {

            FLAGS++;
          }
          if (!mine.board[lastRow][nextCol].r) {
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
        if (!mine.board[ROW][lastCol].r) {
          UNOPENED++;
        }
      }
      if (nextCol != -1) {
        if (mine.board[ROW][nextCol].x) {
          FLAGS++;
        }
        if (!mine.board[ROW][nextCol].r) {
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
          if (!mine.board[nextRow][lastCol].r) {
            UNOPENED++;
          }
        }
        if (mine.board[nextRow][COL].x) {
          FLAGS++;
        }
        if (!mine.board[nextRow][COL].r) {
          UNOPENED++;
        }
        if (nextCol != -1) {
          if (mine.board[nextRow][nextCol].x) {
            FLAGS++;
          }
          if (!mine.board[nextRow][nextCol].r) {
            UNOPENED++;
          }
        }
      }
      let diff = NUMBER - FLAGS;
      // console.log("NUMBER", NUMBER);
      // console.log("Flags in flagging routing", FLAGS);
      // console.log("Unopened", UNOPENED);
      // console.log("DIFFERENCE (num - flags)", diff);
      // // let ratio = NUMBER / UNOPENED
      // // console.log("Ratio of number to unopened", ratio);
      // console.log("AdjacentCells", adjacentCells);
      // console.log(i);
      if (diff == UNOPENED) {
        await console.log("Placing Flag");
        if (mine.bombsFoundByComp != mine.totalBombsToIdentify)
          await mine.placeFlags(adjacentCells);
      }
      // console.log(selectedCell, "Unopened ", UNOPENED, "FLAGS ", FLAGS);
    };

  },
  placeFlags: async function (adjacentCells) {
    // console.log("Placing Flags with Adjacent Cells", adjacentCells);

    for (let i = 0; i < adjacentCells.length; i++) {
      if (adjacentCells[i] != undefined && (mine.bombsFoundByComp != mine.totalBombsToIdentify)) {
        let itemRow = parseInt(adjacentCells[i].c.dataset.row),
          itemColumn = parseInt(adjacentCells[i].c.dataset.col);
        const [result, cell] = mine.markComp(itemRow, itemColumn);
        // await mine.sleep(mine.time);
        if (result != undefined && cell != undefined) {
          await mine.sleep(mine.time);
          document.getElementById('flaggedCells').textContent = mine.numFlagged;
          cell.classList.toggle("mark");
          jQuery("#modal-text").text(mine.bombsFoundByComp + " flag(s) found");
          jQuery("#myModal").css("display", "block");
          await mine.sleep(2000);
          jQuery("#myModal").hide()
        }

      }
    }

  },
  checkAdjacentForOpening: async function (cells) {
    // console.log("TOTAL CELLS FOR OPENING", cells);
    let ROW, COL, NUMBER, adjacentCells, selectedCell, FLAGS, UNOPENED;
    for (let i = 0; i < cells.length; i++) {
      ROW = parseInt(cells[i].dataset.row);
      COL = parseInt(cells[i].dataset.col);
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
          adjacentCells.push(mine.board[lastRow][COL])
          adjacentCells.push(mine.board[lastRow][nextCol])
          // console.log(mine.board[lastRow][lastCol]);
          // console.log(mine.board[ROW][COL]);
          // console.log(mine.board[lastRow][nextCol]);
          if (mine.board[lastRow][lastCol].x) {
            FLAGS++;
          }
          if (!mine.board[lastRow][lastCol].r) {
            UNOPENED++;
          }

        }
        if (mine.board[lastRow][COL].x) {
          FLAGS++;
        }
        if (!mine.board[lastRow][COL].r) {
          UNOPENED++;
        }
        if (nextCol != -1) {
          if (mine.board[lastRow][nextCol].x) {

            FLAGS++;
          }
          if (!mine.board[lastRow][nextCol].r) {
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
        if (!mine.board[ROW][lastCol].r) {
          UNOPENED++;
        }
      }
      if (nextCol != -1) {
        if (mine.board[ROW][nextCol].x) {
          FLAGS++;
        }
        if (!mine.board[ROW][nextCol].r) {
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
          if (!mine.board[nextRow][lastCol].r) {
            UNOPENED++;
          }
        }
        if (mine.board[nextRow][COL].x) {
          FLAGS++;
        }
        if (!mine.board[nextRow][COL].r) {
          UNOPENED++;
        }
        if (nextCol != -1) {
          if (mine.board[nextRow][nextCol].x) {
            FLAGS++;
          }
          if (!mine.board[nextRow][nextCol].r) {
            UNOPENED++;
          }
        }
      }
      let diff = NUMBER - FLAGS;
      // console.log("NUMBER" NUMBER);
      // console.log("Unopened", UNOPENED);
      // console.log("Flags", FLAGS);
      // console.log("DIFFERENCE (num - flags)", diff);,
      // // let ratio = NUMBER / UNOPENED
      // // console.log("Ratio of number to unopened", ratio);
      // console.log("AdjacentCells", adjacentCells);
      // console.log(i);
      //equal number of flags or no flags

      if (diff == 0 || diff < 0) {
        let res = await mine.openCells(adjacentCells);
        console.log("Opening Cell", res);
        if (res) {
          return;
        }
      }
    };

    console.log("Opening Random Cell");
    let random = true;
    while (random) {
      let row = Math.floor(Math.random() * (mine.height - 1));
      let col = Math.floor(Math.random() * (mine.width - 1));
      await mine.sleep(mine.time);
      if (!mine.board[row][col].m && !mine.board[row][col].r) {
        random = false;
        await mine.openComp(row, col)
        break;
      }

    }
    return;

  },

  openCells: async function (adjacentCells) {
    // console.log("Opening Cells with Adjacent Cells", adjacentCells);

    for (let i = 0; i < adjacentCells.length; i++) {
      // console.log("Gello inside openCells");
      if (adjacentCells[i] != undefined && (mine.bombsFoundByComp != mine.totalBombsToIdentify)) {
        let itemRow = parseInt(adjacentCells[i].c.dataset.row),
          itemColumn = parseInt(adjacentCells[i].c.dataset.col);

        if (!mine.board[itemRow][itemColumn].m && !mine.board[itemRow][itemColumn].r) {

          await mine.sleep(mine.time);
          await mine.openComp(itemRow, itemColumn);
          // jQuery("#modal-text").text("A cell has been opened.");
          // jQuery("#myModal").css("display", "block");
          // await mine.sleep(2000);
          // jQuery("#myModal").hide()
          return true;
        }

      }
    }
    return false;
  },

  displayModal: async function (text) {
    jQuery("#modal-text").text(text);
    jQuery("#myModal").css("display", "block");
    await mine.sleep(2000);
    jQuery("#myModal").css("display", "none");
  },

  getAllRevealedCells: function () {
    let cells = document.getElementsByClassName('reveal');
    // console.log("revealed cells", cells);
    cells = Array.from(cells).filter((el) => {
      if (el.textContent == '1' || el.textContent == '2' || el.textContent == '3'
        || el.textContent == '4' || el.textContent == '5' ||
        el.textContent == '6' || el.textContent == '7') {
        return el;
      }
    });
    return cells;
  },
  getAllMarkedCells: function () {
    let revealedCells = document.getElementsByClassName('reveal');
    let markedCells = document.getElementsByClassName('mark');
    let boomCells = document.getElementsByClassName('boom');
    markedCells = Array.from(markedCells).filter((el) => { return el });
    boomCells = Array.from(boomCells).filter((el) => { return el });
    revealedCells = Array.from(revealedCells).filter((el) => { return el });
    let cells = markedCells.concat(boomCells, revealedCells);
    return cells;
  },

};


window.addEventListener("DOMContentLoaded", mine.reset([1], 3));