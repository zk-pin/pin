import { Box, Button, Flex, HStack, IconButton, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import styles from '@styles/Home.module.css'
import { generateNewKeyPair } from '@utils/crypto';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { NextPage } from 'next';
import { useState } from 'react';
import { KeyPair } from '@utils/types';
import { useClipboard } from '@chakra-ui/react'
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';

const CreatePool: NextPage = ({ }) => {
  const [keyPair, setKeyPair] = useState<KeyPair>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { hasCopied, onCopy } = useClipboard(keyPair.privateKey || '');

  // validation schema
  const createPoolSchema = Yup.object().shape({
    title: Yup.string()
      .min(2, 'Too Short!')
      .max(80, 'Too Long!')
      .required('Required'),
    description: Yup.string()
      .min(2, 'Too Short!')
      .max(800, 'Too Long!')
  });

  const createPoolForm = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    validationSchema: createPoolSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const onSubmit = async ({ title, description }: { title: string, description: string }) => {
    const { privateKey, publicKey } = await generateNewKeyPair();
    setKeyPair({ privateKey, publicKey })
    setSubmitted(true);
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
        <form onSubmit={createPoolForm.handleSubmit}>
          <label htmlFor='title'>Title</label>
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
          <label htmlFor='description'>Description</label>
          {createPoolForm.errors.description && <Text color="red.400">*{createPoolForm.errors.description}</Text>}
          <Textarea
            id='description'
            name='description'
            onChange={createPoolForm.handleChange}
            value={createPoolForm.values.description}
          />
          {!submitted && <Button type='submit' marginTop={4}>Submit</Button>}
          {submitted &&
            <Box
              background='blue.50'
              padding={4} marginTop={4}
              marginBottom={4} borderRadius={8}
            >
              <VStack gap={2} width={'100%'}>
                <Text>Operator Public Key</Text>
                <Flex mb={2} width={'100%'}>
                  <Input value={keyPair.publicKey} isReadOnly placeholder='Welcome' />
                  {hasCopied ?
                    <IconButton aria-label={'completed copy button'} ml={2} icon={<CheckIcon />} /> :
                    <IconButton onClick={onCopy} ml={2} aria-label={'copy icon button'} icon={<CopyIcon />} />}
                </Flex>
                <Text>Operator Private Key</Text>
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
        </form>
      </Box>
    </Box>
  )
}

export default CreatePool;