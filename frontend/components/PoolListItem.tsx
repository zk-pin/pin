import { Box, HStack, Spacer, Text, VStack } from '@chakra-ui/react';
import { CommitmentPoolProps } from '@utils/types';
import Link from 'next/link';

type Props = {
  pool: CommitmentPoolProps
}

const PoolListItem = ({ pool }: Props) => {
  return (
    <Link href={`pool/${pool.id}`}>
      <Box
        as="button"
        width={'100%'}
        border='0.5px'
        padding={4}
        background={'gray.50'}
        _hover={{ background: 'gray.100' }}
        borderRadius={0}
        borderWidth='1px'
        borderColor={'gray.500'}
      >
        <HStack justifyContent='space-between' width="100%">
          <HStack textAlign='start' width="100%">
            <Text>{pool.title}</Text>
          </HStack>
          <Spacer />
          {pool.revealedPublicKeys.length === 0 ?
            <Box>{pool.signatures?.length || 0}/{pool.threshold}</Box> :
            <Box>Revealed</Box>
          }
        </HStack>
      </Box>
    </Link>)
}

export const PoolList = ({ commitmentPools }: { commitmentPools: CommitmentPoolProps[] }) => {
  return (
    <VStack marginBottom={8} width={'100%'} maxWidth="1000px">
      {commitmentPools.map((pool, idx) => (
        <PoolListItem key={idx} pool={pool} />
      ))}
    </VStack>
  )
}