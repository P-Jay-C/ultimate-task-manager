import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { PagedTaskResponse, Task } from '../../core/models/task';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { SuccessResponse } from '../../core/models/success-response';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, ButtonModule, InputTextModule, DropdownModule, FormsModule, DatePipe],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  taskForm!: FormGroup;
  editingTask: Task | null = null;
  loading = false;

  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  categoryFilter: string | undefined;
  completedFilter: boolean | undefined;
  searchQuery: string | undefined;

  priorities = ['LOW', 'MEDIUM', 'HIGH'];
  statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.initForm();
  }

  initForm(): void {
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
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService
      .getTasks(this.page, this.size, this.categoryFilter, this.completedFilter, this.searchQuery)
      .subscribe({
        next: (response: SuccessResponse<PagedTaskResponse>) => {
          this.tasks = response?.data?.content ?? [];
          this.page = response?.data?.page ?? 0;
          this.size = response?.data?.size ?? 0;
          this.totalElements = response?.data?.totalElements ?? 0;
          this.totalPages = response?.data?.totalPages ?? 0;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load tasks:', err);
          this.loading = false;
        },
      });
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
      id: this.editingTask ? this.editingTask.id : 0,
      dueDate: formattedDueDate,
      completed: this.taskForm.value.status === 'COMPLETED',
      tags: this.taskForm.value.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      userId: '',
      createdAt: this.editingTask ? this.editingTask.createdAt : '',
      updatedAt: this.editingTask ? this.editingTask.updatedAt : '',
    };

    this.loading = true;
    if (this.editingTask) {
      this.taskService.updateTask(this.editingTask.id, taskData).subscribe({
        next: () => {
          this.loadTasks();
          this.resetForm();
        },
        error: (err) => {
          console.error('Failed to update task:', err);
          this.loading = false;
        },
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: (response) => {
          if (response.data) {
            this.tasks.push(response.data);
            this.resetForm();
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Failed to create task:', err);
          this.loading = false;
        },
      });
    }
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.taskForm.patchValue({
      ...task,
      dueDate: task.dueDate.split('T')[0], // For date input
      tags: task.tags.join(', '),
    });
  }

  deleteTask(id: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.loading = true;
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err) => {
          console.error('Failed to delete task:', err);
          this.loading = false;
        },
      });
    }
  }

  resetForm(): void {
    this.taskForm.reset({
      title: '',
      description: '',
      dueDate: '',
      priority: 'MEDIUM',
      category: '',
      status: 'PENDING',
      progress: 0,
      tags: '',
    });
    this.editingTask = null;
    this.loading = false;
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadTasks();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadTasks();
    }
  }

  applyFilters(): void {
    this.page = 0;
    this.loadTasks();
  }

  getTagsAsString(tags: string[]): string {
    return tags.length ? tags.join(', ') : 'None';
  }

}
