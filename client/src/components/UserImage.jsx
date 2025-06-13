import { Box } from "@mui/material";

const UserImage = ({ image, size = "60px" }) => {
  return (
    <Box width={size} height={size}>
      <img
        style={{
          objectFit: "cover",
          borderRadius: "50%",
          width: size,      // ✅ use the actual prop
          height: size,     // ✅ use the actual prop
        }}
        alt="user"
        src={`http://localhost:3001/assets/${image || "default-profile.jpg"}`}
      />
    </Box>
  );
};

export default UserImage;
