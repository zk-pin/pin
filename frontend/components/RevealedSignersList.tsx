import { Box, Text, VStack } from "@chakra-ui/react"
import { IRevealedSigners } from "@utils/types"

export const RevealedSignersList = ({ revealedSigners }: { revealedSigners: IRevealedSigners[] }) => {
  return <>
    <Box padding={4} background='gray.50' textAlign='center' width='100%' maxWidth='700px'>
      <Text fontSize={20} fontWeight='bold'>Revealed Signers</Text>
      {revealedSigners?.map((signer, idx) => {
        return <VStack key={idx} width='100%' paddingTop={'15px'} paddingBottom={'15px'}>
          <Text fontWeight={'bold'}>
            {signer.name}
          </Text>
          <Text>
            User ID: {signer.id}
          </Text>
          <Text width='100%'>
            Public key: {signer.serializedPublicKey}
          </Text>
        </VStack>
      })}
    </Box>
  </>
}