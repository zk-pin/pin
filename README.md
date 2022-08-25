# Power In Numbers

A webapp that lets you create commitment pools. Commitment pools are pools that allow people to sign/commit/endorse some idea or statement anonymously until a certain size is reached, and then their endorsements become public. Effectively, this is a way to solve coordination problems that rely on power in numbers.

You can imagine that there are causes or ideas that people want to coordinate on but unless a critical mass of people is reached, which they cannot guarantee, they would not be afraid to publicly endorse this. We can use zkSNARKs to help solve this.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Circuit construction:

```
i generate c = sym_enc(msg, ecdh(my_priv, pool_pub))

i generate a snark proof that:

private input my_priv, my_pub, c
public inputs pool_pub, merkle_root, msg, chash

shared_secret = ecdh(my_priv, pool_pub)
c = sym_enc(msg, shared_secret)
my_pub in merkle_root
my_pub = pubkeygen(my_priv)
chash = hash(c)
```

_Created at HackLodge Crypto Edition 2022 (Sponsored by 0xParc)_
