import { createTheme } from "@mui/material/styles";

// Create a theme instance
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1f1f1f", // Your custom dark color for buttons
      light: "#4a4a4a",
      dark: "#000000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
    },
    background: {
      default: "#ffffff", // Pure white background
      paper: "#f6f7ed", // Your custom card background color
    },
    action: {
      hover: "#f4f4f4", // Your custom hover color
      selected: "#f4f4f4",
    },
    text: {
      primary: "#1f1f1f", // Your custom font color
      secondary: "#666666",
    },
    // Custom colors for specific use cases
    grey: {
      100: "#f4f4f4", // For search bars and shaded areas
      200: "#f6f7ed", // Alternative card background
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
    },
  },
  typography: {
    fontFamily:
      '"General Sans", system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 600,
      color: "#1f1f1f",
    },
    h2: {
      fontWeight: 600,
      color: "#1f1f1f",
    },
    h3: {
      fontWeight: 600,
      color: "#1f1f1f",
    },
    h4: {
      fontWeight: 600,
      color: "#1f1f1f",
    },
    h5: {
      fontWeight: 600,
      color: "#1f1f1f",
    },
    h6: {
      fontWeight: 600,
      color: "#1f1f1f",
    },
    button: {
      fontWeight: 500,
      color: "#1f1f1f",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#f4f4f4", // Custom hover for outlined buttons
          },
        },
        contained: {
          backgroundColor: "#1f1f1f",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#4a4a4a",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#f6f7ed", // Your custom card background
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#f6f7ed", // Consistent with cards
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#f4f4f4", // Custom search bar background
            "&:hover": {
              backgroundColor: "#f4f4f4",
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
            },
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f4f4f4", // Custom hover for table rows
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f4f4f4", // Custom hover for list items
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
      light: "#e3f2fd",
      dark: "#42a5f5",
    },
    secondary: {
      main: "#f48fb1",
      light: "#fce4ec",
      dark: "#ad1457",
    },
    background: {
      default: "#242424",
      paper: "#1e1e1e",
    },
    text: {
      primary: "rgba(255, 255, 255, 0.87)",
      secondary: "rgba(255, 255, 255, 0.6)",
    },
  },
  typography: {
    fontFamily:
      '"General Sans", system-ui, Avenir, Helvetica, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        },
      },
    },
  },
});
