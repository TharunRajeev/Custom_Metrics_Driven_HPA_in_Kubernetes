import React, { useState, useEffect } from 'react';

const QueueLengthValue = () => {
  // State to store the queue length value and possible error
  const [queueLength, setQueueLength] = useState(null);
  const [error, setError] = useState(null);

  // Function to fetch the queue length from the API
  const fetchQueueLength = async () => {
    try {
      const response = await fetch('http://localhost:8080/tasks/queue-length');

      // Check if the response is OK (status 200)
      if (!response.ok) {
        throw new Error('Failed to fetch queue length');
      }

      // Parse the response as text or JSON depending on your API response
      const data = await response.text();

      // Update the queue length state
      setQueueLength(data);
    } catch (err) {
      // Handle errors
      setError(err.message);
    }
  };

  // Use effect to fetch the data when the component mounts
  useEffect(() => {
    fetchQueueLength();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Queue Length Metric</h1>

      {/* Show error message if any */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Display queue length if available */}
      <div
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '5px',
          minHeight: '50px',
          width: '200px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '20px',
        }}
      >
        {queueLength !== null ? queueLength : 'Loading...'}
      </div>
    </div>
  );
};

export default QueueLengthValue;
