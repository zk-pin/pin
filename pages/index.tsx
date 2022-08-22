import type { GetStaticProps, NextPage } from 'next'
import styles from '@styles/Home.module.css'
import prisma from '@utils/prisma';
import { CommitmentPoolProps } from '@utils/types';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { PoolListItem } from '@components/PoolListItem';

type Props = {
  pools: CommitmentPoolProps[]
}

const Home: NextPage<Props> = ({ pools }) => {
  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Power in Numbers!
        </h1>
        <Text className={styles.description}>Commitment Pools</Text>
        <VStack maxHeight='500px' overflow="scroll">
          {pools.map(
            (pool, idx) => <PoolListItem key={idx} pool={pool} />)
          }
        </VStack>
      </Box>
    </Box>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const pools = await prisma.commitmentPool.findMany({
  });
  return {
    props: { pools: JSON.parse(JSON.stringify(pools)) },
    revalidate: 10,
  };
};

export default Home
