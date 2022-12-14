/* eslint-disable @next/next/no-sync-scripts */
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { theme as chakraTheme } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import Footer from "@components/core/Footer";
import { Meta } from "@components/core/Meta";

/* Auth */
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import { NavBar } from "../components/core/Navbar";

/* Theming */
const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: 0,
      },
      variants: {
        solid: {
          borderWidth: 1,
          backgroundColor: "gray.50",
          borderColor: "gray.500",
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 0,
          borderColor: "gray.800",
          _hover: {
            borderColor: "primary.foreground",
          },
        },
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: 0,
        borderColor: "gray.800",
        _hover: {
          borderColor: "primary.foreground",
        },
      },
    },
    NumberInput: {
      baseStyle: {
        field: {
          borderRadius: "none",
          borderColor: "gray.800",
          _hover: {
            borderColor: "primary.foreground",
          },
        },
        stepper: {
          borderRadius: "none",
          borderColor: "gray.800",
          _hover: {
            borderColor: "primary.foreground",
          },
        },
      },
    },
  },
  fonts: {
    ...chakraTheme.fonts,
    body: `monospace`,
    heading: `monospace`,
  },
  styles: {
    global: {
      a: {
        _hover: {
          textDecoration: "underline",
        },
      },
      h1: {
        fontSize: "4xl",
        fontWeight: "bold",
      },
      h2: {
        fontSize: "2xl",
        fontWeight: "bold",
      },
      h3: {
        fontSize: "lg",
      },
      h4: {
        fontSize: "md",
      },
    },
  },
});

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Meta />
      <SessionProvider session={session} refetchInterval={5 * 60}>
        <ChakraProvider theme={theme}>
          <Head>
            <script src="/snarkjs.min.js" />
          </Head>
          <NavBar />
          <Component {...pageProps} />
          <Footer />
        </ChakraProvider>
      </SessionProvider>
    </>
  );
}

export default App;
