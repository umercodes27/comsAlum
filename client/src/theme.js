// ===== Color design tokens =====
export const colorTokens = {
  grey: {
    0: "#FFFFFF",
    10: "#F6F6F6",
    50: "#F0F0F0",
    100: "#E0E0E0",
    200: "#C2C2C2",
    300: "#A3A3A3",
    400: "#858585",
    500: "#666666",
    600: "#4D4D4D",
    700: "#333333",
    800: "#1A1A1A",
    900: "#0A0A0A",
    1000: "#000000",
  },
  primary: {
    50: "#F2FBF3",
    100: "#D7F8DB",
    200: "#B9F2C2",
    300: "#8EEAA7",
    400: "#61D98A",
    500: "#3CCB73",   // ✅ Main light green
    600: "#2DBE66",
    700: "#22AC58",
    800: "#199B4B",
    900: "#0B833A",
  },
};

// ===== MUI Theme settings =====
export const themeSettings = (mode) => {
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            // ===== Dark mode palette =====
            primary: {
              dark: colorTokens.primary[200],
              main: colorTokens.primary[500],
              light: colorTokens.primary[800],
            },
            neutral: {
              dark: colorTokens.grey[100],
              main: colorTokens.grey[200],
              mediumMain: colorTokens.grey[300],
              medium: colorTokens.grey[400],
              light: colorTokens.grey[700],
            },
            background: {
              default: colorTokens.grey[900],
              alt: colorTokens.grey[800],
            },
          }
        : {
            // ===== Light mode palette =====
            primary: {
              dark: colorTokens.primary[700],
              main: colorTokens.primary[500],
              light: colorTokens.primary[50],
            },
            neutral: {
              dark: colorTokens.grey[700],
              main: colorTokens.grey[500],
              mediumMain: colorTokens.grey[400],
              medium: colorTokens.grey[300],
              light: colorTokens.grey[50],
            },
            background: {
              default: colorTokens.grey[10],              // page background
              alt: "rgba(255, 255, 255, 0.8)",            // semi-transparent glassy div background
            },
          }),
    },

    // ===== Typography settings =====
    typography: {
      fontFamily: ["Rubik", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Rubik", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Rubik", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Rubik", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Rubik", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Rubik", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Rubik", "sans-serif"].join(","),
        fontSize: 14,
      },
    },

    // ===== Component overrides =====
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "light"
              ? "rgba(255, 255, 255, 0.8)" // glass effect in light mode
              : colorTokens.grey[800],
            backdropFilter: mode === "light" ? "blur(6px)" : "none",
            boxShadow: mode === "light"
              ? "0 2px 10px rgba(0, 0, 0, 0.05)"
              : "none",
          },
        },
      },
    },
  };
};
