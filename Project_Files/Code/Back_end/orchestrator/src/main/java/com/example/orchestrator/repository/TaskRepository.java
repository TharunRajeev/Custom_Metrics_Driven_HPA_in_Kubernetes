package com.example.orchestrator.repository;

import com.example.orchestrator.task.Task;
import com.example.orchestrator.task.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository  extends JpaRepository<Task, Long>{

    // Method to retrieve a list of tasks based on their status (e.g., READY, IN_PROGRESS, COMPLETED)
    List<Task> findByStatus(TaskStatus status);

    // Method to retrieve the first task that matches a specific status
    Optional<Task> findFirstByStatus(TaskStatus taskStatus);
}
