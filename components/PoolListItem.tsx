import { Box, HStack, Spacer, Text, VStack } from '@chakra-ui/react';
import { CommitmentPoolProps } from '@utils/types';
import Link from 'next/link';

type Props = {
  pool: CommitmentPoolProps
}

export const PoolListItem = ({ pool }: Props) => {
  return (
    <Link href={`pool/${pool.id}`}>
      <Box as="button" width={'100%'} border='0.5px' borderRadius={8} padding={4} _hover={{ background: 'gray.100' }}>
        <HStack justifyContent='space-between' width="100%">
          <HStack textAlign='start' width="100%">
            <Text>{pool.id}</Text>
            <Text>{pool.title}</Text>
          </HStack>
          <Spacer />
          {!(pool.signatures?.length > pool.threshold) ?
            <Box>{pool.signatures?.length || 0}/{pool.threshold}</Box> :
            <Box>Revealed</Box>
          }
        </HStack>
      </Box>
    </Link>)
}