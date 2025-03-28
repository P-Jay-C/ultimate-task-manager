import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { DatePipe, NgClass } from '@angular/common';
import { Task } from '../../../core/models/task';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [ButtonModule, NgClass,DatePipe],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css'],
})
export class TaskDetailsComponent {
  task: Task;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.task = this.config.data.task; // Task passed via dialog config
  }

  close(): void {
    this.ref.close();
  }

  getTagsAsString(tags: string[]): string {
    return tags.length ? tags.join(', ') : 'None';
  }
}
