import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  Modal,
  Paper,
} from '@mui/material';

import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Settings,
  Menu,
  Close,
  Help,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { setMode, setLogout } from 'state';
import { useNavigate } from 'react-router-dom';
import FlexBetween from 'components/FlexBetween';
import ChatPage from 'scenes/chat/ChatPage';

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullChat, setIsFullChat] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [chatWidth, setChatWidth] = useState(350);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const minChatWidth = 300;
  const maxChatWidth = 600;

  // Resize logic
  const handleResize = (e) => {
    const newWidth = window.innerWidth - e.clientX - 20;
    if (newWidth >= minChatWidth && newWidth <= maxChatWidth) {
      setChatWidth(newWidth);
    }
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", () => setIsResizing(false));
    }
    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", () => setIsResizing(false));
    };
  }, [isResizing]);

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt}>
      <FlexBetween gap="1.75rem">
        <Typography
          variant="h4"
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          comsAlum
        </Typography>
        {isNonMobileScreens && (
          <FlexBetween
            backgroundColor={neutralLight}
            borderRadius="9px"
            gap="3rem"
            padding="0.1rem 1.5rem"
          >
            <InputBase placeholder="Search..." />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ fontSize: "25px", color: theme.palette.neutral.dark }} />
            )}
          </IconButton>

          {/* Optionally remove this if using floating bubble only */}
          {/* <IconButton onClick={() => setIsChatOpen(true)}>
            <Message sx={{ fontSize: "25px" }} />
          </IconButton> */}

          <Notifications sx={{ fontSize: "25px" }} />
          <Settings sx={{ fontSize: "25px" }} />
          <Help sx={{ fontSize: "25px" }} />

          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<InputBase />}
              onChange={(e) => {
                navigate(`/profile/${e.target.value}`);
              }}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Logout</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
          <Menu />
        </IconButton>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          minWidth="300px"
          maxWidth="350px"
          backgroundColor={background}
        >
          <Box display="flex" justifyContent="flex-end" padding="1rem">
            <IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
              <Close />
            </IconButton>
          </Box>
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <IconButton onClick={() => dispatch(setMode())}>
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ fontSize: "25px", color: theme.palette.neutral.dark }} />
              )}
            </IconButton>

            <IconButton onClick={() => setIsChatOpen(true)}>
              <Message sx={{ fontSize: "25px" }} />
            </IconButton>

            <Notifications sx={{ fontSize: "25px" }} />
            <Help sx={{ fontSize: "25px" }} />

            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>
                  Log Out
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}

      {/* CHAT MODAL */}
      <Modal
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        sx={{ zIndex: 1300 }}
      >
        <Paper
          elevation={8}
          sx={{
            width: chatWidth,
            height: isFullChat ? '100%' : 500,
            borderRadius: 2,
            p: 2,
            backgroundColor: theme.palette.background.default,
            position: 'fixed',
            bottom: isFullChat ? 0 : 20,
            right: isFullChat ? 0 : 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1301,
            overflow: 'hidden',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Chat</Typography>
            <Box>
              <IconButton onClick={() => setIsFullChat((prev) => !prev)}>
                {isFullChat ? <Close fontSize="small" /> : <span style={{ fontSize: '1.1rem' }}>⤢</span>}
              </IconButton>
              <IconButton onClick={() => setIsChatOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          <Box flexGrow={1} overflow="hidden">
            <ChatPage />
          </Box>

          {/* Left-side resize handle */}
          <Box
            onMouseDown={() => setIsResizing(true)}
            sx={{
              width: '5px',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              cursor: 'ew-resize',
              zIndex: 10,
            }}
          />
        </Paper>
      </Modal>

      {/* Mini Chat Bubble Button */}
      {!isChatOpen && (
        <IconButton
          onClick={() => setIsChatOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            zIndex: 1200,
            boxShadow: 4,
            width: 56,
            height: 56,
          }}
        >
          <Message />
        </IconButton>
      )}
    </FlexBetween>
  );
};

export default Navbar;
