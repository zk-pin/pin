import {
  Button,
  Flex,
  HStack,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Image as ChakraImage } from "@chakra-ui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { checkCachedSignerData } from "@utils/api";
import { useEffect, useRef, useState } from "react";
import { getCachedSignerData } from "@utils/dexie";

export const NavBar = () => {
  const router = useRouter();
  const toast = useToast();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const loadingCachedSigned = useRef(true);

  const { data: session, status } = useSession();

  console.log("session nav: ", session);
  const cachedSigner = useLiveQuery(async () => {
    if (!session) {
      console.log("no session");
      return;
    }

    // @ts-ignore TODO:
    const signerData = await getCachedSignerData(session.user.id);

    //initial load, cache has not yet been created for this user.id
    if (!signerData && loadingCachedSigned.current) {
      console.log("first use live query setting the cache");
      await checkCachedSignerData(signerData, session, toast);
    }

    loadingCachedSigned.current = false;
    return signerData;
  }, [session, session?.user]);

  const signInTwitter = () => {
    signIn();
  };

  const refreshData = () => {
    router.replace(router.asPath);
  };

  useEffect(() => {
    if (loadingCachedSigned.current) {
      console.log("current is loading");
      return;
    }
    if (session) {
      console.log(
        "session is valid and loading cache in useEffect: ",
        loadingCachedSigned.current
      );
      const newKeyIssued = checkCachedSignerData(cachedSigner, session, toast);
      if (newKeyIssued) {
        refreshData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, cachedSigner]);

  return (
    <Flex
      as="header"
      position="fixed"
      alignContent="space-evenly"
      justifyContent="space-between"
      w="100%"
      p={2}
      px={4}
      backdropFilter="saturate(150%) blur(20px)"
      zIndex={100}
    >
      <Link href="/">
        <Button size="lg">Home</Button>
      </Link>
      {status === "loading" && (
        <Button size="lg" rightIcon={<Spinner />}>
          Login
        </Button>
      )}
      {!session && status !== "loading" && (
        <Button
          size="lg"
          onClick={() => signInTwitter()}
          isActive={isActive("/signup")}
        >
          Login
        </Button>
      )}
      {session && (
        <HStack>
          <HStack>
            <ChakraImage
              alt={`${session.user?.name}'s profile picture`}
              src={session.user?.image || ""}
              width={10}
              height={10}
              borderRadius={"50%"}
            />
            <Text fontWeight="bold">Hi {session?.user?.name}</Text>
          </HStack>
          <Button size="lg" variant="ghost" onClick={() => signOut()}>
            Log out
          </Button>
        </HStack>
      )}
    </Flex>
  );
};
