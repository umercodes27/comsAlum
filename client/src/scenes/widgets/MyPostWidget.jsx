import {
  EditOutlined,
  DeleteOutlined,
  AttachFileOutlined,
  ImageOutlined,
  GifBoxOutlined,
  MicOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  InputBase,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import Dropzone from "react-dropzone";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import UserImage from "../../components/UserImage";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { setPosts } from "../../state";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [post, setPost] = useState("");
  const [isClip, setIsClip] = useState(false);
  const [clip, setClip] = useState(null);
  const [isAttachment, setIsAttachment] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isAudio, setIsAudio] = useState(false);
  const [audio, setAudio] = useState(null);
  const { palette } = useTheme();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

  const resetFields = () => {
    setPost("");
    setImage(null);
    setClip(null);
    setAttachment(null);
    setAudio(null);
    setIsImage(false);
    setIsClip(false);
    setIsAttachment(false);
    setIsAudio(false);
  };

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("description", post);

    if (image) {
      formData.append("picture", image);
      formData.append("picturePath", image.name);
      formData.append("userPicturePath", picturePath);
    }

    // You can also append clip, attachment, and audio here if backend supports it

    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/posts`, {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
    const posts = await response.json();
    dispatch(setPosts({ posts }));
    resetFields();
    console.log("Post uploaded successfully:", posts);
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} size="60px" />
        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => setPost(e.target.value)}
          value={post}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
            BoxShadow: "0 0 5px rgba(0,0,0,0.1)",
          }}
        />
      </FlexBetween>

      {/* IMAGE DROPZONE */}
      {isImage && (
        <FileDropzone
          file={image}
          setFile={setImage}
          acceptedFiles=".jpg,.jpeg,.png"
          label="Add Image Here"
          medium={medium}
          mediumMain={mediumMain}
        />
      )}

      {/* CLIP DROPZONE */}
      {isClip && (
        <FileDropzone
          file={clip}
          setFile={setClip}
          acceptedFiles=".mp4,.mov,.avi,.webm"
          label="Add Video Clip Here"
          medium={medium}
          mediumMain={mediumMain}
        />
      )}

      {/* ATTACHMENT DROPZONE */}
      {isAttachment && (
        <FileDropzone
          file={attachment}
          setFile={setAttachment}
          acceptedFiles=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          label="Add Attachment Here"
          medium={medium}
          mediumMain={mediumMain}
        />
      )}

      {/* AUDIO DROPZONE */}
      {isAudio && (
        <FileDropzone
          file={audio}
          setFile={setAudio}
          acceptedFiles=".mp3,.wav,.ogg"
          label="Add Audio File Here"
          medium={medium}
          mediumMain={mediumMain}
        />
      )}

      <Divider sx={{ margin: "1rem 0" }} />

      <FlexBetween>
        <FlexBetween
          gap="0.25rem"
          onClick={() => {
            setIsImage(!isImage);
            setIsClip(false);
            setIsAttachment(false);
            setIsAudio(false);
          }}
        >
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography sx={{ color: mediumMain, "&:hover": { cursor: "pointer", color: medium } }}>
            Image
          </Typography>
        </FlexBetween>

        {isNonMobileScreens && (
          <>
            <FlexBetween
              gap="0.25rem"
              onClick={() => {
                setIsClip(!isClip);
                setIsImage(false);
                setIsAttachment(false);
                setIsAudio(false);
              }}
            >
              <GifBoxOutlined sx={{ color: mediumMain }} />
              <Typography sx={{ color: mediumMain, "&:hover": { cursor: "pointer", color: medium } }}>
                Clip
              </Typography>
            </FlexBetween>

            <FlexBetween
              gap="0.25rem"
              onClick={() => {
                setIsAttachment(!isAttachment);
                setIsImage(false);
                setIsClip(false);
                setIsAudio(false);
              }}
            >
              <AttachFileOutlined sx={{ color: mediumMain }} />
              <Typography sx={{ color: mediumMain, "&:hover": { cursor: "pointer", color: medium } }}>
                Attachment
              </Typography>
            </FlexBetween>

            <FlexBetween
              gap="0.25rem"
              onClick={() => {
                setIsAudio(!isAudio);
                setIsImage(false);
                setIsClip(false);
                setIsAttachment(false);
              }}
            >
              <MicOutlined sx={{ color: mediumMain }} />
              <Typography sx={{ color: mediumMain, "&:hover": { cursor: "pointer", color: medium } }}>
                Audio
              </Typography>
            </FlexBetween>
          </>
        )}

        <Button
          disabled={!post && !image && !clip && !attachment && !audio}
          onClick={handlePost}
          sx={{
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          Post
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

// Reusable Dropzone Component
const FileDropzone = ({ file, setFile, acceptedFiles, label, medium, mediumMain }) => (
  <Box border={`1px solid ${medium}`} borderRadius="5px" mt="1rem" p="1rem">
    <Dropzone acceptedFiles={acceptedFiles} multiple={false} onDrop={(files) => setFile(files[0])}>
      {({ getRootProps, getInputProps }) => (
        <FlexBetween>
          <Box
            {...getRootProps()}
            border={`2px dashed ${mediumMain}`}
            p="1rem"
            width="100%"
            sx={{ "&:hover": { cursor: "pointer" } }}
          >
            <input {...getInputProps()} />
            {!file ? (
              <p>{label}</p>
            ) : (
              <FlexBetween>
                <Typography>{file.name}</Typography>
                <EditOutlined />
              </FlexBetween>
            )}
          </Box>
          {file && (
            <IconButton onClick={() => setFile(null)} sx={{ width: "15%" }}>
              <DeleteOutlined />
            </IconButton>
          )}
        </FlexBetween>
      )}
    </Dropzone>
  </Box>
);

export default MyPostWidget;
