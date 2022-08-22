import type { GetStaticProps, NextPage } from "next";
import styles from "@styles/Home.module.css";
import prisma from "@utils/prisma";
import { CommitmentPoolProps } from "@utils/types";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { PoolListItem } from "@components/PoolListItem";
import React from "react";
import { generateNewKeyPairBigInt } from "../utils/crypto";
import { signIn, signOut, useSession } from "next-auth/react";

type Props = {
  pools: CommitmentPoolProps[];
};

const Home: NextPage<Props> = ({ pools }) => {
  React.useEffect(() => {
      console.log(generateNewKeyPairBigInt());
  }, []);
  const { data: session, status } = useSession();

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <h1 className={styles.title}>Welcome to Power in Numbers!</h1>
        <Text className={styles.description}>
          Active Commitment Pools
        </Text>
        {!session &&
          <Button size="lg" variant="ghost" onClick={() => signIn()}>
            Login
          </Button>
        }
        {session &&
          <HStack>
            <Text>
              Signed in as {session?.user?.name}
            </Text>
            <Button size="lg" variant="ghost" onClick={() => signOut()}>
              Log out
            </Button>
          </HStack>
        }
        <VStack maxHeight="500px" overflow="scroll" marginBottom={8}>
          {pools.map((pool, idx) => (
            <PoolListItem key={idx} pool={pool} />
          ))}
        </VStack>
        <Link href="/pool/create">
          <Button>Create Commitment Pool</Button>
        </Link>
      </Box>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const pools = await prisma.commitmentPool.findMany({});
  return {
    props: { pools: JSON.parse(JSON.stringify(pools)) },
    revalidate: 10,
  };
};

export default Home;
