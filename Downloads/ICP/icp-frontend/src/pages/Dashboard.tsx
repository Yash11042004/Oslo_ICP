import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Heading,
  Text,
  Flex,
  Link,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { Upload, MessageCircle, Users } from "lucide-react";

export default function Dashboard() {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const badgeBg = useColorModeValue("blue.50", "blue.900");
  const badgeColor = useColorModeValue("blue.600", "blue.300");

  const cards = [
    {
      title: "Upload Datasets",
      desc: "Vault (admin) or your own Excel",
      to: "/uploads",
      icon: Upload,
    },
    {
      title: "Chat with ICP Assistant",
      desc: "Define ICP → get prospects",
      to: "/chat",
      icon: MessageCircle,
    },
    {
      title: "Prospect Lists",
      desc: "View saved lists",
      to: "/prospects",
      icon: Users,
    },
  ];

  return (
    <Box minH="100vh" bg={bg} p={{ base: 6, md: 8 }}>
      <Box maxW="6xl" mx="auto">
        <Heading size="lg" mb={{ base: 6, md: 8 }}>
          Dashboard
        </Heading>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={6}
        >
          {cards.map((card) => (
            <Link
              key={card.title}
              as={RouterLink}
              to={card.to}
              _hover={{ textDecoration: "none" }}
              _focus={{ boxShadow: "outline" }}
              aria-label={card.title}
            >
              <Box
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                shadow="sm"
                minH="140px"
                _hover={{ shadow: "lg", transform: "translateY(-6px)" }}
                transition="all 200ms ease"
                p={6}
                role="group"
              >
                <Flex align="center" gap={4}>
                  <Flex
                    w={12}
                    h={12}
                    align="center"
                    justify="center"
                    borderRadius="md"
                    bg={badgeBg}
                    color={badgeColor}
                    flexShrink={0}
                    transition="transform 200ms"
                    _groupHover={{ transform: "scale(1.05)" }}
                  >
                    <Icon as={card.icon} boxSize={5} />
                  </Flex>

                  <Flex direction="column">
                    <Heading size="md" mb={1}>
                      {card.title}
                    </Heading>
                    <Text fontSize="sm" color={textColor}>
                      {card.desc}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            </Link>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
