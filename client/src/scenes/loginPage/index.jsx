import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import Form from "scenes/loginPage/Form"; // Importing the Form component for login functionality

const LoginPage = () => {
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
      }}
    >
      /* Background Image */
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkTKOtWxWf6o2drF7LvrVYsnIi23Bf_-qTuQ&s')`, // People graduating
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 1,
          }}
        />
        {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.6)",
          zIndex: 2,
        }}
      />
      {/* Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        {/* Left Side Text */}
        <Box
          sx={{
            flex: 1,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: { xs: "center", md: "flex-start" },
            px: { xs: 2, md: 10 },
            mb: { xs: 4, md: 0 },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{ mb: 2, fontSize: { xs: "2.5rem", md: "3.5rem" } }}
          >
            Welcome to comsAlum
          </Typography>
          <Typography
            variant="h5"
            fontWeight={400}
            color="rgba(255,255,255,0.85)"
            sx={{ maxWidth: 500 }}
          >
            A platform where you can connect and stay updated with your school alumni !!!
          </Typography>
        </Box>
        {/* Right Side Form */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            width={isNonMobileScreens ? "70%" : "93%"}
            p="2rem"
            borderRadius="1.5rem"
            backgroundColor={theme.palette.background.alt}
            boxShadow={3}
            minWidth={320}
            maxWidth={400}
          >
            <Box width="100%" textAlign="center" mb={2}>
              <Typography fontWeight="bold" fontSize="32px" color="primary">
                comsAlum
              </Typography>
            </Box>
            <Form />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;