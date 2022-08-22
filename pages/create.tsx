import { Box, Button, Flex, HStack, IconButton, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Spinner, Text, Textarea, VStack } from '@chakra-ui/react';
import styles from '@styles/Home.module.css'
import { generateNewKeyPair } from '@utils/crypto';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { NextPage } from 'next';
import { useState } from 'react';
import { KeyPair } from '@utils/types';
import { useClipboard } from '@chakra-ui/react'
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { useSession } from 'next-auth/react';

const CreatePool: NextPage = ({ }) => {
  const [keyPair, setKeyPair] = useState<KeyPair>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { hasCopied, onCopy } = useClipboard(keyPair.privateKey || '');

  const { data: session } = useSession();
  const userHasValidSession = Boolean(session);

  // validation schema
  const createPoolSchema = Yup.object().shape({
    title: Yup.string()
      .min(2, 'Too Short!')
      .max(80, 'Too Long!')
      .required('Required'),
    description: Yup.string()
      .min(2, 'Too Short!')
      .max(800, 'Too Long!'),
    threshold: Yup.number()
      .min(2, 'Too small!')
      .max(1000000, 'Too large!')
  });

  const createPoolForm = useFormik({
    initialValues: {
      title: '',
      description: '',
      threshold: 10,
    },
    validationSchema: createPoolSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const onSubmit = async ({ title, description, threshold }: { title: string, description: string, threshold: number }) => {
    if (!userHasValidSession) {
      return;
    }
    setLoading(true);
    const { privateKey, publicKey } = await generateNewKeyPair();
    setKeyPair({ privateKey, publicKey });

    try {
      const body = { title, description, threshold, publicKey };
      const result = await fetch('/api/newPool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (result.status === 200) {
        var resultBody = await result.json();
        // TODO: use dexie + fix security
        localStorage.setItem(`commitment-pool-operator-priv-${resultBody.id}`, privateKey)
        localStorage.setItem(`commitment-pool-operator-pub-${resultBody.id}`, publicKey)
        setSubmitted(true);
        setLoading(false);
      } else {
        setSubmitted(false);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setSubmitted(false);
      setLoading(false);
    }
  }

  const onClickDone = () => {
    setSubmitted(false);
    createPoolForm.resetForm();
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <h1 className={styles.title}>
          Create pool
        </h1>
        <form onSubmit={createPoolForm.handleSubmit} style={{ width: '100%', maxWidth: '1000px' }}>
          <VStack
            textAlign='start'
            justifyContent='start'
            alignContent="start"
          >
            <Text fontWeight='bold'>
              Title
            </Text>
            {createPoolForm.errors.title &&
              <Text color="red.400">*{createPoolForm.errors.title}</Text>
            }
            <Input
              id='title'
              name='title'
              type='title'
              onChange={createPoolForm.handleChange}
              value={createPoolForm.values.title}
            />
            <Text fontWeight='bold'>Description</Text>
            {createPoolForm.errors.description && <Text color="red.400">*{createPoolForm.errors.description}</Text>}
            <Textarea
              id='description'
              name='description'
              onChange={createPoolForm.handleChange}
              value={createPoolForm.values.description}
            />

            <HStack justifyContent="space-between" width="100%">
              <HStack>
                <Text fontWeight='bold'>Threshold</Text>
                {createPoolForm.errors.threshold && <Text color="red.400">*{createPoolForm.errors.threshold}</Text>}
                <NumberInput
                  id='threshold'
                  name='threshold'
                  step={5}
                  onChange={(val) =>
                    createPoolForm.setFieldValue('threshold', val)
                  }
                  value={createPoolForm.values.threshold}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </HStack>
              {!userHasValidSession && <Text color='gray.600'>Please sign in before attempting to create a new commitment pool</Text>}
              {(!submitted && !loading) && <Button disabled={!userHasValidSession} type='submit' marginTop={4}>Submit</Button>}
            </HStack>
            {(!submitted && loading) && <Button type='submit' marginTop={4} rightIcon={<Spinner />}>Submit</Button>}
            {(submitted && !loading) &&
              <Box
                background='blue.50'
                padding={4} marginTop={4}
                marginBottom={4} borderRadius={8}
                width="100%"
              >
                <VStack gap={2} width={'100%'}>
                  <Text>
                    This will be the only time we show your operator private key.
                    You will need this key to decrypt the signatures once the threshold has been reached.
                    Please save it in a safe space.
                  </Text>
                  <Text fontWeight='bold' >Operator Public Key</Text>
                  <Flex mb={2} width={'100%'}>
                    <Input value={keyPair.publicKey} isReadOnly placeholder='Welcome' />
                    {hasCopied ?
                      <IconButton aria-label={'completed copy button'} ml={2} icon={<CheckIcon />} /> :
                      <IconButton onClick={onCopy} ml={2} aria-label={'copy icon button'} icon={<CopyIcon />} />}
                  </Flex>
                  <Text fontWeight='bold' >Operator Private Key</Text>
                  <Flex mb={2} width={'100%'}>
                    <Input value={keyPair.privateKey} isReadOnly placeholder='Welcome' />
                    {hasCopied ?
                      <IconButton aria-label={'completed copy button'} ml={2} icon={<CheckIcon />} /> :
                      <IconButton onClick={onCopy} ml={2} aria-label={'copy icon button'} icon={<CopyIcon />} />}
                  </Flex>
                  <Flex justifyContent="end" width='100%'>
                    <Button onClick={onClickDone}>Done</Button>
                  </Flex>
                </VStack>
              </Box>}
          </VStack>
        </form>
      </Box>
    </Box >
  )
}

export default CreatePool;