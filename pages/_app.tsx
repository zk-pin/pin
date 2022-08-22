import '../styles/globals.css'
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { NavBar } from '@components/core/Navbar';
import Footer from '@components/core/Footer';
import { Meta } from '@components/core/Meta';

/* Auth */
import { SessionProvider } from 'next-auth/react';

/* Theming */
const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
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
    <>
      <Meta />
      <SessionProvider session={pageProps.session}>
        <ChakraProvider theme={theme}>
          <NavBar />
          <Component {...pageProps} />
          <Footer />
        </ChakraProvider>
      </SessionProvider>
    </>
  )
}

export default App
