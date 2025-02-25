import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function AddTask() {
  const [taskName, setTaskName] = useState("");
  const [taskProcessingTime, setTaskProcessingTime] = useState("");
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectionModel, setSelectionModel] = useState([]);

  // Fetch tasks when the component is mounted
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch all tasks from the backend
  const fetchTasks = () => {
    fetch("http://localhost:8080/tasks")
      .then((response) => response.json())
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => {
        console.error("Failed to fetch tasks", error);
      });
  };

  // Update form filled status based on field values
  useEffect(() => {
    const checkFormFilled =
      taskName.trim() !== "" && taskProcessingTime.trim() !== "";
    setIsFormFilled(checkFormFilled);
  }, [taskName, taskProcessingTime]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const taskObject = {
    name: taskName,
    taskTime: parseInt(taskProcessingTime, 10),
  };

  // Function to submit a new task
  const submitTask = (e) => {
    e.preventDefault();
    if (isFormFilled) {
      fetch("http://localhost:8080/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(taskObject),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Server responded with status: ${response.status}`);
          }
        })
        .then((data) => {
          console.log(data);
          // Keeps the data entered in the text fields after submission as well
          //   setTaskName(""); // Reset the task name
          //   setTaskProcessingTime(""); // Reset the processing time
          fetchTasks(); // Refresh the task list
          setSuccess(true); // Set success state to true
          setOpen(true); // Open the Snackbar
        })
        .catch((error) => {
          console.error(error);
          setError("Failed to add the task. " + error.message);
          setOpen(true);
        });
    }
  };

  // Function to reschedule a selected task
  const rescheduleTask = () => {
    if (selectionModel.length > 0) {
      const taskId = selectionModel[0]; // Assuming only one task is selected
      fetch(`http://localhost:8080/tasks/reschedule-task/${taskId}`, {
        method: "PUT",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Failed to reschedule task ${taskId}`);
          }
        })
        .then((data) => {
          console.log("Rescheduled task:", data);
          fetchTasks(); // Refresh the task list
        })
        .catch((error) => {
          console.error("Error rescheduling task", error);
        });
    }
  };

  // Function to delete a selected task
  const deleteTask = () => {
    if (selectionModel.length > 0) {
      const taskId = selectionModel[0]; // Assuming only one task is selected
      fetch(`http://localhost:8080/tasks/${taskId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            console.log(`Task with ID ${taskId} deleted`);
            fetchTasks(); // Refresh the task list
          } else {
            throw new Error(`Failed to delete task ${taskId}`);
          }
        })
        .catch((error) => {
          console.error("Error deleting task", error);
        });
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Task Name", width: 150 },
    { field: "status", headerName: "Status", width: 200 },
    { field: "taskTime", headerName: "Task Time (ms)", width: 150 },
    { field: "created_time", headerName: "Created Time", width: 200 },
  ];

  return (
    <div>
      <div>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            "& > :not(style)": { m: 0.5 },
          }}
          noValidate
          autoComplete="off"
        >
          {/* Add Task Section */}
          <Typography
            variant="h4"
            component="h1"
            textAlign="center"
            sx={{ width: "100%" }}
          >
            Add Task
          </Typography>
          <Box sx={{ display: "flex", width: "50%", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Task Name:
            </Typography>
            <TextField
              label="Task Name"
              variant="outlined"
              sx={{ flexGrow: 1 }}
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </Box>
          <Box sx={{ display: "flex", width: "50%", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Task Processing Time (ms):
            </Typography>
            <TextField
              label="Task Processing Time"
              variant="outlined"
              sx={{ flexGrow: 1 }}
              type="number"
              value={taskProcessingTime}
              onChange={(e) => setTaskProcessingTime(e.target.value)}
            />
          </Box>
          <Button
            onClick={submitTask}
            variant="contained"
            disabled={!isFormFilled}
          >
            Add Task
          </Button>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            {success ? (
              <Alert
                onClose={handleClose}
                severity="success"
                sx={{ width: "100%" }}
              >
                Task successfully created!
              </Alert>
            ) : (
              <Alert
                onClose={handleClose}
                severity="error"
                sx={{ width: "100%" }}
              >
                {error}
              </Alert>
            )}
          </Snackbar>

          {/* Task Queue Section */}
          <div style={{ height: 400, width: "60%", marginTop: "20px" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                textAlign="Left"
                sx={{ width: "100%" }}
              >
                Task Queue
              </Typography>
              <Button variant="outlined" onClick={fetchTasks}>
                Refresh
              </Button>
            </Box>
            <DataGrid
              rows={tasks}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              checkboxSelection
              onRowSelectionModelChange={setSelectionModel}
              rowSelectionModel={selectionModel}
            />
          </div>
        </Box>
      </div>
      <div>
        {/* Reschedule and Delete Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: "60px",
          }}
        >
          <Button
            variant="outlined"
            onClick={rescheduleTask}
            disabled={selectionModel.length === 0}
            sx={{ marginRight: "10px" }}
          >
            Reschedule Task
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={deleteTask}
            disabled={selectionModel.length === 0}
          >
            Delete Task
          </Button>
        </Box>
      </div>
    </div>
  );
}
