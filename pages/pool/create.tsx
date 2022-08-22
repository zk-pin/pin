import { Box, Button, Input, Text } from '@chakra-ui/react';
import styles from '@styles/Home.module.css'
import { generateKeyPairSync } from 'crypto';
import { useFormik } from 'formik';
import { NextPage } from 'next';

const CreatePool: NextPage = ({ }) => {
  // TODO: generate operator pub and priv key pair
  // const keypair = generateKeyPairSync(
  //   'eddsa',
  //   {
  //     privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
  //     publicKeyEncoding: { format: 'pem', type: 'spki' }
  //   }
  // )

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    onSubmit: (values: any) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

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