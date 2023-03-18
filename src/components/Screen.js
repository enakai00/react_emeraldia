import React from "react";
import { Box } from "@chakra-ui/react";

import display from "../assets/display.png";


const Cell = (props) => {
  const x = 26 + 20 * props.pos_x;
  const y = 22 + 20 * props.pos_y;

  const style = {
    position: "absolute",
    margin: 0,
    padding: 0,
    textAlign: "center",
    width: "20px",
    height: "20px",
    left: x,
    top: y,
    color: props.elem.color,
    backgroundColor: props.elem.bgColor,
    fontSize: "12pt",
    fontWeight: "bold",
    fontFamily: "monospace",
  };

  const element = (
    <div style={style}>{props.elem.char}</div>
  );
  return element;
}


export const Screen = (props) => {
  const screen = props.screen;
  const ySize = screen.length;
  const xSize = screen[0].length;

  const screenElement = [];
  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      screenElement.push(
        <Cell key={x.toString()+":"+y.toString()}
              pos_x={x} pos_y={y} elem={screen[y][x]}/>
      );
    }
  }

  const w = 20*40 + 50;
  const h = 20*24 + 50;
  const style = {
    position: "relative",
    width: w,
    height: h,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundImage: `url(${display})`,
    backgroundSize: "100.4% 101.4%"
  };

  const element = (
      <Box style={style}>
        {screenElement}
      </Box>
  );

  return element;
}
