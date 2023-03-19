import React, { useRef, useState, useEffect } from "react";
// eslint-disable-next-line
import { GameBackend, getScreen, sleep, randInt, clearScreen, print }
       from "./components/GameBackend";


// Your code here!
const game = async (screen, refresh, keyPress, exit) => {
  // Global game variables.
  let moveDone = 3;
  let rotateDone = false;
  let score = 0;
  let hiscore = 0;
  let chains = 1;
  let crushed = false;
  const colors1 = ["red", "greenyellow", "yellow", "cyan"];
  const colors2 = colors1.concat(["purple", "blue"]);
  let block = {x: 3, y: 0, colors: ["red", "black", "yellow", "cyan"]};
  let nextBlock = {x: 8, y: 3, colors: ["red", "black", "yellow", "cyan"]};
  const piecePos = [[0, 0], [1, 0], [0, 1], [1, 1]];
  var field;


  const setNextBlock = () => {
    const shuffleArray = (array) => {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
    }
    shuffleArray(colors1);
    shuffleArray(colors2);
    if (randInt(0, 5) === 0) {
      nextBlock = {
        x: 8, y: 3,
        colors: [colors2[0], "black", colors2[1], colors2[2]]
      };
    } else {
      nextBlock = {
        x: 8, y: 3,
        colors: [colors1[0], "black", colors1[1], colors1[2]]
      };
    }
    putBlock(nextBlock);
  }

  const initField = () => {
    const field = new Array(14);
    for (let y = 0; y < 13; y++) {
      field[y] = new Array(7);
      for (let x = 0; x < 7; x++) {
        field[y][x] = {
          color: "black", chr: " ",
          visited: false, impacted: false,
          moved: false
        };
      }
    }
    field[13] = Array(7).fill({color: "dummy", chr: " "});
    return field;
  }

  const putPiece = (x, y, col, chr) => {
    print(screen, 13+x*2,   -3+y*2,   chr, "black", col);
    print(screen, 13+x*2+1, -3+y*2,   chr, "black", col);
    print(screen, 13+x*2,   -3+y*2+1, chr, "black", col);
    print(screen, 13+x*2+1, -3+y*2+1, chr, "black", col);
  }

  const printWave = () => {
    print(screen, 13, 0, "~".repeat(14), "red", "black");
    for (let x = 0; x < 7; x++) {
      if (field[1][x].color !== "black") {
        putPiece(x, 1, field[1][x].color, field[1][x].chr);
      }
    }
  }

  const clearCrushed = () => {
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 7; x++) {
        field[y][x].visited = false;
        field[y][x].impacted = false;
        field[y][x].moved = false;
        if (field[y][x].color === "black") {
          putPiece(x, y, "black", " ");
        }
      }
    }
    printWave();
  }

  const putBlock = (block, dx=0, dy=0) => {
    for (let i = 0; i < 4; i++) {  
      const x = block.x + piecePos[i][0];
      const y = block.y + piecePos[i][1];
      if (block.colors[i] !== "black") {
        putPiece(x, y, block.colors[i], " ", dx, dy);
      }
    }
  }

  const delBlock = (block, dx=0, dy=0) => {
    for (let i = 0; i < 4; i++) {  
      const x = block.x + piecePos[i][0];
      const y = block.y + piecePos[i][1];
      if (block.colors[i] !== "black") {
        putPiece(x, y, "black", " ", dx, dy);
      }
    }
    printWave();
  }

  const rotateBlock = () => {
    let rotOk = false;
    for (let i = 0; i < 4; i++) {  
      const x = block.x + piecePos[i][0];
      const y = block.y + piecePos[i][1];
      if (block.colors[i] === "black" && field[y][x].color === "black") {
        rotOk = true;
      }
    }
    if (rotOk) {
      const color0 = block.colors[0];
      block.colors[0] = block.colors[1];
      block.colors[1] = block.colors[3];
      block.colors[3] = block.colors[2];
      block.colors[2] = color0;
    }
  }

  const initGame = async () => {
    // Draw start screen.
    clearScreen(screen);
    for (let y = 0; y < 24; y++) {
      print(screen, 12, y, " ", "white", "chocolate");
      print(screen, 12+15, y, " ", "white", "chocolate");
    }
    print(screen, 13, 0, "~".repeat(14), "red", "black");
    print(screen, 0, 23, " ".repeat(40), "white", "darkblue");
    print(screen, 12, 23, " ".repeat(16), "white", "chocolate");
    print(screen, 15, 8, "PUSH [S]");
    print(screen, 17, 9, "TO START");
    print(screen, 29, 1, "NEXT");
    setNextBlock();
    print(screen, 29, 9, "SCORE");
    print(screen, 30, 10, score.toString().padStart(8, "0"));
    print(screen, 29, 12, "HI-SCORE");
    print(screen, 30, 13, hiscore.toString().padStart(8, "0"));;
    print(screen, 29, 15, "[J]<->[L]");
    print(screen, 29, 17, "[K]:DROP");
    print(screen, 29, 19, "[Z]:ROTATE");

    refresh();
    while (true) {
      if (exit.current) return;
      if (keyPress["s"]) {
        break;
      }
      await sleep(100);
    }
    print(screen, 15, 8, " ".repeat(8));
    print(screen, 17, 9, " ".repeat(8));
    score = 0;
    print(screen, 30, 10, score.toString().padStart(8, "0"));
    field = initField();
    block = structuredClone(nextBlock);
    block.x = 3;
    block.y = 0;
    setNextBlock();
  }


  const _applyImpact = (x, y, color) => {
    if (field[y][x].visited === true) {
      return;
    }
    if (field[y][x].color === "black") {
      field[y][x].visited = true;
    }
    if (field[y][x].color === color) {
      if (field[y][x].chr === " ") {
        field[y][x].chr = "×";
        putPiece(x, y, color, "×");
        field[y][x].visited = true;
      } else if (field[y][x].chr === "×") {
        putPiece(x, y, color, "*");
        field[y][x].chr = " ";
        field[y][x].color = "black";
        field[y][x].visited = true;
        crushed = true;
        print(screen, 1, 5,
              "CHAINS:" + chains.toString().padStart(3, "0"));
        score += 10 * chains;
        if (score > hiscore) {
          hiscore = score;
        }
      }
      for (let dy = -1; dy < 2; dy++) {
        for (let dx = -1; dx < 2; dx++) {
          if (x+dx >= 0 && x+dx < 7 && y+dy >= 1 && y+dy < 13) {
            _applyImpact(x+dx, y+dy, color);
          }
        }
      }
    }
  }

  const applyImpact = () => {
    for (let y = 1; y < 13; y++) {
      for (let x = 0; x < 7; x++) {
        if (field[y][x].impacted) {
          _applyImpact(x, y, field[y][x].color);
        }
      }
    }
    print(screen, 30, 10, score.toString().padStart(8, "0"));
    print(screen, 30, 13, hiscore.toString().padStart(8, "0"));
  }

  const flashPiece = async () => {
    for (let i = 0; i < 4; i++) {
      for (let y = 1; y < 13; y++) {
        for (let x = 0; x < 7; x++) {
          if (field[y][x].impacted) {
            if (i % 2 === 0) {
              putPiece(x, y, "white", " ");
            } else {
              putPiece(x, y, field[y][x].color, " ");
            }
          }
        }
      }
      await refresh();
      await sleep(50);
    }
  }

  const placeBlock = async () => {
    let impacted = false;
    for (let i = 0; i < 4; i++) {
      if (block.colors[i] !== "black") {
        const x = block.x + piecePos[i][0];
        const y = block.y + piecePos[i][1];
        field[y][x].color = block.colors[i];
        if (block.colors[i] === field[y+1][x].color) {
          impacted = true;
          field[y][x].impacted = true;
        }
      }
    }
    if (impacted) {
      await flashPiece();
      applyImpact();
      await refresh();
      await sleep(400);
    }        
    clearCrushed();
    await refresh();
  }

  const dropPieces = async () => {
    // Drop animation
    let impacted = false;
    let dropped = false;
    for (let i = 0; i < 13; i++) {
      let moved = false;
      for (let y = 12; y > i; y--) {
        for (let x = 0; x < 7; x++) {
          field[y][x].moved = false;
          if (field[y][x].color === "black" &
              field[y-1][x].color !== "black") {
            moved = true;
            dropped = true;
            field[y][x].color = field[y-1][x].color;
            field[y][x].chr = field[y-1][x].chr;
            field[y][x].moved = true;
            field[y-1][x].color = "black";
            field[y-1][x].chr = " ";
            putPiece(x, y-1, "black", " ");
            putPiece(x, y, field[y][x].color, field[y][x].chr);
            if (field[y+1][x].moved === false &
                field[y+1][x].color === field[y][x].color) {
                  impacted = true;
                  field[y][x].impacted = true;
                  putPiece(x, y, "white", " ");
            }
          }
        }
      }
      if (moved) {
        printWave();
        await refresh();
        await sleep(10);
      } else {
        break;
      }
    }

    if (impacted) {
      await flashPiece();
      applyImpact();
    }        
    await refresh();
    await sleep(400);
    clearCrushed();
    return dropped;
  }

  const _moveBlock = (dx) => {
    let moveOk = true;
    for (let i = 0; i < 4; i++) {
      const x = block.x + piecePos[i][0];
      const y = block.y + piecePos[i][1];
      if (block.colors[i] !== "black" && field[y][x+dx].color !== "black") {
        moveOk = false;
      }
    }        
    if (moveOk) {
      block.x += dx;
    }
  }

  const moveBlock = async () => {
    delBlock(block);
    if (keyPress["j"] && block.x > 0) {
      if (moveDone === 0) {
        _moveBlock(-1);
        moveDone = 4;
      } else {
        moveDone = Math.max(0, moveDone - 1);
      }
    } else if (keyPress["l"] && block.x < 5) {
      if (moveDone === 0) {
        _moveBlock(+1);
        moveDone = 4;
      } else {
        moveDone = Math.max(0, moveDone - 1);
      }
    } else {
      moveDone = 0;
    }
    if (keyPress["z"]) {
      if (rotateDone === false) {
        rotateBlock();
        rotateDone = true;
      }
    } else {
      rotateDone = false;
    }
    putBlock(block);
    await refresh();
  }

  const downBlock = async () => {
    let hitPiece = false;
    for (let i = 0; i < 4; i++) {
      const x = block.x + piecePos[i][0];
      const y = block.y + piecePos[i][1];
      if (block.colors[i] !== "black" && field[y+1][x].color !== "black") {
        hitPiece = true;
      }
    }
    if (hitPiece) {
      chains = 1;
      crushed = false;
      await placeBlock();
      if (crushed) {
        chains += 1;
      }
      let dropped = true;
      while (dropped) {
        crushed = false;
        dropped = await dropPieces();
        if (crushed) {
          chains += 1;
        }
      }

      // game over?
      for (let x = 0; x < 7; x++) {
        if (field[1][x].color !== "black") {
          finished = true;
        }
      }

      // start next block
      if (finished === false) {
        block = structuredClone(nextBlock);
        block.x = 3;
        block.y = 0;
        setNextBlock();
      }
    } else {
      delBlock(block);
      block.y += 1;
      putBlock(block);
    }
  }

  const gameover = async () => {
    print(screen, 14, 10, " GAME  OVER ", "black", "white");
    await refresh();
    await sleep(5000);
  }


  // main loop
  var finished;
  while (true) {
    finished = false;
    await initGame();
    while (!finished) {
      if (exit.current) return;
      let loops = Math.floor(16*Math.exp(-score/1000))+4;
      for (let i = 0; i < loops; i++) {
        await moveBlock();
        await refresh();
        await sleep(10);
        if (keyPress["k"]) break;
      }
      await downBlock();
      await refresh();
    }
    await gameover();
  }
}


export const Main = (props) => {
  // Define keys used in the game.
  const keys = ["s", "z", "j", "l", "k"];

  // The following part is a fixed boilarplate. Just leave as is.
  const xSize = 40;
  const ySize = 24;
  const screenRef = useRef(getScreen(xSize, ySize));
  const screen = screenRef.current;
  const exit = useRef(false);
  const keyPressRef = useRef({});
  const keyPress = keyPressRef.current;
  // eslint-disable-next-line
  const [dummyState, setDummyState] = useState([]);
  const refresh = () => { setDummyState([]); }

  useEffect(
    () => {
      game(screen, refresh, keyPress, exit);
      return () => exit.current = true;
    }, [screen, keyPress]
  );

  const element = (
    <GameBackend keys={keys} keyPress={keyPress} screen={screen}/>
  );

  return element;
}
