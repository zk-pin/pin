# zkPIN - commitment pools with zkSNARKs

### Intro

zkPIN is a new coordination mechanism built with zkSNARKs. Vitalik has talked about the idea of [commitment pools](https://vitalik.ca/general/2022/06/12/nonfin.html) before, the problem is simple: you want to sign or endorse some idea, but you're only comfortable doing it publicly if enough other people also do so. Maybe it's some cancelable take, like "based is an annoying word shouldn't be used" (it's not, it's a great word, but you can imagine for things that are unpopular or more controversial get the idea, esp. ), or something you don't feel comfortable initially sharing the idea of etc.

**How do we do this in a trust-minimized way**?

zkPIN is a basic implemention of this with snarks: users create commitment pools (call them the operator), anyone can sign it and generate a zkSNARK proof (that attests to certain properties we'll elaborate on below), but their affiliation remains anonymous to the server and operator until the threshold is reached. Note that by design, zkPIN only requires an **honest minority trust assumption between the operator and the server**. We'll elaborate on this construction more below, but both the server and the operator have to collude in order to dox signatures of people before a threshold for a commitment pool has been reached. Assuming one party is honest, this is effectively not possible (more details in the better guarantees section) i.e. the server has no knowledge of who signed it and neither does the operator until the threshold is reached.

### Basic Flow

You can imagine that there are causes or ideas that people want to coordinate on but unless a critical mass of people is reached, which they cannot guarantee, they would not be afraid to publicly endorse this. We can use zkSNARKs to help solve this.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

The demo is live at [zkpin.xyz](https://www.zkpin.xyz/)

## Circuit construction

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
