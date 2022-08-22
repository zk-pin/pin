import { Box, Text } from '@chakra-ui/react';
import prisma from '@utils/prisma';
import { CommitmentPoolProps } from '@utils/types';
import { GetServerSideProps, NextPage } from 'next';
import styles from '@styles/Home.module.css'

export const getServerSideProps: GetServerSideProps = async ({ params }): Promise<any> => {
  const pool = await prisma.commitmentPool.findUnique({
    where: {
      id: Number(params?.id),
    },
  });
  return {
    props: JSON.parse(JSON.stringify(pool)),
  };
};

const CommitmentPool: NextPage<CommitmentPoolProps> = (props) => {
  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <h1>
          {props.title}
        </h1>
        {/* TODO: fix the date parsing */}
        <Text>Created at: {Date.parse(props.created_at).toString()}</Text>
        <Text>Threshold: {props.threshold}</Text>
      </Box>
    </Box>
  )
}

export default CommitmentPool;