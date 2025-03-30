import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus, PagedTaskResponse } from '../../core/models/task';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table'; // For drag-and-drop
import { DialogService } from 'primeng/dynamicdialog';
import { TaskDetailsComponent } from '../tasks/task-details/task-details.component';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { SuccessResponse } from '../../core/models/success-response';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CardModule, ButtonModule, TableModule, NgClass,NgIf, NgFor, DynamicDialogModule,DatePipe],
  providers: [],
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css'],
})
export class KanbanComponent implements OnInit {
  statuses: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];
  tasksByStatus: { [key in TaskStatus]: Task[] } = {
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    ARCHIVED: [],
  };
  loading: { [key in TaskStatus]: boolean } = {
    PENDING: false,
    IN_PROGRESS: false,
    COMPLETED: false,
    ARCHIVED: false,
  };

  constructor(
    private taskService: TaskService,
    private dialogService: DialogService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadTasksForAllStatuses();
  }

  loadTasksForAllStatuses(page: number = 0, size: number = 10): void {
    this.statuses.forEach((status) => {
      this.loading[status] = true;
      this.taskService.getTasksByStatus(status, page, size).subscribe({
        next: (response) => {
          this.tasksByStatus[status] = response.data?.content ?? [];
          this.loading[status] = false;
        },
        error: (err) => {
          console.error(`Failed to load ${status} tasks:`, err);
          this.loading[status] = false;
        }
      });
    });
  }

  openTaskDetails(task: Task): void {
    this.dialogService.open(TaskDetailsComponent, {
      header: `Details: ${task.title}`,
      width: '40rem',
      data: { task },
    });
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case 'PENDING': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  onDrop(event: any, targetStatus: TaskStatus): void {
    event.preventDefault();
    const column = (event.target as HTMLElement).closest('.flex-col');
    if (column) column.classList.remove('drop-target');

    const draggedTask: Task = JSON.parse(event.dataTransfer.getData('task'));
    if (!draggedTask || draggedTask.status === targetStatus) return;

    const updatedTask = {
      ...draggedTask,
      status: targetStatus,
      progress: targetStatus === 'COMPLETED' ? 100 : draggedTask.progress,
    };
    this.taskService.updateTask(draggedTask.id, updatedTask).subscribe({
      next: (response) => {
        this.tasksByStatus[draggedTask.status] = this.tasksByStatus[draggedTask.status].filter(t => t.id !== draggedTask.id);
        if (response.data) this.tasksByStatus[targetStatus].push(response.data);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: 'Could not move task: ' + err.message
        });
      }
    });
  }

  onDragStart(event: DragEvent, task: Task): void {
    event.dataTransfer?.setData('task', JSON.stringify(task));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    const column = (event.target as HTMLElement).closest('.flex-col');
    if (column) column.classList.add('drop-target');
  }

  onDragLeave(event: DragEvent): void {
    const column = (event.target as HTMLElement).closest('.flex-col');
    if (column) column.classList.remove('drop-target');
  }
}
