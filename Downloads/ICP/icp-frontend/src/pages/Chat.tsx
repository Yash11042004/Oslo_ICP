import React, { useEffect, useMemo, useRef, useState } from "react";
import API from "../api";
import useDebounce from "../hooks/useDebounce";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Input,
  Select,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Text,
  Textarea,
  Tr,
  useColorModeValue,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { Send } from "lucide-react";

type Message = { sender: "user" | "bot"; text: string; id?: string };
type Results = { companies: any[]; people: any[] };

type FilterType = "industry" | "geography" | "roles";
type FilterRow = { id: string; type: FilterType; value: string };

function extractICPjson(text: string) {
  const m = text.match(/<icp_json>([\s\S]*?)<\/icp_json>/i);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function toText(x: any): string {
  if (x == null) return "";
  const t = typeof x;
  if (t === "string" || t === "number" || t === "boolean") return String(x);
  if (Array.isArray(x)) return x.map(toText).filter(Boolean).join(", ");
  if (t === "object") {
    if ("value" in (x as any)) return toText((x as any).value);
    const common =
      (x as any).name ??
      (x as any).title ??
      (x as any).label ??
      (x as any).text ??
      (x as any).email ??
      (x as any).id;
    if (common != null) return toText(common);
    try {
      return JSON.stringify(x);
    } catch {
      return "";
    }
  }
  return "";
}

function personTitle(p: any): string {
  return toText(p?.employment?.title ?? p?.Designation ?? p?.Title);
}
function firstEmail(p: any): string {
  if (Array.isArray(p?.emails) && p.emails.length) return toText(p.emails[0]);
  return toText(p?.email ?? p?.emails);
}
const rid = () => Math.random().toString(36).slice(2, 9);

export default function Chat() {
  /* Colors & layout */
  const pageBg = useColorModeValue(
    "radial-gradient(circle at 80% -10%, rgba(232,240,255,1) 0%, transparent 60%), linear-gradient(180deg,#fafafa,#f5f7fb)",
    "gray.900"
  );
  const panelBg = useColorModeValue("whiteAlpha.900", "gray.800");
  const panelBorder = useColorModeValue("gray.200", "gray.700");
  const subtleText = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");
  const rightAccent = useColorModeValue(
    "linear-gradient(180deg,#f3e8ff,#e8d7ff)",
    "purple.700"
  );

  /* Filters (dynamic) */
  const [filterRows, setFilterRows] = useState<FilterRow[]>([
    { id: rid(), type: "industry", value: "" },
  ]);
  const [addFilterType, setAddFilterType] = useState<FilterType>("industry");

  const filters = useMemo(() => {
    const splitCSV = (s: string) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    const industries = filterRows
      .filter((r) => r.type === "industry" && r.value.trim())
      .flatMap((r) => splitCSV(r.value));
    const geos = filterRows
      .filter((r) => r.type === "geography" && r.value.trim())
      .flatMap((r) => splitCSV(r.value));
    const roles = filterRows
      .filter((r) => r.type === "roles" && r.value.trim())
      .flatMap((r) => splitCSV(r.value));

    const f: any = {};
    if (industries.length) f.industry = industries;
    if (geos.length) f.geography = geos;
    if (roles.length) f.roles = roles;
    return f;
  }, [filterRows]);

  const debouncedFilters = useDebounce(filters, 450);

  /* Results */
  const [results, setResults] = useState<Results>({
    companies: [],
    people: [],
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  /* Chat */
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Welcome! Add filters or tell me your target ICP here — I’ll populate results live.",
      id: rid(),
    },
  ]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  /* Live search on filters */
  useEffect(() => {
    (async () => {
      setErr("");
      setLoading(true);
      try {
        const { data } = await API.post("/search/", {
          ...debouncedFilters,
          limit: 50,
        });
        const safe = data?.results ?? { companies: [], people: [] };
        setResults({
          companies: Array.isArray(safe.companies) ? safe.companies : [],
          people: Array.isArray(safe.people) ? safe.people : [],
        });
      } catch (e: any) {
        const detail = e?.response?.data?.detail;
        setErr(typeof detail === "string" ? detail : "Search failed");
        setResults({ companies: [], people: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedFilters]);

  /* Filters helpers */
  const addFilterRow = () =>
    setFilterRows((r) => [...r, { id: rid(), type: addFilterType, value: "" }]);
  const updateFilterRow = (id: string, patch: Partial<FilterRow>) =>
    setFilterRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
  const removeFilterRow = (id: string) =>
    setFilterRows((rows) => rows.filter((r) => r.id !== id));

  const mergeICPIntoFilters = (icp: any) => {
    setFilterRows((rows) => {
      const next = [...rows];
      const upsert = (type: FilterType, val: any) => {
        if (!val) return;
        const value = Array.isArray(val)
          ? val.filter(Boolean).join(", ")
          : String(val);
        const empty = next.find((r) => r.type === type && !r.value.trim());
        if (empty) empty.value = value;
        else next.push({ id: rid(), type, value });
      };
      if (icp.industry) upsert("industry", icp.industry);
      if (icp.geography) upsert("geography", icp.geography);
      if (icp.roles) upsert("roles", icp.roles);
      return next;
    });
  };

  /* Chat send */
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { sender: "user", text: input.trim(), id: rid() };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    const payload: any = { prompt: input.trim() };
    if (conversationId) payload.conversation_id = conversationId;

    try {
      const { data } = await API.post("/chat/", payload);
      setConversationId(data.conversation_id);
      const reply = toText(data.reply ?? "");
      setMessages((m) => [...m, { sender: "bot", text: reply, id: rid() }]);

      if (data.results && (data.results.companies || data.results.people)) {
        setResults({
          companies: Array.isArray(data.results.companies)
            ? data.results.companies
            : [],
          people: Array.isArray(data.results.people) ? data.results.people : [],
        });
      }
      const icp = extractICPjson(reply);
      if (icp) {
        mergeICPIntoFilters(icp);
        if (!data.results) {
          const resp = await API.post("/search/", { ...icp, limit: 50 });
          const safe = resp.data?.results ?? { companies: [], people: [] };
          setResults({
            companies: Array.isArray(safe.companies) ? safe.companies : [],
            people: Array.isArray(safe.people) ? safe.people : [],
          });
        }
      }
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setMessages((m) => [
        ...m,
        {
          sender: "bot",
          text: typeof detail === "string" ? detail : "Chat failed",
          id: rid(),
        },
      ]);
    } finally {
      setInput("");
      setSending(false);
      chatScrollRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending) sendMessage();
    }
  };

  /* viewport calculations: header height = 72px -> panels height = calc(100vh - 120px) (safe) */
  const panelMaxH = "calc(100vh - 120px)";

  return (
    <Box minH="100vh" bg={pageBg}>
      {/* Top bar */}
      <Box
        position="sticky"
        top={0}
        zIndex={40}
        borderBottomWidth={1}
        bg={useColorModeValue("white", "gray.900")}
        backdropFilter="blur(8px)"
      >
        <Flex
          maxW="1600px"
          mx="auto"
          px={6}
          py={4}
          align="center"
          justify="space-between"
        >
          <Flex align="center" gap={4}>
            <Box
              w={10}
              h={10}
              borderRadius="md"
              bg="black"
              color="white"
              display="grid"
              placeItems="center"
              fontWeight="bold"
            >
              I
            </Box>
            <Box>
              <Text fontSize="sm" color={subtleText} lineHeight="1">
                ICP Builder
              </Text>
              <Text fontSize="md" fontWeight="semibold" lineHeight="1">
                Prospector
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={4}>
            <Text fontSize="sm" color={subtleText}>
              {loading ? (
                <Flex align="center" gap={2}>
                  <Spinner size="xs" /> <Text>Searching…</Text>
                </Flex>
              ) : (
                "Ready"
              )}
            </Text>
            <Button size="sm" variant="ghost">
              Save
            </Button>
            <Button size="sm" colorScheme="purple">
              Save & continue
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Main panels container */}
      <Box maxW="1600px" mx="auto" px={6} py={6}>
        <Flex gap={6} align="stretch">
          {/* Left: Chat column (chatGPT-like) */}
          <Box
            width="360px"
            flex="0 0 360px"
            borderWidth={1}
            borderColor={panelBorder}
            borderRadius="2xl"
            bg={panelBg}
            maxH={panelMaxH}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            boxShadow="sm"
          >
            <Box
              px={4}
              py={3}
              borderBottomWidth={1}
              bg={panelBg}
              position="sticky"
              top="72px"
              zIndex={10}
            >
              <Heading size="sm">Assistant</Heading>
              <Text fontSize="xs" color={subtleText}>
                Describe your ICP or ask to refine
              </Text>
            </Box>

            <Box
              px={4}
              py={4}
              flex="1 1 auto"
              overflowY="auto"
              ref={chatScrollRef as any}
              sx={{
                "&::-webkit-scrollbar": { width: "8px" },
                "&::-webkit-scrollbarThumb": {
                  bg: useColorModeValue("gray.200", "gray.700"),
                  borderRadius: "8px",
                },
              }}
            >
              <VStack spacing={3} align="stretch">
                {messages.map((m) => (
                  <Flex
                    key={m.id}
                    align="flex-end"
                    justify={m.sender === "user" ? "flex-end" : "flex-start"}
                  >
                    {m.sender === "bot" && (
                      <Avatar name="Assistant" size="sm" mr={3} bg="gray.200" />
                    )}
                    <Box
                      maxW="85%"
                      bg={m.sender === "user" ? "blue.600" : cardBg}
                      color={m.sender === "user" ? "white" : "inherit"}
                      px={4}
                      py={3}
                      borderRadius="lg"
                      boxShadow="sm"
                    >
                      <Text whiteSpace="pre-wrap" fontSize="sm">
                        {m.text}
                      </Text>
                    </Box>
                    {m.sender === "user" && (
                      <Avatar
                        name="You"
                        size="sm"
                        ml={3}
                        bg="blue.600"
                        color="white"
                      />
                    )}
                  </Flex>
                ))}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>

            <Box px={3} py={3} borderTopWidth={1} bg={panelBg}>
              <Flex gap={3}>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., US plastics, 50–200, IT Manager"
                  borderRadius="xl"
                  size="sm"
                  resize="none"
                  minH="44px"
                  maxH="160px"
                />
                <Button
                  onClick={() => !sending && sendMessage()}
                  colorScheme="purple"
                  size="sm"
                  px={5}
                  isLoading={sending}
                  rightIcon={<Icon as={Send} />}
                >
                  Send
                </Button>
              </Flex>
              <Text fontSize="xs" color={subtleText} mt={2}>
                Press Enter to send, Shift+Enter for newline.
              </Text>
            </Box>
          </Box>

          {/* Middle: Filters (tall, scrollable) */}
          <Box
            width="520px"
            flex="0 0 520px"
            borderWidth={1}
            borderColor={panelBorder}
            borderRadius="2xl"
            bg={panelBg}
            maxH={panelMaxH}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            boxShadow="sm"
          >
            <Box
              px={6}
              py={4}
              borderBottomWidth={1}
              bg={panelBg}
              position="sticky"
              top="72px"
              zIndex={10}
            >
              <Heading size="md">Let's define your ICP</Heading>
              <Text fontSize="sm" color={subtleText}>
                Focus on the most relevant fields to shape your ICP — all fields
                are optional
              </Text>
            </Box>

            <Box
              px={6}
              py={6}
              overflowY="auto"
              flex="1 1 auto"
              sx={{
                "&::-webkit-scrollbar": { width: "10px" },
                "&::-webkit-scrollbarThumb": {
                  bg: useColorModeValue("gray.200", "gray.700"),
                  borderRadius: "10px",
                },
              }}
            >
              <Box
                borderWidth={1}
                borderRadius="xl"
                bg={cardBg}
                borderColor={panelBorder}
                p={5}
              >
                <Flex align="center" justify="space-between" mb={4}>
                  <Heading size="sm">Contact Profile</Heading>
                  <Box
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg={useColorModeValue("purple.50", "purple.900")}
                    color={useColorModeValue("purple.600", "purple.300")}
                    fontSize="xs"
                  >
                    {filterRows.length} applied
                  </Box>
                </Flex>

                <Stack spacing={4}>
                  {filterRows.map((row) => (
                    <Box
                      key={row.id}
                      p={3}
                      borderRadius="md"
                      borderWidth={1}
                      borderColor={panelBorder}
                      bg={cardBg}
                    >
                      <Flex align="center" justify="space-between" mb={2}>
                        <Text
                          fontSize="xs"
                          textTransform="uppercase"
                          color={subtleText}
                        >
                          {row.type}
                        </Text>
                        <Button
                          size="xs"
                          variant="link"
                          colorScheme="red"
                          onClick={() => removeFilterRow(row.id)}
                        >
                          Remove
                        </Button>
                      </Flex>
                      <Input
                        value={row.value}
                        onChange={(e) =>
                          updateFilterRow(row.id, { value: e.target.value })
                        }
                        placeholder={
                          row.type === "industry"
                            ? "plastics, pharma"
                            : row.type === "geography"
                            ? "United States, India"
                            : "IT Manager, Director of IT"
                        }
                        size="sm"
                        borderRadius="md"
                      />
                    </Box>
                  ))}

                  <Flex gap={2} align="center">
                    <Select
                      value={addFilterType}
                      onChange={(e) =>
                        setAddFilterType(e.target.value as FilterType)
                      }
                      size="sm"
                      borderRadius="xl"
                      width="150px"
                    >
                      <option value="industry">Industry</option>
                      <option value="geography">Geography</option>
                      <option value="roles">Roles</option>
                    </Select>
                    <Button
                      onClick={addFilterRow}
                      colorScheme="purple"
                      size="sm"
                      borderRadius="xl"
                    >
                      Add filter
                    </Button>
                    <Button variant="outline" size="sm">
                      Reset
                    </Button>
                  </Flex>

                  {err && (
                    <Text mt={2} color="red.500" fontSize="sm">
                      {toText(err)}
                    </Text>
                  )}
                </Stack>
              </Box>

              {/* Extra vertical spacing so middle panel feels roomy */}
              <Box h="200px" />
            </Box>
          </Box>

          {/* Right: Preview (accent background, inner white list) */}
          <Box
            flex="1 1 1"
            borderRadius="2xl"
            bg={useColorModeValue(
              "linear-gradient(180deg,#f3e8ff,#e8d7ff)",
              "purple.800"
            )}
            p={6}
            maxH={panelMaxH}
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <Box
              borderRadius="xl"
              bg={useColorModeValue("transparent", "transparent")}
              p={3}
              mb={4}
            >
              <Flex align="center" justify="space-between">
                <Heading
                  size="sm"
                  color={useColorModeValue("gray.700", "white")}
                >
                  Preview prospects
                </Heading>
                <Text
                  fontSize="sm"
                  color={useColorModeValue("gray.600", "whiteAlpha.800")}
                >
                  {results?.people?.length + results?.companies?.length} results
                </Text>
              </Flex>
            </Box>

            <Box
              borderRadius="xl"
              bg={useColorModeValue("white", "gray.800")}
              flex="1 1 auto"
              overflowY="auto"
              p={4}
              boxShadow="sm"
              sx={{
                "&::-webkit-scrollbar": { width: "10px" },
                "&::-webkit-scrollbarThumb": {
                  bg: useColorModeValue("gray.200", "gray.700"),
                  borderRadius: "10px",
                },
              }}
            >
              <VStack spacing={3} align="stretch">
                {results.people.map((p, i) => (
                  <Flex
                    key={p?.id ?? p?._id ?? `${toText(p?.full_name)}-${i}`}
                    align="center"
                    justify="space-between"
                    p={3}
                    borderRadius="md"
                    borderWidth={1}
                    borderColor={useColorModeValue("gray.50", "gray.700")}
                  >
                    <Flex align="center" gap={3}>
                      <Avatar
                        name={toText(p?.full_name)}
                        size="sm"
                        bg={useColorModeValue("gray.200", "gray.600")}
                      />
                      <Box>
                        <Text fontWeight="medium">
                          {toText(p?.full_name ?? p?.fullName)}
                        </Text>
                        <Text fontSize="sm" color={subtleText}>
                          {personTitle(p)}
                        </Text>
                      </Box>
                    </Flex>
                    <Box textAlign="right">
                      <Text fontSize="sm" color={subtleText}>
                        {toText(p?.company ?? p?.company_name ?? p?.Company)}
                      </Text>
                      <Text fontSize="xs" color={subtleText}>
                        {firstEmail(p)}
                      </Text>
                    </Box>
                  </Flex>
                ))}

                {results.people.length === 0 && (
                  <Box textAlign="center" py={8} color={subtleText}>
                    No prospects yet — add filters or ask the assistant to
                    generate an ICP.
                  </Box>
                )}
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
