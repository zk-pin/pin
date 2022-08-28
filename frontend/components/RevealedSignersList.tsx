import { Box, Link as ChakraLink, Text, VStack } from "@chakra-ui/react"
import { IRevealedSigners } from "@utils/types"

export const RevealedSignersList = ({ revealedSigners }: { revealedSigners: IRevealedSigners[] }) => {
  console.log('revealedSigners', revealedSigners)
  return <>
    <Box padding={4} background='gray.50' textAlign='center' width='100%' maxWidth='700px'>
      <Text fontSize={20} fontWeight='bold'>Revealed Signers</Text>
      {revealedSigners?.map((signer, idx) => {
        const { user, ipfsHash } = signer;
        return <VStack key={idx} width='100%' paddingTop={'15px'} paddingBottom={'15px'}>
          <Text fontWeight={'bold'}>
            {user.name}
          </Text>
          <Text>
            User ID: {user.id}
          </Text>
          <Text width='100%'>
            Public key: {user.serializedPublicKey}
          </Text>
          <Text>
            Proof link (ipfs): {` `}
            <ChakraLink
              href={`http://gateway.pinata.cloud/ipfs/${ipfsHash}`}
              isExternal
              target="_blank"
              rel="noreferrer"
              color={'blue.600'}
            >
              {ipfsHash}
            </ChakraLink>
          </Text>
        </VStack>
      })}
    </Box>
  </>
}