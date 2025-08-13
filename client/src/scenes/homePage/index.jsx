import { Box, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import UserWidget from "scenes/widgets/UserWidget";
import Navbar from "../navbar";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import AdvertWidget from "scenes/widgets/AdvertWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const { _id, picturePath } = useSelector((state) => state.user);

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="1rem 5%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="1rem"
        justifyContent="space-between"
      >
        {/* Left Column - Sticky User Widget */}
        <Box
          flexBasis={isNonMobileScreens ? "26%" : undefined}
          sx={{
            position: isNonMobileScreens ? "sticky" : "static",
            top: "60px", // Adjust for Navbar height
            alignSelf: "flex-start",
          }}
        >
          <UserWidget userId={_id} picturePath={picturePath} />
        </Box>

        {/* Middle Column - Posts */}
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "1rem"}
        >
          <MyPostWidget picturePath={picturePath} />
          <PostsWidget userId={_id} />
        </Box>

        {/* Right Column - Advert (scrolls normally) + Sticky Friend List */}
        {isNonMobileScreens && (
          <Box flexBasis="26%">
            <AdvertWidget /> {/* This scrolls away normally */}
            <Box
              sx={{
                position: "sticky",
                top: "60px", // Becomes sticky once it hits this point
                alignSelf: "flex-start",
                mt: "1rem",
              }}
            >
              <FriendListWidget userId={_id} picturePath={picturePath} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
