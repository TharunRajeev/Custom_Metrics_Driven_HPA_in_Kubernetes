import React, { useState } from "react";
import { Button } from "@mui/material"; // Import MUI Button

const QueueLength = () => {
  // State to hold the data fetched from the URL
  const [data, setData] = useState("");
  const [error, setError] = useState(null);

  // Function to handle button click and fetch data from the URL
  const fetchData = async () => {
    try {
      // Reset previous error message
      setError(null);

      // Make a request to the URL
      const response = await fetch("/prometheus");

      // Check if the response is ok (status code 200)
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      // Convert response data to text
      const result = await response.text();

      // Set the fetched data to state
      setData(result);
    } catch (err) {
      // Set error message in case of failure
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Updated Button to MUI Button */}
      <Button
        onClick={fetchData}
        variant="contained"
        sx={{ padding: "10px 20px", marginBottom: "20px" }}
      >
        Fetch Custom Metric
      </Button>

      {/* Show error message if any */}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Show fetched data in a rectangular box with black background */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "5px",
          minHeight: "100px",
          overflow: "auto",
          backgroundColor: "black",
          color: "white",
          fontSize: "18px", // Increased font size for zoomed-in effect
          lineHeight: "1.5", // Optional: Adjust line height for readability
        }}
      >
        {data ? <pre>{data}</pre> : "No data fetched yet."}
      </div>
    </div>
  );
};

export default QueueLength;
