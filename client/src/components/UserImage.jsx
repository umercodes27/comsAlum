import { Box } from "@mui/material";

const UserImage = ({ image, size = "60px" }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const ASSETS_URL = API_BASE_URL.replace("/api", "/assets");

  return (
    <Box width={size} height={size}>
      <img
        style={{
          objectFit: "cover",
          borderRadius: "50%",
          width: size,
          height: size,
        }}
        alt="user"
        src={`${ASSETS_URL}/${image || "default-profile.jpg"}`}
      />
    </Box>
  );
};

export default UserImage;
