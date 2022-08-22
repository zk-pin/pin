# Power In Numbers

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

private input my_priv, my_pub
public inputs pool_pub, merkle_root, msg, c

shared_secret = ecdh(my_priv, pool_pub)
c = sym_enc(msg, shared_secret)
my_pub in merkle_root
my_pub = pubkeygen(my_priv)
```
