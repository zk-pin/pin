import { Box, Button, Spinner, Text, useToast, VStack } from "@chakra-ui/react";
import prisma from "@utils/prisma";
import { CommitmentPoolProps, ProofInput } from "@utils/types";
import { GetServerSideProps, NextPage } from "next";
import styles from "@styles/Home.module.css";
import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  decryptCipherTexts,
  generateCircuitInputs,
  getPublicKeyFromPrivate,
} from "@utils/crypto";
import { generateProof } from "@utils/zkp";
import {
  addRevealedSigner,
  revealCommitmentPool,
  setSignature,
} from "@utils/api";
import { useLiveQuery } from "dexie-react-hooks";
import {
  addOperatorDataToCache,
  getCachedSignerData,
  getCachedCommitmentPoolData,
  addSignerDataToCommitmentPoolInCache,
} from "@utils/dexie";
import { useRouter } from "next/router";
import { RevealedSignersList } from "@components/RevealedSignersList";
import {
  OperatorPrivateInput,
  ReadyForReveal,
  WaitForThreshold,
} from "@components/OperatorComponents";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

const CommitmentPool: NextPage<CommitmentPoolProps> = (props) => {
  const session = props.nextAuthSession;

  const [isOperator, setIsOperator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadySigned, setAlreadySigned] = useState(false);

  // figure out if this is already revealed
  const revealedPublicKeys = useMemo(() => {
    return props.revealedPublicKeys;
  }, [props]);

  const toast = useToast();
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const cachedCommitmentPoolData = useLiveQuery(async () => {
    if (!session) {
      return;
    }
    const operatorData = await getCachedCommitmentPoolData(props.id);
    return operatorData;
  }, [session]);

  const cachedSigner = useLiveQuery(async () => {
    if (!session) {
      return;
    }
    // @ts-ignore TODO
    const signerData = await getCachedSignerData(session.user.id);
    return signerData;
  }, [session, session?.user]);

  // figure out if current user is the operator
  useEffect(() => {
    if (!session || !session.user || !props.id) {
      setIsOperator(false);
      return;
    }
    const operatorUserId = cachedCommitmentPoolData?.operatorUserId;
    if (!operatorUserId) {
      setIsOperator(false);
      // @ts-ignore TODO:
    } else if (session.user.id === operatorUserId) {
      setIsOperator(true);
    }
  }, [setIsOperator, session, props.id, cachedCommitmentPoolData]);

  // figure out if this attestation has already been signed
  // only works for local signers (if you signed from the same device)
  useEffect(() => {
    if (!cachedSigner || !cachedCommitmentPoolData) {
      return;
    }
    if (
      cachedCommitmentPoolData.localSigners &&
      cachedCommitmentPoolData.localSigners.length !== 0 &&
      cachedCommitmentPoolData.localSigners.filter(
        (signer) => signer.publicKey === cachedSigner.publicKey
      )
    ) {
      setAlreadySigned(true);
    } else {
      setAlreadySigned(false);
    }
  }, [
    cachedCommitmentPoolData,
    cachedCommitmentPoolData?.localSigners,
    cachedSigner,
    props.id,
    setAlreadySigned,
  ]);

  const signAttestation = async () => {
    try {
      setIsLoading(true);
      if (!session || !session.user || !cachedSigner?.privateKey) {
        toast({
          title:
            "Uh oh something went wrong with your session, can you try again?",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      //if revealed
      if (revealedPublicKeys.length !== 0) {
        // @ts-ignore TODO:
        const addSignerRes = await addRevealedSigner(
          props.id,
          revealedPublicKeys,
          session.user.id
        );
        setIsLoading(false);
        if (addSignerRes.status !== 200) {
          addSignerRes.json().then((body) => {
            throw new Error(
              `Error occurred adding signer to revealed signers: ${body}`
            );
          });
        } else {
          await refreshData();
        }
      } else {
        //get signer private key
        const privKey = cachedSigner.privateKey;
        const serializedOpPubKey = props.operator.operator_key;
        const serializedPublicKeys: string[] = props.serializedPublicKeys;

        if (!privKey || serializedPublicKeys?.find((key) => !key)) {
          setIsLoading(false);
          return;
        }

        const circuitInput: ProofInput = await generateCircuitInputs(
          serializedOpPubKey,
          privKey,
          serializedPublicKeys,
          Number(props.id)
        );

        const { proof, publicSignals } = await generateProof(circuitInput);
        const res = await setSignature(
          proof,
          publicSignals,
          circuitInput.ciphertext,
          props.id
        );
        if (res.status === 200) {
          await refreshData();
          toast({
            title: "Successfully signed and generated proof.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          addSignerDataToCommitmentPoolInCache(
            props.id,
            cachedSigner.publicKey
          );
        } else {
          res.json().then((body) => {
            toast({
              title: "Error: " + body.msg,
              status: "warning",
              duration: 3000,
              isClosable: true,
            });
          });
        }
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error(err);
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
      if (!session) {
        return;
      }
      const privKey = values.privateKey;
      const derivedPubKey = await getPublicKeyFromPrivate(privKey);
      const res = await fetch(`/api/operator/${props.operatorId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const content = await res.json();
      if (content.operator_key === derivedPubKey) {
        setIsOperator(true);
        addOperatorDataToCache(
          props.id,
          content.operator_key,
          content.id,
          // @ts-ignore TODO:
          session.user.id,
          privKey
        );
      }
    },
  });

  const startReveal = async () => {
    if (!isOperator || !cachedCommitmentPoolData?.operatorPrivateKey) {
      return;
    }
    setIsLoading(true);
    const revealedSigners = await decryptCipherTexts(
      cachedCommitmentPoolData?.operatorPrivateKey,
      props.serializedPublicKeys,
      props.signatures,
      parseInt(props.id)
    );
    await revealCommitmentPool(props.id, revealedSigners);
    setIsLoading(false);
    refreshData();
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.main}>
        <VStack gap={4}>
          <Text as="h1" textAlign="center">
            {props.title}
          </Text>
          <Text as="h3">
            Created at: {new Date(Date.parse(props.created_at)).toDateString()}{" "}
            {new Date(Date.parse(props.created_at)).toLocaleTimeString()}{" "}
          </Text>
          {(!revealedPublicKeys || revealedPublicKeys.length === 0) && (
            <Text as="h3">
              {props.signatures.length || 0}/{props.threshold} signatures
            </Text>
          )}
          {props.description && (
            <Text fontSize="1rem">{props.description}</Text>
          )}
          {!session && <Text color="gray.600">Please sign in to attest</Text>}
          {!alreadySigned ? (
            <Button disabled={!session} onClick={signAttestation}>
              Sign attestation
            </Button>
          ) : (
            <Button disabled>Already signed!</Button>
          )}
          {isOperator &&
            revealedPublicKeys &&
            revealedPublicKeys.length === 0 &&
            props.signatures.length < props.threshold && <WaitForThreshold />}
          {isOperator &&
            props.signatures.length >= props.threshold &&
            revealedPublicKeys &&
            revealedPublicKeys.length === 0 && (
              <ReadyForReveal startReveal={startReveal} />
            )}
          {revealedPublicKeys?.length > 0 && (
            <RevealedSignersList revealedSigners={revealedPublicKeys} />
          )}
          {isLoading && <Spinner />}
          {!isOperator && !revealedPublicKeys && (
            <OperatorPrivateInput submitPrivateKeyForm={submitPrivateKeyForm} />
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}): Promise<any> => {
  const session = await unstable_getServerSession(req, res, authOptions); // need unstable for prod

  const pool = await prisma.commitmentPool.findUnique({
    where: {
      id: Number(params?.id) || -1,
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
      revealedPublicKeys: {
        select: {
          user: {
            select: {
              name: true,
              id: true,
              serializedPublicKey: true,
            },
          },
          ipfsHash: true,
        },
      },
    },
  });

  // global public keys
  const sybilAddresses = {
    serializedPublicKeys: (
      await prisma.user.findMany({
        select: {
          serializedPublicKey: true,
        },
      })
    ).map((el) => el.serializedPublicKey),
  };

  const signatures = await prisma.signature.findMany({
    where: {
      commitment_poolId: pool?.id,
    },
    select: {
      ciphertext: true,
      ipfs: {
        select: { ipfsHash: true },
      },
    },
  });

  if (signatures.length >= (pool?.threshold || 0)) {
    return {
      props: {
        ...JSON.parse(JSON.stringify(pool)),
        ...JSON.parse(JSON.stringify(sybilAddresses)),
        signatures: JSON.parse(JSON.stringify(signatures)),
        nextAuthSession: session
          ? {
            ...JSON.parse(JSON.stringify(session)),
          }
          : null,
      },
    };
  } else {
    return {
      props: {
        ...JSON.parse(JSON.stringify(pool)),
        ...JSON.parse(JSON.stringify(sybilAddresses)),
        signatures: signatures.map(() => ""),
        nextAuthSession: session
          ? {
            ...JSON.parse(JSON.stringify(session)),
          }
          : null,
      },
    };
  }
};

export default CommitmentPool;
