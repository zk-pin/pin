import { Button, Flex, HStack, Spinner, Text } from "@chakra-ui/react"
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Image as ChakraImage } from '@chakra-ui/react'

export const NavBar = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const { data: session, status } = useSession();

  return (<Flex
    as="header"
    position="fixed"
    alignContent="space-evenly"
    justifyContent="space-between"
    w="100%"
    p={2}
    px={4}
    backdropFilter="saturate(150%) blur(20px)"
    zIndex={100}
  >
    <Link href="/">
      <Button size="lg" variant="ghost">
        Home
      </Button>
    </Link>
    {status === 'loading' &&
      <Button size="lg" variant="ghost" rightIcon={<Spinner />}>
        Login
      </Button>
    }
    {!session &&
      // <Link href="/api/auth/signin">
      <Button size="lg" variant="ghost" onClick={() => signIn()} isActive={isActive('/signup')}>
        Login
      </Button>
      // </Link>
    }
    {session &&
      <HStack>
        <HStack>
          <ChakraImage
            alt={`${session.user?.name}'s profile picture`}
            src={session.user?.image || ''}
            width={10}
            height={10}
            borderRadius={'50%'}
          />
          <Text fontWeight="bold">
            Hi {session?.user?.name}
          </Text>
        </HStack>
        <Button size="lg" variant="ghost" onClick={() => signOut()}>
          Log out
        </Button>
      </HStack>
    }
  </Flex>)
}