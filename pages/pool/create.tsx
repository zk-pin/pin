import { Box, Text } from '@chakra-ui/react';
import prisma from '@utils/prisma';
import { CommitmentPoolProps } from '@utils/types';
import { GetServerSideProps, NextPage } from 'next';
import styles from '@styles/Home.module.css'

const CreatePool: NextPage = ({ }) => {
  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <h1 className={styles.title}>
          Create pool
        </h1>
        <Text className={styles.description}>Commitment Pools</Text>

      </Box>
    </Box>
  )
}

export default CreatePool;