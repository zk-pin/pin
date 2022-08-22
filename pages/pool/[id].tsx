import { Box, Button, HStack, Input, Text, VStack } from '@chakra-ui/react';
import prisma from '@utils/prisma';
import { CommitmentPoolProps } from '@utils/types';
import { GetServerSideProps, NextPage } from 'next';
import styles from '@styles/Home.module.css'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getPublicKeyFromPrivate } from '@utils/crypto';

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
  }, [props.id, setAlreadySigned]);

  const signAttestation = () => {
    if (!session) {
      return;
    }
    // TODO: sign attestation
    localStorage.setItem(`signed-pool-${props.id}`, 'true');
  }

  // validation schema
  const submitPrivateKeySchema = Yup.object().shape({
    privateKey: Yup.string()
      .length(66, 'invalid length')
      .required('Required'),
  });

  const submitPrivateKeyForm = useFormik({
    initialValues: {
      privateKey: '',
    },
    validationSchema: submitPrivateKeySchema,
    onSubmit: async (values) => {
      const privKey = values.privateKey;
      const derivedPubKey = await getPublicKeyFromPrivate(privKey);
      const res = await fetch(`/api/operator/${props.operatorId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const content = await res.json();
      if (content.operator_key === derivedPubKey) {
        setIsOperator(true);
        // TODO: set in local
      }
    },
  });

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
          <VStack background='gray.50' padding={4} borderRadius={8}>
            <Text color='gray.600'>
              {`Are you the operator? Sorry, we didn't recognize you but if you have your key pair handy we can sign you back in as an operator.`}
            </Text>
            <form onSubmit={submitPrivateKeyForm.handleSubmit} style={{ width: '100%', maxWidth: '1000px' }}>
              <VStack
                textAlign='start'
                justifyContent='start'
                alignContent="start"
              >
                {submitPrivateKeyForm.errors.privateKey &&
                  <Text color="red.400">*{submitPrivateKeyForm.errors.privateKey}</Text>
                }
                <HStack width='100%'>
                  <Input
                    id='privateKey'
                    name='privateKey'
                    type='text'
                    placeholder='private key (make sure to check the URL is zkpin.xyz, be careful where you share this)'
                    onChange={submitPrivateKeyForm.handleChange}
                    value={submitPrivateKeyForm.values.privateKey}
                  />
                  <Button type="submit" disabled={!session}>Submit</Button>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}

export default CommitmentPool;