import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { PanelModule } from 'primeng/panel';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Task } from '../../../core/models/task';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    ButtonModule,
    ChipModule,
    ProgressBarModule,
    BadgeModule,
    PanelModule,
    NgIf,
    DatePipe,
    NgFor,
  ],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css'],
})
export class TaskDetailsComponent {
  task: Task;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.task = this.config.data.task;
    this.task.tags = this.task.tags ?? [];
    console.log('Task details:', this.task); // Debug to verify tags
  }

  close(): void {
    this.ref.close();
  }

  getStatusSeverity(status: Task['status']): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warn';
      case 'PENDING': return 'danger';
      case 'ARCHIVED': return 'secondary';
      default: return 'info';
    }
  }
}
