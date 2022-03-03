import { Box, Center, ChakraProvider, VStack } from "@chakra-ui/react";
import Home from "./home";
import theme from "./theme";

function App() {
  return (
    <ChakraProvider theme={theme} resetCSS>
      <VStack w="100%" minH="100vh" bgColor={"gray.50"}>
        <Box maxW={1200} w="100%" p={4}>
          <Home />
        </Box>
      </VStack>
    </ChakraProvider>
  );
}

export default App;
