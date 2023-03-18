import React from "react";
import { useKey } from 'react-use';

import { Screen } from "./Screen";


export const getScreen = (xSize, ySize) => {
  const screen = new Array(ySize);
  for (let y = 0; y < ySize; y++) {
    screen[y] = new Array(xSize);
    for (let x = 0; x < xSize; x++) {
      screen[y][x] = {
        char: "", color: "white", bgColor: "black"
      };
    }
  }
  return screen;
}

export const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

export const clearScreen = (screen) => {
  const ySize = screen.length;
  const xSize = screen[0].length;
  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      screen[y][x].char = "";
      screen[y][x].color = "white";
      screen[y][x].bgColor = "black";
    }
  }
}

export const print = (screen, x, y, str, color="white", bgColor="black") => {
  const ySize = screen.length;
  const xSize = screen[0].length;
  str = String(str).replace(/[!-~]/g, (all) => {
		return String.fromCharCode(all.charCodeAt(0) + 0xFEE0);
	});
  for (let dx = 0; dx < str.length; dx++) {
    if (x >=0 && x < xSize && y >=0 && y < ySize) {
      screen[y][x+dx].char = str.slice(dx, dx+1);
      screen[y][x+dx].color = color;
      screen[y][x+dx].bgColor = bgColor;
    }
  }
}

const KeyHandler = (props) => {
  const key = props.button;
  const keyPress = props.keyPress;
  const keyDown = (key) => {
    keyPress[key] = true;
  }
  const keyUp = (key) => {
    keyPress[key] = false;
  }
  useKey(key, () => keyDown(key), {event: "keydown"});
  useKey(key, () => keyUp(key), {event: "keyup"});
  return null;
}


export const GameBackend = (props) => {
  const screen = props.screen;
  // eslint-disable-next-line
  const keyPress = props.keyPress;
  const keys = props.keys;

  // Key event handlers
  const keyHooks = [];
  for (const key of keys) {
    keyHooks.push(
      <KeyHandler button={key} keyPress={keyPress} key={key}/>
    );
  }
  const element = (
    <>
      <Screen screen={screen}/>
      {keyHooks}
    </>
  );

  return element;
}
