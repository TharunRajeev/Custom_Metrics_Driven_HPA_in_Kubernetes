package com.example.orchestrator.controller;

import com.example.orchestrator.repository.TaskRepository;
import com.example.orchestrator.task.Task;
import com.example.orchestrator.task.TaskStatus;
import io.prometheus.client.Gauge;
import io.prometheus.client.exporter.HTTPServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.bind.annotation.*;


import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ScheduledFuture;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskRepository taskRepository;

    // Initialize a Prometheus HTTP server to expose metrics
    HTTPServer server = new HTTPServer(1234);

    // Prometheus Gauge metric to monitor the queue length
    private static final Gauge queueLengthGauge = Gauge.build()
            .name("queue_length")
            .help("Queue length gauge.")
            .labelNames("namespace", "pod")
            .register();

    // Inject environment variables for namespace and pod name
    @Value("${POD_NAMESPACE:default}")
    private String namespace;

    @Value("${POD_NAME:default}")
    private String podName;

    // Time interval for updating queue length metrics (default is 30 seconds)
    @Value("${queue_length_check_interval:30000}")
    private long metricCheckInterval;

    // Time interval for checking task queue for processing (default is 30 seconds)
    @Value("${task_check_interval:30000}")
    private long taskCheckInterval;

    private final ThreadPoolTaskScheduler queueLengthScheduler;
    private final ThreadPoolTaskScheduler taskScheduler;
    private ScheduledFuture<?> scheduledTask;

    public TaskController(TaskRepository taskRepository) throws IOException {
        this.taskRepository = taskRepository;

        // Initialize separate schedulers
        this.queueLengthScheduler = new ThreadPoolTaskScheduler();
        this.queueLengthScheduler.setPoolSize(1);
        this.queueLengthScheduler.initialize();

        this.taskScheduler = new ThreadPoolTaskScheduler();
        this.taskScheduler.setPoolSize(1);
        this.taskScheduler.initialize();
    }

    @PostConstruct
    public void startQueueLengthUpdater() {
        scheduleQueueLengthUpdate();
        processTasks(); // Start processing tasks at initialization
    }

    // Method to update the queue_length metric
    public void updateQueueLengthMetric() {
        List<Task> readyTasks = taskRepository.findByStatus(TaskStatus.READY);
        System.out.println("Ready Tasks Count: " + readyTasks.size());
        queueLengthGauge.labels(namespace, podName).set(readyTasks.size());
        System.out.println("Guage " + queueLengthGauge.labels(namespace, podName).get());
    }

    // Method to dynamically schedule the queue_length updates
    private void scheduleQueueLengthUpdate() {
        scheduledTask = queueLengthScheduler.scheduleWithFixedDelay(() -> {
            try {
                updateQueueLengthMetric();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, metricCheckInterval);
    }

    // REST endpoint to create a task
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        task.setStatus(TaskStatus.READY);
        return taskRepository.save(task);
    }

    // REST endpoint to get the current queue length
    @GetMapping("/queue-length")
    public double getQueueLength() {
        return queueLengthGauge.labels(namespace, podName).get();
    }

    //REST endpoint to get all tasks in the table
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // REST endpoint to complete a task
    @PutMapping("/reschedule-task/{id}")
    public Task rescheduleTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setStatus(TaskStatus.READY);
        return taskRepository.save(task);
    }

    // REST endpoint to delete a task by its ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTask(@PathVariable Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.ok("Task with ID " + id + " has been deleted.");
        } else {
            return ResponseEntity.status(404).body("Task with ID " + id + " not found.");
        }
    }

    // Method to process the tasks
    public void processTasks() {
        taskScheduler.scheduleWithFixedDelay(() -> {
            try {
                // Fetch one ready task
                Optional<Task> optionalTask = taskRepository.findFirstByStatus(TaskStatus.READY);
                if (optionalTask.isPresent()) {
                    Task task = optionalTask.get(); // Get the Task object

                    // Mark the task as in-progress
                    task.setStatus(TaskStatus.IN_PROGRESS);
                    taskRepository.save(task);

                    // Simulate task processing by waiting for the configured sleep time
                    Thread.sleep(task.getTaskTime()); // Sleep time for task processing

                    // Mark task as completed
                    task.setStatus(TaskStatus.COMPLETED);
                    taskRepository.save(task);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                e.printStackTrace();
            }
        }, taskCheckInterval);  // The frequency for checking ready tasks
    }
}
