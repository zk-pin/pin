import { Box, Button, Text, VStack } from '@chakra-ui/react';
import prisma from '@utils/prisma';
import { CommitmentPoolProps } from '@utils/types';
import { GetServerSideProps, NextPage } from 'next';
import styles from '@styles/Home.module.css'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

  const [isOperator, setIsOperator] = useState(false);
  const [alreadySigned, setAlreadySigned] = useState(false);

  // figure out if current user is the operator
  useEffect(() => {
    if (!session || !props.id) {
      setIsOperator(false);
    }
    const operatorPublicKey = localStorage.getItem(`commitment-pool-operator-pub-${props.id}`);
    if (operatorPublicKey) {
      setIsOperator(true);
    }
  }, [setIsOperator, session, props.id])

  // figure out if this attestation has already been signed
  useEffect(() => {
    if (localStorage.getItem(`signed-pool-${props.id}`) === 'true') {
      setAlreadySigned(true);
    } else {
      setAlreadySigned(false);
    }
  }, [props.id, setAlreadySigned])

  const signAttestation = () => {
    // TODO:
    if (!session) {
      return;
    }
    localStorage.setItem(`signed-pool-${props.id}`, 'true');
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <VStack gap={4}>
          <Text as='h1' textAlign='center'>
            {props.title}
          </Text>
          <Text>Created at: {new Date(Date.parse(props.created_at)).toDateString()} {new Date(Date.parse(props.created_at)).toLocaleTimeString()} </Text>
          <Text>{props.signatures?.length || 0}/{props.threshold} signatures before reveal</Text>
          {!session && <Text color='gray.600'>Please sign in to attest</Text>}
          {(!isOperator && !alreadySigned)
            && <Button disabled={!session} onClick={signAttestation}>
              Sign attestation
            </Button>
          }
          <Box background='gray.100' padding={4} borderRadius={8}>
            <Text>
              Are you the operator?
            </Text>
            <Text>
              TODO: let operator provide public key to verify they are the operator
              or retrieve it from their signed in session
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}

export default CommitmentPool;