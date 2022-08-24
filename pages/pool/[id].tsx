import {
  Box,
  Button,
  HStack,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import prisma from "@utils/prisma";
import { CommitmentPoolProps, ProofInput } from "@utils/types";
import { GetServerSideProps, NextPage } from "next";
import styles from "@styles/Home.module.css";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  generateCircuitInputs,
  getPublicKeyFromPrivate,
  serializePubKey,
} from "@utils/crypto";
import { Keypair } from "maci-domainobjs";
import { generateProof } from "@utils/zkp";
import { setSignature, updateUserPublicKey } from "@utils/api";
import { useLiveQuery } from "dexie-react-hooks";
import { addOperatorDataToCache, getCachedSignerData, getCachedCommitmentPoolData, addSignerDataToCommitmentPoolInCache, addSignerDataToCache } from '@utils/dexie';
import sha256 from "crypto-js/sha256";
import { useRouter } from "next/router";

const CommitmentPool: NextPage<CommitmentPoolProps> = (props) => {
  const { data: session } = useSession();

  const [isOperator, setIsOperator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadySigned, setAlreadySigned] = useState(false);

  const toast = useToast();
  const router = useRouter();

  const cachedCommitmentPoolData = useLiveQuery(
    async () => {
      if (!session) { return; }
      const operatorData = await getCachedCommitmentPoolData(props.id)
      return operatorData;
    }, [session]);

  const cachedSigner = useLiveQuery(
    async () => {
      if (!session) { return; }

      // @ts-ignore TODO:
      const signerData = await getCachedSignerData(sha256(session.user.id).toString());
      return signerData;
    }, [session]);

  // figure out if current user is the operator
  useEffect(() => {
    if (!session || !session.user || !props.id) {
      setIsOperator(false);
      return;
    }
    const operatorUserId = cachedCommitmentPoolData?.hashedOperatorUserId;
    if (!operatorUserId) { setIsOperator(false); return; }

    // @ts-ignore TODO:
    if (sha256(session.user.id).toString() === operatorUserId) {
      setIsOperator(true);
    }
  }, [setIsOperator, session, props.id, cachedCommitmentPoolData]);

  // figure out if this attestation has already been signed
  useEffect(() => {
    if (!cachedSigner || !cachedCommitmentPoolData) { return; }
    if (cachedCommitmentPoolData.signers.filter((signer) => signer.publicKey === cachedSigner.publicKey)) {
      setAlreadySigned(true);
    } else {
      setAlreadySigned(false);
    }
  }, [cachedCommitmentPoolData, cachedCommitmentPoolData?.signers, cachedSigner, props.id, setAlreadySigned]);

  useEffect(() => {
    //TODO: hacky fix to use globalComittmentPool
    //TODO: make more secure or encrypt or ask to store offline
    if (
      session?.user && !cachedSigner?.privateKey
    ) {
      const newPair = new Keypair();
      //@ts-ignore TODO:
      addSignerDataToCache(session.user.id, newPair.privKey.rawPrivKey.toString(), serializePubKey(newPair))

      //@ts-ignore TODO:
      updateUserPublicKey(session.user.id, serializePubKey(newPair));
    }
  }, [cachedSigner?.privateKey, session]);

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const signAttestation = async () => {
    try {
      setIsLoading(true);
      if (!session || !session.user || !cachedSigner) {
        return;
      }

      //get signer private key
      const privKey = cachedSigner.privateKey;

      cachedSigner
      if (!privKey) {
        return;
      }
      const serializedOpPubKey = props.operator.operator_key;
      const serializedPublicKeys: string[] = props.serializedPublicKeys;

      const circuitInput: ProofInput = await generateCircuitInputs(
        serializedOpPubKey,
        privKey,
        serializedPublicKeys,
        Number(props.id)
      );

      console.log(JSON.stringify(circuitInput));

      const { proof, publicSignals } = await generateProof(circuitInput);
      setSignature(proof, publicSignals, circuitInput.ciphertext, props.id);
      await refreshData();
      toast({
        title: "Successfully signed and generated proof.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      addSignerDataToCommitmentPoolInCache(props.id, cachedSigner.publicKey);
      setIsLoading(false);
    } catch (err: unknown) {
      toast({
        title: "Uh oh something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  // validation schema
  const submitPrivateKeySchema = Yup.object().shape({
    privateKey: Yup.string().length(77, "invalid length").required("Required"),
  });

  // submit operator private key form
  const submitPrivateKeyForm = useFormik({
    initialValues: {
      privateKey: "",
    },
    validationSchema: submitPrivateKeySchema,
    onSubmit: async (values) => {
      if (!session) { return; }
      const privKey = values.privateKey;
      const derivedPubKey = await getPublicKeyFromPrivate(privKey);
      const res = await fetch(`/api/operator/${props.operatorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const content = await res.json();
      if (content.operator_key === derivedPubKey) {
        setIsOperator(true);
        // @ts-ignore TODO:
        addOperatorDataToCache(props.id, content.operator_key, content.id, session.user.id);
      }
    },
  });

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <VStack gap={4}>
          <Text as="h1" textAlign="center">
            {props.title}
          </Text>
          <Text>
            Created at: {new Date(Date.parse(props.created_at)).toDateString()}{" "}
            {new Date(Date.parse(props.created_at)).toLocaleTimeString()}{" "}
          </Text>
          <Text>
            {/* @ts-ignore */}
            {props.signatures || 0}/{props.threshold} signatures before reveal
          </Text>
          {!session && <Text color="gray.600">Please sign in to attest</Text>}
          {!isOperator && !alreadySigned && (
            <Button disabled={!session} onClick={signAttestation}>
              Sign attestation
            </Button>
          )}
          {isOperator &&
            <Box background="green.50" padding={4} borderRadius={8}>
              <Text>Welcome back! You need to wait until the threshold has been reached to reveal. Come back later.
              </Text>
            </Box>}
          {isLoading && <Spinner />}
          <VStack background="gray.50" padding={4} borderRadius={8}>
            <Text color="gray.600">
              {`Are you the operator? Sorry, we didn't recognize you but if you have your key pair handy we can sign you back in as an operator.`}
            </Text>
            <form
              onSubmit={submitPrivateKeyForm.handleSubmit}
              style={{ width: "100%", maxWidth: "1000px" }}
            >
              <VStack
                textAlign="start"
                justifyContent="start"
                alignContent="start"
              >
                {submitPrivateKeyForm.errors.privateKey && (
                  <Text color="red.400">
                    *{submitPrivateKeyForm.errors.privateKey}
                  </Text>
                )}
                <HStack width="100%">
                  <Input
                    id="privateKey"
                    name="privateKey"
                    type="text"
                    placeholder="private key (make sure to check the URL is zkpin.xyz, be careful where you share this)"
                    onChange={submitPrivateKeyForm.handleChange}
                    value={submitPrivateKeyForm.values.privateKey}
                  />
                  <Button type="submit" disabled={!session}>
                    Submit
                  </Button>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

//TODO: type props
export const getServerSideProps: GetServerSideProps = async ({
  params,
}): Promise<any> => {
  const pool = await prisma.commitmentPool.findUnique({
    where: {
      id: Number(params?.id),
    },
    select: {
      id: true,
      title: true,
      description: true,
      created_at: true,
      threshold: true,
      operator: {
        select: {
          operator_key: true,
        },
      },
    },
  });

  const sybilAddresses = {
    serializedPublicKeys: (
      await prisma.user.findMany({
        select: {
          // @ts-ignore TODO:
          seriailizedPublicKey: true,
        },
      })
      // @ts-ignore TODO:
    ).map((el) => el.seriailizedPublicKey),
  };

  const numSignatures = {
    signatures: await prisma.signature.count({
      where: {
        commitment_poolId: pool?.id,
      },
    }),
  };

  return {
    props: {
      ...JSON.parse(JSON.stringify(pool)),
      ...JSON.parse(JSON.stringify(sybilAddresses)),
      ...JSON.parse(JSON.stringify(numSignatures)),
    },
  };
};

export default CommitmentPool;
