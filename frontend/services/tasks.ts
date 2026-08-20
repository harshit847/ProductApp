// Task service powers the kanban board, task creation, updates, and deletion.
import { apiRequest } from "./api";
import type { Task } from "@/utils/types";

export type TaskFormValues = {
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  assigneeId?: string;
  assignee?: string;
};

/** Fetch all tasks from the API (used by the tasks page to load the kanban board). */
export function getTasks() {
  return apiRequest<Task[]>("/tasks");
}

/** Create a new task via the API. */
export async function createTask(data: TaskFormValues) {
  return apiRequest<Task>("/tasks", { method: "POST", body: JSON.stringify(data) });
}

/** Update an existing task by ID. */
export function updateTask(id: string, data: Partial<TaskFormValues>) {
  return apiRequest<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

/** Mark a task as complete via the dedicated PATCH endpoint. */
export async function completeTask(id: string) {
  return apiRequest<Task>(`/tasks/${id}/complete`, { method: "PATCH" });
}

/** Delete a task by ID from the API. */
export function deleteTask(id: string) {
  return apiRequest<{ message: string }>(`/tasks/${id}`, { method: "DELETE" });
}
