import { Box, Button, Input, Text } from '@chakra-ui/react';
import styles from '@styles/Home.module.css'
import { generateNewKeyPair, generateNewKeyPairHex } from '@utils/crypto';
import { generateKeyPairSync } from 'crypto';
import { useFormik } from 'formik';
import { NextPage } from 'next';

const CreatePool: NextPage = ({ }) => {
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    // TODO: add validation
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const onSubmit = async ({ title, description }: { title: string, description: string }) => {
    const { privateKey, publicKey } = await generateNewKeyPair();
    console.log(privateKey, publicKey);
    alert(JSON.stringify({ title, description }));
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <h1 className={styles.title}>
          Create pool
        </h1>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor='title'>Title</label>
          <Input
            id='title'
            name='title'
            type='title'
            onChange={formik.handleChange}
            value={formik.values.title}
          />
          <label htmlFor='description'>Description</label>
          <Input
            id='description'
            name='description'
            type='description'
            onChange={formik.handleChange}
            value={formik.values.description}
          />
          <Button type='submit' marginTop={4}>Submit</Button>
        </form>
      </Box>
    </Box>
  )
}

export default CreatePool;