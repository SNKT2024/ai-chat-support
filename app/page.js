"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello! Welcome to Studyhub! How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false); // Theme state

  const sendMessage = async () => {
    if (message.trim() === "") return;

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

  // Define theme styles
  const themeStyles = {
    container: {
      width: "100%",
      height: "80vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: darkMode ? "#1e1e1e" : "#ffffff", // Slightly lighter background for dark mode
      borderRadius: 2,
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      marginTop: 5,
      padding: 3,
      border: `1px solid ${darkMode ? "#444" : "#e0e0e0"}`,
    },
    messageBox: {
      fontSize: "1rem",
      fontWeight: "normal",
      backgroundColor: darkMode ? "#2e2e2e" : "#1d5fff", // Slightly different shade for dark mode
      color: darkMode ? "#dcdcdc" : "#ffffff", // Lighter text color for dark mode
      padding: "12px 18px",
      paddingLeft: 5,
      paddingRight: 5,
      borderRadius: 8,
      maxWidth: "70%",
      wordWrap: "break-word",
    },
    sendButton: {
      padding: "10px 20px",
      borderRadius: 2,
      backgroundColor: darkMode ? "#555" : "#007bff",
      "&:hover": {
        backgroundColor: darkMode ? "#666" : "#0056b3",
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center" }}>
      <Box sx={themeStyles.container}>
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          sx={{
            paddingRight: 1,
            "&::-webkit-scrollbar": {
              width: "0.4em",
            },
            "&::-webkit-scrollbar-track": {
              background: darkMode ? "#555" : "#f1f1f1",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: darkMode ? "#f1f1f1" : "#007bff",
              borderRadius: "8px",
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "model" ? "flex-start" : "flex-end"
              }
              alignItems="center"
              lineHeight={2}
            >
              <Box sx={themeStyles.messageBox}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="center"
          mt={3}
        >
          <TextField
            id="message"
            label="Type your message..."
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: darkMode ? "#333" : "#ffffff", // Background color for input box
                "& fieldset": {
                  borderColor: darkMode ? "#555" : "#cccccc", // Border color for input box
                },
                "&:hover fieldset": {
                  borderColor: darkMode ? "#888" : "#007bff", // Border color on hover
                },
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#ccc" : "#000", // Label color
              },
              "& .MuiInputBase-input": {
                color: darkMode ? "#e0e0e0" : "#000", // Input text color
              },
            }}
          />

          <Button
            variant="contained"
            onClick={sendMessage}
            sx={themeStyles.sendButton}
          >
            Send
          </Button>
          <Button
            variant="outlined"
            onClick={() => setDarkMode(!darkMode)}
            sx={{
              marginLeft: 2,
              borderRadius: 2,
              color: darkMode ? "#fff" : "#000",
              borderColor: darkMode ? "#fff" : "#000",
              "&:hover": {
                borderColor: darkMode ? "#ccc" : "#555",
                color: darkMode ? "#ccc" : "#555",
              },
            }}
          >
            Dark Mode
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
