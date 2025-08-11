import React, { useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  TextField,
  Button,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

export default function ChatWindow({
  activeChat,
  messages = [],
  newMessage,
  setNewMessage,
  onSend,
  onBack,
  getVideoToken,
  getAudioToken,
  toggleMaximize,
  isMaximized,
  currentUserId, // logged in user's id (optional but recommended)
}) {
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const headerHeight = 64; // must match CSS below

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper: determine message ownership
  const isFromMe = (msg) => {
    if (currentUserId) return msg.sender === currentUserId;
    // fallback: assume sender !== activeChat._id means it's me
    if (!activeChat) return false;
    return msg.sender !== activeChat._id;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
        minHeight: 0, // crucial so child overflow works in flex
        backgroundColor: "#121212",
      }}
    >
      {/* HEADER - relative to chat window container (not viewport) */}
      <Box
        sx={{
          height: `${headerHeight}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          borderBottom: "1px solid #2b2b2b",
          backgroundColor: "#0f0f0f",
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={onBack} sx={{ color: "white" }} size="small" aria-label="Back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" noWrap sx={{ color: "white", fontWeight: 700 }}>
            {activeChat?.firstName} {activeChat?.lastName}
          </Typography>
        </Box>

        <Box>
          <IconButton
            aria-label="Audio call"
            onClick={getAudioToken}
            sx={{ color: "#2ecc71" }}
            size="small"
          >
            <CallIcon />
          </IconButton>

          <IconButton
            aria-label="Video call"
            onClick={getVideoToken}
            sx={{ color: "#2ecc71" }}
            size="small"
          >
            <VideocamIcon />
          </IconButton>

          <IconButton
            aria-label={isMaximized ? "Restore" : "Maximize"}
            onClick={toggleMaximize}
            sx={{ color: "white" }}
            size="small"
          >
            {isMaximized ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* MESSAGE LIST - occupies remaining space between header and input */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2,
          py: 2,
          backgroundColor: "#181818",
          // ensure box sizing prevents overlapping
          boxSizing: "border-box",
        }}
      >
        {messages.length === 0 ? (
          <Box sx={{ color: "#9e9e9e", textAlign: "center", mt: 4 }}>No messages yet</Box>
        ) : (
          messages.map((msg, idx) => {
            const me = isFromMe(msg);
            return (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: me ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: me ? theme.palette.primary.main : "#2f2f2f",
                    color: me ? "#fff" : "#fff",
                    p: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                    wordBreak: "break-word",
                    // nicer bubbles
                    boxShadow: me ? "0 1px 0 rgba(0,0,0,0.2)" : "none",
                  }}
                >
                  {msg.content}
                </Box>
              </Box>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* INPUT - fixed at bottom of this chat window */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          gap: 1,
          px: 2,
          py: 1,
          borderTop: "1px solid #2b2b2b",
          backgroundColor: "#0f0f0f",
        }}
      >
        <TextField
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Type a message..."
          size="small"
          fullWidth
          InputProps={{
            sx: {
              backgroundColor: "#141414",
              color: "#fff",
              "& .MuiInputBase-input": { px: 1 },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={onSend}
          disabled={!newMessage || newMessage.trim() === ""}
          sx={{
            backgroundColor: "#00c853",
            "&:hover": { backgroundColor: "#00e676" },
            color: "#000",
          }}
        >
          SEND
        </Button>
      </Box>
    </Box>
  );
}
