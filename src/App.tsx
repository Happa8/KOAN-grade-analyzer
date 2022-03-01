import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider resetCSS>
      <div>test</div>
    </ChakraProvider>
  );
}

export default App;
