export type TaskStatus = 'OPEN' | 'DONE';

export interface TaskEmployeeRef {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  relatesTo: TaskEmployeeRef;
  createdBy: TaskEmployeeRef;
  fromInteractionId: number | null;
  dueDate: string | null;
  assignee: TaskEmployeeRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskFromInteractionRequest {
  interactionId: number;
  title: string;
  description?: string;
  dueDate?: string;
  assigneeId?: number;
}

export interface CreateStandaloneTaskRequest {
  relatesToId: number;
  title: string;
  description?: string;
  dueDate?: string;
  assigneeId?: number;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}
