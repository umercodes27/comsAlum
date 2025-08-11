import React, { useState } from "react";
import {
  Box,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography
} from "@mui/material";

export default function ChatList({ friends, onSelectFriend }) {
  const [search, setSearch] = useState("");

  const filteredFriends = friends.filter(f =>
    `${f.firstName} ${f.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
      <TextField
        variant="outlined"
        placeholder="Search..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{
          mb: 2,
          input: { color: "white" },
          "& .MuiOutlinedInput-root fieldset": { borderColor: "#555" }
        }}
      />
      <List>
        {filteredFriends.length > 0 ? (
          filteredFriends.map(friend => {
            const imgSrc = `${import.meta.env.VITE_SERVER_URL}/assets/${
              friend.picturePath || "default-profile.jpg"
            }`;

            return (
              <ListItemButton
                key={friend.id}
                onClick={() => onSelectFriend(friend)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={imgSrc}
                    alt={`${friend.firstName} ${friend.lastName}`}
                    onError={(e) => {
                      e.target.src = `${import.meta.env.VITE_SERVER_URL}/assets/default-profile.jpg`;
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={`${friend.firstName} ${friend.lastName}`}
                  primaryTypographyProps={{ color: "#fff" }}
                />
              </ListItemButton>
            );
          })
        ) : (
          <Typography color="gray">No friends found</Typography>
        )}
      </List>
    </Box>
  );
}
