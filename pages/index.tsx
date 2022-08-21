import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../components/core/Footer'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Power in Numbers</title>
        <meta name="description" content="A webapp that lets you create commitment pools. Commitment pools are pools that allow people to sign/commit/endorse some idea or statement anonymously until a certain size is reached, and then their endorsements become public. Effectively, this is a way to solve coordination problems that rely on power in numbers." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Power in Numbers!
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.tsx</code>
        </p>
      </main>
    </div>
  )
}

export default Home
