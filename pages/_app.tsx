import '../styles/globals.css'
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';

/* Theming */
const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontFamily: "Apple Garamond, serif",
        fontWeight: 'normal',
      },
    },
  },
  styles: {
    global: {
      a: {
        _hover: {
          textDecoration: 'underline',
        },
      },
      h1: {
        fontSize: '4xl',
        fontWeight: 'bold',
      },
      h2: {
        fontSize: '2xl',
        fontWeight: 'bold',
      },
      h3: {
        fontSize: 'lg'
      },
      h4: {
        fontSize: 'md'
      },
    },
  },
})

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default App
