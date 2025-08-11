import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";

export default function VideoCallScreen({
  localVideoRef,
  remoteVideoRef,
  onEnd,
}) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      {/* Remote video container */}
      <Box
        ref={remoteVideoRef}
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
          position: "relative",
          overflow: "hidden",
          objectFit: "cover",
        }}
      />

      {/* Local video container in corner */}
      <Box
        ref={localVideoRef}
        sx={{
          position: "absolute",
          bottom: 20,
          right: 20,
          width: "200px",
          height: "150px",
          borderRadius: "8px",
          backgroundColor: "#000",
          border: "2px solid white",
          overflow: "hidden",
        }}
      />

      {/* End call button */}
      <IconButton
        onClick={onEnd}
        sx={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "red",
          "&:hover": { backgroundColor: "#cc0000" },
        }}
      >
        <CallEndIcon sx={{ color: "white", fontSize: 40 }} />
      </IconButton>

      <Typography
        variant="subtitle1"
        sx={{
          position: "absolute",
          top: 10,
          color: "white",
          textShadow: "0 0 4px black",
        }}
      >
        Video Call in Progress
      </Typography>
    </Box>
  );
}
