import { Box } from "@mui/material";
import { styled } from "@mui/system";

const FlexBetween = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: "0.5rem",
  },
}));

export default FlexBetween;
// This component is a styled Box component from Material-UI that uses the styled API to create a custom FlexBetween component.
// It applies flexbox styles to create a layout that justifies content between two ends and aligns items in the center. 
// The gap between items is set to 1rem, and on small screens (defined by the theme's breakpoints), it changes to a column layout with a smaller gap of 0.5rem.
// This is useful for creating responsive layouts that adapt to different screen sizes.