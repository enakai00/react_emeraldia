import React, { useState } from "react";
import { Container, Stack, Box, Button } from "@chakra-ui/react";

import { Main } from "../Main";


export const Layout = (props) => {
  const [gameID, setGameID] = useState(new Date().getTime());

  const reset = () => {
    setGameID(new Date().getTime());
  }

  const element = (
    <Container maxW='1000' paddingTop="5">
      <Stack spacing="1">
        <Box>
          <Main key={gameID}/>
        </Box>
      <Box>
        <Button colorScheme="red" size="sm"
                onClick={reset}>Reset</Button>
      </Box>
      </Stack>
    </Container>
  );

  return element;
}
