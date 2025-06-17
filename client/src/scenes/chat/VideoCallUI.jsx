// src/scenes/chat/VideoCallUI.jsx
import React, { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';

const VideoCallUI = ({ activeChat, leaveVideoRoom }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={1300}
      bgcolor="black"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box display="flex" gap={2} justifyContent="center" width="100%" px={2} position="relative">
        {/* Local Video */}
        <Box
          sx={{
            position: 'relative',
            width: '45%',
            height: '70%',
            backgroundColor: '#111',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box id="local-video" sx={{ width: '100%', height: '100%' }} />
          <Box
            position="absolute"
            top={8}
            left={8}
            px={1.5}
            py={0.5}
            bgcolor="#00000099"
            borderRadius={1}
          >
            <Typography variant="caption" color="#fff">
              You
            </Typography>
          </Box>
        </Box>

        {/* Remote Video */}
        <Box
          sx={{
            position: 'relative',
            width: '45%',
            height: '70%',
            backgroundColor: '#222',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box id="remote-video" sx={{ width: '100%', height: '100%' }} />
          <Box
            position="absolute"
            top={8}
            left={8}
            px={1.5}
            py={0.5}
            bgcolor="#00000099"
            borderRadius={1}
          >
            <Typography variant="caption" color="#fff">
              {activeChat?.firstName || 'Remote'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="error"
        onClick={leaveVideoRoom}
        sx={{ position: 'absolute', top: 20, right: 20 }}
      >
        Leave Call
      </Button>
    </Box>
  );
};

export default VideoCallUI;
