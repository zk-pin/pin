import { HStack, IconButton, Text } from "@chakra-ui/react";
import styles from "@styles/Home.module.css";
import { FaGithub } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className={`${styles.footer}`}>
      <HStack gap={0}>
        <a target="_blank" href="https://github.com/zk-pin/pin" rel="noreferrer">
          <IconButton aria-label="github" variant='ghost' icon={<FaGithub />} />
        </a>
        <Text>
          zkPin &copy; {new Date().getFullYear()}
        </Text>
      </HStack>
    </footer>
  );
};

export default Footer;
