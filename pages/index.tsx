import type { GetStaticProps, NextPage } from "next";
import styles from "@styles/Home.module.css";
import prisma from "@utils/prisma";
import { CommitmentPoolProps } from "@utils/types";
import { signIn, useSession } from "next-auth/react";
import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Image as ChakraImage,
} from "@chakra-ui/react";
import Link from "next/link";
import { PoolListItem } from "@components/PoolListItem";
import { useEffect } from "react";
import { updateUserPublicKey } from "../utils/api";
import { Keypair } from "maci-domainobjs";
import { serializePubKey } from "@utils/crypto";
import { useLiveQuery } from "dexie-react-hooks";
import { addSignerDataToCache, getCachedSignerData } from "@utils/dexie";
import sha256 from "crypto-js/sha256";

type Props = {
  pools: CommitmentPoolProps[];
};

const Home: NextPage<Props> = ({ pools }) => {
  const { data: session } = useSession();
  const cachedSigner = useLiveQuery(
    async () => {
      if (!session) { return; }
      // @ts-ignore TODO:
      const signerData = await getCachedSignerData(sha256(session.user.id).toString());
      return signerData;
    }, [session]);

  //TODO: double hacky this is duplicated in [id]
  useEffect(() => {
    if (!session) {
      return;
    }
    //TODO: hacky fix to use globalComittmentPool
    //TODO: make more secure or encrypt or ask to store offline
    if (
      session?.user && !cachedSigner?.privateKey
    ) {
      const newPair = new Keypair();
      // @ts-ignore TODO:
      addSignerDataToCache(sha256(session.user.id).toString(), serializePubKey(newPair), newPair.privKey.rawPrivKey.toString());

      // @ts-ignore TODO:
      updateUserPublicKey(session.user.id, serializePubKey(newPair));
    }
  }, [cachedSigner?.privateKey, session]);

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <h1 className={styles.title}>Welcome to Power in Numbers!</h1>
        <Text fontWeight="bold" className={styles.description}>
          Active Commitment Pools
        </Text>
        {!session && (
          <Button size="lg" variant="ghost" onClick={() => signIn()}>
            Login
          </Button>
        )}
        {session && (
          <HStack marginBottom={4}>
            <ChakraImage
              alt={`${session.user?.name}'s profile picture`}
              src={session.user?.image || ""}
              width={10}
              height={10}
              borderRadius={"50%"}
            />
            <Text fontWeight="bold">Signed in as {session?.user?.name}</Text>
          </HStack>
        )}
        <VStack maxHeight="500px" overflow="scroll" marginBottom={8}>
          {pools.map((pool, idx) => (
            <PoolListItem key={idx} pool={pool} />
          ))}
        </VStack>
        <Link href="/create">
          <Button>Create Commitment Pool</Button>
        </Link>
      </Box>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const pools = await prisma.commitmentPool.findMany({
    include: {
      signatures: true,
    }
  });
  return {
    props: { pools: JSON.parse(JSON.stringify(pools)) },
    revalidate: 10,
  };
};

export default Home;
