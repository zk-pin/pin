import { Box, Button, HStack, Input, Text, VStack } from "@chakra-ui/react"
import { useSession } from "next-auth/react";
import { MouseEventHandler } from "react";

export const OperatorPrivateInput = (
  { submitPrivateKeyForm }: {
    submitPrivateKeyForm: any,
  }) => {
  const { data: session } = useSession();

  return <VStack background="gray.50" padding={4} borderRadius={8}>
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
}

export const WaitForThreshold = () => {
  return (
    <Box background="orange.50" padding={4} borderRadius={8}>
      <Text>
        Welcome back! You need to wait until the threshold has been
        reached to reveal. Come back later.
      </Text>
    </Box>
  )
}

export const ReadyForReveal = ({ startReveal }: { startReveal: MouseEventHandler<HTMLButtonElement> }) => {
  const { data: session } = useSession();

  return (
    <VStack background="green.50" padding={4} borderRadius={8}>
      <Text>
        Hi {session?.user?.name}, This commitment pool is ready for
        reveal.
      </Text>
      <Button onClick={startReveal}>Reveal</Button>
    </VStack>
  )
}