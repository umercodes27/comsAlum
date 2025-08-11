import React from "react";
import { Snackbar, Alert, Button, Box } from "@mui/material";

export default function IncomingCallToast({ open, callerName, onAccept, onReject }) {
  return (
    <Snackbar open={open} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      <Alert
        severity="info"
        sx={{ backgroundColor: "#638769ff", color: "#fff" }}
        action={
          <Box>
            <Button color="success" size="small" onClick={onAccept}>Accept</Button>
            <Button color="error" size="small" onClick={onReject}>Reject</Button>
          </Box>
        }
      >
        Incoming video call from {callerName}
      </Alert>
    </Snackbar>
  );
}
