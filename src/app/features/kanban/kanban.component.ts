import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus, PagedTaskResponse } from '../../core/models/task';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { SuccessResponse } from '../../core/models/success-response';
import { DialogService } from 'primeng/dynamicdialog';
import { TaskDetailsComponent } from '../tasks/task-details/task-details.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CardModule, ButtonModule, NgClass, NgFor,DatePipe,NgIf],
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

  constructor(private taskService: TaskService ,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadTasksForAllStatuses();
  }

  loadTasksForAllStatuses(): void {
    this.statuses.forEach((status) => {
      this.loading[status] = true;
      this.taskService.getTasksByStatus(status).subscribe({
        next: (response: SuccessResponse<PagedTaskResponse>) => {
          this.tasksByStatus[status] = response.data?.content ?? [];
          this.loading[status] = false;
        },
        error: (err) => {
          console.error(`Failed to load ${status} tasks:`, err);
          this.loading[status] = false;
        },
      });
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

  openTaskDetails(task: Task): void {
    this.dialogService.open(TaskDetailsComponent, {
      header: `Details: ${task.title}`,
      width: '40rem',
      data: { task },
    });
  }

}
