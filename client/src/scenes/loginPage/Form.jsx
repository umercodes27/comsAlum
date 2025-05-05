import { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik"; //formik library
import * as Yup from "yup"; //validation library
import Dropzone from "react-dropzone"; //for file upload
import FlexBetween from "components/FlexBetween"; //custom component for flexbox layout
import { useNavigate } from "react-router-dom"; //for navigation
import { useDispatch} from "react-redux"; //redux hooks
import { setLogin } from "state"; //redux action to set login state 

const registerSchema = Yup.object().shape({
    firstName: Yup.string().required("required"),
    lastName: Yup.string().required("required"),
    email: Yup.string().email("invalid email").required("required"),
    password: Yup.string().required("required"),
    location: Yup.string().required("required"),
    occupation: Yup.string().required("required"),
    picturePath: Yup.string().required("required"),
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
    const [pageType, setPageType] = useState("login"); //state to toggle between login and register forms
    const palette =useTheme().palette; //theme palette
    const dispatch = useDispatch(); //redux dispatch function
    const navigate = useNavigate(); //navigation function
    const isNonMobileScreens = useMediaQuery("(min-width: 600px)"); //media query for responsive design
    const isLogin = pageType === "login"; //boolean to check if the current page is login or register
    const isRegister = pageType === "register"; //boolean to check if the current page is register

    const register = async (values, onSubmitProps) => {
        const formData = new FormData(); //create a new FormData object to handle file upload
        for (const value in values) {
            formData.append(value, values[value]); //append each value to the FormData object
        } //loop through each value in the values object and append it to the FormData object
        formData.append("picturePath", values.picturePath.name); //append the picturePath to the FormData object
        const savedUserResponse = await fetch("http://localhost:3001/auth/register", { //fetch API to send a POST request to the server
            method: "POST",
            body: formData, //send the FormData object as the request body
    }
 ); //function to handle registration

        const savedUser = await savedUserResponse.json(); //parse the response as JSON
        onSubmitProps.resetForm(); //reset the form values
        if (savedUser) {
            setPageType("login"); //if registration is successful, set the page type to login
        }   
    };

    const handleFormSubmit = async (values, onSubmitProps) => {
        if (isLogin) await login(values, onSubmitProps); //if the page is login, call the login function
        if (isRegister) await register(values, onSubmitProps); //if the page is register, call the register function 
    }; //function to handle form submission

    const login = async (values, onSubmitProps) => {
        const loggedInResponse = await fetch("http://localhost:3001/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });
    
        const loggedIn = await loggedInResponse.json();
        onSubmitProps.resetForm();
        
        if (loggedIn) {
            dispatch(setLogin({ user: loggedIn.user, token: loggedIn.token }));
            navigate("/home");
        } else {
            alert("Login failed! Please check your credentials and try again.");  // Example error handling
        }
    };
    

    return (
        <Formik 
        onSubmit={handleFormSubmit}
        initialValues={isLogin ? initialValuesLogin : initialValuesRegister} //initial values for the form
        validationSchema={isLogin ? loginSchema : registerSchema} //validation schema for the form
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
                                    label="First Name" //input field for first name
                                    onBlur={handleBlur} //onBlur event handler
                                    onChange={handleChange} //onChange event handler
                                    value={values.firstName} //value of the input field
                                    name="firstName" //name of the input field
                                    error={!!touched.firstName && !!errors.firstName} //check if the field has been touched and if there are any errors
                                    //if the field has been touched and there are errors, set error to true
                                    helperText={touched.firstName && errors.firstName} //display error message if there is an error
                                    sx={{ gridColumn: "span 2" }} //grid column span for responsive design
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
                        border={`1px solid ${palette.neutral.medium}`} //border for the dropzone area
                        borderRadius="5px"
                        padding="1rem"
                        >
                            <Dropzone 
                            acceptedFiles=".jpg,.jpeg,.png" //accepted file types
                            multiple={false} //allow multiple files
                            onDrop={(acceptedFiles) => {
                                if (acceptedFiles.length > 0) {
                                    setFieldValue("picturePath", acceptedFiles[0]);
                                } else {
                                    alert("Invalid file type! Please upload a .jpg, .jpeg, or .png file.");
                                }
                            }}
                        >
                                {({ getRootProps, getInputProps }) => ( //getRootProps and getInputProps are functions from the Dropzone library to handle file upload
                                    //getRootProps returns props for the dropzone area
                                    //getInputProps returns props for the input field
                                    <Box
                                        {...getRootProps()} //spread operator to pass the props to the dropzone area
                                        border={`2px dashed ${palette.primary.main}`} //border for the dropzone area
                                        sx={{
                                            "&:hover": {
                                                cursor: "pointer",
                                            },
                                        }}
                                        padding="1rem"
                                        textAlign="center"
                                    >
                                        <input {...getInputProps()} /> {/*input field for file upload*/}
                                        {values.picturePath ? ( //if there is a file uploaded, display the file name
                                            <FlexBetween>
                                                <Typography>{values.picturePath}</Typography>
                                                <EditOutlinedIcon />
                                            </FlexBetween>
                                        ) : (
                                            <p>Add Picture Here</p> //display message if no file is uploaded
                                        )}
                                    </Box>
                                )}
                            </Dropzone>
                        </Box>
                        </>
                    )}
                        <TextField
                            label= "Email"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.email}
                            name="email"
                            error={!!touched.email && !!errors.email} //check if the field has been touched and if there are any errors
                            helperText={touched.email && errors.email} //display error message if there is an error
                            sx={{ gridColumn: "span 4" }} //grid column span for responsive design
                            />
                        <TextField
                            label="Password"
                            type="password" //input type for password
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.password}
                            name="password"
                            error={!!touched.password && !!errors.password} //check if the field has been touched and if there are any errors
                            helperText={touched.password && errors.password} //display error message if there is an error
                            sx={{ gridColumn: "span 4" }} //grid column span for responsive design
                            />
                        </Box>

                        {/* Button to submit the form */}
                        <Box>
                            <Button
                                fullWidth
                                type="submit"
                                sx={{
                                    m: "2rem 0",
                                    p: "1rem",
                                    backgroundColor: palette.primary.main,
                                    color: palette.background.alt,
                                    "&:hover": {
                                        backgroundColor: palette.primary.light,
                                    },
                                }}
                            >
                                {isLogin ? "LOGIN" : "REGISTER"} {/*button text based on the page type*/}
                            </Button>
                            <Typography
                                onClick={() => {
                                    setPageType(isLogin ? "register" : "login"); //toggle between login and register forms
                                    resetForm(); //reset the form values
                                }}
                                sx={{
                                    textDecoration: "underline",
                                    color: palette.primary.main,
                                    "&:hover": {
                                        cursor: "pointer",
                                        color: palette.primary.light,
                                    }
                                }}
                            >
                                {isLogin ? "Don't have an account? Sign Up here." : "Already have an account? Login here."} {/*link to toggle between login and register forms*/}
                            </Typography>
                        </Box>

                        </form>
                    )}
        </Formik>
    )
};

export default Form;  

