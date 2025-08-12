import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import Dropzone from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";

const registerSchema = Yup.object().shape({
  firstName: Yup.string().required("required"),
  lastName: Yup.string().required("required"),
  email: Yup.string().email("invalid email").required("required"),
  password: Yup.string().required("required"),
  location: Yup.string().required("required"),
  occupation: Yup.string().required("required"),
  picturePath: Yup.mixed().required("required"),
});

const loginSchema = Yup.object().shape({
  email: Yup.string().email("invalid email").required("required"),
  password: Yup.string().required("required"),
});

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  location: "",
  occupation: "",
  picturePath: "",
};

const initialValuesLogin = {
  email: "",
  password: "",
};

const Form = () => {
  const [pageType, setPageType] = useState("login");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const theme = useTheme();
  const palette = theme.palette;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isNonMobileScreens = useMediaQuery("(min-width: 600px)");
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const register = async (values, onSubmitProps) => {
    try {
      const formData = new FormData();
      formData.append("picture", values.picturePath);
      formData.append("picturePath", values.picturePath.name);

      for (const key in values) {
        if (key !== "picturePath") {
          formData.append(key, values[key]);
        }
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

      const savedUserResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/auth/register`, {
        method: "POST",
        body: formData,
      });


      if (!savedUserResponse.ok) {
        const errorText = await savedUserResponse.text();
        showSnackbar("Registration failed: " + errorText, "error");
        return;
      }

      const savedUser = await savedUserResponse.json();
      onSubmitProps.resetForm();
      if (savedUser) {
        showSnackbar("Registration successful! Please log in.", "success");
        setPageType("login");
      }
    } catch (error) {
      showSnackbar("Registration failed: " + error.message, "error");
    }
  };

  const login = async (values, onSubmitProps) => {
    const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

    try {
      const loggedInResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!loggedInResponse.ok) {
        const errorText = await loggedInResponse.text();
        showSnackbar("Login failed: " + errorText, "error");
        return;
      }

      const loggedIn = await loggedInResponse.json();
      onSubmitProps.resetForm();
      if (loggedIn) {
        showSnackbar("Login successful!", "success");
        dispatch(setLogin({ user: loggedIn.user, token: loggedIn.token }));
        navigate("/home");
      }
    } catch (error) {
      showSnackbar("Login failed: " + error.message, "error");
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    if (isLogin) await login(values, onSubmitProps);
    if (isRegister) await register(values, onSubmitProps);
  };

  return (
    <>
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            borderRadius: "12px",
            backgroundColor: "#fff",
            color: "#333",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
            border: `1px solid ${palette.primary.light}`,
          },
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: "10px",
            fontWeight: "500",
            backgroundColor:
              snackbarSeverity === "success"
                ? palette.success.main
                : snackbarSeverity === "error"
                ? palette.error.main
                : snackbarSeverity === "warning"
                ? palette.warning.main
                : palette.info.main,
            color: "#fff",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Formik for form handling */}
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
        validationSchema={isLogin ? loginSchema : registerSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
          resetForm,
          isSubmitting,
        }) => (
          <Box
            sx={{
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobileScreens ? undefined : "span 4" },
                }}
              >
                {isRegister && (
                  <>
                    <TextField
                      label="First Name"
                      name="firstName"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.firstName}
                      error={!!touched.firstName && !!errors.firstName}
                      helperText={touched.firstName && errors.firstName}
                      sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                      label="Last Name"
                      name="lastName"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.lastName}
                      error={!!touched.lastName && !!errors.lastName}
                      helperText={touched.lastName && errors.lastName}
                      sx={{ gridColumn: "span 2" }}
                    />
                    <TextField
                      label="Location"
                      name="location"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.location}
                      error={!!touched.location && !!errors.location}
                      helperText={touched.location && errors.location}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <TextField
                      label="Occupation"
                      name="occupation"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.occupation}
                      error={!!touched.occupation && !!errors.occupation}
                      helperText={touched.occupation && errors.occupation}
                      sx={{ gridColumn: "span 4" }}
                    />
                    <Box gridColumn="span 4">
                      <Dropzone
                        acceptedFiles=".jpg,.jpeg,.png"
                        multiple={false}
                        onDrop={(acceptedFiles) =>
                          setFieldValue("picturePath", acceptedFiles[0])
                        }
                      >
                        {({ getRootProps, getInputProps, open }) => (
                          <Box
                            {...getRootProps({
                              className: "dropzone",
                              onClick: (e) => e.preventDefault(),
                            })}
                            border={`2px dashed ${palette.primary.main}`}
                            p="1rem"
                            textAlign="center"
                            sx={{ cursor: "pointer" }}
                          >
                            <input {...getInputProps()} />
                            {values.picturePath ? (
                              <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                              >
                                <img
                                  src={URL.createObjectURL(values.picturePath)}
                                  alt="Preview"
                                  style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                    marginBottom: "0.5rem",
                                  }}
                                />
                                <Typography>{values.picturePath.name}</Typography>
                                <Box display="flex" gap="1rem" mt="0.5rem">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFieldValue("picturePath", "");
                                    }}
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      open();
                                    }}
                                  >
                                    Change
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              <Typography>Add Picture Here</Typography>
                            )}
                          </Box>
                        )}
                      </Dropzone>
                      {touched.picturePath && errors.picturePath && (
                        <Typography color="error" variant="body2">
                          {errors.picturePath}
                        </Typography>
                      )}
                    </Box>
                  </>
                )}

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  error={!!touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>

              <Box>
                <Button
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                  sx={{
                    m: "2rem 0",
                    p: "1rem",
                    backgroundColor: isSubmitting
                      ? palette.neutral.medium
                      : palette.primary.main,
                    color: palette.background.alt,
                    "&:hover": {
                      backgroundColor: palette.primary.light,
                    },
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      sx={{ color: palette.background.alt }}
                    />
                  ) : isLogin ? (
                    "LOGIN"
                  ) : (
                    "REGISTER"
                  )}
                </Button>
                <Typography
                  onClick={() => {
                    setPageType(isLogin ? "register" : "login");
                    resetForm();
                  }}
                  sx={{
                    textDecoration: "underline",
                    color: palette.primary.main,
                    "&:hover": {
                      cursor: "pointer",
                      color: palette.primary.light,
                    },
                  }}
                >
                  {isLogin
                    ? "Don't have an account? Sign Up here."
                    : "Already have an account? Login here."}
                </Typography>
              </Box>
            </form>
          </Box>
        )}
      </Formik>
    </>
  );
};

export default Form;
