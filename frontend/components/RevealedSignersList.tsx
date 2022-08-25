import { Box, Text, VStack } from "@chakra-ui/react"
import { IRevealedSigners } from "@utils/types"

const RevealedListItem = () => {
  return <>
  </>
}
export const RevealedSignersList = ({ revealedSigners }: { revealedSigners: IRevealedSigners[] }) => {
  return <>
    <Box padding={4} background='gray.50' textAlign='center'>
      <Text fontSize={20} fontWeight='bold'>Revealed Signers</Text>
      {revealedSigners?.map((signer, idx) => {
        return <VStack key={idx} width='100%'>
          <Text>
            {signer.name}
          </Text>
          <Text>
            {signer.id}
          </Text>
          <Text>
            {signer.serializedPublicKey}
          </Text>
        </VStack>
      })}
    </Box>
  </>
}