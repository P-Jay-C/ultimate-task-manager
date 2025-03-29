import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { Textarea } from 'primeng/inputtextarea';
import { Task } from '../../../core/models/task';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, DropdownModule, Textarea],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
})
export class AddTaskComponent {
  taskForm: FormGroup;
  loading = false;
  priorities = ['LOW', 'MEDIUM', 'HIGH'];
  statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
      priority: ['MEDIUM', Validators.required],
      category: [''],
      status: ['PENDING', Validators.required],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      tags: [''],
    });

    // If editing, populate the form with task data
    if (this.config.data?.task) {
      const task: Task = this.config.data.task;
      this.taskForm.patchValue({
        ...task,
        dueDate: task.dueDate.split('T')[0],
        tags: task.tags.join(', '),
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const dueDate = new Date(this.taskForm.value.dueDate);
    const formattedDueDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}T00:00:00`;

    const taskData: Task = {
      ...this.taskForm.value,
      id: this.config.data?.task?.id || 0,
      dueDate: formattedDueDate,
      completed: this.taskForm.value.status === 'COMPLETED',
      tags: this.taskForm.value.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      userId: '',
      createdAt: this.config.data?.task?.createdAt || '',
      updatedAt: this.config.data?.task?.updatedAt || '',
    };

    this.loading = true;
    const action = this.config.data?.task
      ? this.taskService.updateTask(taskData.id, taskData)
      : this.taskService.createTask(taskData);

    action.subscribe({
      next: (response) => {
        this.loading = false;
        this.ref.close(response.data);
      },
      error: (err) => {
        console.error('Failed to save task:', err);
        this.loading = false;
      },
    });
  }

  close(): void {
    this.ref.close();
  }
}
