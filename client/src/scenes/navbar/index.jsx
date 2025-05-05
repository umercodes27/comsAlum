import React from 'react';
import { useState } from 'react';
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
import { useDispatch ,useSelector } from 'react-redux';
import { setMode, setLogout } from 'state';
import { useNavigate } from 'react-router-dom';
import FlexBetween from 'components/FlexBetween';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const neutralDark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

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
          Sociopedia
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

      {/* DESKTOP NAV*/}
      {isNonMobileScreens ? (<FlexBetween gap="2rem">
        <IconButton onClick={() => dispatch(setMode())}>
          {theme.palette.mode === "dark" ? (
            <DarkMode sx={{ fontSize: "25px" }} />
          ) : (
            <LightMode sx={{ fontSize: "25px", color: theme.palette.neutral.dark }} />
          )}
        </IconButton>
        <Message sx = {{ fontSize: "25px" }} />
        <Notifications sx = {{ fontSize: "25px" }} />
        <Settings sx = {{ fontSize: "25px" }} />
        <Help sx = {{ fontSize: "25px" }} />
        <FormControl variant="standard" value={fullName} >
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
            input = {<InputBase />}
            onChange={(e) => {
              navigate(`/profile/${e.target.value}`);
            }}
            // input={<InputBase />}
          >
            <MenuItem value={fullName}>
            <Typography>{fullName}</Typography></MenuItem>
            <MenuItem onClick={() => dispatch(setLogout())}>Logout</MenuItem>
          </Select>
          </FormControl>

      </FlexBetween>) : (
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
          {/* CLOSE ICON */}
          <Box display="flex" justifyContent="flex-end" padding="1rem">
            <IconButton onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}>
              <Close />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : ( <LightMode sx={{ color: theme.palette.neutral.dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <Message sx={{ fontSize: "25px" }} />
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
    </FlexBetween>
  );
};

export default Navbar;
// This code defines a simple React functional component called Navbar.