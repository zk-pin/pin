import Head from "next/head"

export const Meta = () => {
  return (
    <Head>
      <title>Power in Numbers</title>
      <meta name="title" content="Power in Numbers" />
      <meta name="description" content="A webapp that lets you create commitment pools. Commitment pools are pools that allow people to sign/commit/endorse some idea or statement anonymously until a certain size is reached, and then their endorsements become public. Effectively, this is a way to solve coordination problems that rely on power in numbers." />
      <link rel="icon" href="/favicon.ico" />
      <meta property="og:type" content="website" />
      <meta name="og:title" content="Power in Numbers" />
      <meta name="og:description" content="A webapp that lets you create commitment pools. Commitment pools are pools that allow people to sign/commit/endorse some idea or statement anonymously until a certain size is reached, and then their endorsements become public. Effectively, this is a way to solve coordination problems that rely on power in numbers." />
    </Head>
  )
}