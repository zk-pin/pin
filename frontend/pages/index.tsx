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
  Image as ChakraImage,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { PoolList } from "@components/PoolListItem";
import { NavBar } from "../components/core/Navbar";

type Props = {
  pools: CommitmentPoolProps[];
};

const Home: NextPage<Props> = ({ pools }) => {
  const { data: session } = useSession();

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <VStack gap={2}>
          <h1 className={styles.title}>Welcome to Power in Numbers!</h1>
          {!session && (
            <Button size="lg" onClick={() => signIn()}>
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
          <Text fontWeight="bold" className={styles.description}>
            Active Commitment Pools
          </Text>
          {session && (
            <Link href="/create">
              <Button>Create Commitment Pool</Button>
            </Link>
          )}
          <PoolList commitmentPools={pools} />
        </VStack>
      </Box>
    </Box>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const pools = await prisma.commitmentPool.findMany({
    include: {
      revealedPublicKeys: true,
      //return non-revealing info about signatures in order to get the count
      signatures: {
        select: {
          commitment_poolId: true,
        },
      },
    },
  });

  return {
    props: { pools: JSON.parse(JSON.stringify(pools)) },
    revalidate: 10,
  };
};

export default Home;
