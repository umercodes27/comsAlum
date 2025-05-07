import { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    CircularProgress,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik";
import * as Yup from "yup";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
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
    const theme = useTheme();
    const palette = theme.palette;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isNonMobileScreens = useMediaQuery("(min-width: 600px)");
    const isLogin = pageType === "login";
    const isRegister = pageType === "register";

    const register = async (values, onSubmitProps) => {
        try {
            const formData = new FormData();
    
            // ✅ Append the actual file for Multer
            formData.append("picture", values.picturePath);
    
            // ✅ Append just the filename for MongoDB
            formData.append("picturePath", values.picturePath.name);
    
            // ✅ Append remaining fields, excluding 'picturePath' (already handled)
            for (const key in values) {
                if (key !== "picturePath") {
                    formData.append(key, values[key]);
                }
            }
    
            const savedUserResponse = await fetch("http://localhost:3001/auth/register", {
                method: "POST",
                body: formData,
            });
    
            if (!savedUserResponse.ok) {
                const errorText = await savedUserResponse.text();
                throw new Error(errorText || "Registration failed");
            }
    
            const savedUser = await savedUserResponse.json();
            onSubmitProps.resetForm();
            if (savedUser) {
                setPageType("login");
            }
        } catch (error) {
            alert("Registration failed: " + error.message);
        }
    };
    

    const login = async (values, onSubmitProps) => {
        try {
            const loggedInResponse = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!loggedInResponse.ok) {
                const errorText = await loggedInResponse.text();
                throw new Error(errorText || "Login failed");
            }

            const loggedIn = await loggedInResponse.json();
            onSubmitProps.resetForm();

            if (loggedIn) {
                dispatch(setLogin({ user: loggedIn.user, token: loggedIn.token }));
                navigate("/home");
            }
        } catch (error) {
            alert("Login failed: " + error.message);
        }
    };

    const handleFormSubmit = async (values, onSubmitProps) => {
        if (isLogin) await login(values, onSubmitProps);
        if (isRegister) await register(values, onSubmitProps);
    };

    return (
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
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.firstName}
                                    name="firstName"
                                    error={!!touched.firstName && !!errors.firstName}
                                    helperText={touched.firstName && errors.firstName}
                                    sx={{ gridColumn: "span 2" }}
                                />
                                <TextField
                                    label="Last Name"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.lastName}
                                    name="lastName"
                                    error={!!touched.lastName && !!errors.lastName}
                                    helperText={touched.lastName && errors.lastName}
                                    sx={{ gridColumn: "span 2" }}
                                />
                                <TextField
                                    label="Location"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.location}
                                    name="location"
                                    error={!!touched.location && !!errors.location}
                                    helperText={touched.location && errors.location}
                                    sx={{ gridColumn: "span 4" }}
                                />
                                <TextField
                                    label="Occupation"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    value={values.occupation}
                                    name="occupation"
                                    error={!!touched.occupation && !!errors.occupation}
                                    helperText={touched.occupation && errors.occupation}
                                    sx={{ gridColumn: "span 4" }}
                                />
                                <Box
                                    gridColumn="span 4"
                                    border={`1px solid ${palette.neutral.medium}`}
                                    borderRadius="5px"
                                    padding="1rem"
                                >
                                    <Dropzone
                                        acceptedFiles=".jpg,.jpeg,.png"
                                        multiple={false}
                                        onDrop={(acceptedFiles) => {
                                            if (acceptedFiles.length > 0) {
                                            setFieldValue("picturePath", acceptedFiles[0]);
                                            } else {
                                            alert("Invalid file type!");
                                            }
                                        }}
                                        >
                                        {({ getRootProps, getInputProps, open }) => (
                                            <Box
                                            {...getRootProps({ className: 'dropzone', onClick: (e) => e.preventDefault() })}
                                            border={`2px dashed ${palette.primary.main}`}
                                            sx={{ "&:hover": { cursor: "pointer" } }}
                                            padding="1rem"
                                            textAlign="center"
                                            >
                                            <input {...getInputProps()} />

                                            {values.picturePath ? (
                                                <Box display="flex" flexDirection="column" alignItems="center">
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
                                                        open(); // 👈 Trigger file picker manually
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
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.email}
                            name="email"
                            error={!!touched.email && !!errors.email}
                            helperText={touched.email && errors.email}
                            sx={{ gridColumn: "span 4" }}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.password}
                            name="password"
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
                                backgroundColor: isSubmitting ? palette.neutral.medium : palette.primary.main,
                                color: palette.background.alt,
                                "&:hover": {
                                    backgroundColor: palette.primary.light,
                                },
                            }}
                        >
                            {isSubmitting ? (
                                <CircularProgress size={24} sx={{ color: palette.background.alt }} />
                            ) : (
                                isLogin ? "LOGIN" : "REGISTER"
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
            )}
        </Formik>
    );
};

export default Form;
