import { Box, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux"; // Importing useSelector to access Redux store state
import UserWidget from "components/UserImage"; // Importing UserWidget component
import Navbar from "../navbar";
import MyPostWidget from "scenes/widgets/MyPostWidget"; // Importing MyPostWidget 
import PostsWidget from "scenes/widgets/PostsWidget"; // Importing PostsWidget component
import AdvertWidget from "scenes/widgets/AdvertWidget"; // Importing AdvertWidget component
import FriendListWidget from "scenes/widgets/FriendListWidget"; // Importing FriendListWidget component
// import ad from "data/ad"; // Importing advertisement data
import Friend from "components/Friend";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)"); // Check if the screen size is non-mobile
  const { _id, picturePath } = useSelector((state) => state.user); // Destructure user ID and picture path from Redux store

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"} // Use flexbox for non-mobile screens
        gap="2rem"
        justifyContent="space-between"
      >
        <Box 
          flexBasis={isNonMobileScreens ? "26%" : undefined}>  {/* Sidebar for non-mobile screens */}
          <UserWidget userId={_id} picturePath={picturePath} /> {/* User widget component */}
        </Box>

        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt = {isNonMobileScreens ? undefined : "2rem"}
          >
          <MyPostWidget picturePath={picturePath} /> {/* My post widget component */}
          <PostsWidget userId={_id} /> {/* Posts widget component */}
        </Box>
        
        {isNonMobileScreens && <Box flexBasis="26%">
          <AdvertWidget /> {/* Advert widget component */}
          </Box>}  {/* Advert widget for non-mobile screens */}
          <Box m="2rem 0" /> {/* Margin for spacing */}
          <FriendListWidget userId={_id} picturePath={picturePath} /> {/* Friend list widget component */}
    </Box>
    </Box>
  );
}

export default HomePage;
// This code defines a simple React functional component called HomePage.