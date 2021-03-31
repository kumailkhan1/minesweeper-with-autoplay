function findAdjacent(row,column)

for (let row = row; row < mine.height; row++) {
    let lastRow = row - 1,
      nextRow = row + 1;
    if (nextRow == mine.height) { nextRow = -1; }

    // LOOP THROUGH CELLS OF EACH ROW
    for (let col = column; col < mine.width; col++) {
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