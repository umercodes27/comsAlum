import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import { Box, Button, Typography, useTheme } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Friend = ({ friendId, name, subtitle, userPicturePath }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {_id} = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);
    const loggedInUserId = useSelector((state) => state.user._id);
    const isFriend = useSelector((state) =>
        state.user.friends.find((friend) => friend._id === friendId)
);
const { palette } = useTheme();
const primaryLight = palette.primary.light;
const primaryDark = palette.primary.dark;
const main = palette.neutral.main;
const medium = palette.neutral.medium;

    const patch = async () => {
        const response = await fetch(`http://localhost:3001${url}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return data;
    };

    const handleAddFriend = async () => {
        const updatedFriends = await patch(`/users/${loggedInUserId}/friends`, { friendId });
        dispatch(setFriends({ friends: updatedFriends }));
    };

    const handleRemoveFriend = async () => {
        const updatedFriends = await patch(`/users/${loggedInUserId}/friends/${friendId}`);
        dispatch(setFriends({ friends: updatedFriends }));
    };

    return (
        <FlexBetween gap="0.5rem" pb="0.5rem" key={friendId}>
            <FlexBetween gap="1rem">
                <UserImage image={userPicturePath} size="55px" />
                <Box>
                    <Typography variant="h4" color="#111">{name}</Typography>
                    <Typography color="#808191">{subtitle}</Typography>
                </Box>
            </FlexBetween>
            {isFriend ? (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleRemoveFriend}
                    sx={{ borderRadius: "0.5rem", padding: "0.6rem 1.2rem" }}
                >
                    Remove Friend
                </Button>
            ) : (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddFriend}
                    sx={{ borderRadius: "0.5rem", padding: "0.6rem 1.2rem" }}
                >
                    Add Friend
                </Button>
            )}
        </FlexBetween>
    );
}
  

export default Friend;