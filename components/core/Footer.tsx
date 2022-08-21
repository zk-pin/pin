import { Text, VStack } from "@chakra-ui/react";
import styles from "@styles/Home.module.css";

const Footer = () => {
  return (
    <footer className={`${styles.footer}`}>
      <VStack gap={0}>
        <Text>
          &copy; {new Date().getFullYear()}
        </Text>
      </VStack>
    </footer>
  );
};

export default Footer;
