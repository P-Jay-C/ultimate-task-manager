export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string; // ISO string, e.g., "2025-03-25T15:53"
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  completed: boolean;
  updatedAt: string; // ISO string, e.g., "2025-03-25T16:34:02.631386"
  createdAt: string; // ISO string, e.g., "2025-03-25T16:34:02.629376"
  userId: string;
  tags: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  progress: number; // 0-100
}

export interface PagedTaskResponse {
  content: Task[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
