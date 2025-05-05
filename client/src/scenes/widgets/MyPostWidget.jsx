import {
    EditOutlined,
    DeleteOutlined,
    AttachFileOutlined,
    ImageOutlined,
    GifBoxOutlined,
    MicOutlined,
    MoreHorizOutlined,
    Palette,
} from "@mui/icons-material";
import { Box, Divider, IconButton, InputBase, Typography, Button, useMediaQuery } from "@mui/material";

import Dropzone from "react-dropzone";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import UserImage from "../../components/UserImage";
import { useState } from "react";
import { useDispatch } from "react-redux"; // Importing useDispatch to dispatch actions to the Redux store
import { setPosts } from "../../state"; // Importing setPosts action to update posts in the Redux store
import { useSelector } from "react-redux"; // Importing useSelector to access Redux store state
import { useTheme } from "@mui/material/styles"; // Importing useTheme to access theme properties

const MyPostWidget = ({ picturePath }) => {
    const dispatch = useDispatch(); // Initialize dispatch to send actions to the Redux store
    const [isImage, setIsImage] = useState(false); // State to check if the post is an image
    const [image, setImage] = useState(null); // State to hold the selected image
    const [post, setPost] = useState(""); // State to hold the post content
    const { palette } = useTheme(); // Get the theme palette for styling
    const { _id } = useSelector((state) => state.user); // Get the user ID from the Redux store
    const token = useSelector((state) => state.token); // Get the JWT token from the Redux store

    const isNonMobileScreens = useMediaQuery("(min-width: 1000px)"); // Check if the screen size is non-mobile
    const mediumMain = palette.neutral.mediumMain; // Get the medium main color from the theme palette
    const medium = palette.neutral.medium; // Get the medium color from the theme palette

    const handlePost = async () => {
        const formData = new FormData(); // Create a new FormData object to send data in a multipart/form-data format
        formData.append("userId", _id); // Append user ID to the form data
        formData.append("description", post); // Append post content to the form data
        if (image) {
            formData.append("picture", image); // Append image file to the form data if it exists
            formData.append("userPicturePath", picturePath); // Append user picture path to the form data
        }
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/posts`, {
            method: "POST",
            body: formData,
            headers: { Authorization: `Bearer ${token}` },
          }); // Send a POST request to the server with the form data and authorization token          
        const posts = await response.json(); // Parse the response as JSON
        dispatch(setPosts({ posts })); // Dispatch action to update posts in the Redux store
        resetFields(); // Reset input fields after posting
    };

    return (
        <WidgetWrapper>
            <FlexBetween gap={"1.5rem"}>
                <UserImage image={picturePath} size="60px" />
                <InputBase
                    placeholder="What's on your mind..."
                    onChange={(e) => setPost(e.target.value)} // Update post content state on change
                    value={post} // Bind input value to post state
                    sx={{
                        width: "100%",
                        backgroundColor: palette.neutral.light,
                        borderRadius: "2rem",
                        padding: "1rem 2rem",
                    }}
                />
            </FlexBetween>
            {isImage && (
                <Box
                border={'1px solid ${medium}'}
                borderRadius={"5px"}
                mt={'1rem'}
                p={'1rem'}
                >
                    <Dropzone 
                    acceptedFiles=".jpg,.jpeg,.png"
                    multiple={false}
                    onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}>
                        {({ getRootProps, getInputProps }) => (
                            <FlexBetween>
                                <Box
                                    {...getRootProps()}
                                    border={`2px dashed ${mediumMain}`}
                                    p={"1rem"}
                                    width={"100%"}
                                    sx={{ "&:hover": { cursor: "pointer" } }}
                                >
                                    <input {...getInputProps()} />
                                    {!image ? (
                                        <p>Add Image Here</p>
                                    ) : (
                                        <FlexBetween>
                                            <Typography>{image.name}</Typography>
                                            <EditOutlined />
                                        </FlexBetween>
                                    )}
                                </Box>
                                {image && (
                                    <IconButton
                                        onClick={() => setImage(null)}
                                        sx={{ width: "15%" }}
                                    >
                                        <DeleteOutlined />
                                    </IconButton>
                                )}
                            </FlexBetween>
                        )}
                    </Dropzone>
                </Box>)}
            <Divider sx={{ margin: "1.25rem 0" }} />

            <FlexBetween>
                <FlexBetween gap={"0.25rem"} 
                onClick={() => setIsImage(!isImage)}>
                    <ImageOutlined sx={{ color: mediumMain }} />
                    <Typography
                        color={mediumMain}
                        sx={{ "&:hover": { cursor: "pointer", color: medium } }}
                    >
                        Image
                    </Typography>
                </FlexBetween>
                {isNonMobileScreens ? (
                    <>
                    <FlexBetween gap={"0.25rem"}>
                        <GifBoxOutlined sx={{ color: mediumMain }} />
                        <Typography
                            color={mediumMain}
                            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
                        >
                            Clip
                        </Typography>
                    </FlexBetween>
                    <FlexBetween gap={"0.25rem"}>
                        <AttachFileOutlined sx={{ color: mediumMain }} />
                        <Typography
                            color={mediumMain}
                            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
                        >
                            Attachment
                        </Typography>
                    </FlexBetween>
                    <FlexBetween gap={"0.25rem"}>
                        <MicOutlined sx={{ color: mediumMain }} />
                        <Typography
                            color={mediumMain}
                            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
                        >
                            Audio
                        </Typography>
                    </FlexBetween>
                    </>) : (
                        <FlexBetween gap={"0.25rem"}>
                            <MoreHorizOutlined sx={{ color: mediumMain }} />
                        </FlexBetween>
                    )} 

                    <Button 
                        disabled ={!post}
                        onClick={handlePost}
                        sx={{
                            color: palette.background.alt,
                            backgroundColor: palette.primary.main,
                            borderRadius: "3rem"
                        }}>
                        Post
                    </Button>
            </FlexBetween>
        </WidgetWrapper>
    )
}

export default MyPostWidget;