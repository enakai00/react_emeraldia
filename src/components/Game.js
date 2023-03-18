import React, { useRef, useState, useEffect } from "react";
import { GameBackend, toZenkaku, getScreen,
         sleep, randInt, clearScreen, print } from "./GameBackend";


const game = async (screen, refresh, keyPress) => {
  // Global game variables.
  const shooter = {}
  const spaceships = new Array(3);
  const asteroids = new Array(5);

  const initGame = async () => {
    shooter.x = 18;
    shooter.score = 0;
    for (let i = 0; i < spaceships.length; i++) {
      spaceships[i] = {x: randInt(0, 36), y: randInt(-10, 0)}
    }
    for (let i = 0; i < asteroids.length; i++) {
      asteroids[i] = {x: randInt(0, 40), y: randInt(-23, 0)}
    }

    clearScreen(screen);
    print(screen, 4, 0, "ＳＣＯＲＥ： " + toZenkaku(shooter.score.toString()));
    print(screen, 0, 23, " ".repeat(40), "white", "white");
    for (let y = 21; y > 18; y--) {
      print(screen, shooter.x+1, y, " ", "white", "blue");
    }
    print(screen, shooter.x-7, 19, "　ＢＥＡＭ［Ｚ］");
    print(screen, shooter.x-5, 22,   "［Ｊ］＜＝┏┻┓＝＞［Ｌ］ ");
    print(screen, 12, 10, "ＨＩＴ　［Ｓ］　ＴＯ　ＳＴＡＲＴ");
    refresh();
    while (true) {
      if ( keyPress["s"] ) {
        break;
      }
      await sleep(100);
    }
    clearScreen(screen);
    print(screen, 0, 23, " ".repeat(40), "white", "white");
  }

  const shooterMove = async () => {
    let x = shooter.x;
    let y = 22;
    if ( keyPress["z"] ) {
      shooter.score -= 10;
      if ( shooter.score < 0 ) {
        shooter.score = 0;
      }
      for (let yy = y-1; yy > 0; yy--) {
        print(screen, x+1, yy, " ", "white", "blue");
        await refresh();
      }
      await sleep(100);
      for (let yy = y-1; yy > 0; yy--) {
        print(screen, x+1, yy, " ");
        await refresh();
      }
      for (let i = 0; i < spaceships.length; i++) {
        let xx = spaceships[i].x;
        let yy = spaceships[i].y;
        if (yy > 0 && x+1 === xx+2) {
          shooter.score += 100;
          print(screen, xx, yy, "※※※※※", "blue", "red");
          await refresh();
          await sleep(500);
          print(screen, xx, yy, "     ");
          spaceships[i] = {x: randInt(0, 36), y: 1}
        }          
      }
    }

    print(screen, x, y, "   ");
    if ( keyPress["l"]) {
      if ( x < 37 && screen[y+1][x+3].bgColor === "white") {
        x += 1;
      }
    }
    if ( keyPress["j"] ) {
      if ( x > 0 && screen[y+1][x-1].bgColor === "white") {
        x -= 1;
      }
    }
    print(screen, x, y, "┏┻┓");
    shooter.x = x;
  }

  const asteroidsMove = async () => {
    for (let i = 0; i < asteroids.length; i++) {
      let x = asteroids[i].x;
      let y = asteroids[i].y;
      print(screen, x, y, " ");
      y += 1;
      if ( y === 23 ) {
        y = 0;
      }
      x += randInt(-1, 2);
      if ( x < 0 ) {
        x = 39;
      }
      if ( x > 39 ) {
        x = 0;
      }
      if ( y > 0 ) {
        print(screen, x, y, "＊");
      }
      if ( y === 22 ) {
        if ( x >= shooter.x && x <= shooter.x+2 ){
          gameover = true;
        }
      }
      asteroids[i].x = x;
      asteroids[i].y = y;
    }
  }

  const spaceshipsMove = async () => {
    for (let i = 0; i < spaceships.length; i++) {
      let x = spaceships[i].x;
      let y = spaceships[i].y;
      print(screen, x, y, "     ");
      if (randInt(0, 5) === 0) {
        y += 1;
      }
      x += randInt(-1, 2);
      if ( x < 0 ) {
        x = 0;
      }
      if ( x > 35 ) {
        x = 35;
      }
      if ( y > 0 ) {
        print(screen, x, y, "（＝＠＝）");
      }
      spaceships[i].x = x;
      spaceships[i].y = y;
      if ( y === 22 ) {
        print(screen, x, y, "ｗｗｗｗｗ", "black", "red");
        print(screen, x, y+1, "     ", "white", "red");
        for (let yy = y-1; yy > 0; yy--) {
          print(screen, x, yy, "     ", "white", "red");
          await refresh();
        }
        await sleep(500);
        for (let yy = y+1; yy > 0; yy--) {
          print(screen, x, yy, "     ");
          await refresh();
        }
        if ( x + 4 >= shooter.x && x <= shooter.x + 2 ) {
          gameover = true;
        }
        spaceships[i] = {x: randInt(0, 36), y: 1}
      }
    }
  }

  // game main
  var gameover;
  while (true) {
    gameover = false;
    await initGame();
    while (!gameover) {
      await shooterMove();
      await asteroidsMove();
      await spaceshipsMove();
      print(screen, 0, 0, " ".repeat(40));
      print(screen, 4, 0, "ＳＣＯＲＥ： " + toZenkaku(shooter.score.toString() + "      "));
      await refresh();
      await sleep(100);
    }
    print(screen, shooter.x, 22, "WWW", "black", "red");
    print(screen, 15, 10, "　ＧＡＭＥ　ＯＶＥＲ　", "black", "white");
    await refresh();
    await sleep(5000);
  }
}


export const Game = (props) => {
  // Define keys used in the game.
  const keys = ["s", "z", "j", "l"];

  // The following part is a fixed boilarplate. Just leave as is.
  const xSize = 40;
  const ySize = 24;
  const screenRef = useRef(getScreen(xSize, ySize));
  const screen = screenRef.current;
  const keyPressRef = useRef({});
  const keyPress = keyPressRef.current;
  // eslint-disable-next-line
  const [dummyState, setDummyState] = useState([]);
  const refresh = () => { setDummyState([]); }

  useEffect(
    () => {game(screen, refresh, keyPress)}, [screen, keyPress]
  );

  const element = (
    <GameBackend keys={keys} keyPress={keyPress} screen={screen}/>
  );

  return element;
}
