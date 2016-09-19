class Tetris {
  constructor(row = 16, col = 14, ticks = 500) {
    this.row = row;
    this.col = col;

    //Game loop interval time
    this.ticks = ticks;

    //We have 7 types of blocks
    this.blocks = [
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ],
      [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
      ]];

      //Keep current block that we can control it
      this.currentblock = this.blocks[0][0];
  }

  //Initialize and reset
  init() {
    this.gameOver = false;
    this.pos = {'x': 0, 'y': 0};

    //Init our board like a matrix
    this.board = [];

    //Just add an empty row on the end to avoid of out of range and the block movement
    for (let i=0; i<this.row +1 ; i++) {
      this.board.push([]);
    }

    //Fill default board with 0 and set the border on the left/right/bottom
    for (let i=0; i<this.row; i++) {
      for (let j=0; j<this.col; j++) {
        if (j === 0 || j >= this.col-1 || i >= this.row-1)  // Leave an empty line on board
          this.board[i][j] = -1;
        else
          this.board[i][j] = 0;
      }
    }

  }

  //Return the board as text content
  drawBoard() {
    var content = '';

    //Check if game is over then return the GameOver content
    if (this.gameOver) {
      content = 'Game Over\n `Esc` back to menu'; //Display just a simple 'Game Over' text
    } else {
      content = '';

      for (let i=0; i<this.row; i++) {
        for (let j=0; j<this.col; j++) {
          let c = '';
          if (this.board[i][j] === 0) //Empty cell
            c = ' ';
          else if (this.board[i][j] === 1) //Filled with block
            c = '#';
          else if (this.board[i][j] === -1)  //left and right border
            c = '@';

          content += c;
        }
        content += '\n';
      }

      content += ' Left, Right \n Down, Space';
    }
    //Write the board directly to the output tag(With this we can call draw from every wehre)
    if (this.output)
      this.output.innerHTML = content;

    return content;
  }

  //Create new block from the existing list of blocks
  createBlock() {
    this.pos = {
      'x': Math.round(this.col / 2 - 2),
      'y': 0
    };

    this.currentBlock = this.blocks[Math.floor(Math.random() * 7)];

    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        this.board[i][j + this.pos.x] += this.currentBlock[i][j];

        if (this.board[i][j + this.pos.x] > 1) {
          this.gameOver = true;
          return;
        }
      }
    }

    this.drawBoard();
  }

  addRemoveBlock(removePos = this.pos, addPos = this.pos, removeBlock = null) {
    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        if (removeBlock)
          this.board[i + removePos.y][j + removePos.x] -= removeBlock[i][j];
        else if (removePos)
          this.board[i + removePos.y][j + removePos.x] -= this.currentBlock[i][j];

        if (addPos)
        this.board[i + addPos.y][j + addPos.x] += this.currentBlock[i][j];
      }
    }
  }

  // Check if block is on the edge or filled cell then move is over
  canMove(x = 0, y = 0) {
    this.addRemoveBlock(this.pos, null);

    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        if (this.currentBlock[i][j]) {
          if(this.board[i + y][j + x] != 0) {
            this.addRemoveBlock(null);
            return false;
          }
        }
      }
    }

    return true;
  }

  //Move the block to incoming position
  moveBlock(x, y) {
    let pos = {
      'x': (this.pos.x + x),
      'y': (this.pos.y + y)
    };

    if (this.canMove(pos.x, pos.y)) {
      this.addRemoveBlock(null, pos);
      this.pos = pos;
      this.drawBoard();

      return true;
    } else {
      return false;
    }
  }

  //Turn the block ClockWise
  turnBlock() {
    //Keep a copy of tha current block
    let tmp = [];
    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        tmp.push([]);
        tmp[i][j] = this.currentBlock[i][j];
      }
    }

    // Rotate the block and store it in current block
    for (let i=0; i<4; i++) {
      for (let j=0; j<4; j++) {
        this.currentBlock[i][j] = tmp[3-j][i];
      }
    }
    this.addRemoveBlock(this.pos, this.pos, tmp);
    if (!this.canMove(this.pos.x, this.pos.y)) {
      this.addRemoveBlock(this.pos, null, this.currentBlock);
      this.currentBlock = tmp;
    }

    this.addRemoveBlock(null);
    this.drawBoard();
  }

  // Remove the line and shift all the board one line down
  removeLine(row) {
    // this.board[row] = [];
    for (let i=row; i>0; i--) {
      for (let j=1; j<this.col; j++) {
        this.board[i][j] = this.board[i-1][j];
      }
    }
    this.drawBoard();
  }

  // Check board line by line if any line is full then shift the board down to remove that line
  checkLine() {
    let i = 0;

    for (i=0; i<this.row-1; i++) {
      let isFull = true;

      for (let j=1; j<this.col; j++) {
        if (this.board[i][j] == 0) {
          isFull = false;
          break;
        }
      }

      if (isFull) {
        this.removeLine(i);
        i--;  // Recheck current line
      }
    }
  }

  //Get event and check the keyCode to move the current block
  controlBlock(keyname) {
    //Move Right
    if (keyname == 'right') {
        this.moveBlock(1, 0);
    }

    //Move Left
    if (keyname == 'left') {
        this.moveBlock(-1, 0);
    }

    //Move Down
    if (keyname == 'down') {
        this.moveBlock(0, 1);
    }

    //Turn the block
    if (keyname == 'space') {
      this.turnBlock();
    }

    // Back to menu
    if (keyname == 'escape') {

    }

    // Start game
    if (keyname == 'return') {
      if (!this.gameLoopHandler) {
        this.init();
        this.createBlock();

        this.gameLoopHandler = setInterval(() => {
          if (this.gameOver) {
            this.drawBoard();
            clearInterval(this.gameLoopHandler);
            this.gameLoopHandler = null;
          }

          //Make Block if move it can if not then check filled row and create new block
          if (!this.moveBlock(0, 1)) {
            this.checkLine();
            this.createBlock();
          }
        }, this.ticks);

      }
    }

  }

  static play () {
    let game = new Tetris();

    //Check if can access to document(Run inside browser)
    if(typeof(document) !== 'undefined') {
      var menuHandler = null; //Menu handler to settimeout
      var gameLoopHandler = null; //GameLoop Handler for setinterval
      game.output = document.querySelector('#view');  //Main output section

      //Blink start text like menu
      function showMenu(show=true) {
        if (typeof(document) !== 'undefined') {
          let startText = document.querySelector('#startText');
          if (show) {
            if (startText) {
              startText.style.color = startText.style.color== 'gray' ? 'black':'gray';
            } else {
              startText = document.createElement('h3');
              startText.id = 'startText';
              startText.innerHTML = 'Press Enter to start game';
              view.innerHTML = '';
              view.appendChild(startText);
            }

            menuHandler = setTimeout(showMenu, 500);
          } else {
            clearTimeout(menuHandler);
            menuHandler = null;
            startText.remove();
          }
        }
      }
      // showMenu();

      document.addEventListener('keydown', function (event) {
        let keyname = '';

        switch (event.keyCode) {
          case 13:
            keyname = 'return';
            break;
          case 27:
            keyname = 'escape';
            break;
          case 32:
            keyname = 'space';
            break;
          case 39:
            keyname = 'right';
            break;
          case 37:
            keyname = 'left';
            break;
          case 40:
            keyname = 'down';
            break;
        }

        game.controlBlock(keyname);

        //Stop gameloop and show the menu with ESC key
        if (event.keyCode == '27') {
          if (gameLoopHandler) {
            clearInterval(gameLoopHandler);
            gameLoopHandler = null;
          }
        }

        if(gameLoopHandler)
          game.controlBlock(event.keyCode);

      });

    }
  }
}

// Use this just for test control on Node.js
if (typeof(document) === 'undefined') {
  console.log('hello from node.js');
  // Active keypress event and check it
  var readline = require('readline');

  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY)
    process.stdin.setRawMode(true);

  process.stdin.on('keypress', (chunk, key) => {
    process.stdout.write(`key: ${key.name}`);
    if(key && key.name == 'q') {
      process.stdout.write('\nQuit, come back again ;-)\n');
      process.exit();
    }
  });
}
