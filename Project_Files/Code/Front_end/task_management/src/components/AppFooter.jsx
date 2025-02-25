import React from "react";
import { Box } from "@mui/material";

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        height: "50px", // Set height for footer space
        backgroundColor: "#f1f1f1",
        marginTop: "20px",
      }}
    />
  );
}