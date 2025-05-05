import {Box} from "@mui/material";
import { styled } from "@mui/system";

const WidgetWrapper = styled(Box)(({ theme }) => ({
  padding: "1.5rem 2rem",
  backgroundColor: theme.palette.background.alt,
  borderRadius: "0.75rem",
  marginBottom: "1.5rem",
}));

export default WidgetWrapper; // WidgetWrapper.jsx
// This component is a styled Box component from Material-UI. 
// It is used to create a consistent wrapper for widgets in the application. 
// The styling includes padding, background color, border radius, and margin at the bottom.