import React, { useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import ChatList from "./ChatList";         // your file (named ChatList)
import ChatWindow from "./ChatWindow";
import VideoCallScreen from "./VideoCallScreen";
import IncomingCallToast from "./IncomingCallToast";

export default function ChatPageUI({
  friends,
  search,
  setSearch,
  activeChat,
  onSelectFriend,
  messages,
  newMessage,
  setNewMessage,
  handleSend,
  isVideoCall,
  leaveVideoRoom,
  getVideoToken,
  lastMessages,
  incomingCallToast,
  onAcceptCall,
  onRejectCall,
  localVideoRef,
  remoteVideoRef,
  currentUserId, // optional, pass your logged-in user's id if available
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  // mobile detection
  const isSmallScreen = useMediaQuery("(max-width:768px)");

  const toggleMaximize = () => setIsMaximized((s) => !s);

  // Normal (not maximized) layout:
  // - On small screens: show ChatList (until a chat is selected), then ChatWindow
  // - On larger screens: show both side-by-side (ChatList 30% / ChatWindow 70%)
  if (!isMaximized) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          backgroundColor: "#181818",
        }}
      >
        {/* Chat list: visible on left (or full width on mobile if no activeChat) */}
        {(!activeChat || !isSmallScreen) && (
          <Box
            sx={{
              width: isSmallScreen ? "100%" : "30%",
              minWidth: 160,
              borderRight: isSmallScreen ? "none" : "1px solid #333",
              backgroundColor: "#101010",
              overflow: "hidden",
            }}
          >
            <ChatList
              friends={friends}
              search={search}
              setSearch={setSearch}
              lastMessages={lastMessages}
              onSelectFriend={(friend) => {
                onSelectFriend(friend);
              }}
            />
          </Box>
        )}

        {/* Chat window: full width on mobile when activeChat, otherwise right column on desktop */}
        {activeChat && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              minHeight: 0, // important for child flex scrolling
            }}
          >
            <ChatWindow
              activeChat={activeChat}
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSend={handleSend}
              onBack={() => onSelectFriend(null)}
              getVideoToken={getVideoToken}
              getAudioToken={() => {
                /* implement if you have audio-call logic */
              }}
              toggleMaximize={toggleMaximize}
              isMaximized={false}
              currentUserId={currentUserId}
            />
          </Box>
        )}
      </Box>
    );
  }

  // Maximized layout: fullscreen overlay with chat list (25%) + chat window (75%)
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.45)", // dim backdrop
        p: 2,
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Box
        sx={{
          width: "96%",
          height: "96%",
          display: "flex",
          backgroundColor: "#0f0f0f",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 24,
        }}
      >
        {/* Left: Chat list ~25% */}
        <Box sx={{ width: "25%", minWidth: 260, borderRight: "1px solid #333", overflow: "hidden" }}>
          <ChatList
            friends={friends}
            search={search}
            setSearch={setSearch}
            lastMessages={lastMessages}
            onSelectFriend={(friend) => {
              onSelectFriend(friend);
            }}
          />
        </Box>

        {/* Right: Chat window ~75% */}
        <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
          <ChatWindow
            activeChat={activeChat}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSend={handleSend}
            onBack={() => {
              /* In maximized mode back could close maximize or unselect */
                <Typography
                variant="h6"
                color="text.secondary"
                sx={{ textAlign: "center", width: "100%", mt: 4 }}
                >
                Select a friend to start chatting
                </Typography>
            }}
            getVideoToken={getVideoToken}
            getAudioToken={() => {}}
            toggleMaximize={toggleMaximize}
            isMaximized={true}
            currentUserId={currentUserId}
          />
        </Box>
      </Box>

      {/* Incoming call toast + Video screen (rendered as separate overlays if needed) */}
      <IncomingCallToast
        open={!!incomingCallToast}
        callerName={incomingCallToast?.fromName}
        onAccept={onAcceptCall}
        onReject={onRejectCall}
      />

      {isVideoCall && (
        <VideoCallScreen localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} onEnd={leaveVideoRoom} />
      )}
    </Box>
  );
}
