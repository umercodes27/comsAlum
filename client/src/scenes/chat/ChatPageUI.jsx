import React, { useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  IconButton,
  Snackbar,
  Slide,
  useTheme,
} from '@mui/material';
import { Videocam, Call } from '@mui/icons-material';
import FlexBetween from 'components/FlexBetween';
import WidgetWrapper from 'components/WidgetWrapper';

const ChatPageUI = ({
  friends,
  search,
  setSearch,
  activeChat,
  setActiveChat,
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
}) => {
  const theme = useTheme();
  const neutralLight = theme.palette.neutral?.light || '#f5f5f5';
  const neutralDark = theme.palette.neutral?.dark || '#333';
  const background = theme.palette.background.default;
  const textPrimary = theme.palette.text.primary;

  useEffect(() => {
    document.body.style.overflow = isVideoCall ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVideoCall]);

  useEffect(() => {
    console.log('Snackbar open:', !!incomingCallToast, 'Toast data:', incomingCallToast);
  }, [incomingCallToast]);

  const filteredFriends = friends.filter((friend) =>
    `${friend.firstName} ${friend.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Snackbar
        open={!!incomingCallToast}
        onClose={onRejectCall}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
        message={`📞 Incoming call from ${incomingCallToast?.fromName || 'Someone'}`}
        action={
          <Box>
            <Button color="success" size="small" onClick={onAcceptCall}>
              Accept
            </Button>
            <Button color="error" size="small" onClick={onRejectCall}>
              Reject
            </Button>
          </Box>
        }
      />
      {isVideoCall ? (
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
            <Box
              sx={{
                position: 'relative',
                width: { xs: '100%', md: '45%' },
                height: { xs: '40%', md: '70%' },
                backgroundColor: '#111',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box ref={localVideoRef} sx={{ width: '100%', height: '100%' }} />
              <Box position="absolute" top={8} left={8} px={1.5} py={0.5} bgcolor="#00000099" borderRadius={1}>
                <Typography variant="caption" color="#fff">
                  You
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                position: 'relative',
                width: { xs: '100%', md: '45%' },
                height: { xs: '40%', md: '70%' },
                backgroundColor: '#222',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box ref={remoteVideoRef} sx={{ width: '100%', height: '100%' }} />
              <Box position="absolute" top={8} left={8} px={1.5} py={0.5} bgcolor="#00000099" borderRadius={1}>
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
      ) : (
        <Box display="flex" height="100vh" bgcolor={background} color={textPrimary}>
          <WidgetWrapper sx={{ width: { xs: '100%', sm: '35%' }, borderRight: `1px solid ${neutralDark}`, overflow: 'auto' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
            />
            {filteredFriends.length === 0 ? (
              <Typography color="textSecondary">No friends found.</Typography>
            ) : (
              <List dense>
                {filteredFriends.map((friend) => (
                  <ListItem sx={{ padding: '4px 4px' }} key={friend._id} disablePadding>
                    <ListItemButton
                      selected={activeChat?._id === friend._id}
                      onClick={() => setActiveChat(friend)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        padding: '4px 4px',
                        bgcolor: activeChat?._id === friend._id ? neutralDark : 'transparent',
                        '&:hover': { backgroundColor: neutralLight },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 20, marginRight: 1 }}>
                        <Avatar
                          src={`${import.meta.env.VITE_SERVER_URL}/assets/${friend.picturePath || 'default-profile.jpg'}`}
                          alt={`${friend.firstName} ${friend.lastName}`}
                          sx={{ width: 28, height: 28 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography fontWeight={600}>{friend.firstName} {friend.lastName}</Typography>}
                        secondary={lastMessages[friend._id] || ''}
                        sx={{ fontSize: '0.25rem', color: textPrimary }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </WidgetWrapper>
          <Box flexGrow={1} display="flex" flexDirection="column" height="100vh">
            {activeChat && (
              <Box px={2} py={1}>
                <FlexBetween>
                  <Typography fontWeight={600} fontSize="1rem" color="white">
                    {activeChat.firstName} {activeChat.lastName}
                  </Typography>
                  <Box>
                    <IconButton onClick={getVideoToken} title="Start Video Call" sx={{ color: 'white' }}>
                      <Videocam />
                    </IconButton>
                    <IconButton disabled title="Audio Call (Coming Soon)" sx={{ color: 'white' }}>
                      <Call />
                    </IconButton>
                  </Box>
                </FlexBetween>
              </Box>
            )}
            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                px: 2,
                py: 1,
                backgroundColor: theme.palette.background.paper,
                height: 'calc(100vh - 64px - 64px)',
              }}
              display="flex"
              flexDirection="column"
            >
              {activeChat ? (
                messages.map((msg, i) => (
                  <Box
                    key={i}
                    maxWidth="75%"
                    mb={1}
                    p={1}
                    borderRadius={2}
                    alignSelf={msg.sender === activeChat._id ? 'flex-end' : 'flex-start'}
                    bgcolor={msg.sender === activeChat._id ? '#bbdefb' : '#e0e0e0'}
                  >
                    <Typography variant="body2" color="black">
                      <strong>{msg.sender === activeChat._id ? 'Me' : activeChat.firstName}:</strong> {msg.content}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="textSecondary" align="center" mt={8}>
                  Select a friend to start chatting.
                </Typography>
              )}
            </Box>
            {activeChat && (
              <Box
                display="flex"
                alignItems="center"
                px={2}
                py={1}
                borderTop={`1px solid ${neutralDark}`}
                bgcolor={neutralLight}
                sx={{ position: 'sticky', bottom: 0, zIndex: 10 }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  variant="outlined"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  sx={{ borderRadius: '4px 0 0 4px' }}
                />
                <Button
                  variant="contained"
                  onClick={handleSend}
                  disabled={!newMessage}
                  sx={{ height: '40px', borderRadius: '0 4px 4px 0', ml: 1 }}
                >
                  Send
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default ChatPageUI;