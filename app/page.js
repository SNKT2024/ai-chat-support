"use client";
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! Welcome to INTERprep! How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (message.trim() === "") return; // Prevent sending empty messages

    const newMessages = [
      ...messages,
      { role: "user", text: message },
      { role: "model", text: "" },
    ];
    setMessages(newMessages);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        botResponse += chunk;

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const otherMessages = prevMessages.slice(0, prevMessages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              text: botResponse,
            },
          ];
        });
      }
    } catch (error) {
      console.error("Error fetching chat response:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          width: "100%",
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f5f5f5",
          borderRadius: 8,
          boxShadow: 2,
          marginTop: 5,
          padding: 3,
          border: "1px solid black",
        }}
      >
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto">
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "model" ? "flex-start" : "flex-end"
              }
              alignItems="center"
            >
              <Typography
                variant="body1"
                sx={{
                  backgroundColor:
                    message.role === "model" ? "#007bff" : "#ccc",
                  color: message.role === "model" ? "white" : "black",
                  padding: "10px 16px",
                  borderRadius: 8,
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
              >
                {message.text}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
          mt={5}
        >
          <TextField
            id="message"
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
